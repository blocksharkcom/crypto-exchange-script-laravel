import { Head, Link, usePage } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { CategoryIcon } from '@/components/help/CategoryIcon';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icons';
import type { SharedProps } from '@/Types';

interface ArticleSummary { slug: string; title: string; summary: string; }
interface PageProps extends SharedProps {
    category: { slug: string; title: string; desc: string; icon: string; count: number };
    articles: ArticleSummary[];
}

export default function HelpCategory() {
    const { props } = usePage<PageProps>();
    const { category, articles } = props;

    return (
        <PublicLayout>
            <Head title={category.title} />

            <section className="relative pt-10 pb-4">
                <div className="container-edge max-w-3xl">
                    <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-muted-3 hover:text-[color:var(--text-1)] transition">
                        <ChevronLeft width={16} height={16} /> Help center
                    </Link>

                    <div className="mt-6 flex items-start gap-4">
                        <span className="w-14 h-14 rounded-2xl grid place-items-center surface-card-2 border border-line-2 text-[color:var(--color-brand-300)] shrink-0">
                            <CategoryIcon name={category.icon} size={28} />
                        </span>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{category.title}</h1>
                            <p className="mt-1 text-muted-2">{category.desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 container-edge max-w-3xl py-8">
                <ul className="space-y-2">
                    {articles.map((a) => (
                        <li key={a.slug}>
                            <Link
                                href={`/help/article/${a.slug}`}
                                className="group block surface-card rounded-xl border border-line-1 px-5 py-4 hover:border-line-3 transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-[color:var(--text-1)] leading-snug">{a.title}</h2>
                                        <p className="mt-1 text-sm text-muted-3 line-clamp-2">{a.summary}</p>
                                    </div>
                                    <ChevronRight className="text-muted-3 shrink-0 group-hover:text-[color:var(--text-1)] transition" />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </PublicLayout>
    );
}
