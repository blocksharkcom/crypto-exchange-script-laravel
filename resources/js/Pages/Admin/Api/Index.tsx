import { Head, router, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import MiniChart from '@/components/admin/MiniChart';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ApiCfg {
    masked_key: string;
    has_key: boolean;
    referral: string;
    base_url: string;
    default_flow: string;
}

interface PartnerStats {
    finished: number;
    fees: Record<string, number>;
}

interface SuccessSeries {
    labels: string[];
    success_rate: number[];
    total: number[];
}

interface ApiLogRow {
    id: number;
    endpoint: string;
    method: string;
    ip: string | null;
    duration_ms: number | null;
    status_code: number | null;
    error: string | null;
    created_at: string | null;
}

interface ErrorRow {
    id: number;
    endpoint: string;
    status_code: number | null;
    error: string | null;
    created_at: string | null;
}

interface Props {
    config: ApiCfg;
    partner_stats: PartnerStats;
    success_series: SuccessSeries;
    recent: ApiLogRow[];
    errors: ErrorRow[];
}

export default function ApiIndex({ config, partner_stats, success_series, recent, errors }: Props) {
    const t = useT();
    const form = useForm({
        api_key: '',
        referral: config.referral,
        base_url: config.base_url,
        default_flow: config.default_flow || 'standard',
    });

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('admin.api.update'), {
            preserveScroll: true,
            onSuccess: () => form.reset('api_key'),
        });
    }

    function rotate() {
        if (!confirm(t('admin.api.rotate') + '?')) return;
        router.post(route('admin.api.rotate'), {}, { preserveScroll: true });
    }

    const feeEntries = Object.entries(partner_stats.fees);

    return (
        <AdminLayout title={t('admin.api.title')} subtitle={t('admin.api.subtitle')}>
            <Head title={t('admin.api.title')} />

            <div className="grid lg:grid-cols-3 gap-4">
                <form onSubmit={submit} className="lg:col-span-2 surface-card border border-line-1 rounded-xl p-4 grid gap-4">
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">{t('admin.api.current_key')}</div>
                        <div className="surface-input rounded-lg px-3 py-2 font-mono text-sm">
                            {config.has_key ? config.masked_key : <span className="text-muted-3">{t('admin.api.no_key')}</span>}
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="field">
                            <label htmlFor="api-key" className="field-label">{t('admin.api.key_input')}</label>
                            <input
                                id="api-key"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.api_key}
                                onChange={(e) => form.setData('api_key', e.target.value)}
                                placeholder={t('admin.api.key_ph')}
                            />
                            {form.errors.api_key && <p className="mt-1 text-xs text-rose-400">{form.errors.api_key}</p>}
                        </div>
                        <div className="field">
                            <label htmlFor="api-ref" className="field-label">{t('admin.api.referral')}</label>
                            <input
                                id="api-ref"
                                type="text"
                                value={form.data.referral}
                                onChange={(e) => form.setData('referral', e.target.value)}
                            />
                            {form.errors.referral && <p className="mt-1 text-xs text-rose-400">{form.errors.referral}</p>}
                        </div>
                        <div className="field sm:col-span-2">
                            <label htmlFor="api-url" className="field-label">{t('admin.api.base_url')}</label>
                            <input
                                id="api-url"
                                type="url"
                                value={form.data.base_url}
                                onChange={(e) => form.setData('base_url', e.target.value)}
                            />
                            {form.errors.base_url && <p className="mt-1 text-xs text-rose-400">{form.errors.base_url}</p>}
                        </div>
                        <div>
                            <label htmlFor="api-flow" className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.api.default_flow')}
                            </label>
                            <select
                                id="api-flow"
                                value={form.data.default_flow}
                                onChange={(e) => form.setData('default_flow', e.target.value)}
                                className="surface-input border border-line-1 rounded-lg px-2 py-1.5 w-full text-sm"
                            >
                                <option value="standard">{t('admin.tx.flow_standard')}</option>
                                <option value="fixed-rate">{t('admin.tx.flow_fixed')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-3 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold disabled:opacity-50"
                        >
                            {form.processing ? <span className="spinner" /> : t('admin.common.save')}
                        </button>
                        <button
                            type="button"
                            onClick={rotate}
                            className="px-3 py-1.5 rounded-lg border border-line-2 text-sm hover:bg-[color:var(--surface-card-2)]"
                        >
                            {t('admin.api.rotate')}
                        </button>
                    </div>
                </form>

                <section className="surface-card border border-line-1 rounded-xl p-4">
                    <h3 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-3">{t('admin.api.partner_stats')}</h3>
                    <div className="grid gap-2 text-sm">
                        <KV label={t('admin.api.finished_swaps')} value={String(partner_stats.finished)} strong />
                        <div>
                            <div className="text-xs uppercase tracking-wider text-muted-3 mb-1">{t('admin.api.partner_fees')}</div>
                            {feeEntries.length === 0 ? (
                                <p className="text-xs text-muted-3">—</p>
                            ) : (
                                <ul className="grid gap-1">
                                    {feeEntries.map(([cur, val]) => (
                                        <li key={cur} className="flex justify-between text-xs">
                                            <span className="font-mono">{cur}</span>
                                            <span className="font-semibold">{val.toLocaleString('en-US', { maximumFractionDigits: 8 })}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <section className="mt-6 surface-card border border-line-1 rounded-xl p-4">
                <h3 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-2">{t('admin.api.success_rate')}</h3>
                <MiniChart
                    labels={success_series.labels}
                    values={success_series.success_rate}
                    type="line"
                    color="var(--color-brand-300)"
                    ariaLabel={t('admin.api.success_rate')}
                />
                <div className="mt-1 flex justify-between text-[11px] text-muted-3">
                    {success_series.labels.map((l, i) => (
                        <span key={i}>{l}</span>
                    ))}
                </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-4 mt-6">
                <section className="surface-card border border-line-1 rounded-xl">
                    <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">{t('admin.api.recent_calls')}</header>
                    {recent.length === 0 ? (
                        <p className="p-4 text-sm text-muted-3">{t('admin.api.no_calls')}</p>
                    ) : (
                        <div className="max-h-[480px] overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="text-muted-3 bg-[color:var(--surface-card-2)] sticky top-0">
                                    <tr className="text-left">
                                        <th className="px-3 py-2">{t('admin.api.when')}</th>
                                        <th className="px-3 py-2">{t('admin.api.endpoint')}</th>
                                        <th className="px-3 py-2">{t('admin.api.code')}</th>
                                        <th className="px-3 py-2 text-right">ms</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((r) => (
                                        <tr key={r.id} className="border-t border-line-1">
                                            <td className="px-3 py-1.5 text-muted-3 whitespace-nowrap">{fmt(r.created_at)}</td>
                                            <td className="px-3 py-1.5 font-mono truncate max-w-[260px]">{r.method} {r.endpoint}</td>
                                            <td className="px-3 py-1.5">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold',
                                                        r.status_code !== null && r.status_code < 300 ? 'bg-emerald-500/15 text-emerald-300' :
                                                        r.status_code !== null && r.status_code < 500 ? 'bg-amber-500/15 text-amber-300' :
                                                        'bg-rose-500/15 text-rose-300',
                                                    )}
                                                >
                                                    {r.status_code ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-1.5 text-right">{r.duration_ms ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="surface-card border border-line-1 rounded-xl">
                    <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">{t('admin.api.recent_errors')}</header>
                    {errors.length === 0 ? (
                        <p className="p-4 text-sm text-muted-3">{t('admin.api.no_errors')}</p>
                    ) : (
                        <ul className="divide-y divide-line-1 max-h-[480px] overflow-y-auto">
                            {errors.map((e) => (
                                <li key={e.id} className="p-3">
                                    <div className="flex items-center justify-between text-[11px] text-muted-3">
                                        <span className="font-mono truncate">{e.endpoint}</span>
                                        <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-semibold">{e.status_code ?? '—'}</span>
                                    </div>
                                    <p className="mt-1 text-xs break-words">{e.error ?? '—'}</p>
                                    <div className="mt-1 text-[11px] text-muted-3">{fmt(e.created_at)}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}

function KV({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-3">{label}</span>
            <span className={cn('text-sm', strong && 'font-semibold')}>{value}</span>
        </div>
    );
}

function fmt(iso: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
