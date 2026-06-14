import type { SVGProps } from 'react';

const sw = (props: SVGProps<SVGSVGElement>) => ({
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
});

export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M6 9l6 6 6-6" /></svg>
);
export const ChevronLeft = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M15 18l-6-6 6-6" /></svg>
);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M9 6l6 6-6 6" /></svg>
);
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M5 12h14m-6-6l6 6-6 6" /></svg>
);
export const ArrowUpDown = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M8 5v14m0 0l-4-4m4 4l4-4M16 19V5m0 0l-4 4m4-4l4 4" /></svg>
);
export const Search = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const Copy = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);
export const X = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Globe = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" /></svg>
);
export const Moon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" stroke="none" /></svg>
);
export const Sun = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M4.5 19.5l2-2M17.5 6.5l2-2" /></svg>
);
export const Triangle = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M12 2l11 19H1L12 2z" /><path d="M12 9v5M12 17h.01" /></svg>
);
export const Check = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M5 13l4 4L19 7" /></svg>
);
export const Qr = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M14 14h3v3h-3zM20 14h1v1h-1zM20 20h1v1h-1zM14 20h3v1h-3z" stroke="none" fill="currentColor" />
    </svg>
);
export const Help = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1.2-1.5 2.3M12 17h.01" /></svg>
);
export const Bolt = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z" fill="currentColor" stroke="none" /></svg>
);
export const Shield = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" /></svg>
);
export const Sparkles = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
);
export const ExternalLink = (p: SVGProps<SVGSVGElement>) => (
    <svg {...sw(p)}><path d="M14 5h5v5M19 5L9 15M19 13v6H5V5h6" /></svg>
);
