import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import MiniChart from '@/components/admin/MiniChart';
import StatusBadge from '@/components/admin/StatusBadge';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn, formatAmount, shorten } from '@/lib/utils';

interface KpiWindow {
    count: number;
    finished: number;
    volume: Record<string, number>;
    fees: Record<string, number>;
}

interface TxRow {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    amount_send: number;
    amount_receive: number;
    status: string;
    stuck_flagged: boolean;
    created_at: string | null;
}

interface TicketRow {
    id: number;
    subject: string;
    email: string;
    status: string;
    priority: string;
    created_at: string | null;
}

interface Props {
    kpi: {
        current: KpiWindow;
        previous: KpiWindow;
        stuck_count: number;
        open_tickets: number;
    };
    series: {
        labels: string[];
        swaps: number[];
        volume: number[];
    };
    recent_transactions: TxRow[];
    stuck_top: TxRow[];
    tickets_top: TicketRow[];
}

export default function Dashboard({ kpi, series, recent_transactions, stuck_top, tickets_top }: Props) {
    const t = useT();

    const totalVolume = (window: KpiWindow): string => {
        const entries = Object.entries(window.volume);
        if (entries.length === 0) return '0';
        return entries
            .slice(0, 3)
            .map(([cur, amount]) => `${formatAmount(amount)} ${cur}`)
            .join(', ');
    };

    const totalFees = (window: KpiWindow): string => {
        const entries = Object.entries(window.fees);
        if (entries.length === 0) return '0';
        return entries
            .slice(0, 3)
            .map(([cur, amount]) => `${formatAmount(amount)} ${cur}`)
            .join(', ');
    };

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
                <span className="font-semibold uppercase text-xs">
                    <PairBadge from={row.from_currency} to={row.to_currency} />
                </span>
            ),
        },
        {
            key: 'amount',
            header: t('admin.tx.col_amount'),
            cell: (row) => (
                <span className="text-xs">
                    {formatAmount(row.amount_send)} {row.from_currency.toUpperCase()}
                </span>
            ),
        },
        {
            key: 'status',
            header: t('admin.tx.col_status'),
            cell: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'created',
            header: t('admin.tx.col_created'),
            cell: (row) => <RelTime iso={row.created_at} />,
            className: 'text-xs text-muted-3',
        },
    ];

    return (
        <AdminLayout title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')}>
            <Head title={t('admin.dashboard.title')} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Kpi
                    icon={<IconSwap />}
                    label={t('admin.dashboard.kpi_swaps')}
                    value={String(kpi.current.count)}
                    delta={diffPercent(kpi.current.count, kpi.previous.count)}
                    sub={t('admin.dashboard.vs_prev')}
                    sparkline={series.swaps}
                    sparklineColor="var(--color-brand-300)"
                    gradient
                />
                <Kpi
                    icon={<IconCheck />}
                    label={t('admin.dashboard.kpi_finished')}
                    value={String(kpi.current.finished)}
                    delta={diffPercent(kpi.current.finished, kpi.previous.finished)}
                    sub={t('admin.dashboard.vs_prev')}
                    sparkline={series.swaps}
                />
                <Kpi
                    icon={<IconCoins />}
                    label={t('admin.dashboard.kpi_volume')}
                    value={totalVolume(kpi.current)}
                    sub={t('admin.dashboard.vs_prev')}
                    sparkline={series.volume}
                    sparklineColor="var(--color-progress)"
                    small
                />
                <Kpi
                    icon={<IconWallet />}
                    label={t('admin.dashboard.kpi_fees')}
                    value={totalFees(kpi.current)}
                    sub={t('admin.dashboard.vs_prev')}
                    sparkline={series.volume}
                    sparklineColor="#8a86f6"
                    small
                />
                <Kpi
                    icon={<IconWarning />}
                    label={t('admin.dashboard.kpi_stuck')}
                    value={String(kpi.stuck_count)}
                    tone={kpi.stuck_count > 0 ? 'warn' : undefined}
                />
                <Kpi
                    icon={<IconTicket />}
                    label={t('admin.dashboard.kpi_tickets')}
                    value={String(kpi.open_tickets)}
                    tone={kpi.open_tickets > 0 ? 'info' : undefined}
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mt-6">
                <ChartCard title={t('admin.dashboard.chart_swaps')} icon={<IconSwap />} accent="lime">
                    <MiniChart
                        labels={series.labels}
                        values={series.swaps}
                        type="bar"
                        height={200}
                        formatValue={(v) => v >= 1 ? Math.round(v).toString() : v.toString()}
                        ariaLabel={t('admin.dashboard.chart_swaps')}
                    />
                </ChartCard>
                <ChartCard title={t('admin.dashboard.chart_volume')} icon={<IconCoins />} accent="indigo">
                    <MiniChart
                        labels={series.labels}
                        values={series.volume}
                        type="line"
                        height={200}
                        color="var(--color-progress)"
                        ariaLabel={t('admin.dashboard.chart_volume')}
                    />
                </ChartCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-6">
                <Panel
                    title={t('admin.dashboard.stuck_panel')}
                    action={<Link href={route('admin.transactions.stuck')} className="text-xs text-muted-2 hover:underline">{t('admin.dashboard.view_all')}</Link>}
                >
                    {stuck_top.length === 0 ? (
                        <p className="text-sm text-muted-3 p-4">{t('admin.dashboard.no_stuck')}</p>
                    ) : (
                        <ul className="divide-y divide-line-1">
                            {stuck_top.map((tx) => (
                                <li key={tx.id} className="p-3 hover:bg-[color:var(--surface-card-2)]">
                                    <Link href={route('admin.transactions.show', tx.id)} className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-xs font-mono truncate">{tx.provider_id ?? `#${tx.id}`}</div>
                                            <div className="text-xs text-muted-3 uppercase mt-0.5"><PairBadge from={tx.from_currency} to={tx.to_currency} /></div>
                                        </div>
                                        <StatusBadge status={tx.status} />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel
                    title={t('admin.dashboard.tickets_panel')}
                    action={<Link href={route('admin.tickets.index')} className="text-xs text-muted-2 hover:underline">{t('admin.dashboard.view_all')}</Link>}
                >
                    {tickets_top.length === 0 ? (
                        <p className="text-sm text-muted-3 p-4">{t('admin.dashboard.no_tickets')}</p>
                    ) : (
                        <ul className="divide-y divide-line-1">
                            {tickets_top.map((tk) => (
                                <li key={tk.id} className="p-3 hover:bg-[color:var(--surface-card-2)]">
                                    <Link href={route('admin.tickets.show', tk.id)} className="block">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm truncate">{tk.subject}</div>
                                            <StatusBadge status={tk.status} namespace="admin.tickets.status" />
                                        </div>
                                        <div className="text-xs text-muted-3 mt-0.5 truncate">{tk.email}</div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel
                    title={t('admin.dashboard.recent_tx')}
                    action={<Link href={route('admin.transactions.index')} className="text-xs text-muted-2 hover:underline">{t('admin.dashboard.view_all')}</Link>}
                >
                    <ul className="divide-y divide-line-1 max-h-[420px] overflow-y-auto">
                        {recent_transactions.slice(0, 8).map((tx) => (
                            <li key={tx.id} className="p-3 hover:bg-[color:var(--surface-card-2)]">
                                <Link href={route('admin.transactions.show', tx.id)} className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-xs font-semibold uppercase"><PairBadge from={tx.from_currency} to={tx.to_currency} /></div>
                                        <div className="text-[11px] text-muted-3 font-mono truncate">
                                            {tx.provider_id ? shorten(tx.provider_id, 6, 4) : `#${tx.id}`}
                                        </div>
                                    </div>
                                    <StatusBadge status={tx.status} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <div className="mt-6">
                <h2 className="text-sm font-semibold mb-3">{t('admin.dashboard.recent_tx')}</h2>
                <DataTable
                    rows={recent_transactions}
                    columns={cols}
                    rowKey={(r) => r.id}
                    dense
                />
            </div>
        </AdminLayout>
    );
}

function diffPercent(curr: number, prev: number): number | null {
    if (prev === 0 && curr === 0) return 0;
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
}

function RelTime({ iso }: { iso: string | null }) {
    if (!iso) return <span>—</span>;
    const d = new Date(iso);
    const diff = Math.round((Date.now() - d.getTime()) / 1000);
    let label: string;
    if (diff < 60) label = `${diff}s`;
    else if (diff < 3600) label = `${Math.round(diff / 60)}m`;
    else if (diff < 86400) label = `${Math.round(diff / 3600)}h`;
    else label = `${Math.round(diff / 86400)}d`;
    return <span title={d.toLocaleString()}>{label}</span>;
}

function Kpi({
    label,
    value,
    delta,
    sub,
    tone,
    small,
    gradient,
    icon,
    sparkline,
    sparklineColor,
}: {
    label: string;
    value: string;
    delta?: number | null;
    sub?: string;
    tone?: 'warn' | 'info';
    small?: boolean;
    gradient?: boolean;
    icon?: React.ReactNode;
    sparkline?: number[];
    sparklineColor?: string;
}) {
    const toneStyle: React.CSSProperties =
        tone === 'warn' ? { boxShadow: 'inset 0 0 0 1px var(--warn-border)' } :
        tone === 'info' ? { boxShadow: 'inset 0 0 0 1px var(--promo-border)' } :
        {};
    const iconBg =
        tone === 'warn' ? 'bg-[color:var(--warn-bg)] text-[color:var(--warn)]' :
        tone === 'info' ? 'bg-[color:var(--promo-bg)] text-[color:var(--promo-text)]' :
        'bg-[color:var(--surface-card-2)] text-[color:var(--color-brand-300)]';
    return (
        <div
            className="surface-card rounded-2xl border border-line-1 p-4 sm:p-5 flex flex-col gap-3 min-h-[140px]"
            style={toneStyle}
        >
            <div className="flex items-start gap-2.5">
                {icon && (
                    <span aria-hidden className={cn('w-9 h-9 rounded-lg grid place-items-center border border-line-1 shrink-0', iconBg)}>
                        {icon}
                    </span>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-3 font-semibold">{label}</div>
                    <div
                        className={cn(
                            'mt-1 font-bold tracking-tight leading-none truncate',
                            small ? 'text-base sm:text-lg' : 'text-3xl sm:text-4xl tabular-nums',
                            gradient && 'text-gradient-brand',
                        )}
                    >
                        {value}
                    </div>
                </div>
            </div>

            <div className="mt-auto flex items-end justify-between gap-3">
                <div className="text-[11px] flex items-center gap-1.5">
                    {delta !== undefined && delta !== null && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 font-bold rounded-md px-1.5 py-0.5 text-[10px]',
                                delta > 0 && 'text-[color:var(--color-brand-700)] bg-[color:var(--color-brand-300)]/15',
                                delta < 0 && 'text-[color:var(--warn)] bg-[color:var(--warn-bg)]',
                                delta === 0 && 'text-muted-3 bg-[color:var(--surface-card-2)]',
                            )}
                        >
                            {delta > 0 ? <ArrowUpTiny /> : delta < 0 ? <ArrowDownTiny /> : <span aria-hidden>~</span>}
                            {Math.abs(delta)}%
                        </span>
                    )}
                    {sub && <span className="text-muted-3">{sub}</span>}
                </div>
                {sparkline && sparkline.length > 1 && (
                    <Sparkline values={sparkline} color={sparklineColor ?? 'var(--text-3)'} />
                )}
            </div>
        </div>
    );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
    const W = 64, H = 24;
    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => {
        const x = (i / (values.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const path = 'M ' + pts.join(' L ');
    const area = path + ` L ${W},${H} L 0,${H} Z`;
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0">
            <defs>
                <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.30" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area}  fill="url(#spark-grad)" />
            <path d={path}  fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChartCard({ title, children, icon, accent }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    accent?: 'lime' | 'indigo';
}) {
    const color = accent === 'indigo'
        ? 'bg-[color:var(--promo-bg)] text-[color:var(--promo-text)]'
        : 'bg-[color:var(--surface-card-2)] text-[color:var(--color-brand-300)]';
    return (
        <div className="surface-card rounded-2xl border border-line-1 p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3">
                {icon && <span aria-hidden className={cn('w-8 h-8 rounded-lg grid place-items-center border border-line-1', color)}>{icon}</span>}
                <h3 className="text-[13px] font-semibold text-[color:var(--text-1)]">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// ── Inline icons (kept here so we don't bloat the global Icons file) ─────

const I = (props: React.SVGProps<SVGSVGElement> = {}) => ({
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true, ...props,
});

function IconSwap()    { return <svg {...I()}><path d="M5 7h14m-4-4l4 4-4 4M19 17H5m4 4l-4-4 4-4" /></svg>; }
function IconCheck()   { return <svg {...I()}><path d="M5 13l4 4L19 7" /></svg>; }
function IconCoins()   { return <svg {...I()}><circle cx="9" cy="9" r="6" /><path d="M14.5 8a6 6 0 1 1 0 12 6 6 0 0 1-6-6" /></svg>; }
function IconWallet()  { return <svg {...I()}><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /><path d="M16 13h.01M3 7l3-3h12" /></svg>; }
function IconWarning() { return <svg {...I()}><path d="M12 3l11 19H1L12 3z" /><path d="M12 10v5M12 18h.01" /></svg>; }
function IconTicket()  { return <svg {...I()}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" /><path d="M9 6v12" strokeDasharray="2 2" /></svg>; }
function ArrowUpTiny()   { return <svg {...I({ width: 10, height: 10 })}><path d="M12 19V5m0 0l-6 6m6-6l6 6" /></svg>; }
function ArrowDownTiny() { return <svg {...I({ width: 10, height: 10 })}><path d="M12 5v14m0 0l6-6m-6 6l-6-6" /></svg>; }

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="surface-card rounded-[20px] border border-line-1 flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}
