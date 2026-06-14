import { useEffect, useMemo, useRef, useState } from 'react';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { Search, X } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import { api } from '@/lib/api';
import type { Currency } from '@/Types';

// ─── Logo uploader ─────────────────────────────────────────────────────

interface LogoUploaderProps {
    value: string;
    onChange: (url: string) => void;
    brand: string;
    label: string;
    hint?: string;
}

export function LogoUploader({ value, onChange, brand, label, hint }: LogoUploaderProps) {
    const t = useT();
    const inputRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<'upload' | 'clear' | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function onPick(file: File) {
        setError(null);
        setBusy('upload');
        try {
            const fd = new FormData();
            fd.append('logo', file);
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
            const res = await fetch('/admin/settings/logo', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
                body: fd,
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || json.message || 'Upload failed');
            onChange(json.data.url);
        } catch (e) {
            setError(e instanceof Error ? e.message : t('admin.settings.logo_error'));
        } finally {
            setBusy(null);
        }
    }

    async function onClear() {
        setError(null);
        setBusy('clear');
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
            const res = await fetch('/admin/settings/logo', {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: { 'X-CSRF-TOKEN': csrf, Accept: 'application/json' },
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || 'Clear failed');
            onChange('');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
        } finally {
            setBusy(null);
        }
    }

    return (
        <div>
            <div className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">{label}</div>
            <div className="flex items-center gap-4 surface-card-2 rounded-2xl border border-line-1 p-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-line-1 grid place-items-center overflow-hidden shrink-0">
                    {value ? (
                        <img src={value} alt={brand} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <span aria-hidden className="text-muted-3 text-[10px] uppercase tracking-wider font-bold">{t('admin.settings.no_logo')}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm text-[color:var(--text-1)] font-semibold truncate">{brand}</div>
                    <div className="text-xs text-muted-3">{hint ?? t('admin.settings.logo_hint')}</div>
                    {error && <div className="mt-1 text-xs text-[color:var(--warn)]">{error}</div>}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy !== null}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] hover:bg-[color:var(--color-brand-200)] disabled:opacity-50"
                    >
                        {busy === 'upload' ? <span className="spinner" /> : (value ? t('admin.settings.logo_replace') : t('admin.settings.logo_upload'))}
                    </button>
                    {value && (
                        <button
                            type="button"
                            onClick={onClear}
                            disabled={busy !== null}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] disabled:opacity-50"
                        >
                            {busy === 'clear' ? <span className="spinner" /> : t('admin.settings.logo_clear')}
                        </button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onPick(f);
                        e.target.value = '';
                    }}
                />
            </div>
        </div>
    );
}

// ─── Currency picker (rich, used by featured + blacklist) ──────────────

interface CurrencyPickerProps {
    /** Comma-separated string of tickers, kept this shape for compatibility with existing form state. */
    value: string;
    onChange: (csv: string) => void;
    label: string;
    hint?: string;
    /** Visible badge colour for selected coins — lime for "include", indigo for "exclude". */
    tone?: 'lime' | 'indigo';
}

export function CurrencyPicker({ value, onChange, label, hint, tone = 'lime' }: CurrencyPickerProps) {
    const t = useT();
    const [open, setOpen] = useState(false);
    const [coins, setCoins] = useState<Currency[]>([]);
    const [search, setSearch] = useState('');
    const wrapRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(
        () => value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
        [value],
    );

    // Lazy-load currency list on first open.
    useEffect(() => {
        if (!open || coins.length > 0) return;
        let alive = true;
        api.currencies()
            .then((rows) => { if (alive) setCoins(rows); })
            .catch(() => { /* show empty list */ });
        return () => { alive = false; };
    }, [open, coins.length]);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', onDown);
        return () => window.removeEventListener('mousedown', onDown);
    }, [open]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return coins.slice(0, 50);
        return coins.filter((c) =>
            c.ticker.includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.network ?? '').toLowerCase().includes(q),
        ).slice(0, 50);
    }, [coins, search]);

    function toggle(ticker: string) {
        const t = ticker.toLowerCase();
        const next = selected.includes(t)
            ? selected.filter((s) => s !== t)
            : [...selected, t];
        onChange(next.join(','));
    }

    function removeOne(ticker: string) {
        onChange(selected.filter((s) => s !== ticker.toLowerCase()).join(','));
    }

    const chipCls = tone === 'lime'
        ? 'bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)]'
        : 'bg-[color:var(--color-progress)] text-white';

    return (
        <div ref={wrapRef} className="relative">
            <div className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">{label}</div>
            <div
                className="surface-card-2 border border-line-1 rounded-2xl p-3 min-h-[3.5rem] cursor-text flex flex-wrap items-center gap-1.5"
                onClick={() => setOpen(true)}
            >
                {selected.length === 0 && (
                    <span className="text-sm text-muted-3 px-1">{t('admin.settings.cp_placeholder')}</span>
                )}
                {selected.map((s) => (
                    <span
                        key={s}
                        className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold uppercase', chipCls)}
                    >
                        <CoinIcon ticker={s} size={14} />
                        <span>{s}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeOne(s); }}
                            aria-label={t('aria.close')}
                            className="hover:opacity-70"
                        >
                            <X width={10} height={10} />
                        </button>
                    </span>
                ))}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                    className="ml-auto text-[11px] font-semibold text-muted-3 hover:text-[color:var(--text-1)] px-2 py-1"
                >
                    {open ? t('admin.settings.cp_close') : t('admin.settings.cp_add')}
                </button>
            </div>
            {hint && <p className="mt-1.5 text-xs text-muted-3">{hint}</p>}

            {open && (
                <div className="absolute left-0 right-0 mt-2 surface-card rounded-2xl border border-line-2 shadow-2xl z-30 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-line-1 flex items-center gap-2">
                        <Search className="text-muted-3" width={14} height={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('admin.settings.cp_search')}
                            autoFocus
                            className="flex-1 bg-transparent border-0 outline-none text-sm text-[color:var(--text-1)] placeholder:text-muted-3"
                        />
                    </div>
                    <ul className="max-h-72 overflow-y-auto">
                        {coins.length === 0 && (
                            <li className="px-4 py-6 text-center text-xs text-muted-3">
                                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> {t('admin.settings.cp_loading')}
                            </li>
                        )}
                        {filtered.map((c) => {
                            const isOn = selected.includes(c.ticker.toLowerCase());
                            return (
                                <li key={`${c.ticker}-${c.network ?? ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(c.ticker)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition',
                                            isOn ? 'bg-[color:var(--surface-card-2)]' : 'hover:bg-[color:var(--surface-card-2)]',
                                        )}
                                    >
                                        <CoinIcon ticker={c.ticker} image={c.image} size={22} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold uppercase text-xs">{c.ticker}</span>
                                                {c.network && (
                                                    <span className="chain-chip chain-chip-default text-[9px]">{c.network.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-muted-3 truncate">{c.name}</div>
                                        </div>
                                        <span className={cn(
                                            'w-4 h-4 rounded border-2 flex items-center justify-center',
                                            isOn
                                                ? 'bg-[color:var(--color-brand-300)] border-[color:var(--color-brand-300)]'
                                                : 'border-line-3',
                                        )}>
                                            {isOn && (
                                                <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="#0a0a0c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                                    <path d="M3 7l3 3 5-6" />
                                                </svg>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
