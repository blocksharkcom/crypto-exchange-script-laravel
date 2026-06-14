interface Props { name: string; size?: number; }

export function CategoryIcon({ name, size = 22 }: Props) {
    const c = {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7,
        strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
        'aria-hidden': true,
    };
    switch (name) {
        case 'rocket':
            return (
                <svg {...c}><path d="M4.5 19.5l3 3 4-1-1-4-3-3-4 1 1 4z" />
                <path d="M14 4c4 0 6 2 6 6-4 4-6 6-9 7l-4-4c1-3 3-5 7-9z" />
                <circle cx="14.5" cy="9.5" r="1.3" /></svg>
            );
        case 'arrows':
            return (
                <svg {...c}><path d="M4 8h14m-3-3l3 3-3 3M20 16H6m3-3l-3 3 3 3" /></svg>
            );
        case 'scale':
            return (
                <svg {...c}><path d="M12 3v18M3 7h18M7 7l-3 6c0 1.5 1.5 3 3 3s3-1.5 3-3l-3-6zM17 7l-3 6c0 1.5 1.5 3 3 3s3-1.5 3-3l-3-6z" /></svg>
            );
        case 'shield':
            return (
                <svg {...c}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
                <path d="M9 12l2 2 4-4" /></svg>
            );
        case 'user':
            return (
                <svg {...c}><circle cx="12" cy="8" r="4" />
                <path d="M3 21c1-4 5-6 9-6s8 2 9 6" /></svg>
            );
        default:
            return (
                <svg {...c}><circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1.2-1.5 2.3M12 17h.01" /></svg>
            );
    }
}
