import { Head, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { CardSwitcher } from '@/components/exchange/CardSwitcher';
import { Partners } from '@/components/marketing/Partners';
import { Stats } from '@/components/marketing/Stats';
import { QuickPairs } from '@/components/marketing/QuickPairs';
import { Highlights } from '@/components/marketing/Highlights';
import { ReviewsCarousel } from '@/components/marketing/ReviewsCarousel';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Guides } from '@/components/marketing/Guides';
import { FinalCta } from '@/components/marketing/FinalCta';
import { TypedHeadline } from '@/components/marketing/TypedHeadline';
import { useT } from '@/lib/i18n';
import type { Currency, SharedProps } from '@/Types';

interface PageProps extends SharedProps {
    featured: string[];
    currencies: Currency[];
}

export default function Home() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const { brand } = props;

    // Currencies are pre-loaded server-side via the HomeController, so the swap
    // card renders immediately with no client-side fetch / spinner.
    const currencies = props.currencies ?? [];
    const loading = false;

    // Read ?from=&to=&amount= from the URL so deep-links from QuickPairs etc. pre-fill the form.
    const initial = (() => {
        if (typeof window === 'undefined') return {} as { from?: string; to?: string; amount?: string };
        const u = new URLSearchParams(window.location.search);
        return {
            from:   u.get('from')   ?? undefined,
            to:     u.get('to')     ?? undefined,
            amount: u.get('amount') ?? undefined,
        };
    })();

    return (
        <PublicLayout>
            <Head title={brand.tagline} />

            {/* Big multi-color headline with typewriter on the gradient word */}
            <section className="relative pt-10 sm:pt-14 pb-8 sm:pb-10">
                <div className="container-edge">
                    <TypedHeadline
                        prefix={t('hero.title_a')}
                        rotating={[t('hero.title_b'), t('hero.rotate_1'), t('hero.rotate_2'), t('hero.rotate_3')]}
                        subtitle={t('hero.subtitle')}
                    />
                </div>
            </section>

            {/* Centered exchange card */}
            <section id="exchange-card" className="relative pt-2 pb-6 sm:pb-10">
                <div className="container-edge flex justify-center">
                    {loading ? (
                        <div className="w-full max-w-[470px] surface-card rounded-[28px] p-16 grid place-items-center border border-line-1">
                            <span className="spinner" />
                        </div>
                    ) : (
                        <CardSwitcher
                            currencies={currencies}
                            initialFrom={initial.from}
                            initialTo={initial.to}
                            initialAmount={initial.amount}
                        />
                    )}
                </div>
            </section>

            {/* Partner / wallet strip */}
            <Partners />

            {/* Stats */}
            <Stats />

            {/* Most-swapped pairs */}
            <QuickPairs />

            {/* Highlights + Reviews split */}
            <section className="relative z-10 container-edge py-8">
                <div className="grid lg:grid-cols-2 gap-5">
                    <Highlights since={2024} />
                    <ReviewsCarousel />
                </div>
            </section>

            {/* How it works — big purple numbers */}
            <HowItWorks />

            {/* Helpful guides */}
            <Guides />

            {/* FAQ */}
            <section id="faq" className="relative z-10 container-edge py-16 max-w-3xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-center tracking-tight">{t('faq.title')}</h2>
                <div className="mt-8 space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <details key={n} className="surface-card rounded-2xl border border-line-1 overflow-hidden group">
                            <summary className="px-5 py-4 cursor-pointer font-medium text-[color:var(--text-1)] flex items-center justify-between gap-3 list-none">
                                <span>{t(`faq.q${n}`)}</span>
                                <span aria-hidden className="text-muted-3 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                            </summary>
                            <p className="px-5 pb-5 text-sm text-muted-3">{t(`faq.a${n}`)}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* Final CTA banner */}
            <FinalCta />
        </PublicLayout>
    );
}
