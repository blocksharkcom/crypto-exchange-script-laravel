import { ArrowRight } from '@/components/ui/Icons';
import { useT } from '@/lib/i18n';

export function FinalCta() {
    const t = useT();
    return (
        <section className="relative z-10 container-edge py-16">
            <div className="surface-card rounded-[32px] border border-line-1 p-10 sm:p-14 text-center shadow-[var(--shadow-card)] overflow-hidden relative">
                <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden
                    style={{
                        background:
                            'radial-gradient(60% 50% at 50% 0%, rgba(191, 241, 90, 0.18), transparent 70%)',
                    }}
                />
                <div className="relative">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                        <span className="text-[color:var(--text-1)]">{t('marketing.final_cta.title_pre')}</span>
                        <span className="text-gradient-brand">{t('marketing.final_cta.title_emp')}</span>
                    </h2>
                    <p className="mt-4 text-muted-2 text-base sm:text-lg max-w-xl mx-auto">
                        {t('marketing.final_cta.subtitle')}
                    </p>
                    <a href="#exchange-card" className="cta inline-flex max-w-xs mt-7 mx-auto">
                        <span>{t('marketing.final_cta.cta')}</span>
                        <ArrowRight />
                    </a>
                </div>
            </div>
        </section>
    );
}
