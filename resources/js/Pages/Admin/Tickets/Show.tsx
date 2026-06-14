import { Head, Link, router, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import StatusBadge from '@/components/admin/StatusBadge';
import PairBadge from '@/components/admin/PairBadge';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Ticket {
    id: number;
    subject: string;
    email: string;
    status: string;
    priority: string;
    closed_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface UserSummary {
    id: number;
    email: string | null;
    country: string | null;
}

interface TxSummary {
    id: number;
    provider_id: string | null;
    from_currency: string;
    to_currency: string;
    status: string;
}

interface Message {
    id: number;
    sender: string; // 'user' | 'admin'
    body: string;
    admin: { name: string; email: string } | null;
    created_at: string | null;
}

interface Props {
    ticket: Ticket;
    user: UserSummary | null;
    transaction: TxSummary | null;
    messages: Message[];
}

export default function TicketShow({ ticket, user, transaction, messages }: Props) {
    const t = useT();
    const form = useForm({ body: '' });

    function onReply(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('admin.tickets.reply', ticket.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    }

    function onClose() {
        if (!confirm(t('admin.tickets.close_btn') + '?')) return;
        router.post(route('admin.tickets.close', ticket.id), {}, { preserveScroll: true });
    }

    return (
        <AdminLayout
            title={ticket.subject}
            subtitle={`#${ticket.id} · ${ticket.email}`}
            actions={
                <div className="flex items-center gap-2">
                    <StatusBadge status={ticket.status} namespace="admin.tickets.status" />
                    {ticket.status !== 'closed' && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 rounded-lg border border-line-2 text-sm hover:bg-[color:var(--surface-card-2)]"
                        >
                            {t('admin.tickets.close_btn')}
                        </button>
                    )}
                </div>
            }
        >
            <Head title={ticket.subject} />

            <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 surface-card border border-line-1 rounded-xl flex flex-col">
                    <header className="px-4 py-2.5 border-b border-line-1 text-[11px] font-semibold uppercase tracking-wider text-muted-3">
                        {t('admin.common.conversation')}
                    </header>
                    <ul className="p-4 grid gap-3">
                        {messages.length === 0 ? (
                            <li className="text-sm text-muted-3">{t('admin.tickets.no_messages')}</li>
                        ) : messages.map((m) => (
                            <li
                                key={m.id}
                                className={cn(
                                    'rounded-xl p-3 max-w-[85%] border',
                                    m.sender === 'admin'
                                        ? 'ml-auto bg-[color:var(--color-brand-300)]/10 border-[color:var(--color-brand-300)]/30'
                                        : 'mr-auto surface-input border-line-1',
                                )}
                            >
                                <div className="flex items-center justify-between gap-3 text-[11px] text-muted-3">
                                    <span>
                                        {m.sender === 'admin'
                                            ? `${t('admin.tickets.sender_admin')}${m.admin ? ' · ' + m.admin.name : ''}`
                                            : t('admin.tickets.sender_user')}
                                    </span>
                                    <span>{fmt(m.created_at)}</span>
                                </div>
                                <p className="mt-1 text-sm whitespace-pre-wrap break-words">{m.body}</p>
                            </li>
                        ))}
                    </ul>

                    {ticket.status !== 'closed' && (
                        <form onSubmit={onReply} className="p-4 border-t border-line-1 grid gap-2">
                            <label htmlFor="reply" className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold">
                                {t('admin.tickets.reply_label')}
                            </label>
                            <textarea
                                id="reply"
                                rows={5}
                                maxLength={5000}
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                placeholder={t('admin.tickets.reply_ph')}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 text-sm resize-vertical"
                                required
                            />
                            {form.errors.body && <p className="text-xs text-rose-400">{form.errors.body}</p>}
                            <div className="flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="px-3 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold disabled:opacity-50"
                                >
                                    {form.processing ? <span className="spinner" /> : t('admin.tickets.reply_btn')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="grid gap-4">
                    <section className="surface-card border border-line-1 rounded-xl p-4">
                        <h3 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-3">{t('admin.common.details')}</h3>
                        <dl className="grid gap-2 text-sm">
                            <KV label={t('admin.common.status')} value={<StatusBadge status={ticket.status} namespace="admin.tickets.status" />} />
                            <KV label={t('admin.tickets.col_priority')} value={<span className="uppercase">{ticket.priority}</span>} />
                            <KV label={t('admin.common.created_at')} value={fmt(ticket.created_at)} />
                            <KV label={t('admin.common.updated_at')} value={fmt(ticket.updated_at)} />
                            {ticket.closed_at && <KV label={t('admin.tickets.closed_at')} value={fmt(ticket.closed_at)} />}
                            <KV label={t('admin.common.email')} value={ticket.email} />
                        </dl>
                    </section>

                    {user && (
                        <section className="surface-card border border-line-1 rounded-xl p-4">
                            <h3 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-3">{t('admin.tx.associated_user')}</h3>
                            <Link href={route('admin.users.show', user.id)} className="text-sm font-semibold hover:underline">
                                {user.email ?? `#${user.id}`}
                            </Link>
                            <div className="text-xs text-muted-3">{user.country?.toUpperCase() ?? '—'}</div>
                        </section>
                    )}

                    {transaction && (
                        <section className="surface-card border border-line-1 rounded-xl p-4">
                            <h3 className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-3">{t('admin.tickets.related_tx')}</h3>
                            <Link href={route('admin.transactions.show', transaction.id)} className="text-sm font-semibold uppercase hover:underline">
                                <PairBadge from={transaction.from_currency} to={transaction.to_currency} />
                            </Link>
                            <div className="text-xs text-muted-3 font-mono mt-0.5">{transaction.provider_id}</div>
                            <div className="mt-2"><StatusBadge status={transaction.status} /></div>
                        </section>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="text-xs uppercase tracking-wider text-muted-3">{label}</dt>
            <dd className="text-sm text-right break-all">{value}</dd>
        </div>
    );
}

function fmt(iso: string | null): string {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
