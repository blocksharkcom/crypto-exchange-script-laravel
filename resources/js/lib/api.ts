import type {
    ChatMessage,
    ChatReply,
    Currency,
    EstimateResponse,
    ExchangeFlow,
    ExchangeRecord,
} from '@/Types';

type ApiOk<T>  = { ok: true; data: T };
type ApiErr    = { ok: false; error: string };
type ApiReply<T> = ApiOk<T> | ApiErr;

function csrf(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${path}`, {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrf(),
            ...(init.headers ?? {}),
        },
        ...init,
    });

    let payload: ApiReply<T> | null = null;
    try {
        payload = await res.json();
    } catch {
        throw new Error(`HTTP ${res.status}`);
    }
    if (!payload || !('ok' in payload)) {
        throw new Error('Bad upstream response');
    }
    if (!payload.ok) {
        throw new Error(payload.error || 'API error');
    }
    return payload.data;
}

const qs = (params: Record<string, string | number | undefined | null>): string => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue;
        u.set(k, String(v));
    }
    return u.toString() ? `?${u.toString()}` : '';
};

export const api = {
    currencies: (flow: ExchangeFlow = 'standard') =>
        request<Currency[]>(`/exchange/currencies${qs({ flow })}`),

    minAmount: (params: { from: string; to: string; from_network?: string; to_network?: string; flow?: ExchangeFlow }) =>
        request<{ min_amount: number }>(`/exchange/min-amount${qs(params)}`),

    estimate: (params: { from: string; to: string; amount: number; from_network?: string; to_network?: string; flow?: ExchangeFlow }) =>
        request<EstimateResponse>(`/exchange/estimate${qs(params)}`),

    create: (body: {
        from: string;
        to: string;
        amount: number;
        address: string;
        refund_address?: string;
        extra_id?: string;
        email?: string;
        from_network?: string;
        to_network?: string;
        flow?: ExchangeFlow;
        rate_id?: string;
        promo_code?: string;
    }) =>
        request<ExchangeRecord>('/exchange/create', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    status: (providerId: string) =>
        request<ExchangeRecord>(`/exchange/status/${encodeURIComponent(providerId)}`),

    validateAddress: (currency: string, address: string) =>
        request<{ valid: boolean }>('/exchange/validate', {
            method: 'POST',
            body: JSON.stringify({ currency, address }),
        }),

    openTicket: (body: { email: string; subject: string; message: string; transaction_id?: string }) =>
        request<{ ticket_id: number }>('/support/ticket', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    chat: {
        send: (messages: ChatMessage[]) =>
            request<ChatReply>('/chat/message', {
                method: 'POST',
                body: JSON.stringify({ messages }),
            }),
    },
};
