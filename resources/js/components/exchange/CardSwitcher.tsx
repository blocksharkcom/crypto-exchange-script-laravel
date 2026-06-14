import { useMemo, useState } from 'react';
import { ExchangeCard } from './ExchangeCard';
import { LimitCard } from './LimitCard';
import { RecurringCard } from './RecurringCard';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { Currency } from '@/Types';

type Mode = 'exchange' | 'limit' | 'recurring';

interface Props {
    currencies: Currency[];
    initialFrom?: string;
    initialTo?: string;
    initialAmount?: string;
}

/**
 * Wraps the three swap modes (instant Exchange, Limit, Recurring) behind a
 * single tab strip so picked currencies survive a tab switch.
 */
export function CardSwitcher({ currencies, initialFrom, initialTo, initialAmount }: Props) {
    const t = useT();
    const [mode, setMode] = useState<Mode>('exchange');

    const findByTicker = useMemo(
        () =>
            (ticker: string | undefined): Currency | null =>
                currencies.find((c) => c.ticker === (ticker ?? '').toLowerCase()) ?? null,
        [currencies],
    );

    // Shared state so a tab switch preserves selections.
    const [from, setFrom] = useState<Currency | null>(
        () => findByTicker(initialFrom ?? 'btc') ?? currencies[0] ?? null,
    );
    const [to, setTo] = useState<Currency | null>(
        () => findByTicker(initialTo ?? 'eth') ?? currencies[1] ?? null,
    );
    const [amount, setAmount] = useState<string>(initialAmount ?? '0.1');

    const tabsSlot = (
        <div className="grid grid-cols-3 border-b border-line-1" role="tablist" aria-label={t('aria.swap_modes')}>
            <TabButton active={mode === 'exchange'}  onClick={() => setMode('exchange')}  label={t('card.tab_exchange')} />
            <TabButton active={mode === 'limit'}     onClick={() => setMode('limit')}     label={t('card.tab_limit')} />
            <TabButton active={mode === 'recurring'} onClick={() => setMode('recurring')} label={t('card.tab_recurring')} />
        </div>
    );

    if (mode === 'exchange') {
        return (
            <ExchangeCard
                currencies={currencies}
                initialFrom={from?.ticker ?? initialFrom}
                initialTo={to?.ticker ?? initialTo}
                initialAmount={amount}
                tabsSlot={tabsSlot}
                onPairChange={(f, t2, a) => {
                    if (f !== from) setFrom(f);
                    if (t2 !== to) setTo(t2);
                    if (a !== amount) setAmount(a);
                }}
            />
        );
    }

    if (mode === 'limit') {
        return (
            <LimitCard
                currencies={currencies}
                from={from}
                to={to}
                amount={amount}
                onChangeFrom={setFrom}
                onChangeTo={setTo}
                onChangeAmount={setAmount}
                tabsSlot={tabsSlot}
            />
        );
    }

    return (
        <RecurringCard
            currencies={currencies}
            from={from}
            to={to}
            amount={amount}
            onChangeFrom={setFrom}
            onChangeTo={setTo}
            onChangeAmount={setAmount}
            tabsSlot={tabsSlot}
        />
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                'relative py-4 text-sm font-semibold transition',
                active ? 'text-[color:var(--text-1)]' : 'text-muted-3 hover:text-[color:var(--text-1)]',
            )}
        >
            {label}
            {active && (
                <span className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[2px] w-9 rounded-t-full bg-[color:var(--text-1)]" />
            )}
        </button>
    );
}
