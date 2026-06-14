import { Head, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { BrowserFrame } from '@/components/preview/BrowserFrame';
import { Lightbox } from '@/components/preview/Lightbox';
import {
    ArrowRight, Check, ExternalLink, Shield, Bolt, Sparkles, Globe, Help,
} from '@/components/ui/Icons';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

const SHOT = (n: string) => `/preview-shots/${n}.png`;

interface DemoCred { url: string; email: string; password: string }
interface PageProps extends SharedProps {
    changenowAffiliateUrl: string;
    changenowApiDocsUrl: string;
    codecanyonUrl: string;
    demo: { admin: DemoCred | null; user: DemoCred | null };
}

type TLine = string;

export default function Preview() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const brand = props.brand.name;
    const buyUrl = props.codecanyonUrl;
    const affUrl = props.changenowAffiliateUrl;
    const apiUrl = props.changenowApiDocsUrl;

    return (
        <PublicLayout>
            <Head title={t('preview.meta_title', { brand })} />

            <Hero brand={brand} buyUrl={buyUrl} />
            <DemoCredentials demo={props.demo} />
            <TrustStrip />
            <WhatIsIt brand={brand} />
            <FeatureGrid />
            <VisualTour />
            <SwapFlow />
            <EarnSection affUrl={affUrl} />
            <ChangeNowSetup affUrl={affUrl} apiUrl={apiUrl} brand={brand} />
            <TechSpecs />
            <Faq />
            <FinalCta brand={brand} buyUrl={buyUrl} />
        </PublicLayout>
    );
}

// ─── HERO ────────────────────────────────────────────────────────────

