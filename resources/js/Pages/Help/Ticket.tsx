import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import { ArrowRight, Check } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/Types';

type TicketStatus = 'open' | 'pending' | 'closed';

interface ThreadMessage {
    id: number;
    sender: 'user' | 'admin';
    body: string;
    admin_name: string | null;
    created_at: string | null;
}

interface PageProps extends SharedProps {
    ticket: {
        id: number;
        subject: string;
        status: TicketStatus;
        priority: string;
        created_at: string | null;
        updated_at: string | null;
        view_token: string;
    };
    transaction: null | {
        provider_id: string;
        from_currency: string;
        to_currency: string;
        status: string;
    };
    messages: ThreadMessage[];
}

export default function Ticket() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const { ticket, transaction, messages, flash } = props;

    useEffect(() => {
        if (flash.success) toast.success(flash.success);
        if (flash.error)   toast.error(flash.error);
    }, [flash.success, flash.error]);

    const form = useForm({ body: '' });

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(`/help/ticket/${ticket.id}/${ticket.view_token}/reply`, {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    }

    return (
        <PublicLayout>
            <Head title={`#${ticket.id} — ${ticket.subject}`} />

            <section className="relative pt-10 pb-6">
                <div className="container-edge max-w-3xl">
                    <a href="/help" className="inline-flex items-center gap-1.5 text-sm text-muted-3 hover:text-[color:var(--text-1)] transition">
                        ← {t('help.title')}
                    </a>

                    <div className="mt-4 flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--color-progress)] font-semibold">
                                #{ticket.id}
                                <StatusBadge status={ticket.status} />
                            </div>
                            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                                {ticket.subject}
                            </h1>
                            <p className="mt-1 text-sm text-muted-3">
                                {t('help.thread.opened_on', { date: formatDate(ticket.created_at) })}
                            </p>
                        </div>

                        {transaction && (
                            <a
                                href={`/tx/${transaction.provider_id}`}
                                className="inline-flex items-center gap-2 surface-card-2 border border-line-1 rounded-full px-3.5 py-2 text-xs font-mono text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3 transition"
                            >
                                <span className="inline-flex items-center gap-1 uppercase">
                                    <span>{transaction.from_currency.toUpperCase()}</span>
                                    <span className="text-muted-3" aria-hidden>→</span>
                                    <span>{transaction.to_currency.toUpperCase()}</span>
                                </span>
                                <span className="text-muted-3">·</span>
                                <span>{transaction.provider_id.slice(0, 10)}…</span>
                            </a>
                        )}
                    </div>
                </div>
            </section>

            <section className="relative z-10 container-edge max-w-3xl pb-16">
                <ol className="space-y-3">
                    {messages.map((m) => (
                        <li
                            key={m.id}
                            className={cn(
                                'rounded-2xl p-5 border',
                                m.sender === 'user'
                                    ? 'surface-card border-line-1'
                                    : 'surface-card-2 border-[color:var(--color-progress-track)]',
                            )}
                        >
                            <header className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Avatar role={m.sender} name={m.admin_name} />
                                    <span className="font-semibold text-[color:var(--text-1)]">
                                        {m.sender === 'admin'
                                            ? (m.admin_name ?? t('help.thread.admin_team'))
                                            : t('help.thread.you')}
                                    </span>
                                </div>
                                <time className="text-xs text-muted-3">{formatDate(m.created_at)}</time>
                            </header>
                            <p className="text-[15px] text-muted-2 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                        </li>
                    ))}
                </ol>

                {ticket.status === 'closed' ? (
                    <div className="mt-6 rounded-2xl border border-line-1 surface-card p-5 text-sm text-muted-3 flex items-center gap-2">
                        <Check className="text-[color:var(--color-brand-300)]" />
                        {t('help.thread.closed')}
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="mt-6">
                        <div className="field">
                            <label className="field-label" htmlFor="reply-body">{t('help.thread.reply_label')}</label>
                            <textarea
                                id="reply-body"
                                rows={5}
                                maxLength={5000}
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                required
                            />
                        </div>
                        {form.errors.body && (
                            <p className="mt-2 text-sm text-[color:var(--warn)]">{form.errors.body}</p>
                        )}
                        <button
                            type="submit"
                            disabled={form.processing || !form.data.body.trim()}
                            className="cta mt-4 sm:max-w-xs"
                        >
                            {form.processing ? <span className="spinner" /> : (
                                <>
                                    <span>{t('help.thread.reply_send')}</span>
                                    <ArrowRight />
                                </>
                            )}
                        </button>
                        <p className="mt-3 text-xs text-muted-3">{t('help.thread.awaiting')}</p>
                    </form>
                )}
            </section>
        </PublicLayout>
    );
}

function StatusBadge({ status }: { status: TicketStatus }) {
    const map: Record<TicketStatus, { color: string; bg: string; label: string }> = {
        open:    { color: '#bff15a', bg: 'rgba(191, 241, 90, 0.14)', label: 'Open' },
        pending: { color: '#b9b7ff', bg: 'rgba(110, 109, 244, 0.18)', label: 'Pending reply' },
        closed:  { color: 'var(--text-3)', bg: 'rgba(255, 255, 255, 0.06)', label: 'Closed' },
    };
    const m = map[status];
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
            style={{ color: m.color, background: m.bg }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
            {m.label}
        </span>
    );
}

function Avatar({ role, name }: { role: 'user' | 'admin'; name: string | null }) {
    const initial = (role === 'admin' ? name : null)?.slice(0, 1).toUpperCase() ?? (role === 'admin' ? 'S' : 'U');
    const bg = role === 'admin'
        ? 'linear-gradient(135deg, var(--color-brand-300), var(--color-cy-300))'
        : 'linear-gradient(135deg, var(--color-progress), #4cd1c1)';
    return (
        <span
            aria-hidden
            className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold text-[color:var(--color-brand-ink)]"
            style={{ background: bg }}
        >
            {initial}
        </span>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return '';
    try {
        return new Intl.DateTimeFormat(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}
