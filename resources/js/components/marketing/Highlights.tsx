import { usePage } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import type { HighlightItem, SharedProps } from '@/Types';

interface Props {
    /** Optional override; defaults to value coming from the admin-editable content. */
    since?: number;
}

export function Highlights({ since }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const data = props.content?.highlights ?? { since: 2024, items: [] };
    const year = since ?? data.since ?? 2024;
    const items: HighlightItem[] = Array.isArray(data.items) ? data.items : [];

    return (
        <section aria-labelledby="highlights-h" className="surface-card-2 rounded-[28px] border border-line-1 p-7 sm:p-10">
            <h2 id="highlights-h" className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t('highlights.title', { year })}
            </h2>

            <ul className="mt-8 space-y-6">
                {items.map((item, i) => (
                    <li key={`${item.title}-${i}`}>
                        <span className="inline-block bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] font-semibold text-base px-3 py-1.5 rounded-md">
                            {item.title}
                        </span>
                        <p className="mt-3 text-muted-2 text-[15px] leading-relaxed max-w-[40ch]">
                            {item.desc}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
