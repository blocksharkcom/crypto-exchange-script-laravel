<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Campaign;
use App\Models\ContentSection;
use App\Models\LimitOrder;
use App\Models\Page;
use App\Models\PageTranslation;
use App\Models\RecurringSchedule;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeds the LIVE demo deployment with realistic-looking data so reviewers and
 * prospective buyers can explore a populated admin panel and customer dashboard.
 *
 *   php artisan db:seed --class=Database\\Seeders\\DemoDataSeeder
 *
 * The `crossswap:prepare-archive` artisan command strips every row this seeder
 * inserts, so the archive shipped to buyers stays clean of demo data.
 */
final class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::firstOrCreate(
            ['email' => 'admin@demo.com'],
            ['name' => 'Demo Admin', 'password' => 'password!321'],
        );
        if (! $admin->hasRole('superadmin')) {
            $admin->assignRole('superadmin');
        }

        $supportAdmin = Admin::firstOrCreate(
            ['email' => 'support@demo.com'],
            ['name' => 'Demo Support', 'password' => 'password!321'],
        );
        if (! $supportAdmin->hasRole('support')) {
            $supportAdmin->assignRole('support');
        }

        $user = User::firstOrCreate(
            ['email' => 'user@demo.com'],
            ['name' => 'Demo User', 'password' => 'password!321'],
        );

        $extraUsers = $this->seedExtraUsers();
        $allUsers = collect([$user])->concat($extraUsers);

        DB::transaction(function () use ($user, $admin, $supportAdmin, $allUsers): void {
            $this->seedTransactions($user, $allUsers);
            $this->seedTickets($user, $admin, $supportAdmin, $allUsers);
            $this->seedLimitOrders($user, $allUsers);
            $this->seedRecurringSchedules($user, $allUsers);
            $this->seedContentSections();
            $this->seedCampaigns($admin);
            $this->seedPages();
        });
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function seedExtraUsers(): \Illuminate\Support\Collection
    {
        $extras = [
            ['email' => 'liam.harper@fake.com',   'name' => 'Liam Harper',     'country' => 'GB', 'locale' => 'en', 'days_ago' => 58, 'opt_in' => true],
            ['email' => 'sofia.romero@fake.com',  'name' => 'Sofia Romero',    'country' => 'ES', 'locale' => 'es', 'days_ago' => 45, 'opt_in' => true],
            ['email' => 'noah.becker@fake.com',   'name' => 'Noah Becker',     'country' => 'DE', 'locale' => 'de', 'days_ago' => 32, 'opt_in' => false],
            ['email' => 'aiko.tanaka@fake.com',   'name' => 'Aiko Tanaka',     'country' => 'JP', 'locale' => 'en', 'days_ago' => 19, 'opt_in' => true],
            ['email' => 'mateus.silva@fake.com',  'name' => 'Mateus Silva',    'country' => 'BR', 'locale' => 'en', 'days_ago' => 6,  'opt_in' => false],
        ];

        $created = collect();
        foreach ($extras as $row) {
            $createdAt = Carbon::now()->subDays($row['days_ago'])->setTime(mt_rand(8, 22), mt_rand(0, 59));
            $u = User::firstOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => 'password!321',
                    'country' => $row['country'],
                    'locale' => $row['locale'],
                    'marketing_opt_in' => $row['opt_in'],
                    'last_seen_at' => Carbon::now()->subHours(mt_rand(1, 96)),
                    'email_verified_at' => $createdAt->copy()->addMinutes(mt_rand(2, 90)),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ],
            );
            $created->push($u);
        }

        return $created;
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $allUsers
     */
    private function seedTransactions(User $user, \Illuminate\Support\Collection $allUsers): void
    {
        // Stable seed marker so we can detect already-seeded transactions on re-run.
        if (Transaction::where('source', 'demo')->count() >= 35) {
            return;
        }

        // [from, to, fromNet, toNet, minAmt, maxAmt, approxRate]
        $pairs = [
            ['btc', 'eth', 'btc', 'eth',   0.05,  0.5,    38.2],
            ['eth', 'usdt', 'eth', 'trx',  0.5,   4,      3450],
            ['usdt', 'btc', 'trx', 'btc',  200,   2500,   0.0000259],
            ['sol', 'usdc', 'sol', 'sol',  5,     50,     156.4],
            ['bnb', 'btc', 'bsc', 'btc',   1,     10,     0.00882],
            ['usdt', 'xmr', 'trx', 'xmr',  100,   1200,   0.00547],
            ['ada', 'eth', 'ada', 'eth',   100,   1500,   0.000234],
            ['trx', 'usdt', 'trx', 'trx',  200,   2000,   0.142],
            ['doge', 'btc', 'doge', 'btc', 1000,  12000,  0.0000023],
            ['usdc', 'sol', 'eth', 'sol',  100,   500,    0.0061],
            ['btc', 'usdt', 'btc', 'trx',  0.02,  0.15,   82800],
            ['eth', 'btc', 'eth', 'btc',   0.8,   3.2,    0.0263],
            ['link', 'eth', 'eth', 'eth',  10,    250,    0.0042],
            ['matic', 'usdc', 'matic', 'eth', 100, 3000,  0.42],
            ['avax', 'btc', 'avax', 'btc', 5,     80,     0.00038],
            ['dot', 'eth', 'dot', 'eth',   20,    500,    0.0021],
            ['atom', 'usdt', 'atom', 'trx', 10,   400,    7.85],
            ['near', 'btc', 'near', 'btc', 30,    900,    0.000045],
            ['op', 'eth', 'op', 'eth',     15,    600,    0.00052],
            ['arb', 'usdc', 'arb', 'eth',  25,    1000,   0.78],
            ['pepe', 'eth', 'eth', 'eth',  500000, 9000000, 0.00000000034],
            ['shib', 'usdt', 'eth', 'trx', 200000, 5000000, 0.0000091],
            ['usdc', 'usdt', 'eth', 'trx', 50,    1500,   0.999],
            ['usdc', 'btc', 'sol', 'btc',  200,   3000,   0.0000122],
            ['eth', 'sol', 'eth', 'sol',   0.2,   3.5,    22.4],
            ['btc', 'sol', 'btc', 'sol',   0.01,  0.08,   1850],
            ['xmr', 'btc', 'xmr', 'btc',   0.5,   5,      0.0023],
            ['ltc', 'eth', 'ltc', 'eth',   1,     15,     0.034],
            ['usdt', 'sol', 'trx', 'sol',  150,   2200,   0.0061],
            ['eth', 'usdc', 'eth', 'eth',  0.5,   6,      3450],
            ['btc', 'xmr', 'btc', 'xmr',   0.02,  0.2,    540],
            ['usdt', 'ada', 'trx', 'ada',  100,   2000,   2.45],
            ['sol', 'btc', 'sol', 'btc',   1,     20,     0.00097],
            ['eth', 'matic', 'eth', 'matic', 0.3, 3,      7800],
            ['btc', 'usdc', 'btc', 'eth',  0.01,  0.1,    82500],
            ['usdt', 'eth', 'trx', 'eth',  500,   4000,   0.000288],
            ['avax', 'usdc', 'avax', 'eth', 5,    150,    26.4],
            ['atom', 'btc', 'atom', 'btc', 20,    300,    0.000094],
            ['arb', 'btc', 'arb', 'btc',   100,   2500,   0.0000087],
        ];

        // Distribute statuses with ~70% finished, balanced others.
        $statusBag = array_merge(
            array_fill(0, 27, 'finished'),    // ~70%
            array_fill(0, 2,  'waiting'),
            array_fill(0, 2,  'confirming'),
            array_fill(0, 2,  'exchanging'),
            array_fill(0, 2,  'sending'),
            array_fill(0, 2,  'failed'),
            array_fill(0, 2,  'refunded'),
        );
        shuffle($statusBag);

        // Distribute owners: roughly 50% main user, 35% other users, 15% guest (null).
        $userPool = $allUsers->all();

        foreach ($pairs as $i => $pair) {
            [$from, $to, $fromNet, $toNet, $minAmt, $maxAmt, $approxRate] = $pair;
            $status = $statusBag[$i % count($statusBag)] ?? 'finished';

            // Spread created_at across the last 90 days, weighted toward recent.
            $daysAgo = (int) round(90 * (mt_rand(0, 100) / 100) ** 1.7);
            $createdAt = Carbon::now()->subDays($daysAgo)->subMinutes(mt_rand(0, 1440));

            $roll = mt_rand(1, 100);
            if ($roll <= 50) {
                $owner = $user;
            } elseif ($roll <= 85) {
                $owner = $userPool[array_rand($userPool)];
            } else {
                $owner = null;
            }

            $amount = round($minAmt + (($maxAmt - $minAmt) * (mt_rand(0, 100) / 100)), 8);
            $received = round($amount * $approxRate * (1 - mt_rand(0, 25) / 1000), 8);
            $isFinished = $status === 'finished';
            $isRefunded = $status === 'refunded';
            $hasOnchain = $isFinished || $isRefunded;

            Transaction::create([
                'provider_id' => Str::random(14),
                'user_id' => $owner?->id,
                'from_currency' => $from,
                'to_currency' => $to,
                'from_network' => $fromNet,
                'to_network' => $toNet,
                'amount_send' => $amount,
                'amount_receive' => $received,
                'payin_address' => $this->fakeAddress($fromNet),
                'payout_address' => $this->fakeAddress($toNet),
                'flow' => $i % 4 === 0 ? 'fixed-rate' : 'standard',
                'status' => $status,
                'finished_at' => $isFinished ? $createdAt->copy()->addMinutes(mt_rand(4, 38)) : null,
                'fee_amount' => round($amount * 0.0035, 8),
                'fee_currency' => $from,
                'partner_fee' => round($amount * 0.0014, 8),
                'partner_fee_currency' => $from,
                'payin_hash' => $hasOnchain ? bin2hex(random_bytes(32)) : null,
                'payout_hash' => $isFinished ? bin2hex(random_bytes(32)) : null,
                'ip' => '203.0.113.'.mt_rand(2, 250),
                'country' => collect(['US', 'DE', 'GB', 'FR', 'NL', 'SE', 'SG', 'BR', 'JP', 'ES'])->random(),
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                'source' => 'demo',
                'created_at' => $createdAt,
                'updated_at' => $isFinished ? $createdAt->copy()->addMinutes(8) : $createdAt,
            ]);
        }

        // One stuck swap for the admin stuck-monitor screen
        Transaction::create([
            'provider_id' => Str::random(14),
            'user_id' => $user->id,
            'from_currency' => 'btc',
            'to_currency' => 'eth',
            'amount_send' => 0.08,
            'amount_receive' => 3.05,
            'payin_address' => $this->fakeAddress('btc'),
            'payout_address' => $this->fakeAddress('eth'),
            'flow' => 'standard',
            'status' => 'confirming',
            'stuck_flagged' => true,
            'fee_amount' => 0.00028,
            'fee_currency' => 'btc',
            'partner_fee' => 0.00011,
            'partner_fee_currency' => 'btc',
            'ip' => '203.0.113.42',
            'country' => 'NL',
            'source' => 'demo',
            'created_at' => Carbon::now()->subHours(7),
            'updated_at' => Carbon::now()->subHours(7),
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $allUsers
     */
    private function seedTickets(User $user, Admin $admin, Admin $supportAdmin, \Illuminate\Support\Collection $allUsers): void
    {
        if (Ticket::count() >= 8) {
            return;
        }

        $tickets = [
            [
                'subject' => 'Where is my BTC swap?',
                'status' => 'open',
                'priority' => 'high',
                'owner' => $user,
                'messages' => [
                    ['sender' => 'user', 'body' => 'My BTC transfer was sent 2 hours ago and it still says confirming. Could you check the on-chain status? The hash is in my dashboard.'],
                ],
            ],
            [
                'subject' => 'Wrong network on USDT',
                'status' => 'pending',
                'priority' => 'normal',
                'owner' => $user,
                'messages' => [
                    ['sender' => 'user',  'body' => 'I think I selected ERC20 instead of TRC20 when copying my receive address. What can be done?'],
                    ['sender' => 'admin', 'body' => 'Thanks for reaching out — we can issue a refund to your original sending address. Could you confirm the refund address you want us to use?'],
                    ['sender' => 'user',  'body' => 'Yes please use the same address I sent the USDT from. Appreciate the quick response.'],
                ],
            ],
            [
                'subject' => 'How do I track lifetime fees?',
                'status' => 'closed',
                'priority' => 'low',
                'owner' => $user,
                'messages' => [
                    ['sender' => 'user',  'body' => 'Just wondering where to see how much I have paid in fees total across all swaps. Thanks!'],
                    ['sender' => 'admin', 'body' => 'Hi! Lifetime fees are visible inside your account dashboard — see the "Fees paid" KPI tile at the top. Closing this ticket, but feel free to reopen if anything is unclear.'],
                ],
            ],
            [
                'subject' => 'Limit order not triggering',
                'status' => 'open',
                'priority' => 'normal',
                'owner' => $allUsers->get(1) ?? $user,
                'messages' => [
                    ['sender' => 'user', 'body' => 'I set a limit order for ETH/BTC at 0.026 last night and the market touched that price this morning, but my order is still open. Is the poller running?'],
                    ['sender' => 'user', 'body' => 'Bumping this — order ID is visible in my account.'],
                ],
            ],
            [
                'subject' => 'Refund processing time',
                'status' => 'pending',
                'priority' => 'normal',
                'owner' => $allUsers->get(2) ?? $user,
                'messages' => [
                    ['sender' => 'user',  'body' => 'How long does a refund typically take once approved? My exchange failed yesterday and I am waiting for funds back.'],
                    ['sender' => 'admin', 'body' => 'Refunds normally land within 30 minutes of approval, depending on the network. I can see yours was approved an hour ago — could you double-check the receiving wallet?'],
                ],
            ],
            [
                'subject' => 'Can I get an invoice for accounting?',
                'status' => 'closed',
                'priority' => 'low',
                'owner' => $allUsers->get(3) ?? $user,
                'messages' => [
                    ['sender' => 'user',  'body' => 'My company needs a PDF receipt for the swap I did last week. Is that possible?'],
                    ['sender' => 'admin', 'body' => 'Absolutely — you can download a receipt PDF directly from the swap details page in your dashboard. Look for the "Download receipt" button. Closing this one, but reach out if it does not show up.'],
                ],
            ],
            [
                'subject' => 'KYC required for large swap?',
                'status' => 'pending',
                'priority' => 'normal',
                'owner' => $allUsers->get(4) ?? $user,
                'messages' => [
                    ['sender' => 'user',  'body' => 'I want to swap roughly $25,000 worth of BTC into stablecoin. Do I need to complete KYC first?'],
                    ['sender' => 'admin', 'body' => 'For amounts above the risk threshold we route through a KYC-required liquidity venue. I will send you a verification link by email shortly — it usually takes 5-10 minutes.'],
                ],
            ],
            [
                'subject' => 'API access for power users?',
                'status' => 'open',
                'priority' => 'low',
                'owner' => $allUsers->get(0) ?? $user,
                'messages' => [
                    ['sender' => 'user', 'body' => 'Hey team — any plans to expose a swap API? I would love to script some recurring trades against your liquidity. Happy to beta test.'],
                ],
            ],
        ];

        foreach ($tickets as $i => $t) {
            $owner = $t['owner'];
            $createdAt = Carbon::now()->subHours($i * 6 + 2)->subMinutes(mt_rand(0, 90));
            $closedAt = $t['status'] === 'closed' ? $createdAt->copy()->addHours(mt_rand(4, 24)) : null;
            $assignedTo = in_array($t['status'], ['pending', 'closed'], true) ? $supportAdmin->id : null;

            $messageCount = count($t['messages']);
            $lastUserReplyAt = null;
            $lastAdminReplyAt = null;

            $ticket = Ticket::create([
                'user_id' => $owner->id,
                'email' => $owner->email,
                'view_token' => Str::random(48),
                'subject' => $t['subject'],
                'status' => $t['status'],
                'priority' => $t['priority'],
                'assigned_to' => $assignedTo,
                'closed_at' => $closedAt,
                'created_at' => $createdAt,
                'updated_at' => $closedAt ?? $createdAt,
            ]);

            foreach ($t['messages'] as $m => $msg) {
                $messageAt = $createdAt->copy()->addHours($m * 2 + ($m === 0 ? 0 : mt_rand(1, 5)));
                $isAdmin = $msg['sender'] === 'admin';

                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'sender' => $msg['sender'],
                    'admin_id' => $isAdmin ? $supportAdmin->id : null,
                    'body' => $msg['body'],
                    'created_at' => $messageAt,
                    'updated_at' => $messageAt,
                ]);

                if ($isAdmin) {
                    $lastAdminReplyAt = $messageAt;
                } else {
                    $lastUserReplyAt = $messageAt;
                }
            }

            $ticket->update([
                'user_replied_at' => $lastUserReplyAt,
                'admin_replied_at' => $lastAdminReplyAt,
            ]);

            unset($messageCount);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $allUsers
     */
    private function seedLimitOrders(User $user, \Illuminate\Support\Collection $allUsers): void
    {
        if (LimitOrder::count() >= 5) {
            return;
        }

        $orders = [
            // Spec says 'active' but the model's open-status constant is 'open'.
            ['status' => 'open',      'from' => 'eth', 'to' => 'btc', 'fromNet' => 'eth', 'toNet' => 'btc', 'amount' => 1.5,   'rate' => 0.027,    'daysAgo' => 3,  'expiresInDays' => 27],
            ['status' => 'open',      'from' => 'btc', 'to' => 'usdt', 'fromNet' => 'btc', 'toNet' => 'trx', 'amount' => 0.05, 'rate' => 88000,    'daysAgo' => 1,  'expiresInDays' => 13],
            ['status' => 'filled',    'from' => 'sol', 'to' => 'usdc', 'fromNet' => 'sol', 'toNet' => 'sol', 'amount' => 25,   'rate' => 165,      'daysAgo' => 12, 'expiresInDays' => -2],
            ['status' => 'cancelled', 'from' => 'matic', 'to' => 'eth', 'fromNet' => 'matic', 'toNet' => 'eth', 'amount' => 500, 'rate' => 0.00022,'daysAgo' => 20, 'expiresInDays' => -5],
            ['status' => 'expired',   'from' => 'doge', 'to' => 'btc', 'fromNet' => 'doge', 'toNet' => 'btc', 'amount' => 5000,'rate' => 0.0000028,'daysAgo' => 45, 'expiresInDays' => -15],
        ];

        $userPool = $allUsers->all();

        foreach ($orders as $i => $o) {
            $owner = $i === 0 ? $user : ($userPool[array_rand($userPool)] ?? $user);
            $createdAt = Carbon::now()->subDays($o['daysAgo']);
            $expiresAt = Carbon::now()->addDays($o['expiresInDays']);

            LimitOrder::create([
                'user_id' => $owner->id,
                'from_currency' => $o['from'],
                'to_currency' => $o['to'],
                'from_network' => $o['fromNet'],
                'to_network' => $o['toNet'],
                'amount_send' => $o['amount'],
                'target_rate' => $o['rate'],
                'address' => $this->fakeAddress($o['toNet']),
                'refund_address' => $this->fakeAddress($o['fromNet']),
                'extra_id' => null,
                'status' => $o['status'],
                'expires_at' => $expiresAt,
                'last_polled_at' => $o['status'] === 'open' ? Carbon::now()->subMinutes(mt_rand(1, 15)) : $createdAt->copy()->addHours(mt_rand(1, 48)),
                'last_quoted_rate' => round($o['rate'] * (1 + (mt_rand(-30, 30) / 1000)), 12),
                'last_quoted_at' => $o['status'] === 'open' ? Carbon::now()->subMinutes(mt_rand(1, 15)) : $createdAt->copy()->addHours(mt_rand(1, 48)),
                'ip' => '203.0.113.'.mt_rand(2, 250),
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $allUsers
     */
    private function seedRecurringSchedules(User $user, \Illuminate\Support\Collection $allUsers): void
    {
        if (RecurringSchedule::count() >= 3) {
            return;
        }

        $now = Carbon::now();
        $schedules = [
            [
                'owner' => $user,
                'from' => 'usdc', 'to' => 'btc',
                'fromNet' => 'eth', 'toNet' => 'btc',
                'amount' => 50,
                'frequency' => 'daily',
                'status' => 'active',
                'start_at' => $now->copy()->subDays(14),
                'next_run_at' => $now->copy()->addHours(6),
                'runs_completed' => 14,
                'last_run_at' => $now->copy()->subHours(18),
            ],
            [
                'owner' => $allUsers->get(1) ?? $user,
                'from' => 'usdt', 'to' => 'eth',
                'fromNet' => 'trx', 'toNet' => 'eth',
                'amount' => 200,
                'frequency' => 'weekly',
                'status' => 'active',
                'start_at' => $now->copy()->subWeeks(6),
                'next_run_at' => $now->copy()->addDays(3),
                'runs_completed' => 6,
                'last_run_at' => $now->copy()->subDays(4),
            ],
            [
                'owner' => $allUsers->get(2) ?? $user,
                'from' => 'eth', 'to' => 'usdc',
                'fromNet' => 'eth', 'toNet' => 'eth',
                'amount' => 0.25,
                'frequency' => 'weekly',
                'status' => 'paused',
                'start_at' => $now->copy()->subWeeks(3),
                'next_run_at' => $now->copy()->addDays(7),
                'runs_completed' => 2,
                'last_run_at' => $now->copy()->subDays(10),
            ],
        ];

        foreach ($schedules as $s) {
            RecurringSchedule::create([
                'user_id' => $s['owner']->id,
                'from_currency' => $s['from'],
                'to_currency' => $s['to'],
                'from_network' => $s['fromNet'],
                'to_network' => $s['toNet'],
                'amount_send' => $s['amount'],
                'frequency' => $s['frequency'],
                'start_at' => $s['start_at'],
                'next_run_at' => $s['next_run_at'],
                'end_condition' => 'never',
                'end_at' => null,
                'max_runs' => null,
                'runs_completed' => $s['runs_completed'],
                'status' => $s['status'],
                'address' => $this->fakeAddress($s['toNet']),
                'refund_address' => $this->fakeAddress($s['fromNet']),
                'extra_id' => null,
                'last_run_at' => $s['last_run_at'],
                'created_at' => $s['start_at'],
                'updated_at' => $s['last_run_at'],
            ]);
        }
    }

    private function seedContentSections(): void
    {
        $highlights = [
            'since' => 2024,
            'items' => [
                ['title' => '24/7 live support',         'desc' => 'Our dedicated team is available around the clock to offer personalised assistance with any swap.'],
                ['title' => 'Best market rates',         'desc' => 'Through partnerships with leading liquidity venues, we surface the most competitive rates on every pair.'],
                ['title' => 'Speedy transactions',       'desc' => 'Average swap completes in 5-40 minutes, so you can act on opportunities while they last.'],
                ['title' => 'Non-custodial by design',   'desc' => 'We never hold your assets. Funds move directly between blockchains and your own wallet.'],
            ],
        ];

        $reviews = [
            'items' => [
                ['name' => 'Daniel Cinta',   'rating' => 5, 'body' => 'It is the best I have used. I have been in the crypto world for a while and used several exchanges. This has been by far the smoothest experience yet.'],
                ['name' => 'Ron Cave',       'rating' => 5, 'body' => 'Superb, super easy to use from sign-up to exchanging crypto. Would recommend to anyone who wants no-friction swaps. Well done team.'],
                ['name' => 'Peter Vell',     'rating' => 5, 'body' => 'First time I found the customer service team this helpful. Whatever problem comes up, they have an answer. Five stars across the board.'],
                ['name' => 'Marta Olsson',   'rating' => 5, 'body' => 'Settled in minutes, no account required. The rate I was quoted was the rate I got. Will use again next time I need to rebalance.'],
                ['name' => 'Hideo Kimura',   'rating' => 5, 'body' => 'Cleanest UX of any swap service I have tried. The address verification step saved me from a costly typo. Recommended.'],
                ['name' => 'Amelia Becker',  'rating' => 4, 'body' => 'Solid platform. The fixed-rate option saved me on a volatile swap last week. Slight learning curve at first but support walked me through.'],
            ],
        ];

        $stats = [
            ['value' => 920, 'suffix' => '+',  'label' => 'Supported assets'],
            ['value' => 14,  'suffix' => 'M+', 'label' => 'Swaps completed'],
            ['value' => 190, 'suffix' => '+',  'label' => 'Countries served'],
            ['value' => 6,   'suffix' => 'B+', 'label' => 'In lifetime volume (USD)'],
        ];

        $howItWorks = [
            'items' => [
                ['title' => 'Pick a pair',         'desc' => "Choose what to send and what to receive. We'll fetch a live, real-time rate."],
                ['title' => 'Enter your address',  'desc' => 'Give us the wallet where you want the new asset delivered — no account required.'],
                ['title' => 'Send your deposit',   'desc' => 'Send the exact amount to the one-time address we generate just for this swap.'],
                ['title' => "You're done",         'desc' => 'We exchange and forward funds to your destination wallet automatically.'],
            ],
        ];

        $payload = [
            'highlights' => $highlights,
            'reviews' => $reviews,
            'stats' => $stats,
            'how_it_works' => $howItWorks,
        ];

        foreach ($payload as $key => $data) {
            ContentSection::updateOrCreate(
                ['key' => $key, 'locale' => 'en'],
                ['data' => $data],
            );
        }
    }

    private function seedCampaigns(Admin $admin): void
    {
        $sentAt = Carbon::now()->subDays(8);
        Campaign::updateOrCreate(
            ['name' => 'Spring 2026 fee drop'],
            [
                'subject' => 'Lower fees this month on every swap',
                'body' => "Hi {{name}},\n\nGood news — we've cut our swap fees across the board for the next 30 days. No promo code, no hoops to jump through, every pair benefits automatically.\n\nDrop in and check the new rates: {{site_url}}\n\nThanks for swapping with us,\nThe team",
                'audience' => Campaign::AUDIENCE_OPT_IN,
                'status' => Campaign::STATUS_SENT,
                'recipients_total' => 4820,
                'recipients_sent' => 4811,
                'scheduled_at' => $sentAt->copy()->subHours(1),
                'sent_at' => $sentAt,
                'created_by' => $admin->id,
                'created_at' => $sentAt->copy()->subDays(2),
                'updated_at' => $sentAt,
            ],
        );

        Campaign::updateOrCreate(
            ['name' => 'New limit orders feature'],
            [
                'subject' => 'Set a target rate. We do the rest.',
                'body' => "Hey {{name}},\n\nWe just rolled out limit orders — set the rate you want, and we'll trigger the swap the moment the market hits it. No need to babysit charts.\n\nTry it out on your dashboard.\n\n— Team SwapForge",
                'audience' => Campaign::AUDIENCE_CUSTOMERS_WITH_SWAPS,
                'status' => Campaign::STATUS_DRAFT,
                'recipients_total' => 0,
                'recipients_sent' => 0,
                'scheduled_at' => null,
                'sent_at' => null,
                'created_by' => $admin->id,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subHours(3),
            ],
        );
    }

    private function seedPages(): void
    {
        $pages = [
            [
                'slug' => 'privacy-policy',
                'sort_order' => 1,
                'title' => 'Privacy Policy',
                'excerpt' => 'How we collect, use, and protect data when you swap crypto with us.',
                'body' => <<<'MD'
## Our commitment

We built this service so you can swap crypto without handing over more personal information than is strictly necessary. This policy explains what we collect, why we collect it, and what we do with it.

## What we collect

When you initiate a swap we record the swap parameters (amounts, currencies, networks, destination address), a hashed reference of your IP address, and a coarse country code derived from that IP for fraud-prevention purposes. If you create an account we additionally store your email address and a securely hashed password.

We do not collect government identifiers, photos, or any data the swap itself does not require.

## How we use it

The swap parameters are forwarded to our liquidity partners to execute your trade. The IP and country code are used solely for abuse detection — we do not sell, rent, or otherwise commercialise any of this data.

## Retention

Swap records are retained for as long as regulatory and accounting requirements demand, typically five years. You can request export or deletion of account-level data at any time by contacting support.

## Cookies

We use a single first-party cookie to keep your session active between page loads. No third-party advertising cookies are set by this site.
MD,
            ],
            [
                'slug' => 'terms-of-service',
                'sort_order' => 2,
                'title' => 'Terms of Service',
                'excerpt' => 'The rules that govern your use of our crypto swap service.',
                'body' => <<<'MD'
## Agreement

By initiating a swap on this platform you agree to these terms in full. If you do not agree, please do not use the service.

## Eligibility

You must be of legal age in your jurisdiction to use this service, and you must not be a resident of any jurisdiction in which the service is unlawful. You are solely responsible for compliance with local laws.

## Service description

We provide a non-custodial interface that routes your swap through third-party liquidity venues. We never hold your funds — assets move directly between blockchains and your wallet. Rates are sourced live and may shift between quote and execution; the fixed-rate flow locks a rate at quote time for an additional spread.

## User responsibilities

You are responsible for providing the correct destination address and network. Funds sent to an incorrect address or on an incorrect network may be unrecoverable. We strongly recommend double-checking every detail before sending.

## Limitation of liability

To the maximum extent permitted by law, our liability for any single swap is limited to the value of that swap. We are not liable for losses arising from blockchain congestion, third-party venue outages, or user error.

## Changes to terms

We may update these terms from time to time. Continued use of the service after a change constitutes acceptance of the updated terms.
MD,
            ],
            [
                'slug' => 'about-us',
                'sort_order' => 3,
                'title' => 'About Us',
                'excerpt' => 'Who we are and why we built a non-custodial swap platform.',
                'body' => <<<'MD'
## Our story

We started this project because we were tired of swap services that felt like 2017 — clunky interfaces, opaque fees, and custodial flows that asked for far more trust than necessary. We wanted something faster, cleaner, and demonstrably non-custodial.

## What we do

We aggregate liquidity from multiple swap venues and surface the best rate for every pair. Behind the scenes, we route your trade through whichever partner can fill it most efficiently at that moment. You see one quote, one address, and one confirmation — the complexity is hidden where it belongs.

## Why non-custodial matters

Custodial exchanges are a single point of failure. Even well-run ones get hacked, frozen, or wound up. By never taking custody of your funds we remove that risk from the equation. Your assets are in your wallet right up until the moment they hit the partner venue, and they come back into your wallet seconds later.

## The team

We're a small distributed team of engineers, designers, and crypto natives. Some of us have been in the space since the early Bitcoin days; others joined during the DeFi summer. All of us believe that good infrastructure should be invisible.

## Get in touch

Questions, feedback, or feature requests? Drop us a line through the support tab — a real human reads every message.
MD,
            ],
        ];

        foreach ($pages as $p) {
            $page = Page::firstOrCreate(
                ['slug' => $p['slug']],
                [
                    'title' => $p['title'],
                    'excerpt' => $p['excerpt'],
                    'body' => $p['body'],
                    'status' => Page::STATUS_PUBLISHED,
                    'show_in_header' => false,
                    'show_in_footer' => true,
                    'sort_order' => $p['sort_order'],
                ],
            );

            PageTranslation::updateOrCreate(
                ['page_id' => $page->id, 'locale' => 'en'],
                [
                    'title' => $p['title'],
                    'excerpt' => $p['excerpt'],
                    'body' => $p['body'],
                ],
            );
        }
    }

    private function fakeAddress(?string $coin): string
    {
        return match (strtolower((string) $coin)) {
            'btc' => 'bc1q'.bin2hex(random_bytes(15)),
            'ltc' => 'ltc1'.bin2hex(random_bytes(15)),
            'doge' => 'D'.Str::random(33),
            'trx' => 'T'.Str::random(33),
            'sol' => Str::random(43),
            'xmr' => '4'.Str::random(94),
            'ada' => 'addr1'.Str::random(98),
            'near' => Str::random(8).'.near',
            'atom' => 'cosmos1'.Str::random(38),
            default => '0x'.bin2hex(random_bytes(20)),
        };
    }
}
