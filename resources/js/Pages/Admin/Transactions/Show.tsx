import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import StatusBadge from '@/components/admin/StatusBadge';
import { explorerUrl } from '@/components/admin/explorers';
import { useT } from '@/lib/i18n';
import { copyToClipboard, formatAmount, shorten } from '@/lib/utils';
import { Copy, ExternalLink } from '@/components/ui/Icons';

interface TxDetail {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    from_network: string | null;
    to_network: string | null;
    amount_send: number;
    amount_receive: number;
    payin_address: string | null;
    payout_address: string | null;
    refund_address: string | null;
    payin_extra_id: string | null;
    payout_extra_id: string | null;
    flow: string;
    rate_id: string | null;
    valid_until: string | null;
    status: string;
    stuck_flagged: boolean;
    finished_at: string | null;
    fee_amount: number;
    fee_currency: string | null;
    partner_fee: number;
    partner_fee_currency: string | null;
    payin_hash: string | null;
    payout_hash: string | null;
    ip: string | null;
    country: string | null;
    user_agent: string | null;
    source: string | null;
    promo_code: string | null;
    meta: Record<string, unknown> | null;
    created_at: string | null;
    updated_at: string | null;
}

interface UserSummary {
    id: number;
    email: string | null;
    country: string | null;
    last_seen_at: string | null;
}

interface TicketSummary {
    id: number;
    subject: string;
    status: string;
    created_at: string | null;
}

interface AuditRow {
    id: number;
    event: string;
    old_values: Record<string, unknown>;
    new_values: Record<string, unknown>;
    user_type: string | null;
    user_id: number | null;
    ip_address: string | null;
    created_at: string | null;
}

interface Props {
    transaction: TxDetail;
    user: UserSummary | null;
    tickets: TicketSummary[];
    audits: AuditRow[];
}

