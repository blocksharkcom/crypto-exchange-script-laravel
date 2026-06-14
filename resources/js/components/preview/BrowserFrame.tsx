import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    url?: string;
    tone?: 'dark' | 'light';
    className?: string;
    children: ReactNode;
}

/**
 * Faux-browser chrome that visually frames product mockups.
 * Realistic enough to read as a screenshot, lightweight enough to never block render.
 */
export function BrowserFrame({ url = 'crossswap.app', tone = 'light', children, className }: Props) {
    return (
        <div
            className={cn(
                'rounded-2xl overflow-hidden border shadow-[var(--shadow-card)]',
                tone === 'light' ? 'bg-white border-line-2' : 'bg-[#0a0c10] border-line-3',
                className,
            )}
            style={{ isolation: 'isolate' }}
        >
            <div className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 border-b',
                tone === 'light' ? 'bg-[#f3f4f8] border-line-1' : 'bg-[#16181d] border-line-1',
            )}>
                <span className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6058]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbf30]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#30c948]" />
                </span>
                <span className={cn(
                    'flex-1 truncate text-center text-[11px] font-mono',
                    tone === 'light' ? 'text-[#4a5160]' : 'text-[#a8afbd]',
                )}>
                    {url}
                </span>
                <span aria-hidden className="w-12" />
            </div>
            <div>{children}</div>
        </div>
    );
}
