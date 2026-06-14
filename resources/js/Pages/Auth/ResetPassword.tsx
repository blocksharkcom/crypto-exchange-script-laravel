import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { useT } from '@/lib/i18n';

interface Props {
    token: string;
    email: string;
}

interface FormShape {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: Props) {
    const t = useT();
    const form = useForm<FormShape>({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('auth.password.update'), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <PublicLayout>
            <Head title={t('auth.reset.title')} />

            <section className="container-edge max-w-md py-12">
                <div className="surface-card border border-line-1 rounded-3xl p-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gradient-brand">{t('auth.reset.title')}</h1>
                    <p className="text-sm text-muted-3 mt-1">{t('auth.reset.subtitle')}</p>

                    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                        <div className="field">
                            <label htmlFor="rp-email" className="field-label">{t('auth.reset.email')}</label>
                            <input
                                id="rp-email"
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
                            <label htmlFor="rp-password" className="field-label">{t('auth.reset.password')}</label>
                            <input
                                id="rp-password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                required
                                autoFocus
                            />
                            {form.errors.password && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{form.errors.password}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="rp-confirm" className="field-label">{t('auth.reset.password_confirmation')}</label>
                            <input
                                id="rp-confirm"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password_confirmation}
                                onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={form.processing} className="cta">
                            {form.processing ? <span className="spinner" /> : t('auth.reset.submit')}
                        </button>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
}
