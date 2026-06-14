import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import StatusBadge from '@/components/admin/StatusBadge';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { useT } from '@/lib/i18n';
import { formatAmount, shorten } from '@/lib/utils';
import type { Paginator } from '@/Types';

interface TxRow {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    from_network: string | null;
    to_network: string | null;
    amount_send: number;
    amount_receive: number;
    flow: string;
    status: string;
    stuck_flagged: boolean;
    email: string | null;
    country: string | null;
    created_at: string | null;
}

interface Filters {
    q: string;
    status: string;
    from: string;
    to: string;
    flow: string;
    date_from: string;
    date_to: string;
    stuck: boolean;
}

interface Props {
    transactions: Paginator<TxRow>;
    filters: Filters;
    stuck_only: boolean;
    statuses: string[];
}

export default function TransactionsIndex({ transactions, filters, stuck_only, statuses }: Props) {
    const t = useT();
    const [local, setLocal] = useState<Filters>(filters);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params: Record<string, string> = {};
        Object.entries(local).forEach(([k, v]) => {
            if (typeof v === 'boolean') {
                if (v) params[k] = '1';
            } else if (v !== '') {
                params[k] = String(v);
            }
        });
        router.get(
            stuck_only ? route('admin.transactions.stuck') : route('admin.transactions.index'),
            params,
            { preserveState: true, replace: true },
        );
    }

    function reset() {
        setLocal({ q: '', status: '', from: '', to: '', flow: '', date_from: '', date_to: '', stuck: stuck_only });
        router.get(
            stuck_only ? route('admin.transactions.stuck') : route('admin.transactions.index'),
            {},
            { preserveState: false, replace: true },
        );
    }

    function exportCsv() {
        const params = new URLSearchParams();
        Object.entries(local).forEach(([k, v]) => {
            if (typeof v === 'boolean') {
                if (v) params.set(k, '1');
            } else if (v !== '') {
                params.set(k, String(v));
            }
        });
        if (stuck_only) params.set('stuck', '1');
        const qs = params.toString();
        window.location.href = `${route('admin.transactions.export')}${qs ? '?' + qs : ''}`;
    }

    const cols: Column<TxRow>[] = [
        {
            key: 'id',
            header: t('admin.tx.col_id'),
            cell: (row) => (
                <Link href={route('admin.transactions.show', row.id)} className="font-mono text-xs hover:underline">
                    {row.provider_id ? shorten(row.provider_id, 6, 4) : `#${row.id}`}
                </Link>
            ),
        },
        {
            key: 'pair',
            header: t('admin.tx.col_pair'),
            cell: (row) => (
                <span className="inline-flex items-center gap-2 font-semibold uppercase text-xs">
                    <CoinIcon ticker={row.from_currency} size={20} />
                    <span>{row.from_currency}</span>
                    <span className="text-muted-3">→</span>
                    <CoinIcon ticker={row.to_currency} size={20} />
                    <span>{row.to_currency}</span>
                </span>
            ),
        },
        {
            key: 'amount',
            header: t('admin.tx.col_amount'),
            cell: (row) => (
                <span className="text-xs tabular-nums">
                    {formatAmount(row.amount_send)} <span className="text-muted-3 uppercase">{row.from_currency}</span>
                </span>
            ),
        },
        {
            key: 'email',
            header: t('admin.tx.col_email'),
            cell: (row) => <span className="text-xs">{row.email ?? '—'}</span>,
        },
        {
            key: 'country',
            header: t('admin.tx.col_country'),
            cell: (row) => <span className="text-xs uppercase">{row.country ?? '—'}</span>,
        },
        {
            key: 'flow',
            header: t('admin.tx.col_flow'),
            cell: (row) => <span className="text-xs uppercase">{row.flow}</span>,
        },
        {
            key: 'status',
            header: t('admin.tx.col_status'),
            cell: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'stuck',
            header: t('admin.tx.col_stuck'),
            cell: (row) => (
                row.stuck_flagged
                    ? <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25">!</span>
                    : <span className="text-muted-4">—</span>
            ),
        },
        {
            key: 'created',
            header: t('admin.tx.col_created'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                </span>
            ),
        },
    ];

    const title = stuck_only ? t('admin.tx.stuck_title') : t('admin.tx.title');

    return (
        <AdminLayout
            title={title}
            actions={
                <button type="button" onClick={exportCsv} className="cta cta-ghost !w-auto !px-4 !py-2 !text-sm">
                    {t('admin.common.export')}
                </button>
            }
        >
            <Head title={title} />

            <form onSubmit={submit} className="surface-card border border-line-1 rounded-xl p-3 grid gap-2 md:grid-cols-12 md:items-end mb-4">
                <div className="md:col-span-4">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.common.search')}
                    </label>
                    <input
                        type="text"
                        value={local.q}
                        onChange={(e) => setLocal({ ...local, q: e.target.value })}
                        placeholder={t('admin.tx.search_ph')}
                        className="surface-input border border-line-1 rounded-lg px-3 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.tx.filter_status')}
                    </label>
                    <select
                        value={local.status}
                        onChange={(e) => setLocal({ ...local, status: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    >
                        <option value="">{t('admin.common.all')}</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>{t(`status.${s}`)}</option>
                        ))}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.tx.filter_from')}
                    </label>
                    <input
                        type="text"
                        value={local.from}
                        onChange={(e) => setLocal({ ...local, from: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm uppercase"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.tx.filter_to')}
                    </label>
                    <input
                        type="text"
                        value={local.to}
                        onChange={(e) => setLocal({ ...local, to: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm uppercase"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.tx.filter_flow')}
                    </label>
                    <select
                        value={local.flow}
                        onChange={(e) => setLocal({ ...local, flow: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    >
                        <option value="">{t('admin.common.all')}</option>
                        <option value="standard">{t('admin.tx.flow_standard')}</option>
                        <option value="fixed-rate">{t('admin.tx.flow_fixed')}</option>
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.common.date_from')}
                    </label>
                    <input
                        type="date"
                        value={local.date_from}
                        onChange={(e) => setLocal({ ...local, date_from: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">
                        {t('admin.common.date_to')}
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
                        {t('admin.common.apply')}
                    </button>
                    <button type="button" onClick={reset} className="cta cta-ghost !w-auto !px-4 !py-2 !text-sm">
                        {t('admin.common.reset')}
                    </button>
                </div>
            </form>

            <DataTable<TxRow>
                rows={transactions.data}
                columns={cols}
                rowKey={(r) => r.id}
                dense
            />

            <Pagination
                current={transactions.current_page}
                last={transactions.last_page}
                links={transactions.links}
                from={transactions.from}
                to={transactions.to}
                total={transactions.total}
            />
        </AdminLayout>
    );
}