function Hero({ brand, buyUrl }: { brand: string; buyUrl: string }) {
    const t = useT();
    const bullets = usePropArray<TLine>('preview.hero.bullets');
    return (
        <section className="relative pt-12 sm:pt-20 pb-10">
            <div className="container-edge grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-[color:var(--color-progress)] surface-card-2 border border-line-2 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-progress)]" />
                        {t('preview.eyebrow')}
                    </div>
                    <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[68px] font-extrabold tracking-tight leading-[1.04]">
                        <span className="text-[color:var(--text-1)] block">{t('preview.hero.title_a')}</span>
                        <span className="text-gradient-brand block">{t('preview.hero.title_b')}</span>
                        <span className="text-[color:var(--text-1)] block">{t('preview.hero.title_c')}</span>
                    </h1>
                    <p className="mt-5 text-lg text-muted-2 max-w-xl">
                        {t('preview.hero.body', { brand })}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <a href={buyUrl} target="_blank" rel="noopener noreferrer"
                           className="cta !w-auto px-7 inline-flex items-center gap-2">
                            <span>{t('preview.hero.buy')}</span>
                            <ArrowRight />
                        </a>
                        <a href="/" className="cta cta-ghost !w-auto px-6">{t('preview.hero.demo')}</a>
                    </div>

                    <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-2">
                        {bullets.map((b) => (
                            <li key={b} className="inline-flex items-center gap-1.5">
                                <Check width={14} height={14} className="text-[color:var(--color-brand-300)]" />
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative">
                    <div className="absolute -inset-12 -z-10"
                         style={{ background: 'radial-gradient(closest-side, rgba(191,241,90,.35), transparent 70%)', filter: 'blur(40px)' }} aria-hidden />
                    <BrowserFrame url={`${brand.toLowerCase()}.app`}>
                        <img
                            src={SHOT('home-hero')}
                            alt={`${brand} live homepage`}
                            className="block w-full h-auto"
                            loading="eager"
                        />
                    </BrowserFrame>
                </div>
            </div>
        </section>
    );
}

// ─── DEMO CREDENTIALS ─────────────────────────────────────────────────

function DemoCredentials({ demo }: { demo: { admin: DemoCred | null; user: DemoCred | null } }) {
    const t = useT();
    if (!demo.admin && !demo.user) return null;

    return (
        <section className="relative z-10 container-edge py-4">
            <div className="surface-card-2 border border-line-1 rounded-2xl px-5 sm:px-7 py-5 sm:py-6">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-[color:var(--color-progress)] mb-3">
                    <KeyIcon /> {t('preview.demo.eyebrow')}
                </div>
                <p className="text-sm text-muted-2 max-w-2xl mb-4">
                    {t('preview.demo.intro')}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    {demo.admin && <CredCard label={t('preview.demo.admin_label')} cred={demo.admin} />}
                    {demo.user  && <CredCard label={t('preview.demo.user_label')}  cred={demo.user} />}
                </div>
            </div>
        </section>
    );
}

function CredCard({ label, cred }: { label: string; cred: DemoCred }) {
    const t = useT();
    return (
        <div className="surface-card border border-line-1 rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-2 mb-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-3">{label}</div>
                <a href={cred.url} className="text-xs text-[color:var(--color-progress)] hover:underline font-medium">
                    {t('preview.demo.open_login')} →
                </a>
            </div>
            <CredField label={t('preview.demo.email')}    value={cred.email} />
            <CredField label={t('preview.demo.password')} value={cred.password} />
        </div>
    );
}

function CredField({ label, value }: { label: string; value: string }) {
    const t = useT();
    const copy = async () => {
        try { await navigator.clipboard.writeText(value); } catch { /* noop */ }
    };
    return (
        <div className="mt-2 first:mt-0 flex items-center gap-2 text-sm">
            <span className="text-muted-3 w-16 shrink-0">{label}</span>
            <code className="flex-1 font-mono text-[12px] truncate text-[color:var(--text-1)] bg-[color:var(--surface-page)] rounded-md px-2 py-1 border border-line-1">
                {value}
            </code>
            <button
                type="button"
                onClick={copy}
                aria-label={t('aria.copy')}
                className="text-muted-3 hover:text-[color:var(--text-1)] p-1.5 rounded-md hover:bg-[color:var(--surface-card-2)] transition"
            >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
            </button>
        </div>
    );
}

function KeyIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="8" cy="14" r="4" />
            <path d="M11 14h11l-3 3M19 17v-3" />
        </svg>
    );
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────

function TrustStrip() {
    const t = useT();
    const items = ['Laravel 12', 'React 19', 'Inertia v2', 'TypeScript', 'Tailwind v4', 'Horizon', 'Spatie', 'ChangeNOW v2'];
    return (
        <section className="relative z-10 container-edge py-6 sm:py-8">
            <div className="text-center text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-4">
                {t('preview.trust.kicker')}
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {items.map((s) => (
                    <span key={s} className="surface-card border border-line-1 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-2">
                        {s}
                    </span>
                ))}
            </div>
        </section>
    );
}

// ─── WHAT IS IT ──────────────────────────────────────────────────────

function WhatIsIt({ brand }: { brand: string }) {
    const t = useT();
    return (
        <section id="what-is-it" className="relative z-10 container-edge py-16">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-progress)] font-bold mb-2">{t('preview.what.eyebrow')}</div>
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                        {t('preview.what.title_a')}
                        <span className="text-gradient-brand"> {t('preview.what.title_b')}</span>
                        .
                    </h2>
                </div>
                <div className="space-y-7 text-muted-2 text-[17px] leading-relaxed">
                    <p>{t('preview.what.p1', { brand })}</p>
                    <p>{t('preview.what.p2')}</p>
                    <p>
                        {t('preview.what.p3_pre')}{' '}
                        <span className="text-[color:var(--text-1)] font-semibold">{t('preview.what.p3_emp')}</span>{' '}
                        {t('preview.what.p3_post')}
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─── FEATURE GRID ────────────────────────────────────────────────────

function FeatureGrid() {
    const t = useT();
    const cells: { key: string; icon: ReactNode }[] = [
        { key: 'instant',  icon: <Bolt /> },
        { key: 'noncust',  icon: <Shield /> },
        { key: 'limitdca', icon: <Sparkles /> },
        { key: 'ai',       icon: <Help /> },
        { key: 'langs',    icon: <Globe /> },
        { key: 'admin',    icon: <ChartIcon /> },
        { key: 'accounts', icon: <CardIcon /> },
        { key: 'help',     icon: <SearchIcon /> },
        { key: 'theme',    icon: <PaletteIcon /> },
    ];
    return (
        <section id="features" className="relative z-10 container-edge py-16">
            <SectionHeader eyebrow={t('preview.features.eyebrow')} title={t('preview.features.title')} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                {cells.map((c) => (
                    <article key={c.key} className="surface-card rounded-2xl border border-line-1 p-6">
                        <span className="w-11 h-11 rounded-xl grid place-items-center bg-[color:var(--surface-card-2)] border border-line-2 text-[color:var(--color-brand-300)]">
                            {c.icon}
                        </span>
                        <h3 className="mt-4 font-bold text-lg text-[color:var(--text-1)]">{t(`preview.features.${c.key}.t`)}</h3>
                        <p className="mt-1.5 text-sm text-muted-3 leading-relaxed">{t(`preview.features.${c.key}.d`)}</p>
                    </article>
                ))}
            </div>
        </section>
    );
}

// ─── VISUAL TOUR ─────────────────────────────────────────────────────

function VisualTour() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const brand = props.brand.name.toLowerCase();
    const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

    const tour: { url: string; key: string; shot: string }[] = [
        { url: `${brand}.app`,                              key: 'exchange', shot: 'home-hero' },
        { url: `${brand}.app/#features`,                    key: 'deposit',  shot: 'home-features' },
        { url: `${brand}.app/admin`,                        key: 'admin',    shot: 'admin-dashboard' },
        { url: `${brand}.app/admin/transactions`,           key: 'account',  shot: 'admin-transactions' },
        { url: `${brand}.app/admin/content`,                key: 'content',  shot: 'admin-content' },
        { url: `${brand}.app/admin/pages/1/edit`,           key: 'pages',    shot: 'admin-page-editor' },
        { url: `${brand}.app/help`,                         key: 'help',     shot: 'help-center' },
        { url: `${brand}.app/help/article/floating-vs-fixed`, key: 'ai',     shot: 'help-article' },
    ];

    const slides = tour.map((s) => ({
        src: SHOT(s.shot),
        title: t(`preview.tour.stops.${s.key}.t`),
        caption: t(`preview.tour.stops.${s.key}.d`),
    }));

    return (
        <section id="tour" className="relative z-10 container-edge py-16">
            <SectionHeader eyebrow={t('preview.tour.eyebrow')} title={t('preview.tour.title')} />
            <div className="mt-10 space-y-16">
                {tour.map((stop, i) => (
                    <div key={stop.key} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                        <button
                            type="button"
                            onClick={() => setLightbox({ open: true, index: i })}
                            className="group block w-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-300)] focus-visible:ring-offset-2"
                            aria-label={t('preview.tour.open_aria', { title: slides[i].title })}
                        >
                            <BrowserFrame url={stop.url}>
                                <div className="relative">
                                    <img
                                        src={SHOT(stop.shot)}
                                        alt={slides[i].title}
                                        loading="lazy"
                                        className="block w-full h-auto group-hover:opacity-95 transition"
                                    />
                                    <span className="pointer-events-none absolute inset-0 grid place-items-end p-3 opacity-0 group-hover:opacity-100 transition">
                                        <span className="inline-flex items-center gap-1.5 bg-black/65 backdrop-blur-sm text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                            <ExpandIcon /> {t('preview.tour.view_full')}
                                        </span>
                                    </span>
                                </div>
                            </BrowserFrame>
                        </button>
                        <div>
                            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-progress)] font-bold">
                                {t('preview.tour.index_label', { n: i + 1 })}
                            </div>
                            <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                                {t(`preview.tour.stops.${stop.key}.t`)}
                            </h3>
                            <p className="mt-3 text-muted-2 text-[17px] leading-relaxed max-w-md">
                                {t(`preview.tour.stops.${stop.key}.d`)}
                            </p>
                            <button
                                type="button"
                                onClick={() => setLightbox({ open: true, index: i })}
                                className="mt-5 cta cta-ghost !w-auto px-5 !py-2 !text-sm inline-flex items-center gap-2"
                            >
                                <ExpandIcon /> {t('preview.tour.open_full')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Lightbox
                open={lightbox.open}
                index={lightbox.index}
                onIndexChange={(i) => setLightbox((s) => ({ ...s, index: i }))}
                onClose={() => setLightbox((s) => ({ ...s, open: false }))}
                slides={slides}
            />
        </section>
    );
}

function ExpandIcon() {
    return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
    );
}

// ─── SWAP FLOW ───────────────────────────────────────────────────────

function SwapFlow() {
    const t = useT();
    const steps = usePropArray<{ t: string; d: string }>('preview.flow.steps');
    return (
        <section className="relative z-10 container-edge py-16">
            <SectionHeader eyebrow={t('preview.flow.eyebrow')} title={t('preview.flow.title')} />
            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
                {steps.map((s, i) => (
                    <li key={i}>
                        <div className="text-[64px] leading-none font-bold text-[color:var(--color-progress)] tabular-nums">{i + 1}</div>
                        <h4 className="mt-4 font-bold text-lg text-[color:var(--text-1)]">{s.t}</h4>
                        <p className="mt-2 text-[15px] leading-relaxed text-muted-2 max-w-[28ch]">{s.d}</p>
                    </li>
                ))}
            </ol>
        </section>
    );
}

// ─── EARN SECTION ────────────────────────────────────────────────────

function EarnSection({ affUrl }: { affUrl: string }) {
    const t = useT();
    const bullets = usePropArray<TLine>('preview.earn.bullets');
    const tiers   = usePropArray<{ volume: string; commission: string; range: string }>('preview.earn.tiers');
    return (
        <section id="earn" className="relative z-10 container-edge py-16">
            <div className="surface-card rounded-[28px] border border-line-1 shadow-[var(--shadow-card)] p-7 sm:p-10">
                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
                    <div>
                        <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-progress)] font-bold">{t('preview.earn.eyebrow')}</div>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                            {t('preview.earn.title_a')}{' '}
                            <span className="text-gradient-brand">{t('preview.earn.title_b')}</span>{' '}
                            {t('preview.earn.title_c')}
                        </h2>
                        <p className="mt-4 text-muted-2 leading-relaxed">
                            {t('preview.earn.body_pre')}{' '}
                            <span className="text-[color:var(--text-1)] font-semibold">{t('preview.earn.body_emp')}</span>{' '}
                            {t('preview.earn.body_post')}
                        </p>
                        <ul className="mt-5 space-y-2 text-sm text-muted-2">
                            {bullets.map((l) => (
                                <li key={l} className="flex items-start gap-2">
                                    <Check width={16} height={16} className="text-[color:var(--color-brand-300)] mt-0.5 shrink-0" />
                                    <span>{l}</span>
                                </li>
                            ))}
                        </ul>
                        <a href={affUrl} target="_blank" rel="noopener noreferrer" className="cta !w-auto px-6 mt-7 inline-flex items-center gap-2">
                            <span>{t('preview.earn.open_portal')}</span>
                            <ExternalLink width={14} height={14} />
                        </a>
                    </div>

                    <div className="surface-card-2 rounded-[24px] border border-line-1 overflow-hidden">
                        <div className="px-5 py-3 border-b border-line-1 text-[11px] uppercase tracking-wider text-muted-3 font-semibold flex justify-between">
                            <span>{t('preview.earn.table_col_volume')}</span>
                            <span>{t('preview.earn.table_col_commission')}</span>
                        </div>
                        {tiers.map((r, i) => (
                            <div key={r.volume} className={`px-5 py-4 grid grid-cols-[1fr_auto_auto] items-center gap-4 ${i ? 'border-t border-line-1' : ''}`}>
                                <div>
                                    <div className="text-lg font-bold tabular-nums">{r.volume}</div>
                                    <div className="text-[11px] text-muted-3 capitalize">{r.range}</div>
                                </div>
                                <ArrowRight className="text-muted-3 shrink-0" width={16} height={16} />
                                <div className="text-lg font-bold text-gradient-brand tabular-nums text-right">{r.commission}</div>
                            </div>
                        ))}
                        <div className="px-5 py-3 text-[11px] text-muted-3 border-t border-line-1">
                            {t('preview.earn.disclaimer')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── CHANGENOW SETUP ─────────────────────────────────────────────────

function ChangeNowSetup({ affUrl, apiUrl, brand }: { affUrl: string; apiUrl: string; brand: string }) {
    const t = useT();
    const steps = usePropArray<{ t: string; d: string }>('preview.setup.steps');
    return (
        <section id="setup" className="relative z-10 container-edge py-16">
            <SectionHeader eyebrow={t('preview.setup.eyebrow')} title={t('preview.setup.title')} />
            <p className="mt-3 text-center text-muted-2 max-w-2xl mx-auto">
                {t('preview.setup.intro_pre')}{' '}
                <span className="text-[color:var(--text-1)] font-semibold">{t('preview.setup.intro_emp')}</span>{' '}
                {t('preview.setup.intro_post')}
            </p>
            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {steps.map((s, i) => (
                    <li key={i} className="surface-card rounded-2xl border border-line-1 p-6">
                        <div className="w-9 h-9 rounded-full grid place-items-center font-bold bg-[color:var(--surface-card-2)] border border-line-2 text-[color:var(--color-brand-300)]">{i + 1}</div>
                        <h4 className="mt-4 font-bold text-[color:var(--text-1)] leading-snug">{s.t}</h4>
                        <p className="mt-2 text-sm text-muted-3 leading-relaxed">{replaceBrand(s.d, brand)}</p>
                    </li>
                ))}
            </ol>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href={affUrl} target="_blank" rel="noopener noreferrer" className="cta !w-auto px-6">{t('preview.setup.open_portal')}</a>
                <a href={apiUrl} target="_blank" rel="noopener noreferrer" className="cta cta-ghost !w-auto px-6">{t('preview.setup.read_docs')}</a>
            </div>
        </section>
    );
}

// ─── TECH SPECS ──────────────────────────────────────────────────────

function TechSpecs() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const keys = ['server', 'frontend', 'includes', 'compatible'] as const;
    return (
        <section id="specs" className="relative z-10 container-edge py-16">
            <SectionHeader eyebrow={t('preview.specs.eyebrow')} title={t('preview.specs.title')} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                {keys.map((k) => {
                    const items = usePropArrayFrom<TLine>(props.i18n.messages, `preview.specs.groups.${k}.items`);
                    return (
                        <div key={k} className="surface-card rounded-2xl border border-line-1 p-6">
                            <h3 className="font-bold text-[color:var(--text-1)]">{t(`preview.specs.groups.${k}.title`)}</h3>
                            <ul className="mt-3 space-y-2 text-sm text-muted-2">
                                {items.map((it) => (
                                    <li key={it} className="flex items-start gap-2">
                                        <Check width={14} height={14} className="text-[color:var(--color-brand-300)] mt-0.5 shrink-0" />
                                        <span>{it}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ─── FAQ ─────────────────────────────────────────────────────────────

function Faq() {
    const t = useT();
    const items = usePropArray<{ q: string; a: string }>('preview.faq.items');
    return (
        <section id="faq" className="relative z-10 container-edge py-16 max-w-3xl">
            <SectionHeader eyebrow={t('preview.faq.eyebrow')} title={t('preview.faq.title')} />
            <div className="mt-8 space-y-3">
                {items.map((it) => (
                    <details key={it.q} className="surface-card rounded-2xl border border-line-1 overflow-hidden group">
                        <summary className="px-5 py-4 cursor-pointer font-medium text-[color:var(--text-1)] flex items-center justify-between gap-3 list-none">
                            <span>{it.q}</span>
                            <span aria-hidden className="text-muted-3 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                        </summary>
                        <p className="px-5 pb-5 text-sm text-muted-2 leading-relaxed">{it.a}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}

// ─── FINAL CTA ───────────────────────────────────────────────────────

function FinalCta({ brand, buyUrl }: { brand: string; buyUrl: string }) {
    const t = useT();
    return (
        <section className="relative z-10 container-edge py-16">
            <div className="relative overflow-hidden rounded-[32px] surface-card border border-line-1 shadow-[var(--shadow-card)] p-10 sm:p-14 text-center">
                <div aria-hidden className="absolute inset-0 pointer-events-none"
                     style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(191, 241, 90, 0.22), transparent 70%)' }} />
                <div className="relative">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                        <span className="text-[color:var(--text-1)]">{t('preview.cta.title_a')} </span>
                        <span className="text-gradient-brand">{t('preview.cta.title_b')}</span>
                    </h2>
                    <p className="mt-4 text-muted-2 text-base sm:text-lg max-w-xl mx-auto">
                        {t('preview.cta.body', { brand })}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="cta !w-auto px-7 inline-flex items-center gap-2">
                            <span>{t('preview.hero.buy')}</span>
                            <ArrowRight />
                        </a>
                        <a href="/" className="cta cta-ghost !w-auto px-6">{t('preview.hero.demo')}</a>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── HELPERS ────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="text-center">
            <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-progress)] font-bold">{eyebrow}</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{title}</h2>
        </div>
    );
}

/** Pluck an array-typed translation node from shared i18n messages. */
function usePropArray<T>(path: string): T[] {
    const { props } = usePage<SharedProps>();
    return usePropArrayFrom<T>(props.i18n.messages, path);
}
function usePropArrayFrom<T>(messages: unknown, path: string): T[] {
    let cur: unknown = messages;
    for (const key of path.split('.')) {
        if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
            cur = (cur as Record<string, unknown>)[key];
        } else return [];
    }
    return Array.isArray(cur) ? (cur as T[]) : [];
}

function replaceBrand(str: string, brand: string): string {
    return str.replaceAll(':brand', brand);
}

// ─── Icons (kept local to avoid bloating global Icons) ──────────────

function ChartIcon() {
    return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-7"/></svg>;
}
function CardIcon() {
    return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>;
}
function SearchIcon() {
    return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
}
function PaletteIcon() {
    return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21a9 9 0 1 1 9-9c0 3-3 3-5 3h-2a3 3 0 0 0-2 5c0 1-1 1-2 1z"/><circle cx="7" cy="11" r="1.3"/><circle cx="10" cy="7" r="1.3"/><circle cx="15" cy="7" r="1.3"/><circle cx="18" cy="11" r="1.3"/></svg>;
}
