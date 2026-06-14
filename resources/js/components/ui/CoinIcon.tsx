import { useMemo, useState } from 'react';
import { localCoinIcon } from '@/lib/coinIcons';

interface Props {
    ticker: string;
    image?: string | null;
    size?: number;
}

/**
 * Crypto coin icon with a 3-tier fallback chain:
 *   1. Local SVG shipped via the `cryptocurrency-icons` package (covers the top ~150 assets)
 *   2. Upstream `image` URL returned by the API (CoinGecko / ChangeNOW asset CDN)
 *   3. Gradient disc with the ticker initials (deterministic colour per ticker)
 */
export function CoinIcon({ ticker, image, size = 28 }: Props) {
    const local = localCoinIcon(ticker);
    const [stage, setStage] = useState<'local' | 'remote' | 'fallback'>(
        local ? 'local' : image ? 'remote' : 'fallback',
    );

    const fallbackColor = useMemo(() => {
        const hue = [...ticker].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
        return `hsl(${hue}, 70%, 55%)`;
    }, [ticker]);

    const src = stage === 'local' ? local : stage === 'remote' ? image ?? undefined : undefined;

    if (src) {
        return (
            <img
                src={src}
                alt=""
                width={size}
                height={size}
                className="rounded-full shrink-0"
                loading="lazy"
                draggable={false}
                onError={() => {
                    if (stage === 'local' && image) setStage('remote');
                    else setStage('fallback');
                }}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className="inline-flex items-center justify-center rounded-full font-bold text-[10px] text-white shrink-0"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, ${fallbackColor}, color-mix(in oklab, ${fallbackColor}, black 35%))`,
            }}
        >
            {ticker.slice(0, 3).toUpperCase()}
        </span>
    );
}
