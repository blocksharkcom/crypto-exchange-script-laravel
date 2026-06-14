import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}

export function shorten(str: string, head = 8, tail = 6): string {
    if (str.length <= head + tail + 1) return str;
    return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

export function formatAmount(value: number | string | null | undefined, maxDecimals = 8): string {
    if (value === null || value === undefined || value === '') return '0';
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(n)) return '0';
    const abs = Math.abs(n);
    let decimals = maxDecimals;
    if (abs >= 1000) decimals = 2;
    else if (abs >= 1) decimals = 4;
    else if (abs >= 0.01) decimals = 6;
    return n.toLocaleString('en-US', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0,
    });
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export function debounce<T extends (...args: never[]) => unknown>(fn: T, ms: number) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>): void => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
