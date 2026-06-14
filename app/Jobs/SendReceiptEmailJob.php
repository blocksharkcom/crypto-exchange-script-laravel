<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\ReceiptMail;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Emails the swap receipt to the customer when a transaction finishes.
 * No-op if the transaction is unowned or has no email on file.
 */
final class SendReceiptEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(public Transaction $tx)
    {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $fresh = $this->tx->fresh(['user']);

        if ($fresh === null || $fresh->status !== Transaction::STATUS_FINISHED) {
            return;
        }

        $email = $fresh->user?->email;
        if ($fresh->user_id === null || ! is_string($email) || $email === '') {
            return;
        }

        Mail::to($email)->send(new ReceiptMail($fresh));
    }
}
