import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import { ChevronRight, Search } from '@/components/ui/Icons';
import { CategoryIcon } from '@/components/help/CategoryIcon';
import type { SharedProps } from '@/Types';

interface Category {
    slug: string;
    title: string;
    desc: string;
    icon: string;
    count: number;
}
interface ArticleSummary {
    slug: string;
    title: string;
    summary: string;
    category?: string;
}
interface PageProps extends SharedProps {
    categories: Category[];
    popular:    ArticleSummary[];
    search:     string;
    results:    ArticleSummary[];
}

export default function HelpIndex() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const { categories, popular, search, results } = props;

    const [q, setQ] = useState(search);

    useEffect(() => { setQ(search); }, [search]);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        router.get('/help', q.trim() ? { q: q.trim() } : {}, { preserveScroll: true, preserveState: false });
    }

    return (
        <PublicLayout>
            <Head title={t('help.title')} />

            {/* Hero with search */}
            <section className="relative pt-12 sm:pt-16 pb-8">
                <div className="container-edge max-w-3xl text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                        <span className="text-[color:var(--text-1)]">{t('help_extra.hero_title_a')}</span>
                        <span className="text-gradient-brand">{t('help_extra.hero_title_b')}</span>
                    </h1>
                    <p className="mt-4 text-muted-2 text-base sm:text-lg">
                        {t('help_extra.hero_subtitle')}
                    </p>

                    <form onSubmit={onSubmit} className="mt-7 relative">
                        <div className="surface-card rounded-full border border-line-2 shadow-[var(--shadow-card)] flex items-center pl-5 pr-2">
                            <Search className="text-muted-3 shrink-0" width={18} height={18} />
                            <input
                                type="search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={t('help_extra.search_placeholder')}
                                className="flex-1 bg-transparent border-0 outline-none py-4 px-3 text-[color:var(--text-1)] placeholder:text-muted-3"
                                autoComplete="off"
                            />
                            <button type="submit" className="cta !py-2.5 !w-auto px-5 !text-sm">
                                {t('help_extra.search_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Search results, if any */}
            {search.trim() !== '' && (
                <section className="relative z-10 container-edge py-8 max-w-4xl">
                    <h2 className="text-xl font-bold text-[color:var(--text-1)]">
                        {results.length === 0
                            ? <>{t('help_extra.no_results')} <span className="text-muted-2">“{search}”</span></>
                            : <>{t(results.length === 1 ? 'help_extra.results_count_one' : 'help_extra.results_count_other', { count: results.length })} <span className="text-muted-2">“{search}”</span></>}
                    </h2>
                    {results.length > 0 && (
                        <ul className="mt-5 space-y-2">
                            {results.map((a) => <ArticleRow key={a.slug} article={a} />)}
                        </ul>
                    )}
                </section>
            )}

            {/* Categories grid */}
            <section className="relative z-10 container-edge py-10 max-w-6xl">
                <SectionHeading>{t('help_extra.section_browse')}</SectionHeading>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/help/category/${c.slug}`}
                            className="group surface-card rounded-2xl border border-line-1 p-6 hover:border-line-3 hover:shadow-[var(--shadow-card)] transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="w-11 h-11 rounded-xl grid place-items-center bg-[color:var(--surface-card-2)] border border-line-2 text-[color:var(--color-brand-300)]">
                                    <CategoryIcon name={c.icon} />
                                </span>
                                <span className="text-xs text-muted-3 font-semibold">{t('help_extra.articles_count', { count: c.count })}</span>
                            </div>
                            <h3 className="mt-4 font-bold text-lg text-[color:var(--text-1)] leading-snug">
                                {c.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-3">{c.desc}</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted-2 group-hover:text-[color:var(--text-1)] transition">
                                {t('help_extra.open_category')} <ChevronRight width={14} height={14} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Popular articles */}
            <section className="relative z-10 container-edge py-10 max-w-4xl">
                <SectionHeading>{t('help_extra.section_popular')}</SectionHeading>
                <ul className="space-y-2">
                    {popular.map((a) => <ArticleRow key={a.slug} article={a} />)}
                </ul>
            </section>

            {/* Open ticket / lookup */}
            <TicketBlock />
        </PublicLayout>
    );
}

function SectionHeading({ children }: { children: ReactNode }) {
    return <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{children}</h2>;
}

function ArticleRow({ article }: { article: ArticleSummary }) {
    return (
        <li>
            <Link
                href={`/help/article/${article.slug}`}
                className="group block surface-card rounded-xl border border-line-1 px-5 py-4 hover:border-line-3 transition"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[color:var(--text-1)] leading-snug">
                            {article.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-3 line-clamp-1">{article.summary}</p>
                    </div>
                    <ChevronRight className="text-muted-3 shrink-0 group-hover:text-[color:var(--text-1)] transition" />
                </div>
            </Link>
        </li>
    );
}

function TicketBlock() {
    const t = useT();
    const [tab, setTab] = useState<'open' | 'lookup'>(() => readInitialTab());

    // React to ?tab= or #tickets-(open|lookup) hash changes after mount
    useEffect(() => {
        const sync = () => setTab(readInitialTab());
        window.addEventListener('hashchange', sync);
        window.addEventListener('popstate', sync);
        return () => {
            window.removeEventListener('hashchange', sync);
            window.removeEventListener('popstate', sync);
        };
    }, []);

    return (
        <section id="tickets" className="relative z-10 container-edge py-14 max-w-4xl scroll-mt-24">
            <SectionHeading>{t('help_extra.section_still_need')}</SectionHeading>
            <div className="surface-card rounded-[28px] border border-line-1 shadow-[var(--shadow-card)] p-2">
                <div className="grid grid-cols-2 p-1.5 border-b border-line-1">
                    <TabBtn active={tab === 'open'}   onClick={() => setTab('open')}   label={t('help.cta_open')} />
                    <TabBtn active={tab === 'lookup'} onClick={() => setTab('lookup')} label={t('help.lookup.title')} />
                </div>
                <div className="px-6 sm:px-8 py-7">
                    {tab === 'open' ? <OpenForm /> : <LookupForm />}
                </div>
            </div>
        </section>
    );
}

function readInitialTab(): 'open' | 'lookup' {
    if (typeof window === 'undefined') return 'open';
    const qs = new URLSearchParams(window.location.search);
    const fromQuery = qs.get('tab');
    if (fromQuery === 'lookup') return 'lookup';
    if (fromQuery === 'open')   return 'open';
    // Hash-based fallback: #tickets-lookup
    if (window.location.hash === '#tickets-lookup') return 'lookup';
    return 'open';
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                'py-3 rounded-2xl text-sm font-semibold transition ' +
                (active
                    ? 'bg-[color:var(--surface-card-2)] text-[color:var(--text-1)]'
                    : 'text-muted-3 hover:text-[color:var(--text-1)]')
            }
        >
            {label}
        </button>
    );
}

function OpenForm() {
    const t = useT();
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setSubmitting(true);
        try {
            const res = await fetch('/api/support/ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    email:   String(f.get('email') ?? ''),
                    subject: String(f.get('subject') ?? ''),
                    message: String(f.get('message') ?? ''),
                    transaction_id: String(f.get('transaction_id') ?? '') || undefined,
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || 'fail');
            const portal = json.data?.portal_url;
            if (portal) router.visit(portal);
            else form.reset();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h3 className="text-xl font-bold">{t('help.open_form.title')}</h3>
            <p className="mt-1 text-sm text-muted-3">{t('help.open_form.subtitle')}</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-3.5" noValidate>
                <div className="grid sm:grid-cols-2 gap-3.5">
                    <div className="field">
                        <label className="field-label" htmlFor="op-email">{t('support.email')}</label>
                        <input id="op-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="op-tx">{t('support.tx_id')}</label>
                        <input id="op-tx" name="transaction_id" autoComplete="off" />
                    </div>
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="op-subject">{t('support.subject')}</label>
                    <input id="op-subject" name="subject" required maxLength={200} />
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="op-message">{t('support.message')}</label>
                    <textarea id="op-message" name="message" required rows={6} maxLength={5000} />
                </div>
                <button type="submit" disabled={submitting} className="cta mt-2 sm:max-w-xs">
                    {submitting ? <span className="spinner" /> : t('support.submit')}
                </button>
            </form>
        </div>
    );
}

function LookupForm() {
    const t = useT();
    const [submitting, setSubmitting] = useState(false);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSubmitting(true);
        router.post('/help/lookup', {
            email:     String(f.get('email') ?? ''),
            reference: String(f.get('reference') ?? ''),
        }, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <div>
            <h3 className="text-xl font-bold">{t('help.lookup.title')}</h3>
            <p className="mt-1 text-sm text-muted-3">{t('help.lookup.subtitle')}</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-3.5" noValidate>
                <div className="field">
                    <label className="field-label" htmlFor="lk-email">{t('help.lookup.email')}</label>
                    <input id="lk-email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="lk-ref">{t('help.lookup.reference')}</label>
                    <input id="lk-ref" name="reference" required maxLength={64} autoComplete="off" />
                </div>
                <button type="submit" disabled={submitting} className="cta mt-2 sm:max-w-xs">
                    {submitting ? <span className="spinner" /> : t('help.lookup.submit')}
                </button>
            </form>
        </div>
    );
}
