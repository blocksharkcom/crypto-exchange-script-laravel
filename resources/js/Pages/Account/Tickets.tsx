import { Head, Link } from '@inertiajs/react';
import AccountLayout from '@/layouts/AccountLayout';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface TicketRow {
    id: number;
    subject: string;
    status: string;
    priority: string;
    portal_url: string;
    created_at: string | null;
    updated_at: string | null;
    transaction: {
        provider_id: string | null;
        from_currency: string;
        to_currency: string;
    } | null;
}

interface Props {
    tickets: TicketRow[];
}

export default function Tickets({ tickets }: Props) {
    const t = useT();
    return (
        <AccountLayout
            title={t('account.tickets.title')}
            subtitle={t('account.tickets.subtitle')}
            actions={
                <Link href="/help" className="cta cta-ghost !w-auto !px-4 !py-2 !text-sm">
                    {t('account.tickets.open_help')}
                </Link>
            }
        >
            <Head title={t('account.tickets.title')} />

            <div className="surface-card border border-line-1 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-muted-3 text-left">
                                <th className="px-4 py-2.5 font-semibold">{t('account.tickets.col_subject')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.tickets.col_status')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.tickets.col_updated')}</th>
                                <th className="px-4 py-2.5 font-semibold text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-3">
                                        {t('account.tickets.empty')}
                                    </td>
                                </tr>
                            )}
                            {tickets.map((tk) => (
                                <tr key={tk.id} className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]/40">
                                    <td className="px-4 py-2.5">
                                        <div className="text-sm">{tk.subject}</div>
                                        {tk.transaction && (
                                            <div className="text-[11px] text-muted-3 uppercase mt-0.5">
                                                <PairBadge from={tk.transaction.from_currency} to={tk.transaction.to_currency} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5"><StatusPill status={tk.status} /></td>
                                    <td className="px-4 py-2.5 text-xs text-muted-3">
                                        {tk.updated_at ? new Date(tk.updated_at).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <a href={tk.portal_url} className="text-xs text-muted-2 hover:text-[color:var(--text-1)]">
                                            {t('account.tickets.view')}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AccountLayout>
    );
}

function StatusPill({ status }: { status: string }) {
    const tone = (() => {
        if (status === 'closed') return 'surface-card-2 text-muted-3 ring-1 ring-line-2';
        if (status === 'pending') return 'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-1 ring-[color:var(--warn-border)]';
        return 'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-1 ring-[color:var(--color-brand-300)]/25';
    })();
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide', tone)}>
            {status}
        </span>
    );
}