export default function TransactionShow({ transaction, user, tickets, audits }: Props) {
    const t = useT();
    const tx = transaction;

    function refresh() {
        router.post(route('admin.transactions.refresh', tx.id), {}, { preserveScroll: true });
    }
    function flag() {
        router.post(route('admin.transactions.flag', tx.id), {}, { preserveScroll: true });
    }

    async function copy(value: string | null) {
        if (!value) return;
        const ok = await copyToClipboard(value);
        if (ok) toast.success(t('admin.common.copied'));
    }

    const payinExp  = explorerUrl(tx.from_currency, tx.payin_address, 'address');
    const payoutExp = explorerUrl(tx.to_currency, tx.payout_address, 'address');
    const payinTx   = explorerUrl(tx.from_currency, tx.payin_hash, 'tx');
    const payoutTx  = explorerUrl(tx.to_currency, tx.payout_hash, 'tx');

    return (
        <AdminLayout
            title={t('admin.tx.detail_title')}
            subtitle={tx.provider_id ?? `#${tx.id}`}
            actions={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={refresh}
                        className="px-3 py-1.5 rounded-lg border border-line-2 text-sm hover:bg-[color:var(--surface-card-2)]"
                    >
                        {t('admin.tx.refresh_btn')}
                    </button>
                    <button
                        type="button"
                        onClick={flag}
                        className="px-3 py-1.5 rounded-lg border border-line-2 text-sm hover:bg-[color:var(--surface-card-2)]"
                    >
                        {t('admin.tx.flag_btn')}
                    </button>
                </div>
            }
        >
            <Head title={tx.provider_id ?? `Transaction #${tx.id}`} />

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 grid gap-4">
                    <Card title={t('admin.tx.amounts')}>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <KV label={t('admin.tx.send_amount')} value={`${formatAmount(tx.amount_send)} ${tx.from_currency.toUpperCase()}`} />
                            <KV label={t('admin.tx.receive_amount')} value={`${formatAmount(tx.amount_receive)} ${tx.to_currency.toUpperCase()}`} />
                            <KV label={t('admin.tx.fee_amount')} value={`${formatAmount(tx.fee_amount)} ${tx.fee_currency ?? ''}`} />
                            <KV label={t('admin.tx.partner_fee')} value={`${formatAmount(tx.partner_fee)} ${tx.partner_fee_currency ?? ''}`} />
                            <KV label={t('admin.tx.col_flow')} value={tx.flow} />
                            <KV
                                label={t('admin.common.status')}
                                value={<StatusBadge status={tx.status} />}
                            />
                            <KV label={t('admin.tx.rate_id')} value={tx.rate_id ?? '—'} mono />
                            <KV label={t('admin.tx.valid_until')} value={fmtDate(tx.valid_until)} />
                            <KV label={t('admin.tx.finished_at')} value={fmtDate(tx.finished_at)} />
                            <KV label={t('admin.common.created_at')} value={fmtDate(tx.created_at)} />
                        </div>
                    </Card>

                    <Card title={t('admin.tx.addresses')}>
                        <div className="grid gap-3">
                            <AddrRow
                                label={t('admin.tx.payin')}
                                value={tx.payin_address}
                                explorer={payinExp}
                                onCopy={() => copy(tx.payin_address)}
                                extra={tx.payin_extra_id}
                                network={tx.from_network}
                            />
                            <AddrRow
                                label={t('admin.tx.payout')}
                                value={tx.payout_address}
                                explorer={payoutExp}
                                onCopy={() => copy(tx.payout_address)}
                                extra={tx.payout_extra_id}
                                network={tx.to_network}
                            />
                            <AddrRow
                                label={t('admin.tx.refund')}
                                value={tx.refund_address}
                                explorer={null}
                                onCopy={() => copy(tx.refund_address)}
                            />
                        </div>
                    </Card>

                    <Card title={t('admin.tx.hashes')}>
                        <div className="grid gap-3">
                            <HashRow label="Pay-in" value={tx.payin_hash} explorer={payinTx} onCopy={() => copy(tx.payin_hash)} />
                            <HashRow label="Pay-out" value={tx.payout_hash} explorer={payoutTx} onCopy={() => copy(tx.payout_hash)} />
                        </div>
                    </Card>

                    <Card title={t('admin.tx.meta')}>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <KV label="IP" value={tx.ip ?? '—'} mono />
                            <KV label="Country" value={tx.country ?? '—'} />
                            <KV label="Source" value={tx.source ?? '—'} />
                            <KV label="Promo" value={tx.promo_code ?? '—'} />
                            <KV label="User-Agent" value={tx.user_agent ?? '—'} mono small />
                        </div>
                        {tx.meta && Object.keys(tx.meta).length > 0 && (
                            <pre className="mt-3 surface-input rounded-lg p-3 text-[11px] overflow-x-auto font-mono">
                                {JSON.stringify(tx.meta, null, 2)}
                            </pre>
                        )}
                    </Card>

                    <Card title={t('admin.tx.audit_log')}>
                        {audits.length === 0 ? (
                            <p className="text-sm text-muted-3 px-1 py-2">{t('admin.tx.no_audits')}</p>
                        ) : (
                            <ul className="divide-y divide-line-1">
                                {audits.map((a) => (
                                    <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold uppercase">{a.event}</span>
                                            <span className="text-muted-3">{fmtDate(a.created_at)}</span>
                                        </div>
                                        <Diff old={a.old_values} next={a.new_values} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>

                <div className="grid gap-4">
                    <Card title={t('admin.tx.associated_user')}>
                        {user ? (
                            <div className="text-sm grid gap-2">
                                <Link href={route('admin.users.show', user.id)} className="font-semibold hover:underline">
                                    {user.email ?? `#${user.id}`}
                                </Link>
                                <div className="text-xs text-muted-3">
                                    {user.country ? user.country.toUpperCase() : '—'} · last seen {fmtDate(user.last_seen_at)}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-3">{t('admin.tx.no_user')}</p>
                        )}
                    </Card>

                    <Card title={t('admin.tx.related_tickets')}>
                        {tickets.length === 0 ? (
                            <p className="text-sm text-muted-3">{t('admin.tx.no_tickets')}</p>
                        ) : (
                            <ul className="grid gap-2">
                                {tickets.map((tk) => (
                                    <li key={tk.id}>
                                        <Link href={route('admin.tickets.show', tk.id)} className="block surface-input rounded-lg px-3 py-2 hover:bg-[color:var(--surface-card-2)]">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm truncate">{tk.subject}</span>
                                                <StatusBadge status={tk.status} namespace="admin.tickets.status" />
                                            </div>
                                            <div className="text-[11px] text-muted-3 mt-0.5">{fmtDate(tk.created_at)}</div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card title="ID">
                        <div className="grid gap-2 text-xs">
                            <KV label="Local id" value={`#${tx.id}`} mono />
                            <KV
                                label="Provider id"
                                value={tx.provider_id ? shorten(tx.provider_id, 8, 6) : '—'}
                                mono
                            />
                            <KV label="Stuck" value={tx.stuck_flagged ? t('admin.common.yes') : t('admin.common.no')} />
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="surface-card border border-line-1 rounded-xl">
            <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">
                {title}
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

function KV({
    label,
    value,
    mono,
    small,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    small?: boolean;
}) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-3 mb-0.5">{label}</div>
            <div className={`${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-sm'} text-[color:var(--text-1)] break-all`}>{value}</div>
        </div>
    );
}

function AddrRow({
    label,
    value,
    explorer,
    onCopy,
    extra,
    network,
}: {
    label: string;
    value: string | null;
    explorer: string | null;
    onCopy: () => void;
    extra?: string | null;
    network?: string | null;
}) {
    const t = useT();
    return (
        <div className="surface-input rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-muted-3">
                <span className="uppercase tracking-wider">{label}</span>
                {network && <span className="chain-chip">{network}</span>}
            </div>
            <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs break-all flex-1">{value ?? '—'}</span>
                {value && (
                    <>
                        <button type="button" onClick={onCopy} aria-label={t('aria.copy')} className="p-1 rounded hover:bg-[color:var(--surface-card-2)]">
                            <Copy width={14} height={14} />
                        </button>
                        {explorer && (
                            <a href={explorer} target="_blank" rel="noreferrer noopener" className="p-1 rounded hover:bg-[color:var(--surface-card-2)]">
                                <ExternalLink width={14} height={14} />
                            </a>
                        )}
                    </>
                )}
            </div>
            {extra && (
                <div className="mt-1 text-[11px] text-amber-300/90">
                    extra id: <span className="font-mono">{extra}</span>
                </div>
            )}
        </div>
    );
}

function HashRow({
    label,
    value,
    explorer,
    onCopy,
}: {
    label: string;
    value: string | null;
    explorer: string | null;
    onCopy: () => void;
}) {
    const t = useT();
    return (
        <div className="surface-input rounded-lg p-3">
            <div className="text-xs text-muted-3 uppercase tracking-wider">{label}</div>
            <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xs break-all flex-1">{value ?? '—'}</span>
                {value && (
                    <>
                        <button type="button" onClick={onCopy} aria-label={t('aria.copy')} className="p-1 rounded hover:bg-[color:var(--surface-card-2)]">
                            <Copy width={14} height={14} />
                        </button>
                        {explorer && (
                            <a href={explorer} target="_blank" rel="noreferrer noopener" className="p-1 rounded hover:bg-[color:var(--surface-card-2)]">
                                <ExternalLink width={14} height={14} />
                            </a>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function Diff({ old, next }: { old: Record<string, unknown>; next: Record<string, unknown> }) {
    const keys = Array.from(new Set([...Object.keys(old ?? {}), ...Object.keys(next ?? {})]));
    if (keys.length === 0) return <p className="text-xs text-muted-3 mt-1">—</p>;
    return (
        <table className="w-full mt-2 text-xs">
            <tbody>
                {keys.map((k) => (
                    <tr key={k} className="border-t border-line-1">
                        <td className="py-1 pr-3 font-mono text-muted-3">{k}</td>
                        <td className="py-1 pr-3 font-mono text-rose-300/80 line-through break-all">{stringify(old?.[k])}</td>
                        <td className="py-1 font-mono text-emerald-300/90 break-all">{stringify(next?.[k])}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function stringify(v: unknown): string {
    if (v === null || v === undefined) return '∅';
    if (typeof v === 'object') {
        try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
}

function fmtDate(iso: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
