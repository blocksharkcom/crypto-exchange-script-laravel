import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import { useT } from '@/lib/i18n';
import type { Paginator } from '@/Types';

interface UserRow {
    id: number;
    email: string | null;
    name: string | null;
    country: string | null;
    transactions_count: number;
    last_seen_at: string | null;
    created_at: string | null;
    suspended_at: string | null;
}

interface Props {
    users: Paginator<UserRow>;
    filters: { q: string; status: string };
}

export default function UsersIndex({ users, filters }: Props) {
    const t = useT();
    const [q, setQ] = useState(filters.q);
    const [status, setStatus] = useState(filters.status);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (q) params.q = q;
        if (status) params.status = status;
        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    }

    function destroy(row: UserRow): void {
        if (!window.confirm(t('admin.users.delete_confirm'))) return;
        router.delete(route('admin.users.destroy', row.id), { preserveScroll: true });
    }

    function restore(row: UserRow): void {
        router.post(route('admin.users.restore', row.id), {}, { preserveScroll: true });
    }

    function suspend(row: UserRow): void {
        const reason = window.prompt(t('admin.users.suspend_modal.reason_label')) ?? '';
        router.post(route('admin.users.suspend', row.id), { reason }, { preserveScroll: true });
    }

    const cols: Column<UserRow>[] = [
        {
            key: 'email',
            header: t('admin.users.col_email'),
            cell: (row) => (
                <Link href={route('admin.users.show', row.id)} className="text-sm font-semibold hover:underline">
                    {row.email ?? `#${row.id}`}
                </Link>
            ),
        },
        {
            key: 'country',
            header: t('admin.users.col_country'),
            cell: (row) => <span className="text-xs uppercase text-muted-2">{row.country ?? '—'}</span>,
        },
        {
            key: 'swaps',
            header: t('admin.users.col_swaps'),
            cell: (row) => <span className="text-sm font-semibold">{row.transactions_count}</span>,
        },
        {
            key: 'status',
            header: t('admin.users.col_status'),
            cell: (row) =>
                row.suspended_at ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase font-semibold bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30">
                        {t('admin.users.status_suspended')}
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase font-semibold bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-1 ring-inset ring-[color:var(--color-brand-300)]/30">
                        {t('admin.users.status_active')}
                    </span>
                ),
        },
        {
            key: 'last_seen',
            header: t('admin.users.col_last_seen'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : t('admin.common.never')}
                </span>
            ),
        },
        {
            key: 'created',
            header: t('admin.common.created_at'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: t('admin.users.col_actions'),
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.users.edit', row.id)}
                        className="text-xs font-semibold text-[color:var(--text-1)] hover:underline"
                    >
                        {t('admin.users.edit_action')}
                    </Link>
                    {row.suspended_at ? (
                        <button
                            type="button"
                            onClick={() => restore(row)}
                            className="text-xs font-semibold text-[color:var(--color-brand-300)] hover:opacity-80"
                        >
                            {t('admin.users.restore_action')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => suspend(row)}
                            className="text-xs font-semibold text-amber-400 hover:opacity-80"
                        >
                            {t('admin.users.suspend_action')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => destroy(row)}
                        className="text-xs font-semibold text-rose-400 hover:opacity-80"
                    >
                        {t('admin.users.delete_action')}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title={t('admin.users.title')}
            actions={
                <Link href={route('admin.users.create')} className="cta !py-1.5 !px-3 !text-sm">
                    {t('admin.users.create')}
                </Link>
            }
        >
            <Head title={t('admin.users.title')} />

            <form onSubmit={submit} className="surface-card border border-line-1 rounded-xl p-3 flex flex-wrap items-center gap-2 mb-4">
                <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t('admin.users.search_ph')}
                    className="surface-input border border-line-1 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[240px]"
                />
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="surface-input border border-line-1 rounded-lg px-2 py-1.5 text-sm"
                >
                    <option value="">{t('admin.users.filter_all')}</option>
                    <option value="active">{t('admin.users.filter_active')}</option>
                    <option value="suspended">{t('admin.users.filter_suspended')}</option>
                </select>
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold">
                    {t('admin.common.apply')}
                </button>
            </form>

            <DataTable<UserRow>
                rows={users.data}
                columns={cols}
                rowKey={(r) => r.id}
                dense
            />

            <Pagination
                current={users.current_page}
                last={users.last_page}
                links={users.links}
                from={users.from}
                to={users.to}
                total={users.total}
            />
        </AdminLayout>
    );
}
