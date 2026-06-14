import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { useExchangeFlow } from '@/hooks/useExchangeFlow';
import { CoinIcon } from '@/components/ui/CoinIcon';
import { CurrencySelector } from './CurrencySelector';
import { QrModal } from './QrModal';
import {
    ArrowRight, ArrowUpDown, ChevronDown, ChevronLeft, Copy, Help, Qr, Triangle,
} from '@/components/ui/Icons';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn, copyToClipboard, formatAmount, shorten } from '@/lib/utils';
import type { Currency, SharedProps } from '@/Types';
import { usePage } from '@inertiajs/react';

interface Props {
    currencies: Currency[];
    initialFrom?: string;
    initialTo?: string;
    initialAmount?: string;
    tabsSlot?: React.ReactNode;
    onPairChange?: (from: Currency | null, to: Currency | null, amount: string) => void;
}

const STEP_LABELS = ['step.1_label', 'step.2_label', 'step.3_label', 'step.4_label'] as const;

export function ExchangeCard({ currencies, initialFrom, initialTo, initialAmount, tabsSlot, onPairChange }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const { features, legal } = props;

    const flow = useExchangeFlow(currencies, {
        fromTicker:    initialFrom    ?? 'btc',
        toTicker:      initialTo      ?? 'eth',
        initialAmount: initialAmount,
    });
    const [picker, setPicker] = useState<null | 'from' | 'to'>(null);
    const [qrOpen, setQrOpen] = useState(false);

    // Bubble pair/amount changes to the parent (CardSwitcher) so a tab switch keeps state.
    useEffect(() => {
        onPairChange?.(flow.from, flow.to, flow.amount);
    }, [flow.from, flow.to, flow.amount, onPairChange]);

    return (
        <section className="relative w-full max-w-[470px] mx-auto">
            <div className="card-halo" aria-hidden />

            <div className="relative surface-card rounded-[28px] shadow-[var(--shadow-card)] border border-line-1 overflow-hidden">
                {tabsSlot ?? <Tabs />}

                <div className="px-6 pt-5 pb-6">
                    <StepHeader step={flow.step} onBack={flow.back} label={t(STEP_LABELS[flow.step - 1])} />
                    <ProgressBar step={flow.step} />

                    {flow.step === 1 && (
                        <Step1
                            flow={flow}
                            features={features}
                            openPicker={setPicker}
                        />
                    )}
                    {flow.step === 2 && (
                        <Step2
                            flow={flow}
                            features={features}
                            legal={legal}
                        />
                    )}
                    {flow.step === 3 && (
                        <Step3
                            flow={flow}
                            onShowQr={() => setQrOpen(true)}
                        />
                    )}
                    {flow.step === 4 && (
                        <Step4 flow={flow} />
                    )}
                </div>
            </div>

            <CurrencySelector
                open={picker !== null}
                onClose={() => setPicker(null)}
                currencies={currencies}
                selected={picker === 'from' ? flow.from : flow.to}
                onSelect={(c) => {
                    if (picker === 'from') flow.setFrom(c);
                    if (picker === 'to')   flow.setTo(c);
                }}
            />

            <QrModal
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                address={flow.exchange?.payin_address ?? ''}
            />
        </section>
    );
}

function Tabs() {
    const t = useT();
    return (
        <div className="grid grid-cols-3 border-b border-line-1">
            <button
                type="button"
                className="relative py-4 text-sm font-semibold text-[color:var(--text-1)]"
            >
                {t('card.tab_exchange')}
                <span className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[2px] w-9 rounded-t-full bg-[color:var(--text-1)]" />
            </button>
            <button type="button" disabled title={t('card.coming_soon')} className="py-4 text-sm font-medium text-muted-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {t('card.tab_buy')}
            </button>
            <button type="button" disabled title={t('card.coming_soon')} className="py-4 text-sm font-medium text-muted-3 disabled:opacity-50 disabled:cursor-not-allowed">
                {t('card.tab_sell')}
            </button>
        </div>
    );
}

