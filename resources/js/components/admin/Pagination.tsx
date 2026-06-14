import { Link } from '@inertiajs/react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { PaginatorLink } from '@/Types';

interface Props {
    current: number;
    last: number;
    links: PaginatorLink[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function Pagination({ current, last, links, from, to, total }: Props) {
    const t = useT();
    if (last <= 1) {
        return (
            <div className="flex items-center justify-between gap-3 text-xs text-muted-3 py-3">
                <span>
                    {from ?? 0}–{to ?? 0} / {total}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-3 py-3">
            <span>
                {from ?? 0}–{to ?? 0} / {total}
            </span>
            <div className="flex items-center gap-1">
                {links.map((l, idx) => {
                    const label = l.label
                        .replace(/&laquo;/g, '\u00ab')
                        .replace(/&raquo;/g, '\u00bb');
                    if (l.url === null) {
                        return (
                            <span
                                key={idx}
                                className="px-2 py-1 rounded-md text-muted-4 opacity-60 select-none"
                                aria-hidden
                            >
                                {label}
                            </span>
                        );
                    }
                    return (
                        <Link
                            key={idx}
                            href={l.url}
                            preserveScroll
                            preserveState
                            className={cn(
                                'px-2 py-1 rounded-md hover:bg-[color:var(--surface-card-2)]',
                                l.active && 'bg-[color:var(--surface-card-2)] text-[color:var(--text-1)] font-semibold',
                            )}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
            <span className="hidden sm:inline">
                {t('admin.common.page_of', { current, total: last })}
            </span>
        </div>
    );
}
