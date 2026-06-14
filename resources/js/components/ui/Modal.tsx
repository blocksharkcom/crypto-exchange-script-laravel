import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { X } from './Icons';

interface Props {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    backHandler?: () => void;
    backLabel?: string;
}

export function Modal({ open, onClose, title, children, size = 'md', backHandler, backLabel }: Props) {
    const t = useT();
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.documentElement.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden
            />
            <div
                ref={panelRef}
                className={cn(
                    'relative w-full surface-card rounded-t-3xl sm:rounded-3xl',
                    'shadow-2xl border border-line-1',
                    'max-h-[92vh] flex flex-col overflow-hidden',
                    size === 'sm' && 'sm:max-w-md',
                    size === 'md' && 'sm:max-w-lg',
                    size === 'lg' && 'sm:max-w-2xl',
                )}
            >
                {(title || backHandler) && (
                    <header className="flex items-center justify-between px-5 py-4 border-b border-line-1">
                        {backHandler ? (
                            <button
                                type="button"
                                onClick={backHandler}
                                className="text-muted-3 hover:text-[color:var(--text-1)] transition"
                                aria-label={backLabel ?? t('aria.back')}
                            >
                                <X />
                            </button>
                        ) : <span aria-hidden className="w-5" />}
                        <h3 className="font-semibold text-[color:var(--text-1)]">{title}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-muted-3 hover:text-[color:var(--text-1)] transition"
                            aria-label={t('aria.close')}
                        >
                            <X />
                        </button>
                    </header>
                )}
                <div className="overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
