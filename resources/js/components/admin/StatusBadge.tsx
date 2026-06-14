import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Brand-aligned status tones.
 *  - Lime (brand-300)        — finished / open (success)
 *  - Indigo (color-progress) — in-progress states (confirming, exchanging, sending, verifying, pending)
 *  - Amber (warn)            — waiting / stuck (caution)
 *  - Red (danger)            — failed
 *  - Neutral                 — new / expired / closed / refunded
 */
const TONE: Record<string, string> = {
    finished:   'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-[color:var(--color-brand-300)]/30',
    open:       'bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)] ring-[color:var(--color-brand-300)]/30',
    waiting:    'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-[color:var(--warn-border)]',
    pending:    'bg-[color:var(--warn-bg)] text-[color:var(--warn)] ring-[color:var(--warn-border)]',
    confirming: 'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    exchanging: 'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    sending:    'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    verifying:  'bg-[color:var(--color-progress)]/15 text-[color:var(--color-progress)] ring-[color:var(--color-progress)]/30',
    failed:     'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    new:        'bg-white/5 text-[color:var(--text-3)] ring-[color:var(--line-2)]',
    expired:    'bg-white/5 text-[color:var(--text-3)] ring-[color:var(--line-2)]',
    closed:     'bg-white/5 text-[color:var(--text-3)] ring-[color:var(--line-2)]',
    refunded:   'bg-white/5 text-[color:var(--text-3)] ring-[color:var(--line-2)]',
};

interface Props {
    status: string;
    namespace?: 'status' | 'admin.tickets.status';
}

export default function StatusBadge({ status, namespace = 'status' }: Props) {
    const t = useT();
    const tone = TONE[status] ?? 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/25';
    const labelKey =
        namespace === 'admin.tickets.status'
            ? `admin.tickets.status_${status}`
            : `status.${status}`;
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset',
                tone,
            )}
        >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {t(labelKey)}
        </span>
    );
}
