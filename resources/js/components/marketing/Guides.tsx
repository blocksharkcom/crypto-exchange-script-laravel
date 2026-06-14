import { useT } from '@/lib/i18n';
import { ChevronRight } from '@/components/ui/Icons';

interface Guide { id: string; title: string; minutes: number; href: string; }

const GUIDES: Guide[] = [
    { id: 'first-swap',  title: 'Your first swap: a 60-second walkthrough',   minutes: 2, href: '/help/article/how-crypto-swap-works' },
    { id: 'floating',    title: 'Floating vs fixed rate — which to pick',     minutes: 3, href: '/help/article/floating-vs-fixed' },
    { id: 'network-fee', title: 'Network fees explained without the jargon',  minutes: 4, href: '/help/article/where-fees-come-from' },
    { id: 'limits',      title: 'Minimums, maximums, and how liquidity works',minutes: 3, href: '/help/article/minimums-maximums' },
];

export function Guides() {
    const t = useT();
    return (
        <section className="relative z-10 container-edge py-16">
            <header className="flex items-baseline justify-between gap-3 mb-7">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('guides.title')}</h2>
                <a href="/help" className="text-sm font-semibold text-[color:var(--color-progress)] hover:underline">
                    {t('guides.view_all')} →
                </a>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GUIDES.map((g) => (
                    <a
                        key={g.id}
                        href={g.href}
                        className="group surface-card rounded-2xl border border-line-1 p-5 hover:border-line-3 transition flex flex-col"
                    >
                        <div className="text-xs font-semibold text-[color:var(--color-brand-300)] uppercase tracking-wider">
                            {g.minutes} min read
                        </div>
                        <h3 className="mt-3 font-bold text-[color:var(--text-1)] leading-snug flex-1">
                            {g.title}
                        </h3>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-2 group-hover:text-[color:var(--text-1)] transition">
                            Read guide <ChevronRight width={14} height={14} />
                        </span>
                    </a>
                ))}
            </div>
        </section>
    );
}
