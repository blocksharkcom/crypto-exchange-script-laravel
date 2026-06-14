import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { renderMarkdown } from '@/lib/markdown';

interface Page {
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    updated_at: string | null;
}

interface Props {
    page: Page;
}

export default function PageView({ page }: Props) {
    return (
        <PublicLayout>
            <Head title={page.title} />

            <article className="container-edge py-12 sm:py-16">
                <header className="max-w-3xl mx-auto mb-8 sm:mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[color:var(--text-1)]">
                        {page.title}
                    </h1>
                    {page.excerpt && (
                        <p className="mt-4 text-base sm:text-lg text-muted-2 leading-relaxed">
                            {page.excerpt}
                        </p>
                    )}
                </header>

                <div
                    className="prose-help max-w-3xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
                />
            </article>
        </PublicLayout>
    );
}
