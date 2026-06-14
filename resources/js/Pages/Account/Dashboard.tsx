import { Head, Link } from '@inertiajs/react';
import AccountLayout from '@/layouts/AccountLayout';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn, formatAmount, shorten } from '@/lib/utils';

interface KpiPayload {
    total_swaps: number;
    finished: number;
    volume_top: Record<string, number>;
    fees_top: Record<string, number>;
    favorite_pair: string | null;
    since: string | null;
}

interface TxRow {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    amount_send: number;
    amount_receive: number;
    status: string;
    created_at: string | null;
}

interface Props {
    kpi: KpiPayload;
    series: { labels: string[]; swaps: number[]; volume: number[] };
    recent_transactions: TxRow[];
}

export default function Dashboard({ kpi, series, recent_transactions }: Props) {
    const t = useT();

    const isEmpty = kpi.total_swaps === 0;

    if (isEmpty) {
        return (
            <AccountLayout title={t('account.dashboard.title')}>
                <Head title={t('account.dashboard.title')} />
                <div className="surface-card border border-line-1 rounded-3xl p-10 text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gradient-brand mb-2">
                        {t('account.dashboard.empty.headline')}
                    </h2>
                    <p className="text-muted-3 max-w-md mx-auto mb-6">{t('account.dashboard.empty.body')}</p>
                    <Link href="/" className="cta !w-auto !px-6 !text-sm inline-flex">
                        {t('account.dashboard.empty.cta')}
                    </Link>
                </div>
            </AccountLayout>
        );
    }

    const sinceFormatted = kpi.since
        ? new Date(kpi.since).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    const volumeChips = Object.entries(kpi.volume_top).slice(0, 3);
    const feesText = Object.entries(kpi.fees_top)
        .slice(0, 3)
        .map(([cur, amt]) => `${formatAmount(amt)} ${cur}`)
        .join(', ');

    return (
        <AccountLayout title={t('account.dashboard.title')} subtitle={kpi.since ? t('account.dashboard.since', { date: sinceFormatted }) : undefined}>
            <Head title={t('account.dashboard.title')} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <Kpi
                    label={t('account.dashboard.kpi_swaps')}
                    value={String(kpi.total_swaps)}
                    gradient
                />
                <div className="kpi-card">
                    <div className="kpi-label">{t('account.dashboard.kpi_volume')}</div>
                    {volumeChips.length === 0 ? (
                        <div className="kpi-value text-base">—</div>
                    ) : (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {volumeChips.map(([cur, amt]) => (
                                <span key={cur} className="text-xs font-semibold px-2 py-0.5 rounded-full surface-card-2 border border-line-2 text-muted-2">
                                    {formatAmount(amt)} {cur}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <Kpi
                    label={t('account.dashboard.kpi_fees')}
                    value={feesText === '' ? '—' : feesText}
                    small
                />
                <Kpi
                    label={t('account.dashboard.kpi_favorite')}
                    value={kpi.favorite_pair ?? '—'}
                    small
                />
            </div>

            <div className="surface-card border border-line-1 rounded-3xl p-5 mb-6">
                <h2 className="text-sm font-semibold mb-3">{t('account.dashboard.chart_title')}</h2>
                <BarChart labels={series.labels} values={series.volume} />
            </div>

            <div className="surface-card border border-line-1 rounded-3xl">
                <div className="px-5 py-3 flex items-center justify-between border-b border-line-1">
                    <h2 className="text-sm font-semibold">{t('account.dashboard.recent_swaps')}</h2>
                    <Link href={route('account.transactions')} className="text-xs text-muted-2 hover:text-[color:var(--text-1)]">
                        {t('account.dashboard.view_all')}
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] uppercase tracking-wider text-muted-3 text-left">
                                <th className="px-5 py-2.5 font-semibold">{t('account.transactions.col_id')}</th>
                                <th className="px-5 py-2.5 font-semibold">{t('account.transactions.col_pair')}</th>
                                <th className="px-5 py-2.5 font-semibold">{t('account.transactions.col_amount')}</th>
                                <th className="px-5 py-2.5 font-semibold">{t('account.transactions.col_status')}</th>
                                <th className="px-5 py-2.5 font-semibold">{t('account.transactions.col_date')}</th>
                                <th className="px-5 py-2.5 font-semibold text-right">{t('account.transactions.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_transactions.map((tx) => (
                                <tr key={tx.id} className="border-t border-line-1 hover:bg-[color:var(--surface-card-2)]/40">
                                    <td className="px-5 py-2.5 font-mono text-xs text-muted-2">
                                        {tx.provider_id ? shorten(tx.provider_id, 6, 4) : `#${tx.id}`}
                                    </td>
                                    <td className="px-5 py-2.5 font-semibold uppercase text-xs">
                                        <PairBadge from={tx.from_currency} to={tx.to_currency} />
                                    </td>
                                    <td className="px-5 py-2.5 text-xs">
                                        {formatAmount(tx.amount_send)} {tx.from_currency.toUpperCase()}
                                    </td>
                                    <td className="px-5 py-2.5"><StatusPill status={tx.status} /></td>
                                    <td className="px-5 py-2.5 text-xs text-muted-3">
                                        {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                        {tx.provider_id && (
                                            <a href={`/tx/${tx.provider_id}`} className="text-xs text-muted-2 hover:text-[color:var(--text-1)]">
                                                {t('account.dashboard.view_tx')}
                                            </a>
                                        )}
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

function Kpi({
    label,
    value,
    small,
    gradient,
}: {
    label: string;
    value: string;
    small?: boolean;
    gradient?: boolean;
}) {
    return (
        <div className="kpi-card">
            <div className="kpi-label">{label}</div>
            <div className={cn('kpi-value', small && 'text-base', gradient && 'kpi-gradient')}>{value}</div>
        </div>
    );
}

function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
    const t = useT();
    const max = Math.max(...values, 1);
    const W = 720;
    const H = 160;
    const padL = 28;
    const padR = 12;
    const padT = 8;
    const padB = 22;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const n = values.length || 1;
    const barW = innerW / n;
    const barInner = Math.max(barW * 0.55, 4);

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} aria-label={t('aria.volume_chart')} role="img">
                <line
                    x1={padL}
                    y1={padT + innerH}
                    x2={W - padR}
                    y2={padT + innerH}
                    stroke="var(--line-2)"
                    strokeWidth={1}
                />
                {values.map((v, i) => {
                    const h = (v / max) * innerH;
                    const x = padL + i * barW + (barW - barInner) / 2;
                    const y = padT + innerH - h;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barInner}
                                height={Math.max(h, v > 0 ? 2 : 0)}
                                rx={2}
                                fill="var(--color-progress)"
                                opacity={v > 0 ? 0.9 : 0.15}
                            />
                        </g>
                    );
                })}
                {labels.map((label, i) => {
                    if (i % 2 !== 0 && i !== labels.length - 1) return null;
                    const x = padL + i * barW + barW / 2;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={H - 6}
                            textAnchor="middle"
                            fontSize={9}
                            fill="var(--text-3)"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>
        </div>
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
