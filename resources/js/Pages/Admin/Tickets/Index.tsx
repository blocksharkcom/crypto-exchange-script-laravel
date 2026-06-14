import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import StatusBadge from '@/components/admin/StatusBadge';
import { useT } from '@/lib/i18n';
import type { Paginator } from '@/Types';

interface TicketRow {
    id: number;
    subject: string;
    email: string;
    user_email: string | null;
    status: string;
    priority: string;
    created_at: string | null;
    updated_at: string | null;
}

interface Props {
    tickets: Paginator<TicketRow>;
    filters: { q: string; status: string };
}

export default function TicketsIndex({ tickets, filters }: Props) {
    const t = useT();
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (q) params.q = q;
        if (status) params.status = status;
        router.get(route('admin.tickets.index'), params, { preserveState: true, replace: true });
    }

    const cols: Column<TicketRow>[] = [
        {
            key: 'subject',
            header: t('admin.tickets.col_subject'),
            cell: (row) => (
                <Link href={route('admin.tickets.show', row.id)} className="text-sm font-semibold hover:underline">
                    {row.subject}
                </Link>
            ),
        },
        {
            key: 'email',
            header: t('admin.tickets.col_email'),
            cell: (row) => <span className="text-xs">{row.email}</span>,
        },
        {
            key: 'priority',
            header: t('admin.tickets.col_priority'),
            cell: (row) => <span className="text-xs uppercase">{row.priority}</span>,
        },
        {
            key: 'status',
            header: t('admin.tickets.col_status'),
            cell: (row) => <StatusBadge status={row.status} namespace="admin.tickets.status" />,
        },
        {
            key: 'updated',
            header: t('admin.tickets.col_updated'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout title={t('admin.tickets.title')}>
            <Head title={t('admin.tickets.title')} />

            <form onSubmit={submit} className="surface-card border border-line-1 rounded-xl p-3 flex flex-wrap items-center gap-2 mb-4">
                <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('admin.tickets.search_ph')}
                    className="surface-input border border-line-1 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="surface-input border border-line-1 rounded-lg px-2 py-1.5 text-sm"
                >
                    <option value="">{t('admin.common.all')}</option>
                    <option value="open">{t('admin.tickets.status_open')}</option>
                    <option value="pending">{t('admin.tickets.status_pending')}</option>
                    <option value="closed">{t('admin.tickets.status_closed')}</option>
                </select>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold">
                    {t('admin.common.apply')}
                </button>
            </form>

            <DataTable<TicketRow>
                rows={tickets.data}
                columns={cols}
                rowKey={(r) => r.id}
                dense
            />

            <Pagination
                current={tickets.current_page}
                last={tickets.last_page}
                links={tickets.links}
                from={tickets.from}
                to={tickets.to}
                total={tickets.total}
            />
        </AdminLayout>
    );
}
