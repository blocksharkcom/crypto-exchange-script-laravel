import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { debounce } from '@/lib/utils';
import type {
    Currency,
    EstimateResponse,
    ExchangeFlow,
    ExchangeRecord,
    TransactionStatus,
} from '@/Types';

export type Step = 1 | 2 | 3 | 4;

export interface FlowState {
    step: Step;
    from: Currency | null;
    to: Currency | null;
    amount: string;
    flow: ExchangeFlow;
    estimate: EstimateResponse | null;
    minAmount: number | null;
    estimateLoading: boolean;
    estimateError: string | null;
    address: string;
    refundAddress: string;
    extraId: string;
    email: string;
    exchange: ExchangeRecord | null;
    creating: boolean;
    createError: string | null;
    status: TransactionStatus | null;
}

export interface FlowActions {
    setFrom: (c: Currency | null) => void;
    setTo: (c: Currency | null) => void;
    setAmount: (s: string) => void;
    setFlow: (f: ExchangeFlow) => void;
    swap: () => void;
    setAddress: (s: string) => void;
    setRefundAddress: (s: string) => void;
    setExtraId: (s: string) => void;
    setEmail: (s: string) => void;
    next: () => void;
    back: () => void;
    reset: () => void;
    createExchange: () => Promise<void>;
}

interface InitialPair {
    fromTicker?: string;
    toTicker?: string;
    initialAmount?: string;
}

const isValid = (s: string): boolean => /^\d+(\.\d+)?$/.test(s) && parseFloat(s) > 0;

export function useExchangeFlow(currencies: Currency[], initial: InitialPair = {}): FlowState & FlowActions {
    const findByTicker = useCallback(
        (ticker: string | undefined): Currency | null =>
            currencies.find((c) => c.ticker === (ticker ?? '').toLowerCase()) ?? null,
        [currencies],
    );

    const [step, setStep] = useState<Step>(1);
    const [from, setFrom] = useState<Currency | null>(() => findByTicker(initial.fromTicker ?? 'btc') ?? currencies[0] ?? null);
    const [to,   setTo]   = useState<Currency | null>(() => findByTicker(initial.toTicker   ?? 'eth') ?? currencies[1] ?? null);
    const [amount, setAmount] = useState<string>(initial.initialAmount ?? '0.1');
    const [flow, setFlow] = useState<ExchangeFlow>('standard');

    const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
    const [minAmount, setMinAmount] = useState<number | null>(null);
    const [estimateLoading, setEstimateLoading] = useState<boolean>(false);
    const [estimateError, setEstimateError] = useState<string | null>(null);

    const [address, setAddress] = useState<string>('');
    const [refundAddress, setRefundAddress] = useState<string>('');
    const [extraId, setExtraId] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [exchange, setExchange] = useState<ExchangeRecord | null>(null);
    const [creating, setCreating] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [status, setStatus] = useState<TransactionStatus | null>(null);

    const seq = useRef(0);

    const fetchEstimate = useCallback(async (
        fromC: Currency, toC: Currency, amt: string, flw: ExchangeFlow,
    ): Promise<void> => {
        if (!isValid(amt)) {
            setEstimate(null);
            setEstimateError(null);
            return;
        }
        const tag = ++seq.current;
        setEstimateLoading(true);
        setEstimateError(null);
        try {
            const [est, mn] = await Promise.all([
                api.estimate({
                    from: fromC.ticker, to: toC.ticker,
                    amount: parseFloat(amt),
                    from_network: fromC.network ?? undefined,
                    to_network: toC.network ?? undefined,
                    flow: flw,
                }),
                api.minAmount({
                    from: fromC.ticker, to: toC.ticker,
                    from_network: fromC.network ?? undefined,
                    to_network: toC.network ?? undefined,
                    flow: flw,
                }).catch(() => ({ min_amount: 0 })),
            ]);
            if (seq.current !== tag) return;
            setEstimate(est);
            setMinAmount(mn.min_amount);
        } catch (e) {
            if (seq.current !== tag) return;
            setEstimate(null);
            setEstimateError(e instanceof Error ? e.message : 'Error');
        } finally {
            if (seq.current === tag) setEstimateLoading(false);
        }
    }, []);

    const debouncedFetch = useMemo(
        () => debounce(fetchEstimate, 350),
        [fetchEstimate],
    );

    useEffect(() => {
        if (from && to) debouncedFetch(from, to, amount, flow);
    }, [from, to, amount, flow, debouncedFetch]);

    const swap = useCallback(() => {
        setFrom(to);
        setTo(from);
    }, [from, to]);

    const next = useCallback(() => {
        setStep((s) => (Math.min(4, s + 1) as Step));
    }, []);
    const back = useCallback(() => {
        setStep((s) => (Math.max(1, s - 1) as Step));
    }, []);
    const reset = useCallback(() => {
        setStep(1);
        setAddress('');
        setRefundAddress('');
        setExtraId('');
        setExchange(null);
        setStatus(null);
        setCreateError(null);
    }, []);

    const createExchange = useCallback(async (): Promise<void> => {
        if (!from || !to) return;
        setCreating(true);
        setCreateError(null);
        try {
            const record = await api.create({
                from: from.ticker, to: to.ticker,
                amount: parseFloat(amount),
                address: address.trim(),
                refund_address: refundAddress.trim() || undefined,
                extra_id: extraId.trim() || undefined,
                email: email.trim() || undefined,
                from_network: from.network ?? undefined,
                to_network:   to.network ?? undefined,
                flow,
                rate_id: estimate?.rate_id || undefined,
            });
            setExchange(record);
            setStatus(record.status);
            setStep(3);
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Error');
        } finally {
            setCreating(false);
        }
    }, [from, to, amount, address, refundAddress, extraId, email, flow, estimate?.rate_id]);

    // Poll status while in step 3
    useEffect(() => {
        if (step !== 3 || !exchange) return;
        let alive = true;
        const tick = async (): Promise<void> => {
            try {
                const fresh = await api.status(exchange.id);
                if (!alive) return;
                setStatus(fresh.status);
                setExchange(fresh);
                if (fresh.status === 'finished') setStep(4);
            } catch {
                /* keep polling */
            }
        };
        void tick();
        const id = setInterval(tick, 10_000);
        return () => { alive = false; clearInterval(id); };
    }, [step, exchange?.id]);

    return {
        step, from, to, amount, flow,
        estimate, minAmount, estimateLoading, estimateError,
        address, refundAddress, extraId, email,
        exchange, creating, createError, status,
        setFrom, setTo, setAmount, setFlow, swap,
        setAddress, setRefundAddress, setExtraId, setEmail,
        next, back, reset, createExchange,
    };
}
