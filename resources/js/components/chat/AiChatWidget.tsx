import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
    type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { X } from '@/components/ui/Icons';
import type { ChatMessage } from '@/Types';

interface Props {
    assistantName: string;
}

interface UiMessage extends ChatMessage {
    id: string;
}

const STORAGE_KEY_OPEN = 'swapforge-chat-open';

export default function AiChatWidget({ assistantName }: Props) {
    const t = useT();
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<UiMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [sending, setSending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [notConfigured, setNotConfigured] = useState<boolean>(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const stuckToBottomRef = useRef<boolean>(true);

    // Remember open state across navigations within the same tab session.
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY_OPEN);
            if (stored === '1') setOpen(true);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY_OPEN, open ? '1' : '0');
        } catch {
            /* ignore */
        }
    }, [open]);

    // Esc closes the panel; also close on outside click on desktop.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    // Focus textarea when opening.
    useEffect(() => {
        if (open) {
            const id = window.setTimeout(() => textareaRef.current?.focus(), 220);
            return () => window.clearTimeout(id);
        }
        return;
    }, [open]);

    // Smart auto-scroll: only stick to bottom if user is already at bottom.
    const onScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const threshold = 40;
        stuckToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }, []);

    useEffect(() => {
        if (!stuckToBottomRef.current) return;
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, sending]);

    // Auto-resize textarea between 1 and 5 rows.
    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        const lineHeight = 20;
        const maxRows = 5;
        const next = Math.min(ta.scrollHeight, lineHeight * maxRows + 16);
        ta.style.height = `${next}px`;
    }, [input]);

    const sendMessage = useCallback(
        async (raw: string) => {
            const content = raw.trim();
            if (content === '' || sending) return;
            setError(null);

            const userMsg: UiMessage = {
                id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                role: 'user',
                content,
            };
            const next = [...messages, userMsg];
            setMessages(next);
            setInput('');
            stuckToBottomRef.current = true;
            setSending(true);

            try {
                const payload: ChatMessage[] = next.map((m) => ({ role: m.role, content: m.content }));
                const data = await api.chat.send(payload);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        role: 'assistant',
                        content: data.reply,
                    },
                ]);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                if (/not configured|not enabled/i.test(msg)) {
                    setNotConfigured(true);
                } else {
                    setError(t('chat.error'));
                }
            } finally {
                setSending(false);
                window.setTimeout(() => textareaRef.current?.focus(), 30);
            }
        },
        [messages, sending, t],
    );

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void sendMessage(input);
    }

    function onTextareaKey(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void sendMessage(input);
        }
    }

    const suggestions: { key: string; label: string }[] = useMemo(
        () => [
            { key: 'track', label: t('chat.suggestions.track') },
            { key: 'rate',  label: t('chat.suggestions.rate') },
            { key: 'fees',  label: t('chat.suggestions.fees') },
        ],
        [t],
    );

    return (
        <>
            <button
                type="button"
                aria-label={t('chat.open')}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    'fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full grid place-items-center',
                    'text-[color:var(--color-brand-ink)] shadow-[0_18px_36px_-12px_rgba(0,0,0,0.45),0_4px_12px_-4px_rgba(0,0,0,0.35)]',
                    'transition-transform duration-200 ease-out hover:scale-105 active:scale-95',
                    'fab-pulse',
                    open && 'opacity-0 pointer-events-none scale-90',
                )}
                style={{
                    background: 'linear-gradient(135deg, var(--color-brand-300) 0%, var(--color-brand-500) 100%)',
                }}
            >
                <ChatBubbleIcon className="w-6 h-6" />
                <span className="sr-only">{t('chat.open')}</span>
            </button>

            <div
                ref={panelRef}
                role="dialog"
                aria-modal="false"
                aria-label={t('chat.title', { name: assistantName })}
                className={cn(
                    'fixed z-50 transition-all duration-200 ease-out',
                    'right-4 bottom-4 sm:right-5 sm:bottom-5',
                    'w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-6rem)]',
                    'max-sm:right-0 max-sm:left-0 max-sm:bottom-0 max-sm:w-full max-sm:max-w-none max-sm:h-[85vh] max-sm:max-h-[85vh]',
                    open
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-3 pointer-events-none',
                )}
            >
                <div
                    className={cn(
                        'flex flex-col h-full surface-card border border-line-2',
                        'rounded-3xl max-sm:rounded-3xl max-sm:rounded-b-none overflow-hidden',
                    )}
                    style={{ boxShadow: 'var(--shadow-card)' }}
                >
                    <Header
                        name={assistantName}
                        subtitle={t('chat.subtitle')}
                        closeLabel={t('chat.close')}
                        onClose={() => setOpen(false)}
                    />

                    <div
                        ref={scrollRef}
                        onScroll={onScroll}
                        className="flex-1 overflow-y-auto px-4 py-4 grid gap-3 content-start"
                    >
                        {notConfigured ? (
                            <DisabledCard
                                heading={t('chat.disabled_heading')}
                                body={t('chat.disabled_body')}
                                cta={t('chat.open_ticket')}
                            />
                        ) : messages.length === 0 ? (
                            <EmptyState
                                heading={t('chat.empty_heading')}
                                subtitle={t('chat.empty_subtitle')}
                                suggestions={suggestions}
                                onPick={(label) => void sendMessage(label)}
                            />
                        ) : (
                            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
                        )}

                        {sending && <TypingIndicator label={t('chat.typing')} />}

                        {error && (
                            <div
                                role="alert"
                                className="text-xs text-rose-400 surface-card-2 border border-rose-400/30 rounded-xl px-3 py-2"
                            >
                                {error}
                            </div>
                        )}
                    </div>

                    <Footer
                        disabled={notConfigured}
                        sending={sending}
                        value={input}
                        onChange={setInput}
                        onSubmit={onSubmit}
                        onKeyDown={onTextareaKey}
                        textareaRef={textareaRef}
                        placeholder={t('chat.placeholder')}
                        sendLabel={t('chat.send')}
                        poweredBy={t('chat.powered_by')}
                    />
                </div>
            </div>

            <WidgetStyles />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Header({
    name,
    subtitle,
    closeLabel,
    onClose,
}: {
    name: string;
    subtitle: string;
    closeLabel: string;
    onClose: () => void;
}) {
    return (
        <div className="px-4 py-3 border-b border-line-1 flex items-center gap-3">
            <BrandAvatar />
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[color:var(--text-1)] truncate">
                    Ask {name}
                </div>
                <div className="text-[11px] text-muted-3 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {subtitle}
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="w-8 h-8 grid place-items-center rounded-full text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] transition"
            >
                <X width={16} height={16} />
            </button>
        </div>
    );
}

