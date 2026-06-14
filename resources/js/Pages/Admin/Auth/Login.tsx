import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

export default function AdminLogin() {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (props.flash?.error) toast.error(props.flash.error);
    }, [props.flash?.error]);

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('admin.login.attempt'), {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <div
            className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
            style={{ background: 'var(--surface-page)' }}
        >
            <Head title={t('admin.auth.title')} />

            <span className="page-glow" aria-hidden />

            <div
                className="relative w-full max-w-md surface-card border border-line-1 p-8"
                style={{ borderRadius: 28, boxShadow: 'var(--shadow-card)' }}
            >
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 mb-3">
                        <svg viewBox="0 0 32 32" fill="none" className="block w-full h-full">
                            <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg)" />
                            <path
                                d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                                stroke="#0a0a0c"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <defs>
                                <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0" stopColor="#c7f74a" />
                                    <stop offset="1" stopColor="#7fe55a" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">{t('admin.auth.title')}</h1>
                    <p className="text-sm text-muted-3 mt-1">{t('admin.auth.subtitle')}</p>
                </div>

                <form onSubmit={onSubmit} className="grid gap-4">
                    <div className="field">
                        <label htmlFor="admin-email" className="field-label">{t('admin.auth.email')}</label>
                        <input
                            id="admin-email"
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
                        <label htmlFor="admin-password" className="field-label">{t('admin.auth.password')}</label>
                        <input
                            id="admin-password"
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

                    <label className="flex items-center gap-2 text-sm text-muted-2 select-none">
                        <input
                            type="checkbox"
                            className="accent-[color:var(--color-brand-300)]"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                        />
                        {t('admin.auth.remember')}
                    </label>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="cta"
                    >
                        {form.processing ? <span className="spinner" /> : t('admin.auth.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
