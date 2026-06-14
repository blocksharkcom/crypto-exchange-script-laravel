import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icons';
import type { ReviewItem, SharedProps } from '@/Types';

const PAGE_SIZE = 3;

export function ReviewsCarousel() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const reviews: ReviewItem[] = props.content?.reviews?.items ?? [];

    const [page, setPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
    const start = page * PAGE_SIZE;
    const visible = reviews.slice(start, start + PAGE_SIZE);

    if (reviews.length === 0) return null;

    return (
        <section aria-labelledby="reviews-h" className="surface-card-2 rounded-[28px] border border-line-1 p-7 sm:p-10">
            <header className="flex items-center justify-between gap-3">
                <h2 id="reviews-h" className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Heart />
                    {t('reviews.title')}
                </h2>
                <div className="flex items-center gap-2">
                    <CarouselBtn
                        label={t('reviews.prev')}
                        onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                        icon="prev"
                    />
                    <CarouselBtn
                        label={t('reviews.next')}
                        onClick={() => setPage((p) => (p + 1) % totalPages)}
                        icon="next"
                    />
                </div>
            </header>

            <ul className="mt-7 space-y-7">
                {visible.map((r, i) => (
                    <li key={`${r.name}-${start + i}`}>
                        <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-[color:var(--text-1)]">{r.name}</span>
                            <Stars count={r.rating} />
                        </div>
                        <p className="mt-2 text-muted-2 text-[15px] leading-relaxed">{r.body}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function Stars({ count }: { count: number }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${count} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                    <path
                        d="M12 2.5l3 6.4 7 .9-5.1 4.7 1.4 6.9L12 17.9 5.7 21.4l1.4-6.9L2 9.8l7-.9z"
                        fill={i < count ? '#f7b300' : 'currentColor'}
                        className={cn(i >= count && 'text-muted-4')}
                    />
                </svg>
            ))}
        </span>
    );
}

function Heart() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
                d="M12 21s-7-4.5-9.3-9A5.7 5.7 0 0 1 12 6a5.7 5.7 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9z"
                fill="var(--color-brand-300)"
            />
        </svg>
    );
}

function CarouselBtn({ label, onClick, icon }: { label: string; onClick: () => void; icon: 'prev' | 'next' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="w-9 h-9 rounded-full grid place-items-center border border-line-2 text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3 transition"
        >
            {icon === 'prev' ? <ChevronLeft width={18} height={18} /> : <ChevronRight width={18} height={18} />}
        </button>
    );
}
