import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Status = 'draft' | 'queued' | 'sending' | 'sent' | 'failed';

interface CampaignRow {
    id: number;
    name: string;
    subject: string;
    audience: 'all' | 'marketing_opt_in' | 'customers_with_swaps';
    status: Status;
    recipients_total: number;
    recipients_sent: number;
    scheduled_at: string | null;
    sent_at: string | null;
    created_at: string | null;
}

interface Props {
    campaigns: CampaignRow[];
}

const TONE: Record<Status, string> = {
    draft:   'bg-white/5 text-[color:var(--text-3)] ring-[color:var(--line-2)]',
    queued:  'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    sending: 'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    sent:    'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-[color:var(--color-brand-300)]/30',
    failed:  'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export default function CampaignsIndex({ campaigns }: Props) {
    const t = useT();

    function destroy(row: CampaignRow): void {
        if (!window.confirm(t('admin.campaigns.delete_confirm'))) return;
        router.delete(route('admin.campaigns.destroy', row.id), { preserveScroll: true });
    }

    function sendNow(row: CampaignRow): void {
        if (!window.confirm(t('admin.campaigns.send_confirm'))) return;
        router.post(route('admin.campaigns.send', row.id), {}, { preserveScroll: true });
    }

    const cols: Column<CampaignRow>[] = [
        {
            key: 'name',
            header: t('admin.campaigns.col_name'),
            cell: (row) => (
                <Link href={route('admin.campaigns.edit', row.id)} className="text-sm font-semibold hover:underline">
                    {row.name}
                </Link>
            ),
        },
        {
            key: 'subject',
            header: t('admin.campaigns.col_subject'),
            cell: (row) => <span className="text-xs text-muted-2 truncate">{row.subject}</span>,
        },
        {
            key: 'audience',
            header: t('admin.campaigns.col_audience'),
            cell: (row) => (
                <span className="text-[11px] uppercase tracking-wide text-muted-2">
                    {t(`admin.campaigns.audience_${row.audience}`)}
                </span>
            ),
        },
        {
            key: 'status',
            header: t('admin.campaigns.col_status'),
            cell: (row) => (
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset',
                        TONE[row.status],
                    )}
                >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                    {t(`admin.campaigns.status_${row.status}`)}
                </span>
            ),
        },
        {
            key: 'sent',
            header: t('admin.campaigns.col_sent'),
            cell: (row) => (
                <span className="text-xs text-muted-2 font-mono">
                    {t('admin.campaigns.sent_progress', { sent: row.recipients_sent, total: row.recipients_total })}
                </span>
            ),
        },
        {
            key: 'date',
            header: t('admin.campaigns.col_date'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: t('admin.campaigns.col_actions'),
            cell: (row) => {
                const canSend = row.status === 'draft' || row.status === 'failed';
                const canEdit = row.status === 'draft' || row.status === 'failed';
                return (
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <Link
                                href={route('admin.campaigns.edit', row.id)}
                                className="text-xs font-semibold text-[color:var(--text-1)] hover:underline"
                            >
                                {t('admin.common.edit')}
                            </Link>
                        )}
                        {canSend ? (
                            <button
                                type="button"
                                onClick={() => sendNow(row)}
                                className="text-xs font-semibold text-[color:var(--color-brand-300)] hover:opacity-80"
                            >
                                {t('admin.campaigns.send_now')}
                            </button>
                        ) : (
                            <span className="text-xs text-muted-3">{t('admin.campaigns.send_disabled_when_sent')}</span>
                        )}
                        <button
                            type="button"
                            onClick={() => destroy(row)}
                            className="text-xs font-semibold text-rose-400 hover:opacity-80"
                        >
                            {t('admin.common.delete')}
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <AdminLayout
            title={t('admin.campaigns.title')}
            subtitle={t('admin.campaigns.subtitle')}
            actions={
                <Link href={route('admin.campaigns.create')} className="cta !py-1.5 !px-3 !text-sm">
                    {t('admin.campaigns.create')}
                </Link>
            }
        >
            <Head title={t('admin.campaigns.title')} />

            <DataTable<CampaignRow>
                rows={campaigns}
                columns={cols}
                rowKey={(r) => r.id}
                dense
            />
        </AdminLayout>
    );
}
