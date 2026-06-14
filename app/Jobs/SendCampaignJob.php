<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Resolves the audience for a saved {@see Campaign}, queues one
 * {@see CampaignMail} per recipient, and tracks progress on the row.
 */
final class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 600;

    public function __construct(public int $campaignId)
    {
        $this->onQueue('default');
    }

    public function handle(): void
    {
        $campaign = Campaign::find($this->campaignId);
        if ($campaign === null) {
            return;
        }
        if (! in_array($campaign->status, [Campaign::STATUS_QUEUED, Campaign::STATUS_DRAFT, Campaign::STATUS_FAILED], true)) {
            return;
        }

        try {
            $base = $this->audienceQuery($campaign->audience);

            $total = (clone $base)->count();
            $campaign->update([
                'status' => Campaign::STATUS_SENDING,
                'recipients_total' => $total,
                'recipients_sent' => 0,
            ]);

            $sent = 0;
            $base->orderBy('id')->chunkById(100, function ($users) use ($campaign, &$sent): void {
                foreach ($users as $user) {
                    if (! $user instanceof User) {
                        continue;
                    }
                    $email = (string) $user->email;
                    if ($email === '') {
                        continue;
                    }

                    Mail::to($email)->queue(new CampaignMail($campaign, $user));
                    $sent++;
                }
                $campaign->update(['recipients_sent' => $sent]);
            });

            $campaign->update([
                'status' => Campaign::STATUS_SENT,
                'sent_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Campaign send failed', ['campaign_id' => $campaign->id, 'error' => $e->getMessage()]);
            $campaign->update(['status' => Campaign::STATUS_FAILED]);
        }
    }

    private function audienceQuery(string $audience): Builder
    {
        $base = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '');

        return match ($audience) {
            Campaign::AUDIENCE_OPT_IN => $base->where('marketing_opt_in', true),
            Campaign::AUDIENCE_CUSTOMERS_WITH_SWAPS => $base->whereIn(
                'id',
                Transaction::query()->whereNotNull('user_id')->select('user_id')
            ),
            default => $base,
        };
    }
}
