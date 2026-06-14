import { usePage } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import type { HowItem, SharedProps } from '@/Types';

export function HowItWorks() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const items: HowItem[] = props.content?.how_it_works?.items ?? [];

    if (items.length === 0) return null;

    return (
        <section id="how" className="relative z-10 container-edge py-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('how.title')}</h2>

            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
                {items.map((item, i) => (
                    <li key={`${item.title}-${i}`} className="relative">
                        <div className="text-[64px] font-bold leading-none text-[color:var(--color-progress)] tabular-nums">
                            {i + 1}
                        </div>
                        <h3 className="mt-4 font-bold text-lg text-[color:var(--text-1)] leading-snug">
                            {item.title}
                        </h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted-2 max-w-[28ch]">
                            {item.desc}
                        </p>
                    </li>
                ))}
            </ol>
        </section>
    );
}
