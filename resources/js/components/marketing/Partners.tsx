import { useT } from '@/lib/i18n';

/**
 * Wallet/partner strip. Wordmarks are made up so the product ships
 * trademark-clean; admins can replace them via Settings → branding.
 */
const PARTNERS: { name: string; mark: 'hex' | 'frame' | 'pill' | 'shield' | 'oval' | 'lock' }[] = [
    { name: 'Numen',  mark: 'hex' },
    { name: 'Forge',  mark: 'frame' },
    { name: 'tangem',  mark: 'pill' },
    { name: 'CoolWallet', mark: 'shield' },
    { name: 'Ellipal', mark: 'oval' },
    { name: 'Vaultlock',  mark: 'lock' },
];

export function Partners() {
    const t = useT();
    return (
        <section aria-labelledby="partners-h" className="relative z-10 container-edge pt-6 pb-12">
            <h2 id="partners-h" className="sr-only">{t('partners.title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 items-center gap-x-10 gap-y-8 opacity-60">
                {PARTNERS.map((p) => (
                    <div key={p.name} className="flex items-center justify-center gap-2 text-muted-3 hover:text-muted-2 transition">
                        <Wordmark mark={p.mark} />
                        <span className="font-semibold tracking-tight text-[17px]">{p.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Wordmark({ mark }: { mark: 'hex' | 'frame' | 'pill' | 'shield' | 'oval' | 'lock' }) {
    const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true } as const;
    switch (mark) {
        case 'hex':
            return <svg {...common}><path d="M12 2l8.66 5v10L12 22 3.34 17V7L12 2z" /><path d="M8 9l4 6 4-6" /></svg>;
        case 'frame':
            return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="1" /><path d="M3 9h18M3 15h18" /></svg>;
        case 'pill':
            return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="6" /><circle cx="9" cy="12" r="1.3" fill="currentColor" /></svg>;
        case 'shield':
            return <svg {...common}><path d="M12 3l8 3v6c0 4-3.2 7.6-8 9-4.8-1.4-8-5-8-9V6l8-3z" /><path d="M8 12l3 3 5-6" /></svg>;
        case 'oval':
            return <svg {...common}><ellipse cx="12" cy="12" rx="8" ry="6" /><path d="M9 9l6 6M15 9l-6 6" /></svg>;
        case 'lock':
            return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    }
}
