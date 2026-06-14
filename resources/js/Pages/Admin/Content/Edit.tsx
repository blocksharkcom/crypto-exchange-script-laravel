import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { HighlightItem, HowItem, ReviewItem, StatItem } from '@/Types';

type SectionKey = 'highlights' | 'reviews' | 'stats' | 'how_it_works';
type Locale = 'en' | 'es' | 'de' | 'fr';

interface HighlightsData { since: number; items: HighlightItem[] }
interface ReviewsData    { items: ReviewItem[] }
interface HowData        { items: HowItem[] }
type StatsData           = StatItem[];

type SectionData = HighlightsData | ReviewsData | StatsData | HowData;

interface Props {
    sectionKey: SectionKey;
    locales: Locale[];
    data: Record<Locale, SectionData>;
    defaults: SectionData;
}

export default function ContentEdit({ sectionKey, locales, data }: Props) {
    const t = useT();
    const [activeLocale, setActiveLocale] = useState<Locale>(locales[0] ?? 'en');

    return (
        <AdminLayout
            title={t(`admin.content.sections.${sectionKey}.title`)}
            subtitle={t(`admin.content.sections.${sectionKey}.desc`)}
            actions={
                <Link
                    href={route('admin.content.index')}
                    className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-muted-2"
                >
                    {t('admin.content.back_to_list')}
                </Link>
            }
        >
            <Head title={t('admin.content.edit_title')} />

            <div className="surface-card border border-line-1 rounded-xl">
                <div className="border-b border-line-1 px-4 pt-3 flex gap-1 flex-wrap">
                    {locales.map((loc) => (
                        <button
                            key={loc}
                            type="button"
                            onClick={() => setActiveLocale(loc)}
                            className={cn(
                                'px-3 py-2 rounded-t-lg text-sm font-semibold border-b-2 transition',
                                activeLocale === loc
                                    ? 'border-[color:var(--color-brand-300)] text-[color:var(--text-1)]'
                                    : 'border-transparent text-muted-3 hover:text-[color:var(--text-1)]',
                            )}
                        >
                            {t(`admin.content.locale_tabs.${loc}`)}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    <LocaleForm
                        key={`${sectionKey}-${activeLocale}`}
                        sectionKey={sectionKey}
                        locale={activeLocale}
                        initial={data[activeLocale]}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}

interface LocaleFormProps {
    sectionKey: SectionKey;
    locale: Locale;
    initial: SectionData;
}

function LocaleForm({ sectionKey, locale, initial }: LocaleFormProps) {
    const t = useT();

    const form = useForm<{ locale: Locale; data: SectionData }>({
        locale,
        data: initial,
    });

    function submit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        form.post(route('admin.content.update', sectionKey), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                router.reload({ only: ['data'] });
            },
        });
    }

    return (
        <form onSubmit={submit} className="grid gap-5">
            {sectionKey === 'highlights' && (
                <HighlightsEditor
                    value={form.data.data as HighlightsData}
                    onChange={(v) => form.setData('data', v)}
                    errors={form.errors}
                />
            )}
            {sectionKey === 'reviews' && (
                <ReviewsEditor
                    value={form.data.data as ReviewsData}
                    onChange={(v) => form.setData('data', v)}
                    errors={form.errors}
                />
            )}
            {sectionKey === 'stats' && (
                <StatsEditor
                    value={form.data.data as StatsData}
                    onChange={(v) => form.setData('data', v)}
                    errors={form.errors}
                />
            )}
            {sectionKey === 'how_it_works' && (
                <HowEditor
                    value={form.data.data as HowData}
                    onChange={(v) => form.setData('data', v)}
                    errors={form.errors}
                />
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-1">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="cta !py-1.5 !px-3 !text-sm disabled:opacity-50"
                >
                    {form.processing ? <span className="spinner" /> : t('admin.content.save')}
                </button>
            </div>
        </form>
    );
}

type FormErrors = Record<string, string>;

/* --------- Highlights --------- */

function HighlightsEditor({
    value, onChange, errors,
}: {
    value: HighlightsData;
    onChange: (v: HighlightsData) => void;
    errors: FormErrors;
}) {
    const t = useT();
    const items = Array.isArray(value.items) ? value.items : [];

    function setItem(i: number, patch: Partial<HighlightItem>): void {
        const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
        onChange({ ...value, items: next });
    }

    return (
        <div className="grid gap-5">
            <FieldRow label={t('admin.content.since')} error={errors['data.since']}>
                <input
                    type="number"
                    min={2000}
                    max={2100}
                    value={value.since ?? 2024}
                    onChange={(e) => onChange({ ...value, since: Number(e.target.value) || 2024 })}
                    className="surface-input border border-line-1 rounded-lg px-3 py-2 w-32 text-sm"
                />
            </FieldRow>

            <div className="grid gap-4">
                {items.map((item, i) => (
                    <div key={i} className="surface-card-2 border border-line-1 rounded-lg p-4 grid gap-3">
                        <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold">
                            #{i + 1}
                        </div>
                        <FieldRow label={t('admin.content.title_field')} error={errors[`data.items.${i}.title`]}>
                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => setItem(i, { title: e.target.value })}
                                maxLength={200}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                            />
                        </FieldRow>
                        <FieldRow label={t('admin.content.desc_field')} error={errors[`data.items.${i}.desc`]}>
                            <textarea
                                value={item.desc}
                                onChange={(e) => setItem(i, { desc: e.target.value })}
                                rows={2}
                                maxLength={500}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm resize-y"
                            />
                        </FieldRow>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* --------- Reviews --------- */

function ReviewsEditor({
    value, onChange, errors,
}: {
    value: ReviewsData;
    onChange: (v: ReviewsData) => void;
    errors: FormErrors;
}) {
    const t = useT();
    const items = Array.isArray(value.items) ? value.items : [];

    function setItem(i: number, patch: Partial<ReviewItem>): void {
        const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
        onChange({ items: next });
    }
    function add(): void {
        onChange({ items: [...items, { name: '', rating: 5, body: '' }] });
    }
    function remove(i: number): void {
        onChange({ items: items.filter((_, idx) => idx !== i) });
    }

    return (
        <div className="grid gap-4">
            {items.map((item, i) => (
                <div key={i} className="surface-card-2 border border-line-1 rounded-lg p-4 grid gap-3">
                    <div className="flex items-center justify-between">
                        <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold">
                            #{i + 1}
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                        >
                            × {t('admin.content.remove_item')}
                        </button>
                    </div>
                    <FieldRow label={t('admin.content.name')} error={errors[`data.items.${i}.name`]}>
                        <input
                            type="text"
                            value={item.name}
                            onChange={(e) => setItem(i, { name: e.target.value })}
                            maxLength={80}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </FieldRow>
                    <FieldRow label={t('admin.content.rating')} error={errors[`data.items.${i}.rating`]}>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={5}
                                step={1}
                                value={item.rating}
                                onChange={(e) => {
                                    const n = Math.max(1, Math.min(5, Number(e.target.value) || 5));
                                    setItem(i, { rating: n });
                                }}
                                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-20 text-sm"
                            />
                            <span className="text-xs text-muted-3">/ 5</span>
                        </div>
                    </FieldRow>
                    <FieldRow label={t('admin.content.body')} error={errors[`data.items.${i}.body`]}>
                        <textarea
                            value={item.body}
                            onChange={(e) => setItem(i, { body: e.target.value })}
                            rows={3}
                            maxLength={600}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm resize-y"
                        />
                    </FieldRow>
                </div>
            ))}

            <button
                type="button"
                onClick={add}
                className="px-3 py-2 rounded-lg border border-dashed border-line-2 text-sm font-semibold text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3"
            >
                + {t('admin.content.add_item')}
            </button>
        </div>
    );
}

/* --------- Stats --------- */

function StatsEditor({
    value, onChange, errors,
}: {
    value: StatsData;
    onChange: (v: StatsData) => void;
    errors: FormErrors;
}) {
    const t = useT();
    const items = Array.isArray(value) ? value : [];

    function setItem(i: number, patch: Partial<StatItem>): void {
        onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    }
    function add(): void {
        onChange([...items, { value: 0, suffix: '+', label: '' }]);
    }
    function remove(i: number): void {
        onChange(items.filter((_, idx) => idx !== i));
    }

    return (
        <div className="grid gap-4">
            {items.map((item, i) => (
                <div key={i} className="surface-card-2 border border-line-1 rounded-lg p-4 grid sm:grid-cols-[120px_120px_1fr_auto] gap-3 items-end">
                    <FieldRow label={t('admin.content.value')} error={errors[`data.${i}.value`]}>
                        <input
                            type="number"
                            value={item.value}
                            onChange={(e) => setItem(i, { value: Number(e.target.value) || 0 })}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </FieldRow>
                    <FieldRow label={t('admin.content.suffix')} error={errors[`data.${i}.suffix`]}>
                        <input
                            type="text"
                            value={item.suffix ?? ''}
                            onChange={(e) => setItem(i, { suffix: e.target.value.slice(0, 6) })}
                            maxLength={6}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </FieldRow>
                    <FieldRow label={t('admin.content.label')} error={errors[`data.${i}.label`]}>
                        <input
                            type="text"
                            value={item.label}
                            onChange={(e) => setItem(i, { label: e.target.value })}
                            maxLength={60}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </FieldRow>
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 mb-2"
                    >
                        × {t('admin.content.remove_item')}
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={add}
                className="px-3 py-2 rounded-lg border border-dashed border-line-2 text-sm font-semibold text-muted-2 hover:text-[color:var(--text-1)] hover:border-line-3"
            >
                + {t('admin.content.add_item')}
            </button>
        </div>
    );
}

/* --------- How it works --------- */

function HowEditor({
    value, onChange, errors,
}: {
    value: HowData;
    onChange: (v: HowData) => void;
    errors: FormErrors;
}) {
    const t = useT();
    const items = Array.isArray(value.items) ? value.items : [];

    function setItem(i: number, patch: Partial<HowItem>): void {
        const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
        onChange({ items: next });
    }

    return (
        <div className="grid gap-4">
            {items.map((item, i) => (
                <div key={i} className="surface-card-2 border border-line-1 rounded-lg p-4 grid gap-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold">
                        Step {i + 1}
                    </div>
                    <FieldRow label={t('admin.content.title_field')} error={errors[`data.items.${i}.title`]}>
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => setItem(i, { title: e.target.value })}
                            maxLength={200}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        />
                    </FieldRow>
                    <FieldRow label={t('admin.content.desc_field')} error={errors[`data.items.${i}.desc`]}>
                        <textarea
                            value={item.desc}
                            onChange={(e) => setItem(i, { desc: e.target.value })}
                            rows={2}
                            maxLength={500}
                            className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm resize-y"
                        />
                    </FieldRow>
                </div>
            ))}
        </div>
    );
}

/* --------- shared row --------- */

function FieldRow({
    label, error, children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        </div>
    );
}
