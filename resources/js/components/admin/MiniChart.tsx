import { useMemo, useState } from 'react';

interface Props {
    labels: string[];
    values: number[];
    height?: number;
    color?: string;
    type?: 'bar' | 'line';
    /** Number of horizontal grid lines / Y-axis ticks. */
    gridLines?: number;
    /** Format the displayed value in tooltips + Y axis. */
    formatValue?: (v: number) => string;
    /** Format the displayed label (axis ticks + tooltip). */
    formatLabel?: (s: string) => string;
    ariaLabel?: string;
}

const DEFAULT_FMT = (v: number): string => {
    if (!Number.isFinite(v)) return '0';
    if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (Number.isInteger(v))      return v.toString();
    return v.toFixed(2);
};

const SHORT_LABEL = (raw: string): string => {
    // Accepts YYYY-MM-DD or arbitrary; trims to Mon DD when possible.
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const d = new Date(raw + 'T00:00:00Z');
        return d.toLocaleString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
    }
    return raw;
};

export default function MiniChart({
    labels, values,
    height = 180,
    color = 'var(--color-brand-300)',
    type = 'bar',
    gridLines = 4,
    formatValue = DEFAULT_FMT,
    formatLabel = SHORT_LABEL,
    ariaLabel,
}: Props) {
    const W = 560;
    const H = height;
    const PAD = { top: 14, right: 14, bottom: 26, left: 38 };

    const max = useMemo(() => {
        const m = Math.max(0, ...values);
        if (m === 0) return 1;
        // round up max to a nicer number
        const mag = Math.pow(10, Math.floor(Math.log10(m)));
        return Math.ceil(m / mag) * mag;
    }, [values]);

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const n = Math.max(1, values.length);

    const [hover, setHover] = useState<number | null>(null);

    const yTicks = useMemo(() => {
        const out: number[] = [];
        for (let i = gridLines; i >= 0; i--) {
            out.push((max / gridLines) * i);
        }
        return out;
    }, [max, gridLines]);

    const xTickIndices = useMemo(() => {
        if (n <= 7) return values.map((_, i) => i);
        const step = Math.ceil(n / 7);
        const out: number[] = [];
        for (let i = 0; i < n; i += step) out.push(i);
        if (out[out.length - 1] !== n - 1) out.push(n - 1);
        return out;
    }, [n, values]);

    // Coordinates
    const slot = innerW / n;
    const barW = Math.max(3, slot - 5);

    const xFor = (i: number): number => {
        if (type === 'line') return PAD.left + (n > 1 ? (innerW / (n - 1)) * i : innerW / 2);
        return PAD.left + slot * i + slot / 2;
    };
    const yFor = (v: number): number => PAD.top + innerH - (v / max) * innerH;

    const linePts = values.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`);
    const linePath = 'M ' + linePts.join(' L ');
    const areaPath = `${linePath} L ${(PAD.left + innerW).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                role="img"
                aria-label={ariaLabel ?? 'chart'}
                preserveAspectRatio="none"
                className="block w-full"
                style={{ height: H }}
                onMouseLeave={() => setHover(null)}
            >
                {/* Grid + Y ticks */}
                {yTicks.map((tv) => {
                    const y = yFor(tv);
                    return (
                        <g key={tv}>
                            <line
                                x1={PAD.left} x2={PAD.left + innerW}
                                y1={y} y2={y}
                                stroke="var(--line-1)"
                                strokeWidth="1"
                            />
                            <text
                                x={PAD.left - 6} y={y + 3}
                                textAnchor="end"
                                fontSize="9"
                                fontFamily="var(--font-mono)"
                                fill="var(--text-3)"
                            >
                                {formatValue(tv)}
                            </text>
                        </g>
                    );
                })}

                {/* X ticks */}
                {xTickIndices.map((i) => (
                    <text
                        key={i}
                        x={xFor(i)} y={H - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="var(--text-3)"
                        fontFamily="var(--font-sans)"
                    >
                        {formatLabel(labels[i] ?? '')}
                    </text>
                ))}

                {/* Data */}
                <defs>
                    <linearGradient id="mc-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.30" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {type === 'line' ? (
                    <>
                        <path d={areaPath} fill="url(#mc-area-grad)" />
                        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {values.map((v, i) => (
                            <circle key={i} cx={xFor(i)} cy={yFor(v)} r={hover === i ? 4 : 2.3}
                                fill={color} stroke="var(--surface-card)" strokeWidth="1.5"
                            />
                        ))}
                    </>
                ) : (
                    values.map((v, i) => {
                        const x = PAD.left + slot * i + (slot - barW) / 2;
                        const y = yFor(v);
                        const h = Math.max(1, PAD.top + innerH - y);
                        const isHover = hover === i;
                        return (
                            <rect
                                key={i}
                                x={x} y={y} width={barW} height={h}
                                rx="3"
                                fill={color}
                                opacity={isHover ? 1 : 0.85}
                            />
                        );
                    })
                )}

                {/* Hover capture columns (invisible) */}
                {values.map((_, i) => (
                    <rect
                        key={'h' + i}
                        x={PAD.left + slot * i}
                        y={PAD.top}
                        width={slot}
                        height={innerH}
                        fill="transparent"
                        onMouseEnter={() => setHover(i)}
                    />
                ))}

                {/* Hover marker */}
                {hover !== null && (
                    <line
                        x1={xFor(hover)} x2={xFor(hover)}
                        y1={PAD.top} y2={PAD.top + innerH}
                        stroke="var(--text-3)"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                    />
                )}
            </svg>

            {hover !== null && (
                <div
                    className="pointer-events-none absolute surface-card border border-line-2 rounded-md px-2.5 py-1.5 text-xs shadow-lg"
                    style={{
                        left:  `min(calc(100% - 9rem), ${(xFor(hover) / W) * 100}%)`,
                        top:   4,
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <div className="text-muted-3 text-[10px] uppercase tracking-wider">{formatLabel(labels[hover] ?? '')}</div>
                    <div className="font-semibold text-[color:var(--text-1)] tabular-nums">
                        {formatValue(values[hover] ?? 0)}
                    </div>
                </div>
            )}
        </div>
    );
}
