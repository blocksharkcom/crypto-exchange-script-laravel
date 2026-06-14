import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { useT } from '@/lib/i18n';

interface UserData {
    id: number;
    name: string | null;
    email: string;
    locale: string | null;
    marketing_opt_in: boolean;
}

interface Props {
    user: UserData | null;
}

export default function UsersEdit({ user }: Props) {
    const t = useT();
    const isCreate = user === null;

    const form = useForm({
        name:             user?.name ?? '',
        email:            user?.email ?? '',
        password:         '',
        locale:           user?.locale ?? '',
        marketing_opt_in: user?.marketing_opt_in ?? false,
    });

    function submit(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        if (isCreate) {
            form.post(route('admin.users.store'));
        } else if (user) {
            form.put(route('admin.users.update', user.id));
        }
    }

    return (
        <AdminLayout
            title={isCreate ? t('admin.users.create_title') : t('admin.users.edit_title')}
            subtitle={isCreate ? undefined : (user?.email ?? undefined)}
        >
            <Head title={isCreate ? t('admin.users.create_title') : t('admin.users.edit_title')} />

            <form onSubmit={submit} className="max-w-xl surface-card border border-line-1 rounded-xl p-5 grid gap-4">
                <Field
                    label={t('admin.users.name')}
                    value={form.data.name}
                    onChange={(v) => form.setData('name', v)}
                    error={form.errors.name}
                />
                <Field
                    label={t('admin.users.col_email')}
                    type="email"
                    value={form.data.email}
                    onChange={(v) => form.setData('email', v)}
                    error={form.errors.email}
                />

                <div>
                    <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                        {t('admin.users.password')}
                    </label>
                    <input
                        type="password"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                        autoComplete="new-password"
                    />
                    <p className="mt-1 text-xs text-muted-3">
                        {isCreate ? t('admin.users.password_hint_create') : t('admin.users.password_hint_edit')}
                    </p>
                    {form.errors.password && <p className="mt-1 text-xs text-rose-400">{form.errors.password}</p>}
                </div>

                <Field
                    label={t('admin.users.locale')}
                    value={form.data.locale}
                    onChange={(v) => form.setData('locale', v)}
                    error={form.errors.locale}
                />

                <label className="flex items-center justify-between gap-3 surface-input border border-line-1 rounded-lg px-3 py-2 cursor-pointer">
                    <span className="text-sm">{t('admin.users.marketing_opt_in')}</span>
                    <input
                        type="checkbox"
                        checked={form.data.marketing_opt_in}
                        onChange={(e) => form.setData('marketing_opt_in', e.target.checked)}
                        className="accent-[color:var(--color-brand-300)] w-4 h-4"
                    />
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-1">
                    <Link
                        href={isCreate ? route('admin.users.index') : route('admin.users.show', user?.id ?? 0)}
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
            </form>
        </AdminLayout>
    );
}

function Field({
    label, value, onChange, type, error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    error?: string;
}) {
    return (
        <div>
            <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">{label}</label>
            <input
                type={type ?? 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
            />
            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        </div>
    );
}
