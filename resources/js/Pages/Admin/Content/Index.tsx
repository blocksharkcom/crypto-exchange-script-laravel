import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { useT } from '@/lib/i18n';

type SectionKey = 'highlights' | 'reviews' | 'stats' | 'how_it_works';

interface SectionRow {
    key: SectionKey;
}

interface Props {
    sections: SectionRow[];
}

export default function ContentIndex({ sections }: Props) {
    const t = useT();

    return (
        <AdminLayout
            title={t('admin.content.index_title')}
            subtitle={t('admin.content.index_subtitle')}
        >
            <Head title={t('admin.content.index_title')} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((s) => (
                    <Link
                        key={s.key}
                        href={route('admin.content.edit', s.key)}
                        className="surface-card border border-line-1 rounded-xl p-5 hover:border-line-3 transition group flex flex-col"
                    >
                        <h3 className="text-base font-semibold text-[color:var(--text-1)] group-hover:text-[color:var(--color-brand-300)]">
                            {t(`admin.content.sections.${s.key}.title`)}
                        </h3>
                        <p className="mt-1 text-sm text-muted-3 leading-relaxed">
                            {t(`admin.content.sections.${s.key}.desc`)}
                        </p>
                        <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-300)]">
                            {t('admin.content.open')} →
                        </span>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
}