function BrandAvatar() {
    return (
        <span
            aria-hidden
            className="block w-9 h-9 rounded-full grid place-items-center shrink-0"
            style={{
                background: 'linear-gradient(135deg, var(--color-brand-300) 0%, var(--color-brand-500) 100%)',
                color: 'var(--color-brand-ink)',
            }}
        >
            <ChatBubbleIcon className="w-4.5 h-4.5" />
        </span>
    );
}

function EmptyState({
    heading,
    subtitle,
    suggestions,
    onPick,
}: {
    heading: string;
    subtitle: string;
    suggestions: { key: string; label: string }[];
    onPick: (label: string) => void;
}) {
    return (
        <div className="grid gap-4 mt-2">
            <div>
                <h3
                    className="text-xl font-bold tracking-tight leading-tight"
                    style={{
                        backgroundImage:
                            'linear-gradient(120deg, var(--color-brand-300) 0%, var(--color-cy-300) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                    }}
                >
                    {heading}
                </h3>
                <p className="mt-1 text-sm text-muted-3">{subtitle}</p>
            </div>
            <div className="grid gap-2">
                {suggestions.map((s) => (
                    <button
                        key={s.key}
                        type="button"
                        onClick={() => onPick(s.label)}
                        className="text-left text-sm surface-card-2 border border-line-1 rounded-xl px-3 py-2.5 hover:border-[color:var(--color-brand-300)]/60 hover:text-[color:var(--text-1)] text-muted-2 transition"
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function DisabledCard({ heading, body, cta }: { heading: string; body: string; cta: string }) {
    return (
        <div className="surface-card-2 border border-line-1 rounded-2xl p-4 grid gap-3 mt-2">
            <div className="text-sm font-semibold text-[color:var(--text-1)]">{heading}</div>
            <p className="text-sm text-muted-3 leading-relaxed">{body}</p>
            <a
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] hover:bg-[color:var(--color-brand-200)] transition"
            >
                {cta}
            </a>
        </div>
    );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
    const isUser = role === 'user';
    return (
        <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isUser
                        ? 'rounded-br-md text-[color:var(--text-1)]'
                        : 'rounded-bl-md surface-card-2 text-[color:var(--text-1)] border border-line-1',
                )}
                style={
                    isUser
                        ? {
                              background: 'color-mix(in srgb, var(--color-progress) 12%, transparent)',
                              boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-progress) 25%, transparent)',
                          }
                        : undefined
                }
            >
                {isUser ? content : <RichText text={content} />}
            </div>
        </div>
    );
}

function TypingIndicator({ label }: { label: string }) {
    return (
        <div className="flex justify-start" aria-label={label}>
            <div className="rounded-2xl rounded-bl-md surface-card-2 border border-line-1 px-3.5 py-3 flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    );
}

function Footer({
    disabled,
    sending,
    value,
    onChange,
    onSubmit,
    onKeyDown,
    textareaRef,
    placeholder,
    sendLabel,
    poweredBy,
}: {
    disabled: boolean;
    sending: boolean;
    value: string;
    onChange: (v: string) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    placeholder: string;
    sendLabel: string;
    poweredBy: string;
}) {
    return (
        <form
            onSubmit={onSubmit}
            className="border-t border-line-1 px-3 pt-2.5 pb-2 grid gap-1.5 bg-[color:var(--surface-card)]"
        >
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    disabled={disabled || sending}
                    placeholder={placeholder}
                    className={cn(
                        'flex-1 resize-none surface-input border border-line-1 rounded-xl px-3 py-2 text-sm',
                        'focus:outline-none focus:border-[color:var(--color-brand-300)]/60',
                        'placeholder:text-muted-3 leading-[20px] min-h-[40px] max-h-[120px]',
                        'disabled:opacity-50',
                    )}
                />
                <button
                    type="submit"
                    disabled={disabled || sending || value.trim() === ''}
                    aria-label={sendLabel}
                    className={cn(
                        'shrink-0 grid place-items-center w-10 h-10 rounded-xl',
                        'bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)]',
                        'hover:bg-[color:var(--color-brand-200)] transition',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                >
                    <SendIcon className="w-4 h-4" />
                </button>
            </div>
            <p className="text-[10px] text-muted-3 px-1">{poweredBy}</p>
        </form>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tiny inline icon set (kept local so the widget is self-contained)
// ─────────────────────────────────────────────────────────────────────────────

function ChatBubbleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} width="24" height="24">
            <path
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.4A.75.75 0 0 1 4.5 18.9V5.5z"
                fill="currentColor"
            />
            <circle cx="9" cy="9.5" r="1.2" fill="rgba(10,10,12,0.6)" />
            <circle cx="12" cy="9.5" r="1.2" fill="rgba(10,10,12,0.6)" />
            <circle cx="15" cy="9.5" r="1.2" fill="rgba(10,10,12,0.6)" />
        </svg>
    );
}

function SendIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className} width="16" height="16">
            <path d="M4 12l16-8-6 16-3-7-7-1z" fill="currentColor" stroke="none" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown-lite renderer: bold, italic, inline code, links.
// Block-level fenced code is rendered as <pre><code>.
// ─────────────────────────────────────────────────────────────────────────────

function RichText({ text }: { text: string }): ReactNode {
    const blocks: ReactNode[] = [];
    const fenceRegex = /```([\s\S]*?)```/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = fenceRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
            blocks.push(
                <span key={`t-${key++}`}>{renderInline(text.slice(lastIdx, match.index), key)}</span>,
            );
        }
        blocks.push(
            <pre
                key={`p-${key++}`}
                className="surface-input border border-line-1 rounded-lg px-3 py-2 my-1.5 text-[12px] font-mono overflow-x-auto"
            >
                <code>{match[1].replace(/^\n|\n$/g, '')}</code>
            </pre>,
        );
        lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) {
        blocks.push(<span key={`t-${key++}`}>{renderInline(text.slice(lastIdx), key)}</span>);
    }
    return <>{blocks}</>;
}

/**
 * Parse `**bold**`, `*italic*` / `_italic_`, `` `code` ``, and `[label](url)`.
 * Safe-by-construction: we only ever emit text nodes and known anchors.
 */
function renderInline(input: string, seed: number): ReactNode {
    const pattern =
        /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
    const out: ReactNode[] = [];
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    let i = seed * 1000;

    while ((m = pattern.exec(input)) !== null) {
        if (m.index > lastIdx) {
            out.push(input.slice(lastIdx, m.index));
        }
        if (m[1] !== undefined) {
            out.push(<strong key={`b-${i++}`}>{m[1]}</strong>);
        } else if (m[2] !== undefined) {
            out.push(<em key={`i-${i++}`}>{m[2]}</em>);
        } else if (m[3] !== undefined) {
            out.push(<em key={`i-${i++}`}>{m[3]}</em>);
        } else if (m[4] !== undefined) {
            out.push(
                <code
                    key={`c-${i++}`}
                    className="px-1 py-0.5 rounded surface-input border border-line-1 text-[12px] font-mono"
                >
                    {m[4]}
                </code>,
            );
        } else if (m[5] !== undefined && m[6] !== undefined) {
            const safeHref = sanitizeHref(m[6]);
            out.push(
                <a
                    key={`a-${i++}`}
                    href={safeHref}
                    target={safeHref.startsWith('/') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="underline text-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-200)]"
                >
                    {m[5]}
                </a>,
            );
        }
        lastIdx = m.index + m[0].length;
    }
    if (lastIdx < input.length) {
        out.push(input.slice(lastIdx));
    }
    return out;
}

function sanitizeHref(href: string): string {
    if (href.startsWith('/')) return href;
    if (/^https?:\/\//i.test(href)) return href;
    return '#';
}

// ─────────────────────────────────────────────────────────────────────────────
// Local styles for the FAB pulse and the typing dots.
// ─────────────────────────────────────────────────────────────────────────────

function WidgetStyles() {
    return (
        <style>{`
            @keyframes fab-pulse {
                0% { box-shadow: 0 18px 36px -12px rgba(0,0,0,0.45), 0 4px 12px -4px rgba(0,0,0,0.35), 0 0 0 0 rgba(191, 241, 90, 0.55); }
                70% { box-shadow: 0 18px 36px -12px rgba(0,0,0,0.45), 0 4px 12px -4px rgba(0,0,0,0.35), 0 0 0 14px rgba(191, 241, 90, 0); }
                100% { box-shadow: 0 18px 36px -12px rgba(0,0,0,0.45), 0 4px 12px -4px rgba(0,0,0,0.35), 0 0 0 0 rgba(191, 241, 90, 0); }
            }
            .fab-pulse {
                animation: fab-pulse 2.8s ease-out infinite;
            }
            @keyframes typing-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
                40% { transform: translateY(-4px); opacity: 1; }
            }
            .typing-dot {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 9999px;
                background: var(--text-3);
                animation: typing-bounce 1.2s ease-in-out infinite;
            }
            .typing-dot:nth-child(2) { animation-delay: 0.15s; }
            .typing-dot:nth-child(3) { animation-delay: 0.3s; }
            @media (prefers-reduced-motion: reduce) {
                .fab-pulse { animation: none; }
                .typing-dot { animation: none; opacity: 0.8; }
            }
        `}</style>
    );
}
