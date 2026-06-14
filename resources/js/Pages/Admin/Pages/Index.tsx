import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { useT } from '@/lib/i18n';

interface PageRow {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    status: 'draft' | 'published';
    show_in_header: boolean;
    show_in_footer: boolean;
    sort_order: number;
    updated_at: string | null;
}

interface Props {
    pages: PageRow[];
}

export default function PagesIndex({ pages }: Props) {
    const t = useT();

    function destroy(row: PageRow): void {
        if (!window.confirm(t('admin.pages.delete_confirm'))) return;
        router.delete(route('admin.pages.destroy', row.id), { preserveScroll: true });
    }

    const cols: Column<PageRow>[] = [
        {
            key: 'title',
            header: t('admin.pages.col_title'),
            cell: (row) => (
                <Link href={route('admin.pages.edit', row.id)} className="text-sm font-semibold hover:underline">
                    {row.title}
                </Link>
            ),
        },
        {
            key: 'slug',
            header: t('admin.pages.col_slug'),
            cell: (row) => <code className="font-mono text-xs text-muted-2">/p/{row.slug}</code>,
        },
        {
            key: 'status',
            header: t('admin.pages.col_status'),
            cell: (row) => <StatusBadge status={row.status === 'published' ? 'finished' : 'new'} />,
        },
        {
            key: 'header',
            header: t('admin.pages.col_header'),
            cell: (row) =>
                row.show_in_header ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase font-semibold bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)]">
                        {t('admin.pages.in_header')}
                    </span>
                ) : (
                    <span className="text-xs text-muted-3">—</span>
                ),
        },
        {
            key: 'footer',
            header: t('admin.pages.col_footer'),
            cell: (row) =>
                row.show_in_footer ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] uppercase font-semibold bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)]">
                        {t('admin.pages.in_footer')}
                    </span>
                ) : (
                    <span className="text-xs text-muted-3">—</span>
                ),
        },
        {
            key: 'updated',
            header: t('admin.pages.col_updated'),
            cell: (row) => (
                <span className="text-xs text-muted-3">
                    {row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: t('admin.pages.col_actions'),
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.pages.edit', row.id)}
                        className="text-xs font-semibold text-[color:var(--text-1)] hover:underline"
                    >
                        {t('admin.common.edit')}
                    </Link>
                    <button
                        type="button"
                        onClick={() => destroy(row)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                    >
                        {t('admin.common.delete')}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            title={t('admin.pages.title')}
            subtitle={t('admin.pages.subtitle')}
            actions={
                <Link href={route('admin.pages.create')} className="cta !py-1.5 !px-3 !text-sm">
                    {t('admin.pages.create')}
                </Link>
            }
        >
            <Head title={t('admin.pages.title')} />

            <DataTable<PageRow>
                rows={pages}
                columns={cols}
                rowKey={(r) => r.id}
                dense
            />
        </AdminLayout>
    );
}
