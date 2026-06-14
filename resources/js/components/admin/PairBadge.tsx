import { CoinIcon } from '@/components/ui/CoinIcon';
import { cn } from '@/lib/utils';

interface Props {
    from: string;
    to: string;
    size?: number;
    className?: string;
    /** Show coin icons (default true). */
    icons?: boolean;
}

/**
 * Compact pair badge used everywhere we render "BTC → ETH" so the
 * coin icons always travel with the tickers.
 */
export default function PairBadge({ from, to, size = 18, className, icons = true }: Props) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 font-semibold uppercase text-xs whitespace-nowrap', className)}>
            {icons && <CoinIcon ticker={from} size={size} />}
            <span>{from}</span>
            <span className="text-muted-3" aria-hidden>→</span>
            {icons && <CoinIcon ticker={to} size={size} />}
            <span>{to}</span>
        </span>
    );
}