function StepHeader({ step, onBack, label }: { step: number; onBack: () => void; label: string }) {
    const t = useT();
    return (
        <div className="flex items-center justify-between mt-5 mb-4">
            <div className="flex items-center gap-3">
                {step > 1 && step < 4 && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-muted-3 hover:text-[color:var(--text-1)] transition"
                        aria-label={t('btn.back')}
                    >
                        <ChevronLeft width={20} height={20} />
                    </button>
                )}
                <h2 className="text-[17px] font-semibold tracking-tight">
                    <span className="text-[color:var(--color-progress)] mr-1.5">{step}/4</span>
                    <span className="text-[color:var(--text-1)]">{label}</span>
                </h2>
            </div>
            <Tooltip
                content={
                    <div>
                        <div className="text-[color:var(--text-1)] font-semibold mb-1 text-[13px]">
                            {label}
                        </div>
                        <p className="text-muted-2">{t(`step.${step}_help`)}</p>
                    </div>
                }
                placement="bottom"
                align="end"
                triggerMode="click"
                widthClass="w-72"
            >
                <button
                    type="button"
                    aria-label={`Help: ${label}`}
                    className="text-muted-3 hover:text-[color:var(--text-1)] transition"
                >
                    <Help width={22} height={22} />
                </button>
            </Tooltip>
        </div>
    );
}

function ProgressBar({ step }: { step: number }) {
    return (
        <div className="flex gap-1.5 mb-6">
            {[1, 2, 3, 4].map((i) => (
                <span
                    key={i}
                    className={cn(
                        'h-[3px] flex-1 rounded-full transition-colors duration-300',
                        i <= step ? 'bg-[color:var(--color-progress)]' : 'bg-[color:var(--color-progress-track)]',
                    )}
                />
            ))}
        </div>
    );
}

type FlowReturn = ReturnType<typeof useExchangeFlow>;
interface StepProps { flow: FlowReturn; }

