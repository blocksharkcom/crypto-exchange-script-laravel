import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

interface FormShape {
    email: string;
    password: string;
    remember: boolean;
}

export default function SignIn() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const form = useForm<FormShape>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (props.flash?.success) {
            // no-op; banner is rendered inline below
        }
    }, [props.flash?.success]);

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('auth.login'), {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <PublicLayout>
            <Head title={t('auth.sign_in.title')} />

            <section className="container-edge max-w-md py-12">
                <div className="surface-card border border-line-1 rounded-3xl p-8 relative overflow-hidden">
                    <h1 className="text-2xl font-bold tracking-tight text-gradient-brand">{t('auth.sign_in.title')}</h1>
                    <p className="text-sm text-muted-3 mt-1">{t('auth.sign_in.subtitle')}</p>

                    {props.flash?.success && (
                        <div className="mt-4 text-sm rounded-xl px-3 py-2 border border-line-2 surface-card-2 text-muted-2">
                            {props.flash.success}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                        <div className="field">
                            <label htmlFor="signin-email" className="field-label">{t('auth.sign_in.email')}</label>
                            <input
                                id="signin-email"
                                type="email"
                                autoComplete="email"
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                required
                                autoFocus
                            />
                            {form.errors.email && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.email}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="signin-password" className="field-label">{t('auth.sign_in.password')}</label>
                            <input
                                id="signin-password"
                                type="password"
                                autoComplete="current-password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                            />
                            {form.errors.password && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                            <label className="flex items-center gap-2 text-muted-2 select-none">
                                <input
                                    type="checkbox"
                                    className="accent-[color:var(--color-brand-300)]"
                                    checked={form.data.remember}
                                    onChange={(e) => form.setData('remember', e.target.checked)}
                                />
                                {t('auth.sign_in.remember')}
                            </label>
                            <Link href={route('auth.password.forgot')} className="text-muted-2 hover:text-[color:var(--text-1)]">
                                {t('auth.sign_in.forgot')}
                            </Link>
                        </div>

                        <button type="submit" disabled={form.processing} className="cta">
                            {form.processing ? <span className="spinner" /> : t('auth.sign_in.submit')}
                        </button>

                        <p className="text-center text-sm text-muted-3">
                            {t('auth.sign_in.no_account')}{' '}
                            <Link href={route('auth.register.show')} className="text-[color:var(--text-1)] font-semibold hover:underline">
                                {t('auth.sign_in.register')}
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
}
