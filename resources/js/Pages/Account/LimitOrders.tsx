import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AccountLayout from '@/layouts/AccountLayout';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn, formatAmount } from '@/lib/utils';
import type { Paginator } from '@/Types';

interface LimitOrderRow {
    id: number;
    from_currency: string;
    to_currency: string;
    from_network: string | null;
    to_network: string | null;
    amount_send: number;
    target_rate: number;
    last_quoted_rate: number | null;
    last_quoted_at: string | null;
    address: string;
    refund_address: string | null;
    status: string;
    expires_at: string | null;
    filled_transaction_id: number | null;
    created_at: string | null;
}

interface Props {
    orders: Paginator<LimitOrderRow>;
    statuses: string[];
}

export default function LimitOrders({ orders }: Props) {
    const t = useT();
    const [drawer, setDrawer] = useState<LimitOrderRow | null>(null);

    function cancel(id: number): void {
        if (!window.confirm(t('account.limit_orders.cancel'))) return;
        router.post(route('account.limit-orders.cancel', { id }), {}, { preserveScroll: true });
    }

    return (
        <AccountLayout title={t('account.limit_orders.title')} subtitle={t('account.limit_orders.subtitle')}>
            <Head title={t('account.limit_orders.title')} />

            <div className="surface-card border border-line-1 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-muted-3 text-left">
                                <th className="px-4 py-2.5 font-semibold">{t('account.limit_orders.col_pair')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.limit_orders.col_amount')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.limit_orders.col_target')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.limit_orders.col_status')}</th>
                                <th className="px-4 py-2.5 font-semibold">{t('account.limit_orders.col_created')}</th>
                                <th className="px-4 py-2.5 font-semibold text-right">{t('account.limit_orders.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-3">
                                        {t('account.limit_orders.empty')}
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((o) => (
                                <tr key={o.id} className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]/40">
                                    <td className="px-4 py-2.5 font-semibold uppercase text-xs">
                                        <PairBadge from={o.from_currency} to={o.to_currency} />
                                    </td>
                                    <td className="px-4 py-2.5 text-xs tabular-nums">
                                        {formatAmount(o.amount_send)} {o.from_currency.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-2.5 text-xs tabular-nums">
                                        {formatAmount(o.target_rate)} {o.to_currency.toUpperCase()}
                                    </td>
                                    <td className="px-4 py-2.5"><StatusPill status={o.status} /></td>
                                    <td className="px-4 py-2.5 text-xs text-muted-3">
                                        {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setDrawer(o)}
                                            className="text-xs text-muted-2 hover:text-[color:var(--text-1)] mr-3"
                                        >
                                            {t('account.limit_orders.view')}
                                        </button>
                                        {o.status === 'open' && (
                                            <button
                                                type="button"
                                                onClick={() => cancel(o.id)}
                                                className="text-xs text-[color:var(--warn)] hover:underline"
                                            >
                                                {t('account.limit_orders.cancel')}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line-1 text-sm">
                        <span className="text-muted-3 text-xs">
                            {orders.from ?? 0}–{orders.to ?? 0} / {orders.total}
                        </span>
                        <div className="flex items-center gap-1">
                            {orders.links.map((l, i) => (
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

            {drawer && <DetailsDrawer order={drawer} onClose={() => setDrawer(null)} />}
        </AccountLayout>
    );
}

function StatusPill({ status }: { status: string }) {
    const t = useT();
    const tone = (() => {
        if (status === 'filled') return 'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-1 ring-[color:var(--color-brand-300)]/25';
        if (status === 'failed' || status === 'expired') return 'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-1 ring-[color:var(--warn-border)]';
        if (status === 'cancelled') return 'surface-card-2 text-muted-3 ring-1 ring-line-2';
        return 'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-1 ring-[color:var(--color-progress)]/25';
    })();
    return (
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide', tone)}>
            {t(`account.limit_orders.status.${status}`)}
        </span>
    );
}

function DetailsDrawer({ order, onClose }: { order: LimitOrderRow; onClose: () => void }) {
    const t = useT();
    const progress = order.last_quoted_rate !== null && order.target_rate > 0
        ? Math.max(0, Math.min(100, (order.last_quoted_rate / order.target_rate) * 100))
        : 0;

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
                        <h2 className="text-lg font-semibold tracking-tight">{t('account.limit_orders.drawer.title')}</h2>
                        <p className="text-xs text-muted-3 mt-0.5 uppercase tracking-wider">
                            <PairBadge from={order.from_currency} to={order.to_currency} />
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

                <div className="mb-5">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-3 mb-1.5">
                        <span>{t('account.limit_orders.drawer.progress')}</span>
                        {order.last_quoted_rate !== null && (
                            <span className="tabular-nums">
                                {t('account.limit_orders.drawer.distance', { percent: progress.toFixed(1) })}
                            </span>
                        )}
                    </div>
                    <div className="h-2 rounded-full bg-[color:var(--color-progress-track)] overflow-hidden">
                        <div
                            className="h-full bg-[color:var(--color-progress)] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    {order.last_quoted_rate === null && (
                        <p className="text-xs text-muted-3 mt-2">{t('account.limit_orders.drawer.no_quote_yet')}</p>
                    )}
                </div>

                <dl className="text-sm space-y-2">
                    <Detail label={t('account.limit_orders.drawer.target')} value={`${formatAmount(order.target_rate)} ${order.to_currency.toUpperCase()}`} />
                    <Detail
                        label={t('account.limit_orders.drawer.last_quote')}
                        value={order.last_quoted_rate !== null
                            ? `${formatAmount(order.last_quoted_rate)} ${order.to_currency.toUpperCase()}`
                            : '—'}
                    />
                    <Detail label={t('account.limit_orders.drawer.amount')} value={`${formatAmount(order.amount_send)} ${order.from_currency.toUpperCase()}`} />
                    <Detail label={t('account.limit_orders.drawer.address')} value={order.address} mono />
                    {order.refund_address && (
                        <Detail label={t('account.limit_orders.drawer.refund')} value={order.refund_address} mono />
                    )}
                    {order.expires_at && (
                        <Detail label={t('account.limit_orders.drawer.expires')} value={new Date(order.expires_at).toLocaleString()} />
                    )}
                    {order.created_at && (
                        <Detail label={t('account.limit_orders.drawer.created')} value={new Date(order.created_at).toLocaleString()} />
                    )}
                </dl>

                {order.filled_transaction_id && (
                    <Link
                        href={route('account.transactions')}
                        className="cta cta-ghost mt-5"
                    >
                        {t('account.limit_orders.drawer.view_tx')}
                    </Link>
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