function Step1({ flow, features, openPicker }: StepProps & {
    features: SharedProps['features'];
    openPicker: (side: 'from' | 'to') => void;
}) {
    const t = useT();
    const tooLow = flow.minAmount !== null && parseFloat(flow.amount) > 0 && parseFloat(flow.amount) < flow.minAmount;

    return (
        <div>
            <AmountRow
                label={t('amount.you_send')}
                currency={flow.from}
                onPickCurrency={() => openPicker('from')}
            >
                <input
                    inputMode="decimal"
                    value={flow.amount}
                    onChange={(e) => flow.setAmount(e.target.value)}
                    className="bg-transparent text-right text-[26px] leading-none font-semibold outline-none w-full text-[color:var(--text-1)] tabular-nums"
                    spellCheck={false}
                    autoComplete="off"
                />
            </AmountRow>

            <div className="flex justify-center -my-3.5 relative z-10">
                <button
                    type="button"
                    onClick={flow.swap}
                    aria-label={t('amount.swap')}
                    className="grid place-items-center w-9 h-9 rounded-full bg-[color:var(--surface-card)] border border-line-2 text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3 transition shadow-lg"
                >
                    <ArrowUpDown width={16} height={16} />
                </button>
            </div>

            <AmountRow
                label={t('amount.you_get')}
                currency={flow.to}
                onPickCurrency={() => openPicker('to')}
            >
                <div className="text-right text-[26px] leading-none font-semibold text-[color:var(--text-1)] tabular-nums whitespace-nowrap overflow-hidden">
                    {flow.estimateLoading ? (
                        <span className="text-muted-3 text-base">{t('amount.fetching')}</span>
                    ) : flow.estimate ? (
                        <>
                            <span className="text-muted-3 text-lg mr-1.5">~</span>
                            {formatAmount(flow.estimate.amount_receive)}
                        </>
                    ) : (
                        <span className="text-muted-3">0</span>
                    )}
                </div>
            </AmountRow>

            <div className="mt-3 min-h-5 text-xs">
                {flow.estimateError && (
                    <p className="text-[color:var(--warn)]">{flow.estimateError}</p>
                )}
                {tooLow && flow.minAmount !== null && (
                    <p className="text-[color:var(--warn)]">
                        {t('amount.min', { amount: formatAmount(flow.minAmount), ticker: flow.from?.ticker.toUpperCase() ?? '' })}
                    </p>
                )}
            </div>

            {features.fixed_rate && (
                <label className="mt-4 inline-flex items-center gap-2.5 text-sm select-none cursor-pointer">
                    <span className={cn(
                        'relative inline-block w-10 h-[22px] rounded-full transition',
                        flow.flow === 'fixed-rate'
                            ? 'bg-[color:var(--color-brand-300)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]'
                            : 'bg-[color:var(--surface-card-2)] shadow-[inset_0_0_0_1px_var(--line-3)]',
                    )}>
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={flow.flow === 'fixed-rate'}
                            onChange={(e) => flow.setFlow(e.target.checked ? 'fixed-rate' : 'standard')}
                        />
                        <span className={cn(
                            'absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all',
                            'shadow-[0_2px_4px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.04)]',
                            flow.flow === 'fixed-rate' ? 'left-[20px]' : 'left-0.5',
                        )} />
                    </span>
                    <span className="text-muted-2">{t('rate.fixed')}</span>
                    <Tooltip
                        content={
                            <div>
                                <div className="text-[color:var(--text-1)] font-semibold mb-1 text-[13px]">
                                    {t('rate.fixed')}
                                </div>
                                <p className="text-muted-2">{t('rate.fixed_hint', { minutes: 5 })}</p>
                            </div>
                        }
                        placement="top"
                        triggerMode="click"
                    >
                        <span aria-label={t('aria.fixed_rate_help')} className="text-muted-4 hover:text-muted-2 transition inline-flex">
                            <Help width={14} height={14} />
                        </span>
                    </Tooltip>
                </label>
            )}

            {features.show_promo && flow.estimate && (
                <TradeInsights
                    fromTicker={flow.from?.ticker.toUpperCase() ?? ''}
                    toTicker={flow.to?.ticker.toUpperCase() ?? ''}
                    rate={flow.estimate.amount_send > 0
                        ? flow.estimate.amount_receive / flow.estimate.amount_send
                        : 0}
                    forecastMin={flow.estimate.transaction_speed_forecast?.minimum}
                    forecastMax={flow.estimate.transaction_speed_forecast?.maximum}
                    flow={flow.flow}
                />
            )}

            <button
                type="button"
                onClick={flow.next}
                disabled={!flow.estimate || flow.estimateLoading || tooLow}
                className="cta mt-5"
            >
                <span>{t('btn.next')}</span>
            </button>

            <div className="mt-4 text-center">
                <a
                    href="/help?tab=open#tickets"
                    className="inline-flex items-center gap-2 text-sm text-[color:var(--color-brand-300)] hover:text-[color:var(--color-brand-200)] transition"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 14.6-8.9A8.4 8.4 0 0 1 21 11.5z" />
                    </svg>
                    {t('btn.stuck_create_ticket')}
                </a>
            </div>
        </div>
    );
}

function TradeInsights({
    fromTicker, toTicker, rate, forecastMin, forecastMax, flow,
}: {
    fromTicker: string;
    toTicker: string;
    rate: number;
    forecastMin?: string;
    forecastMax?: string;
    flow: 'standard' | 'fixed-rate';
}) {
    const rateLabel = rate > 0 ? `1 ${fromTicker} ≈ ${formatAmount(rate, 6)} ${toTicker}` : '—';
    const eta = forecastMin && forecastMax ? `${forecastMin}–${forecastMax} min` : null;

    return (
        <div className="mt-5 rounded-2xl surface-input border border-line-1 divide-x divide-[color:var(--line-1)] grid grid-cols-3">
            <Insight
                icon={<TrendIcon />}
                label="Live rate"
                value={rateLabel}
            />
            <Insight
                icon={eta ? <ClockIcon /> : <ShieldIcon />}
                label={eta ? 'Arrives in' : 'Rate type'}
                value={eta ?? (flow === 'fixed-rate' ? 'Fixed' : 'Floating')}
                accent={flow === 'fixed-rate' ? 'lime' : 'indigo'}
            />
            <Insight
                icon={<RouteIcon />}
                label="Best of"
                value="30+ partners"
                accent="lime"
            />
        </div>
    );
}

