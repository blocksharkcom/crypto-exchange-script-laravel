import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AccountLayout from '@/layouts/AccountLayout';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/Types';

interface Props {
    available_locales: string[];
}

interface ProfileFormShape {
    name: string;
    email: string;
    locale: string;
    marketing_opt_in: boolean;
}

interface PasswordFormShape {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export default function Settings({ available_locales }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const user = props.auth.user;

    const profile = useForm<ProfileFormShape>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        locale: user?.locale ?? 'en',
        marketing_opt_in: false,
    });

    const password = useForm<PasswordFormShape>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function onSubmitProfile(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        profile.post(route('account.settings.profile'), { preserveScroll: true });
    }

    function onSubmitPassword(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        password.post(route('account.settings.password'), {
            preserveScroll: true,
            onFinish: () => password.reset('current_password', 'password', 'password_confirmation'),
        });
    }

    return (
        <AccountLayout title={t('account.settings.title')}>
            <Head title={t('account.settings.title')} />

            <div className="grid lg:grid-cols-2 gap-6">
                <section className="surface-card border border-line-1 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold">{t('account.settings.profile')}</h2>
                    <p className="text-sm text-muted-3 mt-0.5 mb-5">{t('account.settings.profile_sub')}</p>

                    <form onSubmit={onSubmitProfile} className="grid gap-4">
                        <div className="field">
                            <label htmlFor="set-name" className="field-label">{t('account.settings.name')}</label>
                            <input
                                id="set-name"
                                type="text"
                                value={profile.data.name}
                                onChange={(e) => profile.setData('name', e.target.value)}
                                required
                            />
                            {profile.errors.name && <p className="mt-1 text-xs text-[color:var(--warn)]">{profile.errors.name}</p>}
                        </div>

                        <div className="field">
                            <label htmlFor="set-email" className="field-label">{t('account.settings.email')}</label>
                            <input
                                id="set-email"
                                type="email"
                                value={profile.data.email}
                                onChange={(e) => profile.setData('email', e.target.value)}
                                required
                            />
                            {profile.errors.email && <p className="mt-1 text-xs text-[color:var(--warn)]">{profile.errors.email}</p>}
                        </div>

                        <div className="field">
                            <label htmlFor="set-locale" className="field-label">{t('account.settings.locale')}</label>
                            <select
                                id="set-locale"
                                value={profile.data.locale}
                                onChange={(e) => profile.setData('locale', e.target.value)}
                                className="bg-transparent outline-none w-full text-[color:var(--text-1)]"
                            >
                                {available_locales.map((code) => (
                                    <option key={code} value={code}>{code.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <label className="flex items-start gap-2 text-sm text-muted-2 select-none">
                            <input
                                type="checkbox"
                                className="mt-0.5 accent-[color:var(--color-brand-300)]"
                                checked={profile.data.marketing_opt_in}
                                onChange={(e) => profile.setData('marketing_opt_in', e.target.checked)}
                            />
                            <span>{t('account.settings.marketing_opt_in')}</span>
                        </label>

                        <button type="submit" disabled={profile.processing} className="cta !w-auto !px-5 !text-sm self-start">
                            {profile.processing ? <span className="spinner" /> : t('account.settings.save_profile')}
                        </button>
                    </form>
                </section>

                <section className="surface-card border border-line-1 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold">{t('account.settings.security')}</h2>
                    <p className="text-sm text-muted-3 mt-0.5 mb-5">{t('account.settings.security_sub')}</p>

                    <form onSubmit={onSubmitPassword} className="grid gap-4">
                        <div className="field">
                            <label htmlFor="set-cur" className="field-label">{t('account.settings.current_password')}</label>
                            <input
                                id="set-cur"
                                type="password"
                                autoComplete="current-password"
                                value={password.data.current_password}
                                onChange={(e) => password.setData('current_password', e.target.value)}
                                required
                            />
                            {password.errors.current_password && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{password.errors.current_password}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="set-new" className="field-label">{t('account.settings.new_password')}</label>
                            <input
                                id="set-new"
                                type="password"
                                autoComplete="new-password"
                                value={password.data.password}
                                onChange={(e) => password.setData('password', e.target.value)}
                                required
                            />
                            {password.errors.password && (
                                <p className="mt-1 text-xs text-[color:var(--warn)]">{password.errors.password}</p>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="set-conf" className="field-label">{t('account.settings.confirm_password')}</label>
                            <input
                                id="set-conf"
                                type="password"
                                autoComplete="new-password"
                                value={password.data.password_confirmation}
                                onChange={(e) => password.setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={password.processing} className="cta !w-auto !px-5 !text-sm self-start">
                            {password.processing ? <span className="spinner" /> : t('account.settings.save_password')}
                        </button>
                    </form>
                </section>
            </div>
        </AccountLayout>
    );
}
