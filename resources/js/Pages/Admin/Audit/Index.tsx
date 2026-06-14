import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import Pagination from '@/components/admin/Pagination';
import { useT } from '@/lib/i18n';
import type { Paginator } from '@/Types';

interface AuditRow {
    id: number;
    event: string;
    auditable: string;
    auditable_type: string;
    auditable_id: number;
    user_label: string | null;
    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;
    ip_address: string | null;
    created_at: string | null;
}

interface Props {
    audits: Paginator<AuditRow>;
    filters: { event: string; model: string; date_from: string; date_to: string };
    events: string[];
    models: string[];
}

export default function AuditIndex({ audits, filters, events, models }: Props) {
    const t = useT();
    const [local, setLocal] = useState(filters);
    const [open, setOpen] = useState<number | null>(null);

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const params: Record<string, string> = {};
        Object.entries(local).forEach(([k, v]) => {
            if (v) params[k] = String(v);
        });
        router.get(route('admin.audit.index'), params, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout title={t('admin.audit.title')} subtitle={t('admin.audit.subtitle')}>
            <Head title={t('admin.audit.title')} />

            <form onSubmit={submit} className="surface-card border border-line-1 rounded-xl p-3 grid md:grid-cols-4 gap-2 mb-4">
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">{t('admin.audit.filter_event')}</label>
                    <select
                        value={local.event}
                        onChange={(e) => setLocal({ ...local, event: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    >
                        <option value="">{t('admin.common.all')}</option>
                        {events.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">{t('admin.audit.filter_model')}</label>
                    <select
                        value={local.model}
                        onChange={(e) => setLocal({ ...local, model: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    >
                        <option value="">{t('admin.common.all')}</option>
                        {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">{t('admin.common.date_from')}</label>
                    <input
                        type="date"
                        value={local.date_from}
                        onChange={(e) => setLocal({ ...local, date_from: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    />
                </div>
                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 mb-1">{t('admin.common.date_to')}</label>
                    <input
                        type="date"
                        value={local.date_to}
                        onChange={(e) => setLocal({ ...local, date_to: e.target.value })}
                        className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                    />
                </div>
                <div className="md:col-span-4 flex gap-2">
                    <button type="submit" className="px-3 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold">
                        {t('admin.common.apply')}
                    </button>
                </div>
            </form>

            <div className="surface-card border border-line-1 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="text-[11px] uppercase tracking-wide text-muted-3 bg-[color:var(--surface-card-2)]">
                        <tr className="text-left">
                            <th className="px-4 py-2.5">{t('admin.audit.col_when')}</th>
                            <th className="px-4 py-2.5">{t('admin.audit.col_who')}</th>
                            <th className="px-4 py-2.5">{t('admin.audit.col_event')}</th>
                            <th className="px-4 py-2.5">{t('admin.audit.col_target')}</th>
                            <th className="px-4 py-2.5">{t('admin.audit.col_ip')}</th>
                            <th className="px-4 py-2.5 text-right">{t('admin.audit.col_diff')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audits.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-3">
                                    {t('admin.common.no_results')}
                                </td>
                            </tr>
                        ) : audits.data.map((a) => (
                            <FragmentRow
                                key={a.id}
                                row={a}
                                open={open === a.id}
                                onToggle={() => setOpen(open === a.id ? null : a.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                current={audits.current_page}
                last={audits.last_page}
                links={audits.links}
                from={audits.from}
                to={audits.to}
                total={audits.total}
            />
        </AdminLayout>
    );
}

function FragmentRow({ row, open, onToggle }: { row: AuditRow; open: boolean; onToggle: () => void }) {
    const t = useT();
    const oldKeys = Object.keys(row.old_values ?? {});
    const newKeys = Object.keys(row.new_values ?? {});
    const keys = Array.from(new Set([...oldKeys, ...newKeys]));
    return (
        <>
            <tr className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]">
                <td className="px-4 py-2 text-xs text-muted-3 whitespace-nowrap">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-2 text-xs">{row.user_label ?? '—'}</td>
                <td className="px-4 py-2 text-xs uppercase font-semibold">{row.event}</td>
                <td className="px-4 py-2 text-xs font-mono">{row.auditable}</td>
                <td className="px-4 py-2 text-xs font-mono text-muted-3">{row.ip_address ?? '—'}</td>
                <td className="px-4 py-2 text-right">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="text-xs px-2 py-0.5 rounded border border-line-2 hover:bg-[color:var(--surface-card-2)]"
                    >
                        {open ? t('admin.common.close') : t('admin.common.view')}
                    </button>
                </td>
            </tr>
            {open && (
                <tr className="bg-[color:var(--surface-card-2)]/40">
                    <td colSpan={6} className="px-4 py-3">
                        {keys.length === 0 ? (
                            <p className="text-xs text-muted-3">{t('admin.audit.no_diff')}</p>
                        ) : (
                            <table className="w-full text-xs">
                                <thead className="text-muted-3">
                                    <tr className="text-left">
                                        <th className="py-1 pr-3">{t('admin.audit.key_col')}</th>
                                        <th className="py-1 pr-3">{t('admin.audit.from')}</th>
                                        <th className="py-1">{t('admin.audit.to')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keys.map((k) => (
                                        <tr key={k} className="border-t border-line-1">
                                            <td className="py-1 pr-3 font-mono">{k}</td>
                                            <td className="py-1 pr-3 font-mono text-rose-300/80 break-all">{stringify(row.old_values?.[k])}</td>
                                            <td className="py-1 font-mono text-emerald-300/90 break-all">{stringify(row.new_values?.[k])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

function stringify(v: unknown): string {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'object') {
        try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
}