function Insight({ icon, label, value, accent }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent?: 'lime' | 'indigo';
}) {
    const dotColor = accent === 'lime'
        ? 'var(--color-brand-300)'
        : accent === 'indigo'
            ? 'var(--color-progress)'
            : 'var(--text-3)';
    return (
        <div className="px-3 py-2.5 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-3 font-semibold">
                <span aria-hidden className="text-muted-3 shrink-0" style={{ color: dotColor }}>{icon}</span>
                <span className="truncate">{label}</span>
            </div>
            <div className="mt-1 text-[12px] font-semibold text-[color:var(--text-1)] tabular-nums truncate">
                {value}
            </div>
        </div>
    );
}

function TrendIcon() {
    return (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 17l6-6 4 4 8-8M14 7h7v7" />
        </svg>
    );
}
function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
        </svg>
    );
}
function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
        </svg>
    );
}
function RouteIcon() {
    return (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" />
            <path d="M6 16V9a3 3 0 0 1 3-3h6" />
        </svg>
    );
}

function Step2({ flow, features, legal }: StepProps & {
    features: SharedProps['features'];
    legal: SharedProps['legal'];
}) {
    const t = useT();
    const recv = flow.estimate?.amount_receive ?? 0;
    const fromTicker = flow.from?.ticker.toUpperCase() ?? '';
    const toTicker   = flow.to?.ticker.toUpperCase() ?? '';

    return (
        <div>
            <PairSummary
                from={flow.from}
                to={flow.to}
                sendAmount={flow.amount}
                receiveAmount={formatAmount(recv)}
                flow={flow.flow}
            />

            {flow.from?.network && (
                <div className="mt-4 rounded-xl bg-[var(--warn-bg)] border border-[var(--warn-border)] p-3 text-[13px] leading-snug text-[var(--warn)] flex items-start gap-2">
                    <Triangle width={18} height={18} />
                    <span>{t('deposit.network_warning', { network: flow.from.network.toUpperCase() })}</span>
                </div>
            )}

            <div className="space-y-3 mt-5">
                <div className="field">
                    <span className="field-chip">{toTicker}</span>
                    <label className="field-label" htmlFor="dest-address">
                        {t('address.destination_label', { ticker: toTicker })}
                    </label>
                    <input
                        id="dest-address"
                        autoComplete="off"
                        spellCheck={false}
                        value={flow.address}
                        onChange={(e) => flow.setAddress(e.target.value)}
                    />
                </div>

                {flow.to?.has_extra && (
                    <div className="field">
                        <span className="field-chip">{toTicker}</span>
                        <label className="field-label" htmlFor="extra-id">
                            {t('address.extra_label', { ticker: toTicker })}
                        </label>
                        <input
                            id="extra-id"
                            autoComplete="off"
                            spellCheck={false}
                            value={flow.extraId}
                            onChange={(e) => flow.setExtraId(e.target.value)}
                        />
                    </div>
                )}

                <div className="field">
                    <span className="field-chip">{fromTicker}</span>
                    <label className="field-label" htmlFor="refund-address">
                        {t('address.refund_label', { ticker: fromTicker })}
                    </label>
                    <input
                        id="refund-address"
                        autoComplete="off"
                        spellCheck={false}
                        value={flow.refundAddress}
                        onChange={(e) => flow.setRefundAddress(e.target.value)}
                    />
                </div>

                {features.collect_email && (
                    <div className="field">
                        <label className="field-label" htmlFor="user-email">
                            {t('address.email_label')}
                        </label>
                        <input
                            id="user-email"
                            type="email"
                            autoComplete="email"
                            value={flow.email}
                            onChange={(e) => flow.setEmail(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <p className="mt-5 text-xs text-muted-3 leading-relaxed">
                {t('address.terms_pre')}{' '}
                {legal.terms   && <a className="text-[color:var(--color-brand-300)]" href={legal.terms}>{t('address.terms')}</a>}{', '}
                {legal.privacy && <a className="text-[color:var(--color-brand-300)]" href={legal.privacy}>{t('address.privacy')}</a>}{' '}
                {t('address.and')}{' '}
                {legal.aml     && <a className="text-[color:var(--color-brand-300)]" href={legal.aml}>{t('address.aml')}</a>}.
            </p>

            {flow.createError && (
                <p className="mt-3 text-sm text-[color:var(--warn)]">{flow.createError}</p>
            )}

            <button
                type="button"
                onClick={() => void flow.createExchange()}
                disabled={flow.creating || !flow.address.trim()}
                className="cta mt-5"
            >
                {flow.creating ? <span className="spinner" /> : (
                    <>
                        <span>{t('btn.confirm')}</span>
                        <ArrowRight />
                    </>
                )}
            </button>
        </div>
    );
}

function Step3({ flow, onShowQr }: StepProps & { onShowQr: () => void; }) {
    const t = useT();
    const ex = flow.exchange;
    if (!ex) return null;

    const fromTicker = flow.from?.ticker.toUpperCase() ?? '';
    const statusKey = flow.status ?? 'waiting';

    return (
        <div>
            <h3 className="text-[color:var(--text-1)] font-semibold leading-snug">{t('deposit.title')}</h3>
            <p className="text-muted-3 text-sm mt-1">{t('deposit.subtitle')}</p>

            <div className="mt-4 surface-card-2 rounded-2xl p-5 space-y-4 border border-line-1">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-xs text-muted-3 uppercase tracking-wider">{t('deposit.you_need_to_send')}</div>
                        <div className="flex items-center gap-2 mt-1 text-[22px] font-bold text-[color:var(--text-1)] tabular-nums">
                            <span>{formatAmount(ex.amount_send)}</span>
                            <span className="text-muted-2 text-lg">{fromTicker}</span>
                            <CopyButton text={String(ex.amount_send)} />
                        </div>
                    </div>
                    <span className="chain-chip chain-chip-default">{fromTicker}</span>
                </div>

                <div>
                    <div className="text-xs text-muted-3 uppercase tracking-wider mb-1">{t('deposit.to_address')}</div>
                    <div className="font-mono text-sm text-[color:var(--text-1)] break-all flex items-start gap-2">
                        <span className="flex-1">{ex.payin_address}</span>
                        <CopyButton text={ex.payin_address} />
                    </div>
                </div>

                <button type="button" onClick={onShowQr} className="cta">
                    <Qr />
                    <span>{t('deposit.qr')}</span>
                </button>

                <div className="rounded-xl bg-[var(--warn-bg)] border border-[var(--warn-border)] p-3 text-sm text-[var(--warn)] flex items-start gap-2">
                    <Triangle width={18} height={18} />
                    <span>{t('deposit.warning_once')}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-3">
                <span>{t('deposit.id')}: <span className="font-mono text-muted-2">{shorten(ex.id, 10, 6)}</span></span>
                <CopyButton text={ex.id} small />
            </div>

            <div className="mt-4 flex items-center gap-3">
                <span className="spinner" />
                <span className="text-sm text-muted-2">{t(`status.${statusKey}`)}</span>
            </div>

            <button type="button" onClick={flow.reset} className="cta cta-ghost mt-5">
                {t('deposit.new')}
            </button>
        </div>
    );
}

function Step4({ flow }: StepProps) {
    const t = useT();
    const ex = flow.exchange;
    return (
        <div className="text-center">
            <div className="mx-auto w-16 h-16 grid place-items-center mb-4">
                <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
                    <circle cx="32" cy="32" r="30" stroke="var(--color-brand-300)" strokeWidth="2" fill="none" />
                    <path d="M20 33l9 9 16-18" stroke="var(--color-brand-300)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-[color:var(--text-1)]">{t('done.title')}</h3>
            <p className="text-muted-3 text-sm mt-1">{t('done.received_label')}</p>
            <p className="mt-2 text-3xl font-bold text-gradient-brand tabular-nums">
                {formatAmount(ex?.amount_receive ?? 0)} {flow.to?.ticker.toUpperCase()}
            </p>
            <button type="button" onClick={flow.reset} className="cta mt-6">
                {t('done.new_swap')}
            </button>
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
                            {currency?.network && (
                                <span className={cn('chain-chip', chainChipClass(currency.network))}>
                                    {currency.network.toUpperCase()}
                                </span>
                            )}
                        </span>
                    </span>
                </button>
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}

function chainChipClass(network: string): string {
    const k = network.toLowerCase();
    if (k.includes('btc'))  return 'chain-chip-btc';
    if (k.includes('eth'))  return 'chain-chip-eth';
    if (k.includes('bsc') || k.includes('bnb')) return 'chain-chip-bsc';
    if (k.includes('trx') || k.includes('tron')) return 'chain-chip-trx';
    if (k.includes('sol'))  return 'chain-chip-sol';
    if (k.includes('usdt')) return 'chain-chip-usdt';
    return 'chain-chip-default';
}

function PairSummary({ from, to, sendAmount, receiveAmount, flow }: {
    from: Currency | null;
    to: Currency | null;
    sendAmount: string;
    receiveAmount: string;
    flow: 'standard' | 'fixed-rate';
}) {
    const t = useT();
    const fromTicker = from?.ticker.toUpperCase() ?? '';
    const toTicker   = to?.ticker.toUpperCase() ?? '';

    return (
        <div className="rounded-2xl surface-input border border-line-1 p-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="min-w-0">
                    <div className="text-[10px] text-muted-3 uppercase tracking-wider font-semibold">
                        {t('amount.you_send')} {fromTicker}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 min-w-0">
                        {from && <CoinIcon ticker={from.ticker} image={from.image} size={22} />}
                        <div className="min-w-0">
                            <div className="font-bold text-[color:var(--text-1)] tabular-nums text-base sm:text-lg leading-tight truncate">
                                {sendAmount}
                            </div>
                            <div className="text-[11px] text-muted-3 truncate">{from?.name}</div>
                        </div>
                    </div>
                </div>

                <ArrowRight className="text-muted-3 shrink-0" width={18} height={18} />

                <div className="text-right min-w-0">
                    <div className="text-[10px] text-muted-3 uppercase tracking-wider font-semibold">
                        {t('amount.you_get')} {toTicker}
                    </div>
                    <div className="mt-1.5 flex items-center justify-end gap-2 min-w-0">
                        <div className="min-w-0 text-right">
                            <div className="font-bold text-[color:var(--text-1)] tabular-nums text-base sm:text-lg leading-tight truncate">
                                ~ {receiveAmount}
                            </div>
                            <div className="text-[11px] text-muted-3 truncate">{to?.name}</div>
                        </div>
                        {to && <CoinIcon ticker={to.ticker} image={to.image} size={22} />}
                    </div>
                </div>
            </div>

            <div className="pt-2.5 border-t border-line-1 text-xs text-muted-3 flex items-center gap-1.5">
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: flow === 'fixed-rate' ? 'var(--color-brand-400)' : 'var(--color-progress)' }}
                />
                <span>{flow === 'fixed-rate' ? t('rate.fixed') : t('rate.floating')}</span>
            </div>
        </div>
    );
}

function CopyButton({ text, small }: { text: string; small?: boolean }) {
    const t = useT();
    return (
        <button
            type="button"
            aria-label={t('deposit.copy')}
            onClick={async () => {
                const ok = await copyToClipboard(text);
                if (ok) toast.success(t('deposit.copied'));
            }}
            className={cn('inline-flex items-center justify-center rounded-md text-muted-3 hover:text-[color:var(--text-1)] transition', small ? 'p-0.5' : 'p-1.5')}
        >
            <Copy width={small ? 14 : 16} height={small ? 14 : 16} />
        </button>
    );
}
