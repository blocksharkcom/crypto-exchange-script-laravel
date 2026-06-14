import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/Types';

type Replacements = Record<string, string | number>;

function get(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
            return (acc as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
}

function format(str: string, replace?: Replacements): string {
    if (!replace) return str;
    return Object.entries(replace).reduce(
        (out, [k, v]) => out.replaceAll(`:${k}`, String(v)),
        str,
    );
}

export function useT() {
    const { props } = usePage<SharedProps>();
    const messages = props.i18n.messages;

    return (key: string, replace?: Replacements): string => {
        const value = get(messages, key);
        if (typeof value === 'string') return format(value, replace);
        return key;
    };
}

export function useLocale() {
    const { props } = usePage<SharedProps>();
    return props.i18n.locale;
}
