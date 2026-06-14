import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icons';
import { renderMarkdown } from '@/lib/markdown';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

interface PageProps extends SharedProps {
    article: {
        slug: string;
        title: string;
        summary: string;
        body: string;
        category: { slug: string; title: string; icon: string };
    };
    related: { slug: string; title: string; summary: string }[];
}

export default function HelpArticle() {
    const t = useT();
    const { props } = usePage<PageProps>();
    const { article, related } = props;

    return (
        <PublicLayout>
            <Head title={article.title} />

            <section className="relative pt-10 pb-4">
                <div className="container-edge max-w-3xl">
                    <Link href={`/help/category/${article.category.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted-3 hover:text-[color:var(--text-1)] transition">
                        <ChevronLeft width={16} height={16} /> {article.category.title}
                    </Link>
                </div>
            </section>

            <article className="relative z-10 container-edge max-w-3xl py-6">
                <header>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        {article.title}
                    </h1>
                    <p className="mt-4 text-lg text-muted-2 max-w-2xl">{article.summary}</p>
                </header>

                <div
                    className="prose-help mt-10"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body) }}
                />

                <div className="mt-12 rounded-2xl surface-card-2 border border-line-1 p-5 flex items-start gap-4">
                    <span aria-hidden className="w-10 h-10 rounded-full grid place-items-center bg-[color:var(--surface-card)] border border-line-2 text-[color:var(--color-brand-300)] shrink-0">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 14.6-8.9A8.4 8.4 0 0 1 21 11.5z" />
                        </svg>
                    </span>
                    <div className="flex-1">
                        <h2 className="font-semibold text-[color:var(--text-1)]">{t('help_extra.article.still_stuck_title')}</h2>
                        <p className="mt-1 text-sm text-muted-2">{t('help_extra.article.still_stuck_body')}</p>
                    </div>
                    <Link href="/help?tab=open#tickets" className="cta !w-auto px-5 !py-2.5 !text-sm shrink-0">{t('help_extra.article.open_ticket_btn')}</Link>
                </div>
            </article>

            {related.length > 0 && (
                <section className="relative z-10 container-edge max-w-3xl py-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-5">{t('help_extra.article.related')}</h2>
                    <ul className="space-y-2">
                        {related.map((a) => (
                            <li key={a.slug}>
                                <Link
                                    href={`/help/article/${a.slug}`}
                                    className="group block surface-card rounded-xl border border-line-1 px-5 py-4 hover:border-line-3 transition"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-[color:var(--text-1)] leading-snug">{a.title}</h3>
                                            <p className="mt-0.5 text-sm text-muted-3 line-clamp-1">{a.summary}</p>
                                        </div>
                                        <ChevronRight className="text-muted-3 shrink-0 group-hover:text-[color:var(--text-1)] transition" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </PublicLayout>
    );
}
