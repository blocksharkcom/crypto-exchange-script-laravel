import { useCallback, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { CurrencySelector } from './CurrencySelector';
import { ArrowRight, ArrowUpDown, ChevronDown, ChevronLeft } from '@/components/ui/Icons';
import { cn } from '@/lib/utils';
import type { Currency, SharedProps } from '@/Types';

type Step = 1 | 2 | 3;
type Frequency = 'daily' | 'weekly' | 'monthly';
type EndCondition = 'never' | 'until_date' | 'after_runs';

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

export function RecurringCard({
    currencies, from, to, amount,
    onChangeFrom, onChangeTo, onChangeAmount, tabsSlot,
}: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const isAuthed = props.auth.user !== null;

    const [step, setStep] = useState<Step>(1);
    const [picker, setPicker] = useState<null | 'from' | 'to'>(null);

    const [frequency, setFrequency] = useState<Frequency>('weekly');
    const [startNow, setStartNow] = useState<boolean>(true);
    const [startAt, setStartAt] = useState<string>(toLocalIsoMinute(new Date()));

    const [address, setAddress] = useState<string>('');
    const [refundAddress, setRefundAddress] = useState<string>('');
    const [extraId, setExtraId] = useState<string>('');

    const [endCondition, setEndCondition] = useState<EndCondition>('never');
    const [endAt, setEndAt] = useState<string>('');
    const [maxRuns, setMaxRuns] = useState<string>('12');

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const swap = useCallback(() => {
        onChangeFrom(to);
        onChangeTo(from);
    }, [from, to, onChangeFrom, onChangeTo]);

    async function submit(): Promise<void> {
        if (!from || !to) return;
        setCreateError(null);
        setSubmitting(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
            const body: Record<string, unknown> = {
                from: from.ticker,
                to: to.ticker,
                amount: parseFloat(amount),
                address: address.trim(),
                refund_address: refundAddress.trim() || undefined,
                extra_id: extraId.trim() || undefined,
                from_network: from.network ?? undefined,
                to_network:   to.network ?? undefined,
                frequency,
                start_at: startNow ? undefined : new Date(startAt).toISOString(),
                end_condition: endCondition,
            };
            if (endCondition === 'until_date') body.end_at = new Date(endAt).toISOString();
            if (endCondition === 'after_runs') body.max_runs = parseInt(maxRuns, 10);

            const res = await fetch('/api/recurring', {
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
            toast.success(t('recurring.created'));
            window.location.href = '/account/recurring';
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Error');
        } finally {
            setSubmitting(false);
        }
    }

    const fromTicker = from?.ticker.toUpperCase() ?? '';
    const toTicker   = to?.ticker.toUpperCase() ?? '';

    const canNext1 = from !== null && to !== null && from.ticker !== to.ticker && parseFloat(amount) > 0;
    const canNext2 = address.trim().length > 0
        && (endCondition !== 'until_date' || endAt !== '')
        && (endCondition !== 'after_runs' || parseInt(maxRuns, 10) > 0);

    const summaryEnd = (() => {
        if (endCondition === 'never') return t('recurring.summary_forever');
        if (endCondition === 'until_date') return t('recurring.summary_until', { date: endAt || '—' });
        return t('recurring.summary_after', { runs: maxRuns });
    })();

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
                        label={t('recurring.title')}
                    />
                    <ProgressBar step={step} total={STEPS} />

                    {step === 1 && (
                        <div>
                            <AmountRow
                                label={t('recurring.amount_label')}
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
                                <div className="text-right text-muted-3 text-sm">
                                    {t('amount.fetching')}
                                </div>
                            </AmountRow>

                            <fieldset className="mt-5">
                                <legend className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                    {t('recurring.frequency_label')}
                                </legend>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                                        <label
                                            key={f}
                                            className={cn(
                                                'cursor-pointer rounded-xl border px-3 py-2 text-center text-sm transition',
                                                frequency === f
                                                    ? 'surface-card-2 border-line-3 text-[color:var(--text-1)] font-semibold ring-1 ring-line-2'
                                                    : 'border-line-1 text-muted-2 hover:text-[color:var(--text-1)]',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="rec-frequency"
                                                className="sr-only"
                                                checked={frequency === f}
                                                onChange={() => setFrequency(f)}
                                            />
                                            {t(`recurring.frequencies.${f}`)}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="mt-4">
                                <legend className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                    {t('recurring.start_label')}
                                </legend>
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={startNow}
                                            onChange={(e) => setStartNow(e.target.checked)}
                                            className="accent-[color:var(--color-progress)]"
                                        />
                                        <span className="text-muted-2">{t('recurring.start_now')}</span>
                                    </label>
                                    {!startNow && (
                                        <input
                                            type="datetime-local"
                                            value={startAt}
                                            onChange={(e) => setStartAt(e.target.value)}
                                            className="surface-input border border-line-1 rounded-lg px-2 py-1.5 text-sm"
                                        />
                                    )}
                                </div>
                            </fieldset>

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
                                    <label className="field-label" htmlFor="rec-dest">
                                        {t('address.destination_label', { ticker: toTicker })}
                                    </label>
                                    <input
                                        id="rec-dest"
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                {to?.has_extra && (
                                    <div className="field">
                                        <span className="field-chip">{toTicker}</span>
                                        <label className="field-label" htmlFor="rec-extra">
                                            {t('address.extra_label', { ticker: toTicker })}
                                        </label>
                                        <input
                                            id="rec-extra"
                                            autoComplete="off"
                                            spellCheck={false}
                                            value={extraId}
                                            onChange={(e) => setExtraId(e.target.value)}
                                        />
                                    </div>
                                )}

                                <div className="field">
                                    <span className="field-chip">{fromTicker}</span>
                                    <label className="field-label" htmlFor="rec-refund">
                                        {t('address.refund_label', { ticker: fromTicker })}
                                    </label>
                                    <input
                                        id="rec-refund"
                                        autoComplete="off"
                                        spellCheck={false}
                                        value={refundAddress}
                                        onChange={(e) => setRefundAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            <fieldset className="mt-5">
                                <legend className="text-xs uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                    {t('recurring.end_label')}
                                </legend>
                                <div className="space-y-2">
                                    {(['never', 'until_date', 'after_runs'] as EndCondition[]).map((e) => {
                                        const labelKey = e === 'never' ? 'never' : e === 'until_date' ? 'until' : 'after';
                                        return (
                                            <label key={e} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="rec-end"
                                                    checked={endCondition === e}
                                                    onChange={() => setEndCondition(e)}
                                                    className="accent-[color:var(--color-progress)]"
                                                />
                                                <span className={cn(
                                                    'text-sm',
                                                    endCondition === e ? 'text-[color:var(--text-1)] font-semibold' : 'text-muted-2',
                                                )}>
                                                    {t(`recurring.end.${labelKey}`)}
                                                </span>
                                                {endCondition === 'until_date' && e === 'until_date' && (
                                                    <input
                                                        type="date"
                                                        value={endAt}
                                                        onChange={(ev) => setEndAt(ev.target.value)}
                                                        className="ml-auto surface-input border border-line-1 rounded-lg px-2 py-1 text-sm"
                                                    />
                                                )}
                                                {endCondition === 'after_runs' && e === 'after_runs' && (
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={9999}
                                                        value={maxRuns}
                                                        onChange={(ev) => setMaxRuns(ev.target.value)}
                                                        className="ml-auto surface-input border border-line-1 rounded-lg px-2 py-1 text-sm w-20"
                                                    />
                                                )}
                                            </label>
                                        );
                                    })}
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
                                <SummaryRow
                                    label={t('recurring.summary_freq', {
                                        frequency: t(`recurring.frequencies.${frequency}`),
                                        amount,
                                        from: fromTicker,
                                    })}
                                />
                                <SummaryRow label={summaryEnd} />
                            </div>

                            {!isAuthed ? (
                                <div className="mt-5 rounded-2xl surface-card-2 border border-line-2 p-4 text-sm">
                                    <p className="text-muted-2">{t('recurring.requires_account')}</p>
                                    <Link href="/sign-in?return=/" className="cta mt-3">
                                        <span>{t('recurring.account_cta')}</span>
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
                                                <span>{t('recurring.confirm')}</span>
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

function toLocalIsoMinute(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

function SummaryRow({ label }: { label: string }) {
    return <div className="text-muted-2">{label}</div>;
}
