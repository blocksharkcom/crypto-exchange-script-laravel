import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { CurrencySelector } from './CurrencySelector';
import { ArrowRight, ArrowUpDown, ChevronDown, ChevronLeft } from '@/components/ui/Icons';
import { api } from '@/lib/api';
import { cn, debounce, formatAmount } from '@/lib/utils';
import type { Currency, EstimateResponse, SharedProps } from '@/Types';

type Step = 1 | 2 | 3;
type Expiry = '24h' | '7d' | '30d' | 'never';

interface Props {
    currencies: Currency[];
    from: Currency | null;
    to: Currency | null;
    amount: string;
    onChangeFrom: (c: Currency | null) => void;
    onChangeTo: (c: Currency | null) => void;
    onChangeAmount: (s: string) => void;
    tabsSlot: React.ReactNode;
}

const STEPS = 3;

export function LimitCard({
    currencies, from, to, amount,
    onChangeFrom, onChangeTo, onChangeAmount, tabsSlot,
}: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const isAuthed = props.auth.user !== null;

    const [step, setStep] = useState<Step>(1);
    const [picker, setPicker] = useState<null | 'from' | 'to'>(null);

    const [targetRate, setTargetRate] = useState<string>('');
    const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
    const [estimateLoading, setEstimateLoading] = useState<boolean>(false);
    const [estimateError, setEstimateError] = useState<string | null>(null);
    // Market rate decoupled from `estimate` so the slider works before the
    // user has typed an amount. Fetched with amount=1 whenever the pair changes.
    const [marketRate, setMarketRate] = useState<number | null>(null);

    const [address, setAddress] = useState<string>('');
    const [refundAddress, setRefundAddress] = useState<string>('');
    const [extraId, setExtraId] = useState<string>('');
    const [expiration, setExpiration] = useState<Expiry>('7d');

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const seq = useRef(0);

    const liveRate = useMemo<number | null>(() => {
        if (estimate && estimate.amount_send > 0) {
            return estimate.amount_receive / estimate.amount_send;
        }
        return marketRate;
    }, [estimate, marketRate]);

    // Whenever pair/amount changes, keep a fresh estimate for the live rate display.
    const fetchEstimate = useCallback(async (f: Currency, t2: Currency, a: string) => {
        const amt = parseFloat(a);
        if (!Number.isFinite(amt) || amt <= 0) {
            setEstimate(null);
            setEstimateError(null);
            return;
        }
        const tag = ++seq.current;
        setEstimateLoading(true);
        setEstimateError(null);
        try {
            const est = await api.estimate({
                from: f.ticker, to: t2.ticker,
                amount: amt,
                from_network: f.network ?? undefined,
                to_network:   t2.network ?? undefined,
            });
            if (seq.current !== tag) return;
            setEstimate(est);
        } catch (e) {
            if (seq.current !== tag) return;
            setEstimate(null);
            setEstimateError(e instanceof Error ? e.message : 'Error');
        } finally {
            if (seq.current === tag) setEstimateLoading(false);
        }
    }, []);

    const debounced = useMemo(() => debounce(fetchEstimate, 350), [fetchEstimate]);

    useEffect(() => {
        if (from && to) debounced(from, to, amount);
    }, [from, to, amount, debounced]);

    // Whenever the pair changes, fetch a market rate using amount=1 so the
    // slider has an anchor even before the user enters an amount.
    useEffect(() => {
        if (!from || !to || from.ticker === to.ticker) {
            setMarketRate(null);
            return;
        }
        let cancelled = false;
        setMarketRate(null);
        api.estimate({
            from: from.ticker, to: to.ticker, amount: 1,
            from_network: from.network ?? undefined,
            to_network:   to.network ?? undefined,
        }).then((est) => {
            if (cancelled) return;
            if (est.amount_send > 0) setMarketRate(est.amount_receive / est.amount_send);
        }).catch(() => undefined);
        return () => { cancelled = true; };
    }, [from, to]);

    const swap = useCallback(() => {
        onChangeFrom(to);
        onChangeTo(from);
    }, [from, to, onChangeFrom, onChangeTo]);

    async function submit(): Promise<void> {
        if (!from || !to) return;
        const target = parseFloat(targetRate);
        if (!Number.isFinite(target) || target <= 0) {
            setCreateError(t('limit.target_rate_label', { to: '', from: '' }));
            return;
        }
        if (!address.trim()) return;
        setCreateError(null);
        setSubmitting(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
            const body = {
                from: from.ticker,
                to: to.ticker,
                amount: parseFloat(amount),
                target_rate: target,
                address: address.trim(),
                refund_address: refundAddress.trim() || undefined,
                extra_id: extraId.trim() || undefined,
                from_network: from.network ?? undefined,
                to_network:   to.network ?? undefined,
                expiration,
            };
            const res = await fetch('/api/limit-orders', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf,
                },
                body: JSON.stringify(body),
            });
            const payload = (await res.json()) as { ok: boolean; error?: string };
            if (!res.ok || !payload.ok) {
                throw new Error(payload.error ?? `HTTP ${res.status}`);
            }
            toast.success(t('limit.created'));
            window.location.href = '/account/limit-orders';
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Error');
        } finally {
            setSubmitting(false);
        }
    }

    const fromTicker = from?.ticker.toUpperCase() ?? '';
    const toTicker   = to?.ticker.toUpperCase() ?? '';

    const canNext1 = from !== null && to !== null
        && from.ticker !== to.ticker
        && parseFloat(amount) > 0
        && parseFloat(targetRate) > 0;

    const canNext2 = address.trim().length > 0;

    return (
        <section className="relative w-full max-w-[470px] mx-auto">
            <div className="card-halo" aria-hidden />

            <div className="relative surface-card rounded-[28px] shadow-[var(--shadow-card)] border border-line-1 overflow-hidden">
                {tabsSlot}

                <div className="px-6 pt-5 pb-6">
                    <StepHeader
                        step={step}
                        total={STEPS}
                        onBack={() => setStep((s) => (Math.max(1, s - 1) as Step))}
                        label={t('limit.title')}
                    />
                    <ProgressBar step={step} total={STEPS} />

                    {step === 1 && (
                        <div>
                            <AmountRow
                                label={t('amount.you_send')}
                                currency={from}
                                onPickCurrency={() => setPicker('from')}
                            >
                                <input
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => onChangeAmount(e.target.value)}
                                    className="bg-transparent text-right text-[26px] leading-none font-semibold outline-none w-full text-[color:var(--text-1)] tabular-nums"
                                    spellCheck={false}
                                    autoComplete="off"
                                />
                            </AmountRow>

                            <div className="flex justify-center -my-3.5 relative z-10">
                                <button
                                    type="button"
                                    onClick={swap}
                                    aria-label={t('amount.swap')}
                                    className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--surface-card)] border border-line-2 text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3 transition shadow-lg"
                                >
                                    <ArrowUpDown width={16} height={16} />
                                </button>
                            </div>

                            <AmountRow
                                label={t('amount.you_get')}
                                currency={to}
                                onPickCurrency={() => setPicker('to')}
                            >
                                <div className="text-right text-[26px] leading-none font-semibold text-[color:var(--text-1)] tabular-nums whitespace-nowrap overflow-hidden">
                                    {estimateLoading ? (
                                        <span className="text-muted-3 text-base">{t('amount.fetching')}</span>
                                    ) : estimate ? (
                                        <>
                                            <span className="text-muted-3 text-lg mr-1.5">~</span>
                                            {formatAmount(estimate.amount_receive)}
                                        </>
                                    ) : (
                                        <span className="text-muted-3">0</span>
                                    )}
                                </div>
                            </AmountRow>

                            {liveRate !== null && (
                                <p className="mt-3 text-xs text-muted-3">
                                    {t('limit.current_rate', {
                                        from: fromTicker,
                                        rate: formatAmount(liveRate, 8),
                                        to: toTicker,
                                    })}
                                </p>
                            )}
                            {estimateError && <p className="mt-3 text-xs text-[color:var(--warn)]">{estimateError}</p>}

                            <RateSlider
                                liveRate={liveRate}
                                value={targetRate}
                                onChange={setTargetRate}
                                fromTicker={fromTicker}
                                toTicker={toTicker}
                            />

                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!canNext1}
                                className="cta mt-5"
                            >
                                <span>{t('btn.next')}</span>
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="space-y-3">
                                <div className="field">
                                    <span className="field-chip">{toTicker}</span>
                                    <label className="field-label" htmlFor="lo-dest">
                                        {t('address.destination_label', { ticker: toTicker })}
                                    </label>
                                    <input
                                        id="lo-dest"
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {to?.has_extra && (
                                    <div className="field">
                                        <span className="field-chip">{toTicker}</span>
                                        <label className="field-label" htmlFor="lo-extra">
                                            {t('address.extra_label', { ticker: toTicker })}
                                        </label>
                                        <input
                                            id="lo-extra"
                                            autoComplete="off"
                                            spellCheck={false}
                                            value={extraId}
                                            onChange={(e) => setExtraId(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="field">
                                    <span className="field-chip">{fromTicker}</span>
                                    <label className="field-label" htmlFor="lo-refund">
                                        {t('address.refund_label', { ticker: fromTicker })}
                                    </label>
                                    <input
                                        id="lo-refund"
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={refundAddress}
                                        onChange={(e) => setRefundAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            <fieldset className="mt-5">
                                <legend className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                    {t('limit.expiration_label')}
                                </legend>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {(['24h', '7d', '30d', 'never'] as Expiry[]).map((e) => (
                                        <label
                                            key={e}
                                            className={cn(
                                                'cursor-pointer rounded-xl border px-3 py-2 text-center text-sm transition',
                                                expiration === e
                                                    ? 'surface-card-2 border-line-3 text-[color:var(--text-1)] font-semibold ring-1 ring-line-2'
                                                    : 'border-line-1 text-muted-2 hover:text-[color:var(--text-1)]',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="lo-expiration"
                                                className="sr-only"
                                                checked={expiration === e}
                                                onChange={() => setExpiration(e)}
                                            />
                                            {t(`limit.expirations.${e}`)}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                disabled={!canNext2}
                                className="cta mt-5"
                            >
                                <span>{t('btn.next')}</span>
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="rounded-2xl surface-input border border-line-1 p-4 space-y-2.5 text-sm">
                                <SummaryRow label={t('limit.summary_target', { from: fromTicker, target: targetRate || '—', to: toTicker })} />
                                <SummaryRow label={t('limit.summary_amount', { amount, from: fromTicker })} />
                                <SummaryRow label={t('limit.expiration_label')} value={t(`limit.expirations.${expiration}`)} />
                            </div>

                            {!isAuthed ? (
                                <div className="mt-5 rounded-2xl surface-card-2 border border-line-2 p-4 text-sm">
                                    <p className="text-muted-2">{t('limit.requires_account')}</p>
                                    <Link href="/sign-in?return=/" className="cta mt-3">
                                        <span>{t('limit.account_cta')}</span>
                                        <ArrowRight />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {createError && <p className="mt-3 text-sm text-[color:var(--warn)]">{createError}</p>}
                                    <button
                                        type="button"
                                        onClick={() => void submit()}
                                        disabled={submitting}
                                        className="cta mt-5"
                                    >
                                        {submitting ? <span className="spinner" /> : (
                                            <>
                                                <span>{t('limit.place_order')}</span>
                                                <ArrowRight />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CurrencySelector
                open={picker !== null}
                onClose={() => setPicker(null)}
                currencies={currencies}
                selected={picker === 'from' ? from : to}
                onSelect={(c) => {
                    if (picker === 'from') onChangeFrom(c);
                    if (picker === 'to')   onChangeTo(c);
                }}
            />
        </section>
    );
}

/**
 * Slider-based target-rate picker.
 * Range: -50% … +200% of the current live rate, default snap at +5%.
 * When `liveRate` is null we fall back to a plain numeric input.
 */
function RateSlider({
    liveRate, value, onChange, fromTicker, toTicker,
}: {
    liveRate: number | null;
    value: string;
    onChange: (v: string) => void;
    fromTicker: string;
    toTicker: string;
}) {
    const t = useT();

    // Compute current pct relative to liveRate
    const numericValue = parseFloat(value);
    const currentPct = (() => {
        if (!liveRate || !Number.isFinite(numericValue)) return 5;
        return Math.round(((numericValue / liveRate) - 1) * 100);
    })();

    const pctToRate = (pct: number): number => {
        if (!liveRate) return 0;
        return liveRate * (1 + pct / 100);
    };

    function setPct(pct: number) {
        if (!liveRate) return;
        const next = pctToRate(pct);
        const decimals = next >= 1 ? 4 : 8;
        onChange(next.toFixed(decimals));
    }

    if (liveRate === null || liveRate === 0) {
        // No live rate yet — show plain input
        return (
            <div className="field mt-4">
                <span className="field-chip">{toTicker || '—'}</span>
                <label className="field-label" htmlFor="target-rate-manual">
                    {t('limit.target_rate_label', { from: fromTicker, to: toTicker })}
                </label>
                <input
                    id="target-rate-manual"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        );
    }

    const min = -50;
    const max = 200;
    const clamped = Math.max(min, Math.min(max, currentPct));
    const trackPct = ((clamped - min) / (max - min)) * 100;

    // Compute marker position for the live rate (always at 0%)
    const livePct = ((0 - min) / (max - min)) * 100;

    const direction = clamped > 0 ? 'up' : clamped < 0 ? 'down' : 'flat';
    const directionColor =
        direction === 'up'   ? 'text-[color:var(--color-brand-300)]' :
        direction === 'down' ? 'text-[color:var(--warn)]' :
        'text-muted-3';

    return (
        <div className="mt-4 surface-input border border-line-1 rounded-2xl p-4">
            <div className="flex items-baseline justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-3 font-semibold">
                        {t('limit.target_rate_label', { from: fromTicker, to: toTicker })}
                    </div>
                    <div className="mt-1 text-xl font-bold text-[color:var(--text-1)] tabular-nums truncate">
                        {value && parseFloat(value) > 0 ? value : '—'}
                        <span className="text-muted-3 text-sm font-medium ml-1">{toTicker}</span>
                    </div>
                </div>
                <div className={cn('text-sm font-bold tabular-nums', directionColor)}>
                    {clamped > 0 ? '+' : ''}{clamped}%
                </div>
            </div>

            {/* Slider */}
            <div className="relative h-9 select-none">
                {/* Track */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[color:var(--surface-card-2)] border border-line-1" />
                {/* Filled portion from live (0%) up to current */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-[color:var(--color-brand-300)]"
                    style={{
                        left:  `${Math.min(livePct, trackPct)}%`,
                        width: `${Math.abs(trackPct - livePct)}%`,
                        opacity: 0.6,
                    }}
                />
                {/* Live rate marker */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-3 bg-[color:var(--color-progress)] rounded-full"
                    style={{ left: `${livePct}%` }}
                    aria-hidden
                />

                <input
                    type="range"
                    min={min} max={max} step={1}
                    value={clamped}
                    onChange={(e) => setPct(parseInt(e.target.value, 10))}
                    aria-label={t('limit.target_rate_label', { from: fromTicker, to: toTicker })}
                    className="absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-line-3
                        [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.18)]
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-line-3"
                />
            </div>

            {/* Quick chips */}
            <div className="mt-2 grid grid-cols-5 gap-1.5">
                {[-10, -5, 0, 10, 25].map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => setPct(p)}
                        className={cn(
                            'px-2 py-1 rounded-md text-[11px] font-semibold tabular-nums border transition',
                            clamped === p
                                ? 'bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] border-transparent'
                                : 'text-muted-2 hover:text-[color:var(--text-1)] border-line-2 hover:border-line-3',
                        )}
                    >
                        {p === 0 ? t('limit.quick_market') : p > 0 ? `+${p}%` : `${p}%`}
                    </button>
                ))}
            </div>

            <p className="mt-2.5 text-[11px] text-muted-3">
                {t('limit.current_rate', {
                    from: fromTicker,
                    rate: formatAmount(liveRate, 6),
                    to: toTicker,
                })}
            </p>
        </div>
    );
}

function StepHeader({ step, total, onBack, label }: { step: number; total: number; onBack: () => void; label: string }) {
    const t = useT();
    return (
        <div className="flex items-center justify-between mt-5 mb-4">
            <div className="flex items-center gap-3">
                {step > 1 && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-muted-3 hover:text-[color:var(--text-1)] transition"
                        aria-label={t('aria.back')}
                    >
                        <ChevronLeft width={20} height={20} />
                    </button>
                )}
                <h2 className="text-[17px] font-semibold tracking-tight">
                    <span className="text-[color:var(--color-progress)] mr-1.5">{step}/{total}</span>
                    <span className="text-[color:var(--text-1)]">{label}</span>
                </h2>
            </div>
        </div>
    );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
    return (
        <div className="flex gap-1.5 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <span
                    key={i}
                    className={cn(
                        'h-[3px] flex-1 rounded-full transition-colors duration-300',
                        i < step ? 'bg-[color:var(--color-progress)]' : 'bg-[color:var(--color-progress-track)]',
                    )}
                />
            ))}
        </div>
    );
}

function AmountRow({ label, currency, onPickCurrency, children }: {
    label: string;
    currency: Currency | null;
    onPickCurrency: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="surface-input rounded-2xl px-4 py-4 border border-line-1">
            <div className="text-[11px] text-muted-3 uppercase tracking-[0.08em] font-medium">{label}</div>
            <div className="flex items-center gap-3 mt-1.5">
                <button type="button" onClick={onPickCurrency} className="currency-pill min-w-[7rem]">
                    {currency && <CoinIcon ticker={currency.ticker} image={currency.image} size={30} />}
                    <span className="flex flex-col items-start leading-tight">
                        <span className="flex items-center gap-1 text-[17px] font-bold tracking-tight">
                            {currency?.ticker.toUpperCase() ?? '—'}
                            <ChevronDown width={14} height={14} className="text-muted-3" />
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-normal text-muted-3 max-w-[10rem]">
                            <span className="truncate">{currency?.name}</span>
                        </span>
                    </span>
                </button>
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
    if (value === undefined) {
        return <div className="text-muted-2">{label}</div>;
    }
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-3 text-xs uppercase tracking-wider">{label}</span>
            <span className="text-[color:var(--text-1)] font-semibold">{value}</span>
        </div>
    );
}
