import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/layouts/AccountLayout';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn, formatAmount } from '@/lib/utils';
import type { Paginator } from '@/Types';

interface HistoryRow {
    id: number;
    provider_id: string | null;
    amount_send: number;
    amount_receive: number;
    status: string;
    created_at: string | null;
}

interface ScheduleRow {
    id: number;
    from_currency: string;
    to_currency: string;
    from_network: string | null;
    to_network: string | null;
    amount_send: number;
    frequency: string;
    start_at: string | null;
    next_run_at: string | null;
    end_condition: string;
    end_at: string | null;
    max_runs: number | null;
    runs_completed: number;
    status: string;
    address: string;
    refund_address: string | null;
    last_run_at: string | null;
    created_at: string | null;
    history: HistoryRow[];
}

interface Props {
    schedules: Paginator<ScheduleRow>;
}

export default function Recurring({ schedules }: Props) {
    const t = useT();
    const [drawer, setDrawer] = useState<ScheduleRow | null>(null);

    function mutate(id: number, action: 'pause' | 'resume' | 'cancel'): void {
        if (action === 'cancel' && !window.confirm(t('account.recurring.cancel'))) return;
        router.post(route(`account.recurring.${action}`, { id }), {}, { preserveScroll: true });
    }

    return (
        <AccountLayout title={t('account.recurring.title')} subtitle={t('account.recurring.subtitle')}>
            <Head title={t('account.recurring.title')} />

            <div className="surface-card border border-line-1 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-muted-3 text-left">
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_pair')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_amount')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_frequency')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_next_run')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_runs')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_end')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.recurring.col_status')}</th>
                                <th className="px-4 py-2.5 font-semibold text-right">{t('account.recurring.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-3">
                                        {t('account.recurring.empty')}
                                    </td>
                                </tr>
                            )}
                            {schedules.data.map((s) => (
                                <tr key={s.id} className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]/40">
                                    <td className="px-4 py-2.5 font-semibold uppercase text-xs">
                                        <PairBadge from={s.from_currency} to={s.to_currency} />
                                    </td>
                                    <td className="px-4 py-2.5 text-xs tabular-nums">
                                        {formatAmount(s.amount_send)} {s.from_currency.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs">
                                        {t(`recurring.frequencies.${s.frequency}`)}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-3">
                                        {s.next_run_at ? new Date(s.next_run_at).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs tabular-nums">
                                        {s.runs_completed}{s.max_runs ? ` / ${s.max_runs}` : ''}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-muted-3">
                                        {endLabel(s, t)}
                                    </td>
                                    <td className="px-4 py-2.5"><StatusPill status={s.status} /></td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setDrawer(s)}
                                            className="text-xs text-muted-2 hover:text-[color:var(--text-1)] mr-3"
                                        >
                                            {t('account.recurring.view')}
                                        </button>
                                        {s.status === 'active' && (
                                            <button
                                                type="button"
                                                onClick={() => mutate(s.id, 'pause')}
                                                className="text-xs text-muted-2 hover:text-[color:var(--text-1)] mr-3"
                                            >
                                                {t('account.recurring.pause')}
                                            </button>
                                        )}
                                        {s.status === 'paused' && (
                                            <button
                                                type="button"
                                                onClick={() => mutate(s.id, 'resume')}
                                                className="text-xs text-muted-2 hover:text-[color:var(--text-1)] mr-3"
                                            >
                                                {t('account.recurring.resume')}
                                            </button>
                                        )}
                                        {(s.status === 'active' || s.status === 'paused') && (
                                            <button
                                                type="button"
                                                onClick={() => mutate(s.id, 'cancel')}
                                                className="text-xs text-[color:var(--warn)] hover:underline"
                                            >
                                                {t('account.recurring.cancel')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {schedules.last_page > 1 && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line-1 text-sm">
                        <span className="text-muted-3 text-xs">
                            {schedules.from ?? 0}–{schedules.to ?? 0} / {schedules.total}
                        </span>
                        <div className="flex items-center gap-1">
                            {schedules.links.map((l, i) => (
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

            {drawer && <DetailsDrawer schedule={drawer} onClose={() => setDrawer(null)} />}
        </AccountLayout>
    );
}

function endLabel(s: ScheduleRow, t: (k: string, r?: Record<string, string | number>) => string): string {
    if (s.end_condition === 'until_date' && s.end_at) {
        return new Date(s.end_at).toLocaleDateString();
    }
    if (s.end_condition === 'after_runs' && s.max_runs) {
        return t('recurring.summary_after', { runs: s.max_runs });
    }
    return t('recurring.summary_forever');
}

function StatusPill({ status }: { status: string }) {
    const t = useT();
    const tone = (() => {
        if (status === 'active') return 'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-1 ring-[color:var(--color-brand-300)]/25';
        if (status === 'paused') return 'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-1 ring-[color:var(--color-progress)]/25';
        if (status === 'completed') return 'surface-card-2 text-muted-2 ring-1 ring-line-2';
        return 'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-1 ring-[color:var(--warn-border)]';
    })();
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide', tone)}>
            {t(`account.recurring.status.${status}`)}
        </span>
    );
}

function DetailsDrawer({ schedule, onClose }: { schedule: ScheduleRow; onClose: () => void }) {
    const t = useT();

    return (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
            <button
                type="button"
                aria-label={t('btn.close')}
                onClick={onClose}
                className="flex-1 bg-black/40"
            />
            <aside className="w-full max-w-md h-full surface-card border-l border-line-1 overflow-y-auto p-5">
                <header className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">{t('account.recurring.drawer.title')}</h2>
                        <p className="text-xs text-muted-3 mt-0.5 uppercase tracking-wider">
                            <PairBadge from={schedule.from_currency} to={schedule.to_currency} />
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-muted-3 hover:text-[color:var(--text-1)] text-xl leading-none"
                        aria-label={t('btn.close')}
                    >
                        ×
                    </button>
                </header>

                <dl className="text-sm space-y-2 mb-5">
                    <Detail
                        label={t('account.recurring.col_amount')}
                        value={`${formatAmount(schedule.amount_send)} ${schedule.from_currency.toUpperCase()}`}
                    />
                    <Detail label={t('account.recurring.col_frequency')} value={t(`recurring.frequencies.${schedule.frequency}`)} />
                    {schedule.next_run_at && (
                        <Detail label={t('account.recurring.drawer.next_run')} value={new Date(schedule.next_run_at).toLocaleString()} />
                    )}
                    <Detail label={t('account.recurring.drawer.runs_completed')} value={String(schedule.runs_completed)} />
                    {schedule.last_run_at && (
                        <Detail label={t('account.recurring.drawer.last_run')} value={new Date(schedule.last_run_at).toLocaleString()} />
                    )}
                    <Detail label={t('account.recurring.drawer.address')} value={schedule.address} mono />
                    {schedule.refund_address && (
                        <Detail label={t('account.recurring.drawer.refund')} value={schedule.refund_address} mono />
                    )}
                </dl>

                <h3 className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">
                    {t('account.recurring.drawer.history')}
                </h3>
                {schedule.history.length === 0 ? (
                    <p className="text-sm text-muted-3">{t('account.recurring.drawer.no_history')}</p>
                ) : (
                    <ul className="space-y-2">
                        {schedule.history.map((h) => (
                            <li key={h.id} className="rounded-xl border border-line-1 p-3 text-xs flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="font-semibold text-[color:var(--text-1)] tabular-nums">
                                        {formatAmount(h.amount_send)} &rarr; {formatAmount(h.amount_receive)}
                                    </div>
                                    <div className="text-muted-3 mt-0.5">
                                        {h.created_at ? new Date(h.created_at).toLocaleString() : '—'} · {h.status}
                                    </div>
                                </div>
                                {h.provider_id && (
                                    <a
                                        href={`/tx/${h.provider_id}`}
                                        className="text-[color:var(--color-brand-300)] hover:underline shrink-0"
                                    >
                                        {t('account.recurring.drawer.view_tx')}
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </div>
    );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3 py-1.5 border-b border-line-1 last:border-b-0">
            <dt className="text-muted-3 text-xs uppercase tracking-wider shrink-0">{label}</dt>
            <dd className={cn('text-right text-[color:var(--text-1)] min-w-0 break-all', mono && 'font-mono text-xs')}>
                {value}
            </dd>
        </div>
    );
}
