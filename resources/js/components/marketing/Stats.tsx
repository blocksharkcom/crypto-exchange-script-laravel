import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedProps, StatItem } from '@/Types';

export function Stats() {
    const { props } = usePage<SharedProps>();
    const stats: StatItem[] = Array.isArray(props.content?.stats) ? props.content.stats : [];

    if (stats.length === 0) return null;

    return (
        <section className="relative z-10 container-edge py-12">
            <div className="surface-card rounded-[28px] border border-line-1 p-7 sm:p-10 shadow-[var(--shadow-card)]">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
                    {stats.map((s, i) => <Counter key={`${s.label}-${i}`} stat={s} />)}
                </div>
            </div>
        </section>
    );
}

function Counter({ stat }: { stat: StatItem }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (!started.current && entries[0]?.isIntersecting) {
                    started.current = true;
                    animate();
                }
            },
            { threshold: 0.3 },
        );
        io.observe(el);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function animate() {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) { setVal(stat.value); return; }
        const start = performance.now();
        const duration = 1100;
        const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setVal(Math.round(stat.value * easeOut(t)));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    return (
        <div ref={ref}>
            <div className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums text-[color:var(--text-1)]">
                <span>{val.toLocaleString()}</span>
                <span className="text-gradient-brand">{stat.suffix}</span>
            </div>
            <div className="mt-1.5 text-sm text-muted-3 capitalize">{stat.label}</div>
        </div>
    );
}
