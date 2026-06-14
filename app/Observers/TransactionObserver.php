<?php

declare(strict_types=1);

namespace App\Observers;

use App\Jobs\NotifyAdminOnFailureJob;
use App\Jobs\SendReceiptEmailJob;
use App\Models\Transaction;

/**
 * Side-effects triggered by Transaction lifecycle changes:
 *  - dispatch receipt mail when a swap finishes
 *  - alert admins when a swap fails or is newly flagged stuck
 */
final class TransactionObserver
{
    public function updated(Transaction $tx): void
    {
        $original = $tx->getOriginal();

        $statusChanged = array_key_exists('status', $tx->getChanges());
        $newStatus = $tx->status;
        $oldStatus = $original['status'] ?? null;

        if ($statusChanged && $newStatus === Transaction::STATUS_FINISHED && $oldStatus !== Transaction::STATUS_FINISHED) {
            SendReceiptEmailJob::dispatch($tx);
        }

        if ($statusChanged && $newStatus === Transaction::STATUS_FAILED && $oldStatus !== Transaction::STATUS_FAILED) {
            NotifyAdminOnFailureJob::dispatch($tx, 'failed');

            return;
        }

        $stuckChanged = array_key_exists('stuck_flagged', $tx->getChanges());
        $becameStuck = $stuckChanged
            && (bool) $tx->stuck_flagged === true
            && (bool) ($original['stuck_flagged'] ?? false) === false;

        if ($becameStuck) {
            NotifyAdminOnFailureJob::dispatch($tx, 'stuck');
        }
    }
}
