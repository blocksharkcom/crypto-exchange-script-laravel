import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface PageData {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    status: 'draft' | 'published';
    show_in_header: boolean;
    show_in_footer: boolean;
    sort_order: number;
    public_url: string | null;
}

interface Translation { title: string; excerpt: string | null; body: string }

interface Props {
    page: PageData | null;
    locales: string[];
    translations: Record<string, Translation>;
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120);
}

export default function PagesEdit({ page, locales, translations }: Props) {
    const t = useT();
    const isCreate = page === null;
    const supported = locales.length > 0 ? locales : ['en'];
    const [activeLocale, setActiveLocale] = useState<string>(supported[0]);

    // Seed translations for every supported locale so the form always has a slot.
    const seededTranslations: Record<string, Translation> = (() => {
        const out: Record<string, Translation> = {};
        supported.forEach((loc) => {
            out[loc] = translations[loc] ?? {
                title:   loc === supported[0] ? page?.title ?? '' : '',
                excerpt: null,
                body:    loc === supported[0] ? page?.body  ?? '' : '',
            };
        });
        return out;
    })();

    const form = useForm({
        title:          page?.title ?? '',
        slug:           page?.slug ?? '',
        excerpt:        page?.excerpt ?? '',
        body:           page?.body ?? '',
        status:         page?.status ?? 'draft',
        show_in_header: page?.show_in_header ?? false,
        show_in_footer: page?.show_in_footer ?? false,
        sort_order:     page?.sort_order ?? 0,
        translations:   seededTranslations,
    });

    const activeTranslation = form.data.translations[activeLocale] ?? { title: '', excerpt: null, body: '' };

    function updateTranslation(loc: string, patch: Partial<Translation>): void {
        const next = { ...form.data.translations, [loc]: { ...form.data.translations[loc], ...patch } };
        form.setData('translations', next);
        // Mirror the default-locale fields into the top-level slug/title/body fields so
        // existing pages keep working when no translation row exists yet.
        if (loc === supported[0]) {
            if (patch.title   !== undefined) form.setData('title',   patch.title);
            if (patch.excerpt !== undefined) form.setData('excerpt', patch.excerpt ?? '');
            if (patch.body    !== undefined) form.setData('body',    patch.body);
        }
    }

    // Slug auto-syncs from title until the user edits the slug manually.
    const slugLinkedRef = useRef<boolean>(isCreate);

    function onTitleChange(v: string): void {
        // Update the active locale's translation
        updateTranslation(activeLocale, { title: v });
        // Slug auto-derives from the default-locale title only
        if (activeLocale === supported[0] && slugLinkedRef.current) {
            form.setData('slug', slugify(v));
        }
    }

    function onSlugChange(v: string): void {
        slugLinkedRef.current = false;
        form.setData('slug', slugify(v));
    }

    function submit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        if (isCreate) {
            form.post(route('admin.pages.store'));
        } else if (page) {
            form.put(route('admin.pages.update', page.id));
        }
    }

    const [copied, setCopied] = useState<boolean>(false);
    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(id);
    }, [copied]);

    function copyPublicUrl(): void {
        if (!page?.public_url) return;
        navigator.clipboard.writeText(page.public_url).then(() => setCopied(true)).catch(() => undefined);
    }

    return (
        <AdminLayout
            title={isCreate ? t('admin.pages.create_title') : t('admin.pages.edit_title')}
            subtitle={isCreate ? undefined : page?.title}
        >
            <Head title={isCreate ? t('admin.pages.create_title') : t('admin.pages.edit_title')} />

            <form onSubmit={submit} className="grid lg:grid-cols-[1fr_320px] gap-4">
                <div className="grid gap-4">
                    {supported.length > 1 && (
                        <div className="flex items-center gap-1 surface-card border border-line-1 rounded-full p-1 w-fit">
                            {supported.map((loc) => {
                                const tr = form.data.translations[loc];
                                const filled = (tr?.title ?? '').trim() !== '' || (tr?.body ?? '').trim() !== '';
                                return (
                                    <button
                                        key={loc}
                                        type="button"
                                        onClick={() => setActiveLocale(loc)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-xs font-bold uppercase transition inline-flex items-center gap-1.5',
                                            activeLocale === loc
                                                ? 'bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)]'
                                                : 'text-muted-2 hover:text-[color:var(--text-1)]',
                                        )}
                                    >
                                        {loc.toUpperCase()}
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'inline-block w-1.5 h-1.5 rounded-full',
                                                filled ? 'bg-[color:var(--color-brand-700)]' : 'bg-[color:var(--line-3)]',
                                            )}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="surface-card border border-line-1 rounded-xl p-5 grid gap-4">
                        <Field
                            label={t('admin.pages.title_field')}
                            value={activeTranslation.title}
                            onChange={onTitleChange}
                            error={form.errors.title}
                        />
                        <Field
                            label={t('admin.pages.slug_field')}
                            value={form.data.slug}
                            onChange={onSlugChange}
                            error={form.errors.slug}
                            mono
                            hint={t('admin.pages.slug_hint')}
                        />
                        <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.pages.excerpt')}
                            </label>
                            <textarea
                                value={activeTranslation.excerpt ?? ''}
                                onChange={(e) => updateTranslation(activeLocale, { excerpt: e.target.value.slice(0, 300) })}
                                rows={2}
                                maxLength={300}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm resize-y"
                            />
                            <p className="mt-1 text-xs text-muted-3">{t('admin.pages.excerpt_hint')}</p>
                            {form.errors.excerpt && <p className="mt-1 text-xs text-rose-400">{form.errors.excerpt}</p>}
                        </div>
                    </div>

                    <div className="surface-card border border-line-1 rounded-xl p-5">
                        <MarkdownEditor
                            label={t('admin.pages.body')}
                            value={activeTranslation.body}
                            onChange={(v) => updateTranslation(activeLocale, { body: v })}
                            rows={22}
                            placeholder="Write in Markdown. Use the toolbar or type `**bold**`, `## heading`, `- list`."
                            error={form.errors.body}
                        />
                        <p className="mt-1.5 text-xs text-muted-3">{t('admin.pages.body_hint')}</p>
                    </div>
                </div>

                <aside className="grid gap-4 h-fit">
                    <div className="surface-card border border-line-1 rounded-xl p-5 grid gap-4">
                        <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.pages.status')}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['draft', 'published'] as const).map((opt) => (
                                    <label
                                        key={opt}
                                        className={cn(
                                            'cursor-pointer surface-input border rounded-lg px-3 py-2 text-center text-sm',
                                            form.data.status === opt
                                                ? 'border-[color:var(--color-brand-300)] text-[color:var(--text-1)] font-semibold'
                                                : 'border-line-1 text-muted-2',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={opt}
                                            checked={form.data.status === opt}
                                            onChange={() => form.setData('status', opt)}
                                            className="sr-only"
                                        />
                                        {t(`admin.pages.status_${opt}`)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Toggle
                            label={t('admin.pages.show_in_header')}
                            checked={form.data.show_in_header}
                            onChange={(v) => form.setData('show_in_header', v)}
                        />
                        <Toggle
                            label={t('admin.pages.show_in_footer')}
                            checked={form.data.show_in_footer}
                            onChange={(v) => form.setData('show_in_footer', v)}
                        />

                        <div>
                            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                {t('admin.pages.sort_order')}
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={9999}
                                value={form.data.sort_order}
                                onChange={(e) => form.setData('sort_order', Number(e.target.value) || 0)}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                            />
                            <p className="mt-1 text-xs text-muted-3">{t('admin.pages.sort_hint')}</p>
                        </div>
                    </div>

                    {!isCreate && page?.public_url && (
                        <div className="surface-card border border-line-1 rounded-xl p-5">
                            <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                {t('admin.pages.public_url')}
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={page.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-muted-2 hover:text-[color:var(--text-1)] truncate flex-1"
                                >
                                    {page.public_url}
                                </a>
                                <button
                                    type="button"
                                    onClick={copyPublicUrl}
                                    className="px-2 py-1 rounded surface-card-2 border border-line-2 text-[11px] font-semibold"
                                >
                                    {copied ? t('admin.common.copied') : t('admin.pages.copy_url')}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="surface-card border border-line-1 rounded-xl p-5 flex items-center justify-end gap-2">
                        <Link
                            href={route('admin.pages.index')}
                            className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-muted-2"
                        >
                            {t('admin.common.cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="cta !py-1.5 !px-3 !text-sm disabled:opacity-50"
                        >
                            {form.processing ? <span className="spinner" /> : t('admin.common.save')}
                        </button>
                    </div>
                </aside>
            </form>
        </AdminLayout>
    );
}

function Field({
    label, value, onChange, type, error, mono, hint,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    error?: string;
    mono?: boolean;
    hint?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">{label}</label>
            <input
                type={type ?? 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    'surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm',
                    mono && 'font-mono',
                )}
            />
            {hint && <p className="mt-1 text-xs text-muted-3">{hint}</p>}
            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <label className="flex items-center justify-between gap-3 surface-input border border-line-1 rounded-lg px-3 py-2 cursor-pointer">
            <span className="text-sm">{label}</span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="accent-[color:var(--color-brand-300)] w-4 h-4"
            />
        </label>
    );
}
