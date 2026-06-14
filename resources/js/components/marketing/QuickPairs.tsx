import { useT } from '@/lib/i18n';
import { CoinIcon } from '@/components/ui/CoinIcon';

interface Pair { from: string; to: string; }

const PAIRS: Pair[] = [
    { from: 'btc',  to: 'eth' },
    { from: 'eth',  to: 'usdt' },
    { from: 'usdt', to: 'trx' },
    { from: 'sol',  to: 'usdc' },
    { from: 'bnb',  to: 'btc' },
    { from: 'usdt', to: 'xmr' },
];

export function QuickPairs() {
    const t = useT();
    return (
        <section className="relative z-10 container-edge py-10">
            <header className="flex items-baseline justify-between gap-3 mb-5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('marketing.quick_pairs.title')}</h2>
                <span className="text-sm text-muted-3">{t('marketing.quick_pairs.subtitle')}</span>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PAIRS.map((p) => <PairTile key={`${p.from}-${p.to}`} pair={p} />)}
            </div>
            <p className="sr-only">{t('amount.swap')}</p>
        </section>
    );
}

function PairTile({ pair }: { pair: Pair }) {
    const href = `/?from=${pair.from}&to=${pair.to}#exchange-card`;
    return (
        <a
            href={href}
            className="group surface-card rounded-2xl border border-line-1 p-3.5 hover:border-line-3 hover:shadow-[var(--shadow-card)] transition-all flex items-center gap-3"
        >
            <span className="flex -space-x-2 shrink-0">
                <span className="ring-2 ring-[color:var(--surface-card)] rounded-full">
                    <CoinIcon ticker={pair.from} size={28} />
                </span>
                <span className="ring-2 ring-[color:var(--surface-card)] rounded-full">
                    <CoinIcon ticker={pair.to} size={28} />
                </span>
            </span>
            <span className="font-semibold text-sm text-[color:var(--text-1)] truncate">
                {pair.from.toUpperCase()}
                <span className="text-muted-4 mx-1.5">→</span>
                {pair.to.toUpperCase()}
            </span>
        </a>
    );
}
