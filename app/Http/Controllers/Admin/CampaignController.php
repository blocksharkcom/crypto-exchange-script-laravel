<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = Campaign::query()
            ->latest()
            ->limit(200)
            ->get()
            ->map(fn (Campaign $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'subject' => $c->subject,
                'audience' => $c->audience,
                'status' => $c->status,
                'recipients_total' => (int) $c->recipients_total,
                'recipients_sent' => (int) $c->recipients_sent,
                'scheduled_at' => $c->scheduled_at?->toIso8601String(),
                'sent_at' => $c->sent_at?->toIso8601String(),
                'created_at' => $c->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('Admin/Campaigns/Index', [
            'campaigns' => $campaigns,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Campaigns/Edit', [
            'campaign' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $campaign = Campaign::create([
            ...$data,
            'status' => Campaign::STATUS_DRAFT,
            'created_by' => auth('admin')->id(),
        ]);

        return redirect()
            ->route('admin.campaigns.edit', $campaign)
            ->with('success', trans('site.admin.campaigns.created'));
    }

    public function edit(Campaign $campaign): Response
    {
        return Inertia::render('Admin/Campaigns/Edit', [
            'campaign' => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'subject' => $campaign->subject,
                'body' => $campaign->body,
                'audience' => $campaign->audience,
                'status' => $campaign->status,
                'recipients_total' => (int) $campaign->recipients_total,
                'recipients_sent' => (int) $campaign->recipients_sent,
                'sent_at' => $campaign->sent_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, Campaign $campaign): RedirectResponse
    {
        if (! in_array($campaign->status, [Campaign::STATUS_DRAFT, Campaign::STATUS_FAILED], true)) {
            return back()->with('error', trans('site.admin.campaigns.locked'));
        }

        $campaign->update($this->validated($request));

        return back()->with('success', trans('site.admin.campaigns.saved'));
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        $campaign->delete();

        return redirect()
            ->route('admin.campaigns.index')
            ->with('success', trans('site.admin.campaigns.deleted'));
    }

    public function send(Campaign $campaign): RedirectResponse
    {
        if (! in_array($campaign->status, [Campaign::STATUS_DRAFT, Campaign::STATUS_FAILED], true)) {
            return back()->with('error', trans('site.admin.campaigns.already_sent'));
        }

        $campaign->update([
            'status' => Campaign::STATUS_QUEUED,
            'recipients_sent' => 0,
        ]);

        SendCampaignJob::dispatch($campaign->id);

        return redirect()
            ->route('admin.campaigns.index')
            ->with('success', trans('site.admin.campaigns.queued'));
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'subject' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:200000'],
            'audience' => ['required', Rule::in([
                Campaign::AUDIENCE_ALL,
                Campaign::AUDIENCE_OPT_IN,
                Campaign::AUDIENCE_CUSTOMERS_WITH_SWAPS,
            ])],
        ]);
    }
}
