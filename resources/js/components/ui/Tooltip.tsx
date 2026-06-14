import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    content: ReactNode;
    children: ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** Open on click instead of hover. Useful for touch-first contexts. */
    triggerMode?: 'hover' | 'click';
    align?: 'start' | 'center' | 'end';
    /** Tailwind width class (default 14rem). */
    widthClass?: string;
    className?: string;
}

/**
 * Accessible Tooltip / Popover.
 * - Pointer devices: open on hover + keyboard focus
 * - Touch devices: open on click (debounced) — same component works
 * - Dismiss on Esc, outside click, blur
 * - Brand-styled chrome (`surface-card`, hairline border, soft shadow)
 */
export function Tooltip({
    content, children, placement = 'top', triggerMode = 'hover',
    align = 'center', widthClass = 'w-60', className,
}: Props) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLSpanElement>(null);
    const id = useId();
    const isTouch = useRef(false);

    useEffect(() => {
        const mq = window.matchMedia('(hover: none)');
        isTouch.current = mq.matches;
        const onChange = (e: MediaQueryListEvent) => { isTouch.current = e.matches; };
        mq.addEventListener?.('change', onChange);
        return () => mq.removeEventListener?.('change', onChange);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: PointerEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const showOnHover = triggerMode === 'hover' && !isTouch.current;

    const positionCls = (() => {
        switch (placement) {
            case 'bottom': return 'top-full mt-2';
            case 'left':   return 'right-full top-1/2 -translate-y-1/2 mr-2';
            case 'right':  return 'left-full top-1/2 -translate-y-1/2 ml-2';
            default:       return 'bottom-full mb-2';
        }
    })();

    const alignCls = (() => {
        if (placement === 'left' || placement === 'right') return '';
        if (align === 'start') return 'left-0';
        if (align === 'end')   return 'right-0';
        return 'left-1/2 -translate-x-1/2';
    })();

    return (
        <span
            ref={wrapRef}
            className={cn('relative inline-flex', className)}
            onMouseEnter={() => { if (showOnHover) setOpen(true); }}
            onMouseLeave={() => { if (showOnHover) setOpen(false); }}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
                if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
            }}
        >
            <span
                onClick={(e) => {
                    if (showOnHover) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                aria-describedby={open ? id : undefined}
                className="inline-flex"
            >
                {children}
            </span>

            <span
                id={id}
                role="tooltip"
                aria-hidden={!open}
                className={cn(
                    'absolute z-50 pointer-events-none',
                    positionCls,
                    alignCls,
                    widthClass,
                    'transition-all duration-150 origin-center',
                    open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
                )}
            >
                <span className="block surface-card border border-line-2 rounded-xl px-3.5 py-2.5 text-[12.5px] leading-snug text-muted-2 shadow-2xl">
                    {content}
                </span>
            </span>
        </span>
    );
}
