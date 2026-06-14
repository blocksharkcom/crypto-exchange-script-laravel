import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Audience = 'all' | 'marketing_opt_in' | 'customers_with_swaps';

interface CampaignData {
    id: number;
    name: string;
    subject: string;
    body: string;
    audience: Audience;
    status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed';
    recipients_total: number;
    recipients_sent: number;
    sent_at: string | null;
}

interface Props {
    campaign: CampaignData | null;
}

const AUDIENCES: Audience[] = ['marketing_opt_in', 'customers_with_swaps', 'all'];

export default function CampaignsEdit({ campaign }: Props) {
    const t = useT();
    const isCreate = campaign === null;
    const locked = campaign !== null && !(campaign.status === 'draft' || campaign.status === 'failed');

    const form = useForm({
        name:     campaign?.name ?? '',
        subject:  campaign?.subject ?? '',
        body:     campaign?.body ?? '',
        audience: campaign?.audience ?? 'marketing_opt_in',
    });

    function submit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        if (locked) return;
        if (isCreate) {
            form.post(route('admin.campaigns.store'));
        } else if (campaign) {
            form.put(route('admin.campaigns.update', campaign.id));
        }
    }

    return (
        <AdminLayout
            title={isCreate ? t('admin.campaigns.create_title') : t('admin.campaigns.edit_title')}
            subtitle={isCreate ? undefined : campaign?.name}
        >
            <Head title={isCreate ? t('admin.campaigns.create_title') : t('admin.campaigns.edit_title')} />

            {locked && (
                <div className="mb-4 surface-card border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-amber-200 bg-amber-500/5">
                    {t('admin.campaigns.edit_locked')}
                </div>
            )}

            <form onSubmit={submit} className="grid lg:grid-cols-[1fr_320px] gap-4">
                <div className="grid gap-4">
                    <div className="surface-card border border-line-1 rounded-xl p-5 grid gap-4">
                        <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.campaigns.name')}
                            </label>
                            <input
                                type="text"
                                value={form.data.name}
                                disabled={locked}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm disabled:opacity-60"
                            />
                            <p className="mt-1 text-xs text-muted-3">{t('admin.campaigns.name_hint')}</p>
                            {form.errors.name && <p className="mt-1 text-xs text-rose-400">{form.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.campaigns.subject')}
                            </label>
                            <input
                                type="text"
                                value={form.data.subject}
                                disabled={locked}
                                onChange={(e) => form.setData('subject', e.target.value)}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm disabled:opacity-60"
                            />
                            {form.errors.subject && <p className="mt-1 text-xs text-rose-400">{form.errors.subject}</p>}
                        </div>
                    </div>

                    <div className="surface-card border border-line-1 rounded-xl p-5">
                        <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                            {t('admin.campaigns.body')}
                        </label>
                        <textarea
                            value={form.data.body}
                            disabled={locked}
                            onChange={(e) => form.setData('body', e.target.value)}
                            rows={22}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm font-mono resize-y disabled:opacity-60"
                            spellCheck={false}
                        />
                        {form.errors.body && <p className="mt-1 text-xs text-rose-400">{form.errors.body}</p>}
                    </div>
                </div>

                <aside className="grid gap-4 h-fit">
                    <div className="surface-card border border-line-1 rounded-xl p-5">
                        <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-2">
                            {t('admin.campaigns.audience')}
                        </div>
                        <div className="grid gap-2">
                            {AUDIENCES.map((opt) => (
                                <label
                                    key={opt}
                                    className={cn(
                                        'cursor-pointer surface-input border rounded-lg px-3 py-2',
                                        form.data.audience === opt
                                            ? 'border-[color:var(--color-brand-300)]'
                                            : 'border-line-1',
                                        locked && 'opacity-60 cursor-not-allowed',
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="audience"
                                            value={opt}
                                            checked={form.data.audience === opt}
                                            disabled={locked}
                                            onChange={() => form.setData('audience', opt)}
                                            className="accent-[color:var(--color-brand-300)]"
                                        />
                                        <span className="text-sm font-semibold">{t(`admin.campaigns.audience_${opt}`)}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-3 pl-5">{t(`admin.campaigns.audience_${opt}_hint`)}</p>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="surface-card border border-line-1 rounded-xl p-5 flex items-center justify-end gap-2">
                        <Link
                            href={route('admin.campaigns.index')}
                            className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-muted-2"
                        >
                            {t('admin.common.cancel')}
                        </Link>
                        {!locked && (
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="cta !py-1.5 !px-3 !text-sm disabled:opacity-50"
                            >
                                {form.processing ? <span className="spinner" /> : t('admin.common.save')}
                            </button>
                        )}
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}
