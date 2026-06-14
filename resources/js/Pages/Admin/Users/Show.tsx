import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import StatusBadge from '@/components/admin/StatusBadge';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { formatAmount, shorten } from '@/lib/utils';

interface UserDetail {
    id: number;
    email: string | null;
    name: string | null;
    country: string | null;
    locale: string | null;
    ip: string | null;
    marketing_opt_in: boolean;
    last_seen_at: string | null;
    created_at: string | null;
    suspended_at: string | null;
    suspended_reason: string | null;
}

interface Tx {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    amount_send: number;
    amount_receive: number;
    status: string;
    created_at: string | null;
}

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string | null;
}

interface Props {
    user: UserDetail;
    transactions: Tx[];
    tickets: Ticket[];
}

export default function UserShow({ user, transactions, tickets }: Props) {
    const t = useT();
    const [suspendOpen, setSuspendOpen] = useState<boolean>(false);
    const [reason, setReason] = useState<string>('');

    function destroy(): void {
        if (!window.confirm(t('admin.users.delete_confirm'))) return;
        router.delete(route('admin.users.destroy', user.id));
    }

    function restore(): void {
        router.post(route('admin.users.restore', user.id), {}, { preserveScroll: true });
    }

    function confirmSuspend(): void {
        router.post(route('admin.users.suspend', user.id), { reason }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuspendOpen(false);
                setReason('');
            },
        });
    }

    const isSuspended = user.suspended_at !== null;

    return (
        <AdminLayout
            title={t('admin.users.detail_title')}
            subtitle={user.email ?? `#${user.id}`}
            actions={
                <div className="flex items-center gap-2">
                    <Link href={route('admin.users.edit', user.id)} className="cta cta-ghost !py-1.5 !px-3 !text-sm">
                        {t('admin.users.edit_action')}
                    </Link>
                    {isSuspended ? (
                        <button type="button" onClick={restore} className="cta !py-1.5 !px-3 !text-sm">
                            {t('admin.users.restore_action')}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSuspendOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-semibold border border-amber-500/40 hover:bg-amber-500/25"
                        >
                            {t('admin.users.suspend_action')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={destroy}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 text-sm font-semibold border border-rose-500/40 hover:bg-rose-500/25"
                    >
                        {t('admin.users.delete_action')}
                    </button>
                </div>
            }
        >
            <Head title={user.email ?? `User #${user.id}`} />

            {isSuspended && (
                <div className="mb-4 surface-card border border-rose-500/40 rounded-xl px-4 py-3 flex items-start gap-3 bg-rose-500/5">
                    <span className="inline-flex w-6 h-6 mt-0.5 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 9v4m0 4h.01M3 17h18L12 3 3 17z" />
                        </svg>
                    </span>
                    <div className="text-sm text-rose-200">
                        {t('admin.users.suspended_banner', {
                            date: user.suspended_at ? new Date(user.suspended_at).toLocaleString() : '—',
                            reason: user.suspended_reason ?? '—',
                        })}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
                <section className="surface-card border border-line-1 rounded-xl p-4">
                    <h2 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-3">{t('admin.users.detail_title')}</h2>
                    <dl className="grid gap-3 text-sm">
                        <KV label={t('admin.users.col_email')} value={user.email ?? '—'} />
                        <KV label={t('admin.users.name')} value={user.name ?? '—'} />
                        <KV label={t('admin.users.col_country')} value={user.country ? user.country.toUpperCase() : '—'} />
                        <KV label={t('admin.users.locale')} value={user.locale ?? '—'} />
                        <KV label="IP" value={user.ip ?? '—'} mono />
                        <KV label={t('admin.users.marketing_opt_in')} value={user.marketing_opt_in ? t('admin.common.yes') : t('admin.common.no')} />
                        <KV label={t('admin.users.col_last_seen')} value={fmt(user.last_seen_at)} />
                        <KV label={t('admin.common.created_at')} value={fmt(user.created_at)} />
                    </dl>
                </section>

                <section className="lg:col-span-2 surface-card border border-line-1 rounded-xl">
                    <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">
                        {t('admin.users.transactions')}
                    </header>
                    {transactions.length === 0 ? (
                        <p className="p-4 text-sm text-muted-3">{t('admin.users.no_tx')}</p>
                    ) : (
                        <ul className="divide-y divide-line-1">
                            {transactions.map((tx) => (
                                <li key={tx.id}>
                                    <Link href={route('admin.transactions.show', tx.id)} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[color:var(--surface-card-2)]">
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold uppercase"><PairBadge from={tx.from_currency} to={tx.to_currency} /></div>
                                            <div className="text-[11px] text-muted-3 font-mono mt-0.5">
                                                {tx.provider_id ? shorten(tx.provider_id, 6, 4) : `#${tx.id}`} · {fmt(tx.created_at)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs">{formatAmount(tx.amount_send)} {tx.from_currency.toUpperCase()}</div>
                                            <div className="mt-1"><StatusBadge status={tx.status} /></div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <section className="mt-6 surface-card border border-line-1 rounded-xl">
                <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">
                    {t('admin.users.tickets')}
                </header>
                {tickets.length === 0 ? (
                    <p className="p-4 text-sm text-muted-3">{t('admin.users.no_tickets')}</p>
                ) : (
                    <ul className="divide-y divide-line-1">
                        {tickets.map((tk) => (
                            <li key={tk.id}>
                                <Link href={route('admin.tickets.show', tk.id)} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[color:var(--surface-card-2)]">
                                    <div className="min-w-0">
                                        <div className="text-sm truncate">{tk.subject}</div>
                                        <div className="text-[11px] text-muted-3 mt-0.5">{fmt(tk.created_at)} · {tk.priority}</div>
                                    </div>
                                    <StatusBadge status={tk.status} namespace="admin.tickets.status" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {suspendOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md surface-card border border-line-1 rounded-2xl p-5 shadow-2xl">
                        <h3 className="text-base font-semibold tracking-tight">{t('admin.users.suspend_modal.title')}</h3>
                        <p className="mt-1 text-sm text-muted-3">{t('admin.users.suspend_modal.body')}</p>

                        <div className="mt-4">
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.users.suspend_modal.reason_label')}
                            </label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value.slice(0, 200))}
                                placeholder={t('admin.users.suspend_modal.reason_ph')}
                                maxLength={200}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setSuspendOpen(false)}
                                className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-muted-2"
                            >
                                {t('admin.users.suspend_modal.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={confirmSuspend}
                                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-400"
                            >
                                {t('admin.users.suspend_modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex justify-between gap-3">
            <dt className="text-xs uppercase tracking-wider text-muted-3">{label}</dt>
            <dd className={`text-sm ${mono ? 'font-mono' : ''} text-right break-all`}>{value}</dd>
        </div>
    );
}

function fmt(iso: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
