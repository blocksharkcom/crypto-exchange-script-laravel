import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X } from '@/components/ui/Icons';

interface Slide { src: string; title: string; caption?: string; }

interface Props {
    open: boolean;
    onClose: () => void;
    slides: Slide[];
    index: number;
    onIndexChange: (i: number) => void;
}

export function Lightbox({ open, onClose, slides, index, onIndexChange }: Props) {
    const total = slides.length;
    const goPrev = useCallback(() => onIndexChange((index - 1 + total) % total), [index, total, onIndexChange]);
    const goNext = useCallback(() => onIndexChange((index + 1) % total), [index, total, onIndexChange]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft')  goPrev();
            else if (e.key === 'ArrowRight') goNext();
        };
        document.addEventListener('keydown', onKey);
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = '';
        };
    }, [open, onClose, goPrev, goNext]);

    if (!open) return null;
    const slide = slides[index];
    if (!slide) return null;
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={slide.title}
            className="fixed inset-0 z-[9999] flex flex-col bg-[rgba(8,9,12,0.94)] backdrop-blur-md"
        >
            <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10">
                <div className="text-white/85 font-semibold text-sm sm:text-base truncate">
                    {slide.title}
                    <span className="text-white/40 font-normal ml-3 text-xs">{index + 1} / {total}</span>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="w-10 h-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-white/85 transition"
                >
                    <X />
                </button>
            </header>

            <div className="flex-1 grid place-items-center relative px-4 sm:px-12 py-4 sm:py-6 overflow-auto">
                <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous"
                    className="hidden sm:grid place-items-center absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/85 transition"
                >
                    <ChevronLeft />
                </button>

                <img
                    src={slide.src}
                    alt={slide.title}
                    className="max-w-full max-h-full rounded-xl shadow-2xl object-contain ring-1 ring-white/10"
                    draggable={false}
                />

                <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next"
                    className="hidden sm:grid place-items-center absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white/85 transition"
                >
                    <ChevronRight />
                </button>
            </div>

            {slide.caption && (
                <footer className="px-4 sm:px-6 py-3 border-t border-white/10 text-center text-sm text-white/65">
                    {slide.caption}
                </footer>
            )}

            <nav className="border-t border-white/10 px-3 py-2 flex gap-2 overflow-x-auto">
                {slides.map((s, i) => (
                    <button
                        key={s.src}
                        type="button"
                        onClick={() => onIndexChange(i)}
                        className={cn(
                            'shrink-0 rounded-md overflow-hidden border transition',
                            i === index ? 'border-[color:var(--color-brand-300)]' : 'border-white/10 opacity-60 hover:opacity-100',
                        )}
                        aria-label={`Show ${s.title}`}
                    >
                        <img src={s.src} alt="" className="h-12 w-auto block" />
                    </button>
                ))}
            </nav>
        </div>,
        document.body,
    );
}
