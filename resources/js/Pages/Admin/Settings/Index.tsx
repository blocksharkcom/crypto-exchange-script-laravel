import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import { CurrencyPicker, LogoUploader } from '@/components/admin/BrandPickers';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ChatSettings {
    enabled: boolean;
    provider: 'none' | 'openai' | 'anthropic';
    has_api_key: boolean;
    api_key_masked: string;
    api_key: string;
    model: string;
    assistant_name: string;
    system_prompt: string;
}

interface MailSettings {
    transport: 'smtp' | 'log';
    host: string;
    port: string;
    username: string;
    password: string;
    has_password: boolean;
    encryption: 'tls' | 'ssl' | 'none';
    from_address: string;
    from_name: string;
}

interface Settings {
    brand: string;
    tagline: string;
    logo: string;
    support_email: string;
    theme: string;
    webgl_hero: boolean;
    fixed_rate: boolean;
    show_promo: boolean;
    collect_email: boolean;
    featured_currencies: string;
    blacklist_currencies: string;
    terms_url: string;
    privacy_url: string;
    aml_url: string;
    social: {
        twitter: string;
        telegram: string;
        discord: string;
        reddit: string;
    };
    chat: ChatSettings;
    mail: MailSettings;
}

interface Props {
    settings: Settings;
    languages: string[];
}

type Tab = 'branding' | 'features' | 'languages' | 'theme' | 'legal' | 'social' | 'chat' | 'mail';

type TestState =
    | { kind: 'idle' }
    | { kind: 'busy' }
    | { kind: 'ok'; reply: string }
    | { kind: 'fail'; error: string };

function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

const DEFAULT_MODELS: Record<ChatSettings['provider'], string> = {
    none: '',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-haiku-4-5-20251001',
};

