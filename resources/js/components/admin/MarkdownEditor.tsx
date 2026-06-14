import { useRef, useState } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';

interface Props {
    value: string;
    onChange: (v: string) => void;
    label?: string;
    placeholder?: string;
    rows?: number;
    error?: string | null;
}

/**
 * Simple Markdown editor: Write / Preview tabs + a toolbar that wraps the
 * current selection with common Markdown delimiters. Body is rendered with
 * the project's own `renderMarkdown` helper (no library, no CDN).
 */
export function MarkdownEditor({
    value, onChange, label, placeholder, rows = 14, error,
}: Props) {
    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const ref = useRef<HTMLTextAreaElement>(null);

    function wrap(prefix: string, suffix: string = prefix) {
        const el = ref.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const sel = value.slice(start, end);
        const next = value.slice(0, start) + prefix + sel + suffix + value.slice(end);
        onChange(next);
        queueMicrotask(() => {
            el.focus();
            const caret = start + prefix.length + sel.length + suffix.length;
            el.setSelectionRange(caret, caret);
        });
    }

    function linePrefix(prefix: string) {
        const el = ref.current;
        if (!el) return;
        const start = el.selectionStart;
        const before = value.slice(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
        onChange(next);
        queueMicrotask(() => {
            el.focus();
            const caret = start + prefix.length;
            el.setSelectionRange(caret, caret);
        });
    }

    function insertLink() {
        const el = ref.current;
        if (!el) return;
        const url = window.prompt('Link URL?', 'https://') ?? '';
        if (!url) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const sel = value.slice(start, end) || 'link text';
        const next = value.slice(0, start) + `[${sel}](${url})` + value.slice(end);
        onChange(next);
        queueMicrotask(() => el.focus());
    }

    return (
        <div>
            {label && <div className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-1.5">{label}</div>}

            <div className="surface-input border border-line-1 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-line-1 bg-[color:var(--surface-card-2)]">
                    <div className="flex items-center gap-0.5">
                        <Tab active={tab === 'write'}   onClick={() => setTab('write')}   label="Write" />
                        <Tab active={tab === 'preview'} onClick={() => setTab('preview')} label="Preview" />
                    </div>
                    {tab === 'write' && (
                        <div className="flex items-center gap-0.5">
                            <Tool title="Heading"   onClick={() => linePrefix('## ')}>H</Tool>
                            <Tool title="Bold"      onClick={() => wrap('**')}><strong>B</strong></Tool>
                            <Tool title="Italic"    onClick={() => wrap('*')}><em>I</em></Tool>
                            <Tool title="Code"      onClick={() => wrap('`')}>{'</>'}</Tool>
                            <Tool title="List item" onClick={() => linePrefix('- ')}>•</Tool>
                            <Tool title="Numbered"  onClick={() => linePrefix('1. ')}>1.</Tool>
                            <Tool title="Link"      onClick={insertLink}>↗</Tool>
                            <Tool title="Quote"     onClick={() => linePrefix('> ')}>❝</Tool>
                        </div>
                    )}
                </div>

                {tab === 'write' ? (
                    <textarea
                        ref={ref}
                        rows={rows}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        spellCheck
                        className="w-full bg-transparent border-0 outline-none px-4 py-3 font-mono text-[13px] leading-relaxed text-[color:var(--text-1)] placeholder:text-muted-4 resize-y"
                    />
                ) : (
                    <div
                        className="prose-help px-4 py-3 min-h-[10rem]"
                        dangerouslySetInnerHTML={{ __html: value.trim() ? renderMarkdown(value) : '<p class="text-muted-3">Nothing to preview yet.</p>' }}
                    />
                )}
            </div>

            {error && <p className="mt-1.5 text-xs text-[color:var(--warn)]">{error}</p>}
        </div>
    );
}

function Tab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'px-3 py-1 rounded-md text-xs font-semibold transition',
                active
                    ? 'bg-[color:var(--surface-card)] text-[color:var(--text-1)] border border-line-2'
                    : 'text-muted-3 hover:text-[color:var(--text-1)]',
            )}
        >
            {label}
        </button>
    );
}

function Tool({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className="w-7 h-7 grid place-items-center rounded-md text-[12px] font-semibold text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card)] transition"
        >
            {children}
        </button>
    );
}
