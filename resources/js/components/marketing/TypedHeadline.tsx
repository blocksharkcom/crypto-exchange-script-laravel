import { useEffect, useState } from 'react';

interface Props {
    /** Plain words shown immediately (white). */
    prefix: string;
    /** Word(s) typed letter-by-letter on the brand gradient. */
    rotating: string[];
    subtitle?: string;
    /** Milliseconds per letter typed in. */
    typeSpeed?: number;
    /** Milliseconds per letter deleted. */
    deleteSpeed?: number;
    /** Pause once fully typed (ms). */
    holdMs?: number;
}

/**
 * Big multi-line hero headline with a smooth typewriter on the gradient word.
 * - Cycles through `rotating` strings forever
 * - Respects `prefers-reduced-motion` — falls back to a static render
 * - SSR-safe: the typed substring starts blank and animates on mount only
 */
export function TypedHeadline({
    prefix, rotating, subtitle,
    typeSpeed = 80, deleteSpeed = 40, holdMs = 1800,
}: Props) {
    const items = rotating.length > 0 ? rotating : [''];
    const [index, setIndex] = useState(0);
    const [shown, setShown] = useState('');
    const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) {
            // Static render — show the first option fully typed forever.
            setShown(items[0] ?? '');
            return;
        }

        let timer: ReturnType<typeof setTimeout>;
        const target = items[index] ?? '';

        if (phase === 'typing') {
            if (shown.length < target.length) {
                timer = setTimeout(() => setShown(target.slice(0, shown.length + 1)), typeSpeed);
            } else {
                timer = setTimeout(() => setPhase(items.length > 1 ? 'holding' : 'holding'), 0);
            }
        } else if (phase === 'holding') {
            // Only deletion-cycle if there's more than one word; otherwise hold forever.
            if (items.length > 1) {
                timer = setTimeout(() => setPhase('deleting'), holdMs);
            }
        } else {
            if (shown.length > 0) {
                timer = setTimeout(() => setShown(target.slice(0, shown.length - 1)), deleteSpeed);
            } else {
                setIndex((i) => (i + 1) % items.length);
                setPhase('typing');
            }
        }
        return () => clearTimeout(timer);
    }, [shown, phase, index, items, typeSpeed, deleteSpeed, holdMs]);

    return (
        <div className="text-center">
            <h1 className="font-extrabold tracking-tight leading-[1.05] text-[36px] sm:text-[60px] lg:text-[88px]">
                <span className="block text-[color:var(--text-1)]">{prefix}</span>
                <span className="block">
                    <span className="text-gradient-brand">{shown}</span>
                    <span aria-hidden className="caret inline-block align-middle ml-0.5" />
                </span>
            </h1>
            {subtitle && (
                <p className="mt-5 sm:mt-6 mx-auto max-w-xl text-base sm:text-lg text-muted-2 px-2">
                    {subtitle}
                </p>
            )}
            <style>{`
                .caret {
                    width: .08em; height: .9em;
                    background: var(--color-brand-300);
                    border-radius: 2px;
                    transform: translateY(0.08em);
                    animation: caret-blink 1s steps(2, end) infinite;
                }
                @keyframes caret-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
                @media (prefers-reduced-motion: reduce) {
                    .caret { display: none }
                }
            `}</style>
        </div>
    );
}
