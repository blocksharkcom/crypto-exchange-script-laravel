import { CoinIcon } from '@/components/ui/CoinIcon';
import { CategoryIcon } from '@/components/help/CategoryIcon';

/**
 * Self-contained miniaturised screenshots. Each renders a stylized version of a real product view,
 * using the actual coin SVGs + brand tokens. No images, no iframes — Vite bundles SVGs only.
 */

export function ExchangeCardMockup() {
    return (
        <div className="p-8 bg-[var(--surface-page)]">
            <div className="max-w-[400px] mx-auto rounded-[24px] border border-line-1 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                <div className="grid grid-cols-3 border-b border-line-1 text-xs font-semibold">
                    <div className="py-3 text-center text-[#0d100f] relative">
                        Exchange
                        <span className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[2px] w-9 rounded-t-full bg-[#0d100f]" />
                    </div>
                    <div className="py-3 text-center text-[#62686f]">Limit</div>
                    <div className="py-3 text-center text-[#62686f]">Recurring</div>
                </div>
                <div className="px-5 pt-4 pb-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[14px] font-semibold">
                            <span className="text-[#6f6df4] mr-1.5">1/4</span>
                            <span>Select pair</span>
                        </div>
                        <span className="w-5 h-5 rounded-full border border-line-2" />
                    </div>
                    <div className="flex gap-1 mb-4">
                        <span className="h-[3px] flex-1 rounded-full bg-[#6f6df4]" />
                        <span className="h-[3px] flex-1 rounded-full bg-[rgba(110,109,244,.16)]" />
                        <span className="h-[3px] flex-1 rounded-full bg-[rgba(110,109,244,.16)]" />
                        <span className="h-[3px] flex-1 rounded-full bg-[rgba(110,109,244,.16)]" />
                    </div>

                    <FauxAmountRow label="YOU SEND" ticker="btc" amount="0.1" />
                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="w-9 h-9 rounded-full grid place-items-center bg-white border border-line-2">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0d100f" strokeWidth="1.7" aria-hidden>
                                <path d="M8 5v14m0 0l-4-4m4 4l4-4M16 19V5m0 0l-4 4m4-4l4 4" />
                            </svg>
                        </div>
                    </div>
                    <FauxAmountRow label="YOU GET" ticker="eth" amount="~ 3.7505" />

                    <button className="mt-5 w-full py-3.5 rounded-full bg-[#bff15a] text-[#0a0a0c] font-semibold text-sm shadow-[0_10px_28px_-12px_rgba(191,241,90,.55)]">
                        Next step
                    </button>
                </div>
            </div>
        </div>
    );
}

function FauxAmountRow({ label, ticker, amount }: { label: string; ticker: string; amount: string }) {
    const names: Record<string, string> = { btc: 'Bitcoin', eth: 'Ethereum', usdt: 'Tether' };
    return (
        <div className="rounded-2xl bg-[var(--surface-page)] border border-line-1 px-3.5 py-3 mb-1.5">
            <div className="text-[10px] tracking-wider text-[#62686f] font-semibold">{label}</div>
            <div className="flex items-center gap-3 mt-1.5">
                <div className="inline-flex items-center gap-2">
                    <CoinIcon ticker={ticker} size={28} />
                    <div className="leading-tight">
                        <div className="font-bold text-sm">{ticker.toUpperCase()}</div>
                        <div className="text-[10px] text-[#62686f]">{names[ticker] ?? ticker.toUpperCase()}</div>
                    </div>
                </div>
                <div className="flex-1 text-right font-bold text-xl tabular-nums">{amount}</div>
            </div>
        </div>
    );
}

export function DepositMockup() {
    return (
        <div className="p-8 bg-[var(--surface-page)]">
            <div className="max-w-[400px] mx-auto rounded-[24px] border border-line-1 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                <div className="grid grid-cols-3 border-b border-line-1 text-xs font-semibold">
                    <div className="py-3 text-center">Exchange</div>
                    <div className="py-3 text-center text-[#62686f]">Limit</div>
                    <div className="py-3 text-center text-[#62686f]">Recurring</div>
                </div>
                <div className="px-5 pt-4 pb-5">
                    <div className="flex items-center justify-between mb-2 text-[14px] font-semibold">
                        <div><span className="text-[#6f6df4] mr-1.5">3/4</span>Send funds</div>
                    </div>
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4].map(i => (
                            <span key={i} className={`h-[3px] flex-1 rounded-full ${i<=3?'bg-[#6f6df4]':'bg-[rgba(110,109,244,.16)]'}`} />
                        ))}
                    </div>

                    <h3 className="font-semibold text-sm">Send the exact amount to the address below</h3>
                    <p className="text-[12px] text-[#62686f] mt-0.5">Exchange begins after network confirmations.</p>

                    <div className="mt-3 rounded-2xl bg-[var(--surface-card-2)] border border-line-1 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-[#62686f] font-semibold">You need to send</div>
                                <div className="flex items-center gap-1.5 mt-0.5 font-bold text-[16px]">0.1<span className="text-[#62686f] text-sm">BTC</span></div>
                            </div>
                            <span className="text-[9px] font-bold tracking-wider bg-[rgba(247,147,26,.15)] text-[#b56b00] px-1.5 py-0.5 rounded">BTC</span>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-[#62686f] font-semibold">To our exchange address</div>
                            <div className="font-mono text-[10px] break-all mt-1">bc1qez45hdjd58jphhjsd0a3utjqzzwfja9nen6jm5</div>
                        </div>
                        <button className="w-full py-2.5 rounded-full bg-[#bff15a] text-[#0a0a0c] font-semibold text-xs">Show QR-code</button>
                    </div>
                    <div className="mt-3 rounded-xl bg-[rgba(246,185,90,.16)] border border-[rgba(246,185,90,.4)] p-2.5 text-[11px] text-[#c47a05] flex gap-2 items-start">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M12 2l11 19H1L12 2z"/><path d="M12 9v5M12 17h.01"/></svg>
                        <span>Send funds to the address above only once.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AdminDashboardMockup() {
    return (
        <div className="p-6 bg-[#fbfbf7] grid grid-cols-[160px_1fr] gap-4 min-h-[380px]">
            <aside className="bg-white rounded-2xl border border-line-1 p-2.5 text-[11px]">
                <div className="flex items-center gap-1.5 px-2 py-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md grid place-items-center bg-[#bff15a] text-[#0a0a0c] font-bold text-[9px]">C</span>
                    <span className="font-bold">CrossSwap</span>
                </div>
                {['Dashboard','Transactions','Stuck swaps','Users','Tickets','API Mgmt','Settings'].map((l, i) => (
                    <div key={l} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${i===0?'bg-[var(--surface-card-2)] text-[#0d100f] font-semibold':'text-[#62686f]'}`}>
                        <span className={`w-1 h-3.5 rounded-full ${i===0?'bg-[#6f6df4]':'bg-transparent'}`} />
                        <span>{l}</span>
                    </div>
                ))}
            </aside>
            <main className="space-y-3">
                <div className="grid grid-cols-4 gap-2.5">
                    {[
                        { label: 'Swaps today',  value: '1,247', delta: '+12%' },
                        { label: 'Volume',       value: '$842K',  delta: '+7%' },
                        { label: 'Fees earned',  value: '$3.36K', delta: '+9%' },
                        { label: 'Stuck',        value: '3',      delta: 'flag' },
                    ].map((k) => (
                        <div key={k.label} className="rounded-xl border border-line-1 bg-white p-2.5">
                            <div className="text-[9px] uppercase tracking-wider text-[#62686f] font-semibold">{k.label}</div>
                            <div className="text-lg font-bold mt-1 text-gradient-brand tabular-nums">{k.value}</div>
                            <div className="text-[9px] text-[#6f6df4] font-semibold mt-0.5">{k.delta}</div>
                        </div>
                    ))}
                </div>
                <div className="rounded-xl border border-line-1 bg-white p-3">
                    <div className="flex items-baseline justify-between mb-2">
                        <div className="text-[11px] font-semibold">14-day volume</div>
                        <div className="text-[9px] text-[#62686f]">Indigo line</div>
                    </div>
                    <svg viewBox="0 0 240 60" className="w-full h-14" aria-hidden>
                        <polyline points="0,42 18,30 36,38 54,20 72,24 90,12 108,28 126,18 144,8 162,22 180,14 198,26 216,18 234,8"
                            stroke="#6f6df4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="rounded-xl border border-line-1 bg-white p-3">
                    <div className="text-[11px] font-semibold mb-2">Recent transactions</div>
                    <div className="space-y-1.5 text-[10px]">
                        {[
                            { pair: 'BTC→ETH', amt: '0.5 BTC', status: 'finished' },
                            { pair: 'USDT→TRX', amt: '500 USDT', status: 'confirming' },
                            { pair: 'SOL→USDC', amt: '12 SOL', status: 'sending' },
                        ].map((r) => (
                            <div key={r.pair} className="flex items-center justify-between border-t border-line-1 pt-1.5 first:border-0 first:pt-0">
                                <span className="font-mono">{r.pair}</span>
                                <span className="text-[#62686f]">{r.amt}</span>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                    style={{
                                        background: r.status==='finished' ? 'rgba(191,241,90,.18)' : 'rgba(110,109,244,.18)',
                                        color: r.status==='finished' ? '#3a6a07' : '#4f4cda',
                                    }}>{r.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export function HelpCenterMockup() {
    return (
        <div className="p-8 bg-[var(--surface-page)] text-center min-h-[360px]">
            <div className="text-[10px] uppercase tracking-wider text-[#6f6df4] font-semibold">Help center</div>
            <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                <span>How can we </span>
                <span className="text-gradient-brand">help?</span>
            </h3>
            <div className="mt-4 mx-auto max-w-md flex items-center bg-white rounded-full border border-line-2 pl-4 pr-1 shadow-[var(--shadow-card)]">
                <span className="text-[#62686f]">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
                </span>
                <input readOnly placeholder="Search articles…" className="flex-1 bg-transparent text-xs py-2.5 px-2 outline-none" />
                <span className="px-3.5 py-1.5 rounded-full bg-[#bff15a] text-[#0a0a0c] text-[10px] font-semibold">Search</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-left">
                {[
                    { icon: 'rocket', t: 'Getting started', c: 3 },
                    { icon: 'arrows', t: 'Swapping crypto', c: 5 },
                    { icon: 'shield', t: 'Security & safety', c: 3 },
                ].map((c) => (
                    <div key={c.t} className="rounded-xl border border-line-1 bg-white p-3">
                        <div className="flex items-center justify-between">
                            <span className="w-7 h-7 grid place-items-center rounded-lg bg-[var(--surface-card-2)] text-[#bff15a]">
                                <CategoryIcon name={c.icon} size={14} />
                            </span>
                            <span className="text-[9px] text-[#62686f] font-semibold">{c.c} articles</span>
                        </div>
                        <div className="mt-2 text-[11px] font-bold">{c.t}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AccountMockup() {
    return (
        <div className="p-7 bg-[var(--surface-page)] min-h-[360px]">
            <div className="text-xs text-[#62686f]">Welcome back</div>
            <h3 className="text-2xl font-extrabold">Frenks</h3>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                    { l: 'Lifetime swaps', v: '128' },
                    { l: 'Lifetime volume', v: '$54.2K' },
                    { l: 'Fees paid', v: '$216' },
                ].map((k) => (
                    <div key={k.l} className="rounded-xl bg-white border border-line-1 p-3">
                        <div className="text-[10px] uppercase tracking-wider text-[#62686f] font-semibold">{k.l}</div>
                        <div className="mt-1 text-lg font-bold text-gradient-brand tabular-nums">{k.v}</div>
                    </div>
                ))}
            </div>
            <div className="mt-4 rounded-xl bg-white border border-line-1 p-3">
                <div className="text-xs font-semibold mb-2">Recent swaps</div>
                <div className="grid gap-1.5 text-[11px]">
                    {[
                        { pair: 'BTC → ETH',   amount: '0.1 → 3.75' },
                        { pair: 'USDT → TRX',  amount: '500 → 1,412' },
                        { pair: 'SOL → USDC',  amount: '12 → 1,876' },
                    ].map((r) => (
                        <div key={r.pair} className="flex items-center justify-between border-t border-line-1 pt-1.5 first:border-0 first:pt-0">
                            <span className="font-mono">{r.pair}</span>
                            <span className="text-[#62686f] tabular-nums">{r.amount}</span>
                            <span className="text-[9px] uppercase font-bold text-[#3a6a07] bg-[rgba(191,241,90,.18)] px-1.5 py-0.5 rounded">finished</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AiChatMockup() {
    return (
        <div className="relative bg-[var(--surface-page)] min-h-[360px] p-6">
            <div className="absolute bottom-6 right-6 w-[260px] rounded-2xl border border-line-1 bg-white shadow-[var(--shadow-card)] overflow-hidden">
                <div className="px-4 py-3 border-b border-line-1 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-[#0a0a0c]"
                          style={{ background: 'linear-gradient(135deg,#bff15a,#6ce7d2)' }}>A</span>
                    <div className="leading-tight">
                        <div className="text-xs font-bold">Ask Aida</div>
                        <div className="text-[10px] text-[#62686f]">AI support assistant</div>
                    </div>
                </div>
                <div className="p-3 space-y-2 text-[11px]">
                    <div className="bg-[var(--surface-card-2)] rounded-xl rounded-bl-md px-3 py-2">Hi! How can I help today?</div>
                    <div className="ml-6 bg-[rgba(110,109,244,.12)] text-[#4f4cda] rounded-xl rounded-br-md px-3 py-2">What is a floating rate?</div>
                    <div className="bg-[var(--surface-card-2)] rounded-xl rounded-bl-md px-3 py-2">
                        Floating rate uses the market rate at the moment your deposit confirms…
                    </div>
                </div>
                <div className="px-3 pb-3">
                    <div className="bg-[var(--surface-page)] rounded-full border border-line-2 px-3 py-1.5 text-[11px] text-[#62686f]">Ask anything…</div>
                </div>
            </div>
            <div className="absolute bottom-4 right-3 w-12 h-12 rounded-full grid place-items-center shadow-[0_12px_36px_-12px_rgba(191,241,90,.55)]"
                 style={{ background: 'linear-gradient(135deg,#bff15a,#7be09a)' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#0a0a0c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 14.6-8.9A8.4 8.4 0 0 1 21 11.5z"/>
                </svg>
            </div>
        </div>
    );
}
