export interface Brand {
    name: string;
    tagline: string;
    logo: string | null;
    support_email: string;
    social: Record<string, string>;
}

export interface FeatureFlags {
    webgl_hero: boolean;
    fixed_rate: boolean;
    show_promo: boolean;
    collect_email: boolean;
}

export interface I18nShare {
    locale: string;
    available: string[];
    messages: Record<string, unknown>;
}

export interface AdminSession {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

export interface UserSession {
    id: number;
    name: string | null;
    email: string;
    locale: string | null;
    created_at: string;
}

export interface AuthShare {
    admin: AdminSession | null;
    user: UserSession | null;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
    info?: string | null;
}

export interface ChatShare {
    enabled: boolean;
    assistant_name: string;
}

export interface NavLink { label: string; href: string }

export interface HighlightItem { title: string; desc: string }
export interface ReviewItem { name: string; rating: number; body: string }
export interface StatItem { value: number; suffix: string; label: string }
export interface HowItem { title: string; desc: string }

export interface ContentShare {
    highlights:   { since: number; items: HighlightItem[] };
    reviews:      { items: ReviewItem[] };
    stats:        StatItem[];
    how_it_works: { items: HowItem[] };
}

export interface SharedProps {
    appName: string;
    brand: Brand;
    features: FeatureFlags;
    theme: 'dark' | 'light' | 'auto';
    legal: { terms: string | null; privacy: string | null; aml: string | null };
    nav: { header: NavLink[]; footer: NavLink[] };
    content: ContentShare;
    i18n: I18nShare;
    auth: AuthShare;
    flash: Flash;
    chat: ChatShare;
    [key: string]: unknown;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatReply {
    reply: string;
    tokens_in: number;
    tokens_out: number;
}

export interface Currency {
    ticker: string;
    name: string;
    image: string;
    network: string | null;
    has_extra: boolean;
    is_fiat: boolean;
    is_stable: boolean;
    token_contract: string | null;
    featured: boolean;
}

export type ExchangeFlow = 'standard' | 'fixed-rate';

export interface EstimateResponse {
    from: string;
    to: string;
    amount_send: number;
    amount_receive: number;
    rate_id: string;
    valid_until: string | null;
    flow: ExchangeFlow;
    warning: string | null;
    transaction_speed_forecast?: { minimum?: string; maximum?: string } | null;
}

export type TransactionStatus =
    | 'new' | 'waiting' | 'confirming' | 'exchanging' | 'sending'
    | 'finished' | 'failed' | 'refunded' | 'expired' | 'verifying';

export interface ExchangeRecord {
    id: string;
    local_id: number;
    from: string;
    to: string;
    from_network: string | null;
    to_network: string | null;
    amount_send: number;
    amount_receive: number;
    payin_address: string;
    payin_extra_id: string | null;
    payout_address: string;
    payout_extra_id: string | null;
    flow: ExchangeFlow;
    valid_until: string | null;
    status: TransactionStatus;
    payin_hash: string | null;
    payout_hash: string | null;
}

export interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginatorLink[];
    path: string;
    first_page_url: string | null;
    last_page_url: string | null;
    next_page_url: string | null;
    prev_page_url: string | null;
}