export default function SettingsIndex({ settings, languages }: Props) {
    const t = useT();
    const [tab, setTab] = useState<Tab>('branding');

    const form = useForm({ ...settings });

    function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        form.post(route('admin.settings.update'), { preserveScroll: true });
    }

    const tabs: { key: Tab; label: string }[] = [
        { key: 'branding',  label: t('admin.settings.tab_branding') },
        { key: 'features',  label: t('admin.settings.tab_features') },
        { key: 'languages', label: t('admin.settings.tab_languages') },
        { key: 'theme',     label: t('admin.settings.tab_theme') },
        { key: 'legal',     label: t('admin.settings.tab_legal') },
        { key: 'social',    label: t('admin.settings.tab_social') },
        { key: 'chat',      label: t('admin.settings.tab_chat') },
        { key: 'mail',      label: t('admin.settings.tab_mail') },
    ];

    const [showKey, setShowKey] = useState<boolean>(false);
    const [showMailPass, setShowMailPass] = useState<boolean>(false);
    const [testState, setTestState] = useState<TestState>({ kind: 'idle' });
    const [mailTesting, setMailTesting] = useState<boolean>(false);

    async function runMailTest(): Promise<void> {
        const recipient = window.prompt(t('admin.settings.mail.test_prompt'));
        if (!recipient) return;
        setMailTesting(true);
        try {
            const res = await fetch(route('admin.settings.test_mail'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ recipient }),
            });
            const json: { ok: boolean; error?: string } = await res.json();
            if (json.ok) {
                toast.success(t('admin.settings.mail.test_ok'));
            } else {
                toast.error(t('admin.settings.mail.test_failed', { error: json.error ?? `HTTP ${res.status}` }));
            }
        } catch (e) {
            toast.error(t('admin.settings.mail.test_failed', { error: e instanceof Error ? e.message : String(e) }));
        } finally {
            setMailTesting(false);
        }
    }

    async function runChatTest(): Promise<void> {
        setTestState({ kind: 'busy' });
        try {
            const res = await fetch(route('admin.settings.test_chat'), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ message: 'Hello' }),
            });
            const json: { ok: boolean; data?: { reply: string }; error?: string } = await res.json();
            if (json.ok && json.data) {
                setTestState({ kind: 'ok', reply: json.data.reply.slice(0, 160) });
            } else {
                setTestState({ kind: 'fail', error: json.error ?? `HTTP ${res.status}` });
            }
        } catch (e) {
            setTestState({ kind: 'fail', error: e instanceof Error ? e.message : String(e) });
        }
    }

    return (
        <AdminLayout title={t('admin.settings.title')}>
            <Head title={t('admin.settings.title')} />

            <div className="grid lg:grid-cols-[200px_1fr] gap-4">
                <nav className="surface-card border border-line-1 rounded-xl p-2 grid gap-0.5 h-fit">
                    {tabs.map((tt) => (
                        <button
                            key={tt.key}
                            type="button"
                            onClick={() => setTab(tt.key)}
                            className={cn(
                                'text-left px-3 py-2 rounded-lg text-sm',
                                tab === tt.key
                                    ? 'bg-[color:var(--surface-card-2)] text-[color:var(--text-1)] font-semibold'
                                    : 'text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)]',
                            )}
                        >
                            {tt.label}
                        </button>
                    ))}
                </nav>

                <form onSubmit={submit} className="surface-card border border-line-1 rounded-xl p-5 grid gap-4">
                    {tab === 'branding' && (
                        <>
                            <Field
                                label={t('admin.settings.brand')}
                                value={form.data.brand}
                                onChange={(v) => form.setData('brand', v)}
                                error={form.errors.brand}
                            />
                            <Field
                                label={t('admin.settings.tagline')}
                                value={form.data.tagline}
                                onChange={(v) => form.setData('tagline', v)}
                                error={form.errors.tagline}
                            />
                            <LogoUploader
                                label={t('admin.settings.logo')}
                                value={form.data.logo}
                                onChange={(url) => form.setData('logo', url)}
                                brand={form.data.brand || 'CrossSwap'}
                            />
                            <Field
                                label={t('admin.settings.support_email')}
                                type="email"
                                value={form.data.support_email}
                                onChange={(v) => form.setData('support_email', v)}
                                error={form.errors.support_email}
                            />
                        </>
                    )}

                    {tab === 'features' && (
                        <>
                            <Toggle
                                label={t('admin.settings.webgl_hero')}
                                checked={form.data.webgl_hero}
                                onChange={(v) => form.setData('webgl_hero', v)}
                            />
                            <Toggle
                                label={t('admin.settings.fixed_rate')}
                                checked={form.data.fixed_rate}
                                onChange={(v) => form.setData('fixed_rate', v)}
                            />
                            <Toggle
                                label={t('admin.settings.show_promo')}
                                checked={form.data.show_promo}
                                onChange={(v) => form.setData('show_promo', v)}
                            />
                            <Toggle
                                label={t('admin.settings.collect_email')}
                                checked={form.data.collect_email}
                                onChange={(v) => form.setData('collect_email', v)}
                            />
                            <CurrencyPicker
                                label={t('admin.settings.featured_currencies')}
                                value={form.data.featured_currencies}
                                onChange={(v) => form.setData('featured_currencies', v)}
                                hint={t('admin.settings.featured_hint')}
                                tone="lime"
                            />
                            <CurrencyPicker
                                label={t('admin.settings.blacklist_currencies')}
                                value={form.data.blacklist_currencies}
                                onChange={(v) => form.setData('blacklist_currencies', v)}
                                hint={t('admin.settings.blacklist_hint')}
                                tone="indigo"
                            />
                        </>
                    )}

                    {tab === 'languages' && (
                        <div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                {t('admin.settings.languages')}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {languages.map((l) => (
                                    <span key={l} className="surface-input rounded-lg px-3 py-1.5 text-xs uppercase font-semibold border border-line-1">
                                        {l}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-3 text-xs text-muted-3">
                                Configured in <code className="font-mono">config/swapforge.php</code>.
                            </p>
                        </div>
                    )}

                    {tab === 'theme' && (
                        <div>
                            <div className="text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-2">
                                {t('admin.settings.theme')}
                            </div>
                            <div className="grid grid-cols-3 gap-2 max-w-sm">
                                {(['dark', 'light', 'auto'] as const).map((opt) => (
                                    <label
                                        key={opt}
                                        className={cn(
                                            'cursor-pointer surface-input border rounded-lg p-3 text-center text-sm',
                                            form.data.theme === opt
                                                ? 'border-[color:var(--color-brand-300)] text-[color:var(--text-1)] font-semibold'
                                                : 'border-line-1 text-muted-2',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="theme"
                                            value={opt}
                                            checked={form.data.theme === opt}
                                            onChange={() => form.setData('theme', opt)}
                                            className="sr-only"
                                        />
                                        {t(`admin.settings.theme_${opt}`)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'legal' && (
                        <>
                            <Field
                                label={t('admin.settings.terms_url')}
                                type="url"
                                value={form.data.terms_url}
                                onChange={(v) => form.setData('terms_url', v)}
                                error={form.errors.terms_url}
                            />
                            <Field
                                label={t('admin.settings.privacy_url')}
                                type="url"
                                value={form.data.privacy_url}
                                onChange={(v) => form.setData('privacy_url', v)}
                                error={form.errors.privacy_url}
                            />
                            <Field
                                label={t('admin.settings.aml_url')}
                                type="url"
                                value={form.data.aml_url}
                                onChange={(v) => form.setData('aml_url', v)}
                                error={form.errors.aml_url}
                            />
                        </>
                    )}

                    {tab === 'social' && (
                        <>
                            <Field
                                label={t('admin.settings.twitter')}
                                value={form.data.social.twitter}
                                onChange={(v) => form.setData('social', { ...form.data.social, twitter: v })}
                            />
                            <Field
                                label={t('admin.settings.telegram')}
                                value={form.data.social.telegram}
                                onChange={(v) => form.setData('social', { ...form.data.social, telegram: v })}
                            />
                            <Field
                                label={t('admin.settings.discord')}
                                value={form.data.social.discord}
                                onChange={(v) => form.setData('social', { ...form.data.social, discord: v })}
                            />
                            <Field
                                label={t('admin.settings.reddit')}
                                value={form.data.social.reddit}
                                onChange={(v) => form.setData('social', { ...form.data.social, reddit: v })}
                            />
                        </>
                    )}

                    {tab === 'chat' && (
                        <>
                            <p className="text-xs text-muted-3">{t('admin.settings.chat.intro')}</p>

                            <Toggle
                                label={t('admin.settings.chat.enabled')}
                                checked={form.data.chat.enabled}
                                onChange={(v) => form.setData('chat', { ...form.data.chat, enabled: v })}
                            />

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.chat.provider')}
                                </label>
                                <select
                                    value={form.data.chat.provider}
                                    onChange={(e) => {
                                        const next = e.target.value as ChatSettings['provider'];
                                        const nextModel =
                                            form.data.chat.model.trim() === '' || form.data.chat.model === DEFAULT_MODELS[form.data.chat.provider]
                                                ? DEFAULT_MODELS[next]
                                                : form.data.chat.model;
                                        form.setData('chat', { ...form.data.chat, provider: next, model: nextModel });
                                    }}
                                    className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                                >
                                    <option value="none">{t('admin.settings.chat.provider_none')}</option>
                                    <option value="openai">{t('admin.settings.chat.provider_openai')}</option>
                                    <option value="anthropic">{t('admin.settings.chat.provider_anthropic')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.chat.api_key')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={form.data.chat.api_key}
                                        onChange={(e) => form.setData('chat', { ...form.data.chat, api_key: e.target.value })}
                                        placeholder={t('admin.settings.chat.api_key_ph')}
                                        className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm pr-16"
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-2 hover:text-[color:var(--text-1)] px-2 py-1 rounded"
                                    >
                                        {showKey ? t('admin.settings.chat.hide') : t('admin.settings.chat.show')}
                                    </button>
                                </div>
                                {form.data.chat.has_api_key && (
                                    <p className="mt-1 text-xs text-muted-3">
                                        {t('admin.settings.chat.api_key_stored', { masked: form.data.chat.api_key_masked })}
                                    </p>
                                )}
                            </div>

                            <Field
                                label={t('admin.settings.chat.model')}
                                value={form.data.chat.model}
                                onChange={(v) => form.setData('chat', { ...form.data.chat, model: v })}
                            />
                            <p className="-mt-3 text-xs text-muted-3">{t('admin.settings.chat.model_hint')}</p>

                            <Field
                                label={t('admin.settings.chat.assistant_name')}
                                value={form.data.chat.assistant_name}
                                onChange={(v) => form.setData('chat', { ...form.data.chat, assistant_name: v })}
                            />

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.chat.system_prompt')}
                                </label>
                                <textarea
                                    value={form.data.chat.system_prompt}
                                    onChange={(e) => form.setData('chat', { ...form.data.chat, system_prompt: e.target.value })}
                                    rows={5}
                                    className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm resize-y"
                                />
                                <p className="mt-1 text-xs text-muted-3">{t('admin.settings.chat.system_prompt_hint')}</p>
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={runChatTest}
                                    disabled={testState.kind === 'busy'}
                                    className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-[color:var(--text-1)] hover:border-[color:var(--color-brand-300)] transition disabled:opacity-50"
                                >
                                    {testState.kind === 'busy' ? t('admin.settings.chat.testing') : t('admin.settings.chat.test')}
                                </button>
                                <div className="text-xs leading-relaxed pt-1">
                                    {testState.kind === 'ok' && (
                                        <span className="text-emerald-400">
                                            {t('admin.settings.chat.test_ok', { reply: testState.reply })}
                                        </span>
                                    )}
                                    {testState.kind === 'fail' && (
                                        <span className="text-rose-400">
                                            {t('admin.settings.chat.test_failed', { error: testState.error })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {tab === 'mail' && (
                        <>
                            <p className="text-xs text-muted-3">{t('admin.settings.mail.intro')}</p>

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.mail.transport')}
                                </label>
                                <select
                                    value={form.data.mail.transport}
                                    onChange={(e) => form.setData('mail', { ...form.data.mail, transport: e.target.value as MailSettings['transport'] })}
                                    className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                                >
                                    <option value="smtp">{t('admin.settings.mail.transport_smtp')}</option>
                                    <option value="log">{t('admin.settings.mail.transport_log')}</option>
                                </select>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field
                                    label={t('admin.settings.mail.host')}
                                    value={form.data.mail.host}
                                    onChange={(v) => form.setData('mail', { ...form.data.mail, host: v })}
                                />
                                <Field
                                    label={t('admin.settings.mail.port')}
                                    value={form.data.mail.port}
                                    onChange={(v) => form.setData('mail', { ...form.data.mail, port: v })}
                                />
                            </div>

                            <Field
                                label={t('admin.settings.mail.username')}
                                value={form.data.mail.username}
                                onChange={(v) => form.setData('mail', { ...form.data.mail, username: v })}
                            />

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.mail.password')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showMailPass ? 'text' : 'password'}
                                        value={form.data.mail.password}
                                        onChange={(e) => form.setData('mail', { ...form.data.mail, password: e.target.value })}
                                        placeholder={t('admin.settings.mail.password_ph')}
                                        className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm pr-16"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowMailPass((v) => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-2 hover:text-[color:var(--text-1)] px-2 py-1 rounded"
                                    >
                                        {showMailPass ? t('admin.settings.chat.hide') : t('admin.settings.chat.show')}
                                    </button>
                                </div>
                                {form.data.mail.has_password && (
                                    <p className="mt-1 text-xs text-muted-3">{t('admin.settings.mail.password_stored')}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-muted-3 font-semibold mb-1">
                                    {t('admin.settings.mail.encryption')}
                                </label>
                                <select
                                    value={form.data.mail.encryption}
                                    onChange={(e) => form.setData('mail', { ...form.data.mail, encryption: e.target.value as MailSettings['encryption'] })}
                                    className="surface-input border border-line-1 rounded-lg px-3 py-2 w-full text-sm"
                                >
                                    <option value="tls">{t('admin.settings.mail.enc_tls')}</option>
                                    <option value="ssl">{t('admin.settings.mail.enc_ssl')}</option>
                                    <option value="none">{t('admin.settings.mail.enc_none')}</option>
                                </select>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <Field
                                    label={t('admin.settings.mail.from_address')}
                                    type="email"
                                    value={form.data.mail.from_address}
                                    onChange={(v) => form.setData('mail', { ...form.data.mail, from_address: v })}
                                />
                                <Field
                                    label={t('admin.settings.mail.from_name')}
                                    value={form.data.mail.from_name}
                                    onChange={(v) => form.setData('mail', { ...form.data.mail, from_name: v })}
                                />
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={runMailTest}
                                    disabled={mailTesting}
                                    className="px-3 py-1.5 rounded-lg surface-card-2 border border-line-2 text-sm font-semibold text-[color:var(--text-1)] hover:border-[color:var(--color-brand-300)] transition disabled:opacity-50"
                                >
                                    {mailTesting ? <span className="spinner" /> : t('admin.settings.mail.test')}
                                </button>
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-1">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-4 py-1.5 rounded-lg bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)] text-sm font-semibold disabled:opacity-50"
                        >
                            {form.processing ? <span className="spinner" /> : t('admin.common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

function Field({
    label,
    value,
    onChange,
    type,
    error,
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
