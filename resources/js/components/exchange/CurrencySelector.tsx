import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { Search, Check } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { Currency } from '@/Types';

interface Props {
    open: boolean;
    onClose: () => void;
    currencies: Currency[];
    selected: Currency | null;
    onSelect: (c: Currency) => void;
}

type Filter = 'all' | 'stable';

const PAGE_SIZE = 50;

export function CurrencySelector({ open, onClose, currencies, selected, onSelect }: Props) {
    const t = useT();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [pages, setPages] = useState(1);

    const scrollRef = useRef<HTMLUListElement>(null);
    const sentinelRef = useRef<HTMLLIElement>(null);

    // Reset on open
    useEffect(() => {
        if (open) {
            setSearch('');
            setFilter('all');
            setPages(1);
            // Scroll list back to top whenever a fresh search opens
            queueMicrotask(() => scrollRef.current?.scrollTo({ top: 0 }));
        }
    }, [open]);

    const featured = useMemo(
        () => currencies.filter((c) => c.featured).slice(0, 6),
        [currencies],
    );

    const matched = useMemo(() => {
        const q = search.trim().toLowerCase();
        return currencies.filter((c) => {
            if (filter === 'stable' && !c.is_stable) return false;
            if (!q) return true;
            return (
                c.ticker.includes(q) ||
                c.name.toLowerCase().includes(q) ||
                (c.network ?? '').toLowerCase().includes(q)
            );
        });
    }, [currencies, filter, search]);

    // Reset paging window on new filter/search
    useEffect(() => { setPages(1); scrollRef.current?.scrollTo({ top: 0 }); }, [search, filter]);

    const renderedCount = Math.min(matched.length, pages * PAGE_SIZE);
    const visible = useMemo(() => matched.slice(0, renderedCount), [matched, renderedCount]);
    const hasMore = renderedCount < matched.length;

    // IntersectionObserver-driven progressive loading
    useEffect(() => {
        if (!open || !hasMore) return;
        const el = sentinelRef.current;
        const root = scrollRef.current;
        if (!el || !root) return;

        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    setPages((p) => p + 1);
                }
            },
            { root, rootMargin: '300px 0px', threshold: 0 },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [open, hasMore, visible.length]);

    return (
        <Modal open={open} onClose={onClose} title={t('selector.title')} size="md">
            <div className="px-5 pb-5 pt-2">
                <div className="field mb-4 flex items-center gap-2">
                    <Search className="text-muted-3" />
                    <input
                        autoFocus
                        type="text"
                        placeholder={t('selector.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>

                {featured.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {featured.map((c) => (
                            <button
                                key={`${c.ticker}-${c.network ?? ''}`}
                                type="button"
                                onClick={() => { onSelect(c); onClose(); }}
                                className="surface-card-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm hover:ring-1 ring-line-2 transition"
                            >
                                <CoinIcon ticker={c.ticker} image={c.image} size={18} />
                                <span className="font-semibold">{c.ticker.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 mb-3 text-sm">
                    <FilterPill active={filter === 'all'}    onClick={() => setFilter('all')}    label={t('selector.tab_all')} />
                    <FilterPill active={filter === 'stable'} onClick={() => setFilter('stable')} label={t('selector.tab_stable')} />
                    <div className="ml-auto self-center text-[11px] text-muted-3 tabular-nums">
                        {matched.length.toLocaleString()} {matched.length === 1 ? 'asset' : 'assets'}
                    </div>
                </div>

                <ul
                    ref={scrollRef}
                    role="listbox"
                    className="max-h-[55vh] overflow-y-auto -mx-2 pr-1 scroll-smooth"
                >
                    {matched.length === 0 && (
                        <li className="text-center text-muted-3 py-10 text-sm">{t('selector.empty')}</li>
                    )}

                    {visible.map((c) => {
                        const isSelected = selected?.ticker === c.ticker && selected?.network === c.network;
                        return (
                            <li key={`${c.ticker}-${c.network ?? ''}`}>
                                <button
                                    type="button"
                                    onClick={() => { onSelect(c); onClose(); }}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition',
                                        'hover:bg-[color:var(--surface-card-2)]',
                                        isSelected && 'bg-[color:var(--surface-card-2)]',
                                    )}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    <CoinIcon ticker={c.ticker} image={c.image} size={32} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-[color:var(--text-1)]">{c.ticker.toUpperCase()}</span>
                                            {c.network && (
                                                <span className="chain-chip chain-chip-default">{c.network.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-3 truncate">{c.name}</div>
                                    </div>
                                    {isSelected && <Check className="text-[color:var(--color-brand-300)]" width={18} height={18} />}
                                </button>
                            </li>
                        );
                    })}

                    {hasMore && (
                        <>
                            <li ref={sentinelRef} aria-hidden className="h-1" />
                            <li className="flex items-center justify-center gap-2 py-4 text-xs text-muted-3" aria-hidden>
                                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
                                <span>{t('selector_extra.loading_more')}</span>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </Modal>
    );
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'px-3 py-1.5 rounded-full text-sm transition',
                active
                    ? 'bg-[color:var(--surface-card-2)] text-[color:var(--text-1)] ring-1 ring-line-2'
                    : 'text-muted-3 hover:text-[color:var(--text-1)]',
            )}
        >
            {label}
        </button>
    );
}
