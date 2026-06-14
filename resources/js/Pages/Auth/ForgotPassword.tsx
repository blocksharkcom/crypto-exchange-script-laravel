import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

interface FormShape {
    email: string;
}

export default function ForgotPassword() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const form = useForm<FormShape>({ email: '' });

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('auth.password.email'));
    }

    return (
        <PublicLayout>
            <Head title={t('auth.forgot.title')} />

            <section className="container-edge max-w-md py-12">
                <div className="surface-card border border-line-1 rounded-3xl p-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gradient-brand">{t('auth.forgot.title')}</h1>
                    <p className="text-sm text-muted-3 mt-1">{t('auth.forgot.subtitle')}</p>

                    {props.flash?.success && (
                        <div className="mt-4 text-sm rounded-xl px-3 py-2 border border-line-2 surface-card-2 text-muted-2">
                            {props.flash.success}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                        <div className="field">
                            <label htmlFor="fp-email" className="field-label">{t('auth.forgot.email')}</label>
                            <input
                                id="fp-email"
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

                        <button type="submit" disabled={form.processing} className="cta">
                            {form.processing ? <span className="spinner" /> : t('auth.forgot.submit')}
                        </button>

                        <p className="text-center text-sm">
                            <Link href={route('auth.login.show')} className="text-muted-2 hover:text-[color:var(--text-1)]">
                                {t('auth.forgot.back')}
                            </Link>
                        </p>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
}
