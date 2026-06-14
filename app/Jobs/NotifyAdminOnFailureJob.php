<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\AdminFailureNotification;
use App\Models\Admin;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * Notifies all admins when a transaction enters a failure state or has
 * been stuck for over twelve hours.
 */
final class NotifyAdminOnFailureJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(public Transaction $tx, public string $reason = 'failed')
    {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $fresh = $this->tx->fresh();
        if ($fresh === null) {
            return;
        }

        $admins = Admin::query()->whereNotNull('email')->get();
        if ($admins->isEmpty()) {
            return;
        }

        foreach ($admins as $admin) {
            $email = (string) $admin->email;
            if ($email === '') {
                continue;
            }
            Mail::to($email)->send(new AdminFailureNotification($fresh, $this->reason));
        }
    }
}
