import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';

interface Props {
    email: string;
}

export default function Unsubscribed({ email }: Props) {
    const t = useT();
    return (
        <PublicLayout>
            <Head title={t('admin.unsubscribed.title')} />

            <section className="container-edge py-20 sm:py-28">
                <div className="max-w-xl mx-auto surface-card border border-line-1 rounded-2xl p-8 sm:p-10 text-center">
                    <div className="inline-flex w-12 h-12 mb-5 items-center justify-center rounded-full bg-[color:var(--color-brand-300)]/15 text-[color:var(--color-brand-300)]">
                        <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12l5 5L20 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--text-1)]">
                        {t('admin.unsubscribed.title')}
                    </h1>
                    <p className="mt-3 text-sm text-muted-2 leading-relaxed">
                        {t('admin.unsubscribed.body', { email: email || '—' })}
                    </p>
                    <div className="mt-6">
                        <Link href="/" className="cta !py-2 !text-sm">
                            {t('admin.unsubscribed.home')}
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
