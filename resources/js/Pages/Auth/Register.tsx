import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

interface FormShape {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    marketing_opt_in: boolean;
    terms: boolean;
}

export default function Register() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const form = useForm<FormShape>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        marketing_opt_in: false,
        terms: false,
    });

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('auth.register'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <PublicLayout>
            <Head title={t('auth.register.title')} />

            <section className="container-edge max-w-md py-12">
                <div className="surface-card border border-line-1 rounded-3xl p-8 relative overflow-hidden">
                    <h1 className="text-2xl font-bold tracking-tight text-gradient-brand">{t('auth.register.title')}</h1>
                    <p className="text-sm text-muted-3 mt-1">{t('auth.register.subtitle')}</p>

                    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                        <div className="field">
                            <label htmlFor="reg-name" className="field-label">{t('auth.register.name')}</label>
                            <input
                                id="reg-name"
                                type="text"
                                autoComplete="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            {form.errors.name && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="reg-email" className="field-label">{t('auth.register.email')}</label>
                            <input
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                required
                            />
                            {form.errors.email && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="reg-password" className="field-label">{t('auth.register.password')}</label>
                            <input
                                id="reg-password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                            />
                            {form.errors.password && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.password}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="reg-confirm" className="field-label">{t('auth.register.password_confirmation')}</label>
                            <input
                                id="reg-confirm"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <label className="flex items-start gap-2 text-sm text-muted-2 select-none">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-[color:var(--color-brand-300)]"
                                checked={form.data.marketing_opt_in}
                                onChange={(e) => form.setData('marketing_opt_in', e.target.checked)}
                            />
                            <span>{t('auth.register.marketing_opt_in')}</span>
                        </label>

                        <label className="flex items-start gap-2 text-sm text-muted-2 select-none">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-[color:var(--color-brand-300)]"
                                checked={form.data.terms}
                                onChange={(e) => form.setData('terms', e.target.checked)}
                                required
                            />
                            <span>
                                {t('auth.register.terms_pre')}{' '}
                                <a href={props.legal.terms ?? '#'} target="_blank" rel="noreferrer" className="text-[color:var(--text-1)] underline">
                                    {t('auth.register.terms')}
                                </a>{' '}
                                {t('auth.register.and')}{' '}
                                <a href={props.legal.privacy ?? '#'} target="_blank" rel="noreferrer" className="text-[color:var(--text-1)] underline">
                                    {t('auth.register.privacy')}
                                </a>.
                            </span>
                        </label>
                        {form.errors.terms && (
                            <p className="-mt-2 text-xs text-[color:var(--warn)]">{form.errors.terms}</p>
                        )}

                        <button type="submit" disabled={form.processing} className="cta">
                            {form.processing ? <span className="spinner" /> : t('auth.register.submit')}
                        </button>

                        <p className="text-center text-sm text-muted-3">
                            {t('auth.register.have_account')}{' '}
                            <Link href={route('auth.login.show')} className="text-[color:var(--text-1)] font-semibold hover:underline">
                                {t('auth.register.sign_in')}
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
}
