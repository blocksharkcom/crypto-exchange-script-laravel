import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AccountLayout from '@/layouts/AccountLayout';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn, formatAmount, shorten } from '@/lib/utils';
import type { Paginator } from '@/Types';

interface TxRow {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    amount_send: number;
    amount_receive: number;
    flow: string;
    status: string;
    created_at: string | null;
}

interface Filters {
    q: string;
    status: string;
    date_from: string;
    date_to: string;
}

interface Props {
    transactions: Paginator<TxRow>;
    filters: Filters;
    statuses: string[];
}

export default function Transactions({ transactions, filters, statuses }: Props) {
    const t = useT();
    const [local, setLocal] = useState<Filters>(filters);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params: Record<string, string> = {};
        (Object.entries(local) as Array<[keyof Filters, string]>).forEach(([k, v]) => {
            if (v !== '') params[k] = v;
        });
        router.get(route('account.transactions'), params, { preserveState: true, replace: true });
    }

    function reset() {
        setLocal({ q: '', status: '', date_from: '', date_to: '' });
        router.get(route('account.transactions'), {}, { preserveState: false, replace: true });
    }

    return (
        <AccountLayout title={t('account.transactions.title')}>
            <Head title={t('account.transactions.title')} />

            <form onSubmit={submit} className="surface-card border border-line-1 rounded-2xl p-3 grid gap-2 md:grid-cols-12 md:items-end mb-4">
                <div className="md:col-span-5">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('account.transactions.filter_search')}
                    </label>
                    <input
                        type="text"
                        value={local.q}
                        onChange={(e) => setLocal({ ...local, q: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-3 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('account.transactions.filter_status')}
                    </label>
                    <select
                        value={local.status}
                        onChange={(e) => setLocal({ ...local, status: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    >
                        <option value="">{t('account.transactions.all_statuses')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(`status.${s}`)}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('account.transactions.date_from')}
                    </label>
                    <input
                        type="date"
                        value={local.date_from}
                        onChange={(e) => setLocal({ ...local, date_from: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('account.transactions.date_to')}
                    </label>
                    <input
                        type="date"
                        value={local.date_to}
                        onChange={(e) => setLocal({ ...local, date_to: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-12 flex flex-wrap items-center gap-2">
                    <button type="submit" className="cta !w-auto !px-4 !py-2 !text-sm">
                        {t('account.transactions.apply')}
                    </button>
                    <button type="button" onClick={reset} className="cta cta-ghost !w-auto !px-4 !py-2 !text-sm">
                        {t('account.transactions.reset')}
                    </button>
                </div>
            </form>

            <div className="surface-card border border-line-1 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-muted-3 text-left">
                                <th className="px-4 py-2.5 font-semibold">{t('account.transactions.col_id')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.transactions.col_pair')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.transactions.col_amount')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.transactions.col_status')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.transactions.col_date')}</th>
                                <th className="px-4 py-2.5 font-semibold text-right">{t('account.transactions.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-3">
                                        {t('account.transactions.empty')}
                                    </td>
                                </tr>
                            )}
                            {transactions.data.map((tx) => (
                                <tr key={tx.id} className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]/40">
                                    <td className="px-4 py-2.5 font-mono text-xs text-muted-2">
                                        {tx.provider_id ? shorten(tx.provider_id, 6, 4) : `#${tx.id}`}
                                    </td>
                                    <td className="px-4 py-2.5 font-semibold uppercase text-xs">
                                        <PairBadge from={tx.from_currency} to={tx.to_currency} />
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {formatAmount(tx.amount_send)} {tx.from_currency.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-2.5"><StatusPill status={tx.status} /></td>
                                    <td className="px-4 py-2.5 text-xs text-muted-3">
                                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        {tx.provider_id && (
                                            <a href={`/tx/${tx.provider_id}`} className="text-xs text-muted-2 hover:text-[color:var(--text-1)]">
                                                {t('account.transactions.view')}
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line-1 text-sm">
                        <span className="text-muted-3 text-xs">
                            {transactions.from ?? 0}–{transactions.to ?? 0} / {transactions.total}
                        </span>
                        <div className="flex items-center gap-1">
                            {transactions.links.map((l, i) => (
                                <Link
                                    key={i}
                                    href={l.url ?? '#'}
                                    preserveScroll
                                    className={cn(
                                        'px-2.5 py-1 rounded-md text-xs',
                                        l.active ? 'surface-card-2 ring-1 ring-line-2 text-[color:var(--text-1)] font-semibold' : 'text-muted-2 hover:text-[color:var(--text-1)]',
                                        !l.url && 'opacity-40 pointer-events-none',
                                    )}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AccountLayout>
    );
}

function StatusPill({ status }: { status: string }) {
    const t = useT();
    const tone = (() => {
        if (status === 'finished') return 'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-1 ring-[color:var(--color-brand-300)]/25';
        if (status === 'failed' || status === 'expired') return 'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-1 ring-[color:var(--warn-border)]';
        if (status === 'refunded') return 'bg-[color:var(--promo-bg)] text-[color:var(--promo-text)] ring-1 ring-[color:var(--promo-border)]';
        return 'surface-card-2 text-muted-2 ring-1 ring-line-2';
    })();
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide', tone)}>
            {t(`status.${status}`)}
        </span>
    );
}
