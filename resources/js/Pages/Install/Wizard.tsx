import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { SharedProps } from '@/Types';
import { Check, ChevronRight, Triangle } from '@/components/ui/Icons';

interface InstallPageProps extends SharedProps {
    initialStep: number;
    alreadyInstalled: boolean;
    phpVersion: string;
    appName: string;
    adminUrl: string;
    defaultDriver: 'sqlite' | 'mysql' | 'pgsql' | string;
}

type Driver = 'sqlite' | 'mysql' | 'pgsql';
type Theme = 'dark' | 'light' | 'auto';
type Flow = 'standard' | 'fixed-rate';

interface RequirementCheck {
    name: string;
    passed: boolean;
    hint: string;
}

interface RequirementsResponse {
    ok: boolean;
    checks: RequirementCheck[];
}

interface DatabaseResponse {
    ok: boolean;
    output?: string;
    applied?: number;
    error?: string;
}

interface ApiResponse {
    ok: boolean;
    error?: string;
    tested?: boolean;
}

interface DatabaseForm {
    driver: Driver;
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
}

interface AdminForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface BrandingForm {
    brand: string;
    tagline: string;
    support_email: string;
    theme: Theme;
}

interface ApiForm {
    changenow_api_key: string;
    changenow_referral: string;
    changenow_default_flow: Flow;
}

const TOTAL_STEPS = 7;

function csrfToken(): string {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    return meta?.content ?? '';
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(body),
    });

    let payload: unknown = null;
    try {
        payload = await res.json();
    } catch {
        throw new Error(`HTTP ${res.status}`);
    }

    if (!res.ok) {
        const err = (payload as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
        throw new Error(err);
    }

    return payload as T;
}

export default function Wizard() {
    const t = useT();
    const { props } = usePage<InstallPageProps>();
    const { initialStep, alreadyInstalled, appName, adminUrl, defaultDriver } = props;

    const [step, setStep] = useState<number>(initialStep);

    // When the server returns a new initialStep (after router.post/redirect),
    // keep the local step at least as advanced as the server says.
    useEffect(() => {
        setStep((prev) => (initialStep > prev ? initialStep : prev));
    }, [initialStep]);

    const labels = useMemo(
        () => [
            t('install.steps.welcome'),
            t('install.steps.requirements'),
            t('install.steps.database'),
            t('install.steps.admin'),
            t('install.steps.branding'),
            t('install.steps.api'),
            t('install.steps.done'),
        ],
        [t],
    );

    // If already installed, show a friendly screen.
    if (alreadyInstalled) {
        return (
            <Shell brand={appName}>
                <Head title={t('install.already.title')} />
                <div
                    className="surface-card border border-line-1 p-8"
                    style={{ borderRadius: 28, boxShadow: 'var(--shadow-card)' }}
                >
                    <h1 className="text-2xl font-bold text-gradient-brand">{t('install.already.title')}</h1>
                    <p className="mt-3 text-muted-3 text-sm">{t('install.already.body')}</p>
                    <a href={adminUrl} className="cta mt-6 max-w-xs">
                        {t('install.already.cta')} <ChevronRight width={16} height={16} />
                    </a>
                </div>
            </Shell>
        );
    }

    return (
        <Shell brand={appName}>
            <Head title={t('install.title', { brand: appName })} />

            <div className="grid md:grid-cols-[260px_1fr] gap-6 md:gap-10">
                <Sidebar step={step} labels={labels} />

                <section
                    className="surface-card border border-line-1 p-6 sm:p-8 relative overflow-hidden"
                    style={{ borderRadius: 28, boxShadow: 'var(--shadow-card)' }}
                >
                    {step === 1 && <StepWelcome brand={appName} onNext={() => setStep(2)} />}
                    {step === 2 && (
                        <StepRequirements
                            onBack={() => setStep(1)}
                            onNext={() => setStep(3)}
                        />
                    )}
                    {step === 3 && (
                        <StepDatabase
                            defaultDriver={(['sqlite', 'mysql', 'pgsql'] as const).includes(defaultDriver as Driver) ? (defaultDriver as Driver) : 'sqlite'}
                            onBack={() => setStep(2)}
                            onNext={() => setStep(4)}
                        />
                    )}
                    {step === 4 && (
                        <StepAdmin
                            onBack={() => setStep(3)}
                            onNext={() => setStep(5)}
                        />
                    )}
                    {step === 5 && (
                        <StepBranding
                            defaultBrand={appName}
                            onBack={() => setStep(4)}
                            onNext={() => setStep(6)}
                        />
                    )}
                    {step === 6 && (
                        <StepApi
                            onBack={() => setStep(5)}
                            onNext={() => setStep(7)}
                        />
                    )}
                    {step === 7 && <StepDone brand={appName} />}
                </section>
            </div>
        </Shell>
    );
}

// ---------- shell + sidebar ----------

function Shell({ brand, children }: { brand: string; children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <span className="page-glow" aria-hidden />
            <header className="relative z-10 border-b border-line-1">
                <div className="container-edge flex h-16 items-center gap-2.5 font-bold text-[color:var(--text-1)]">
                    <Mark />
                    <span className="text-base tracking-tight">{brand}</span>
                </div>
            </header>
            <main className="container-edge py-10 relative z-10">{children}</main>
        </div>
    );
}

function Sidebar({ step, labels }: { step: number; labels: string[] }) {
    const t = useT();
    return (
        <aside
            className="surface-card border border-line-1 p-5 md:p-6 md:sticky md:top-6 h-fit"
            style={{ borderRadius: 28, boxShadow: 'var(--shadow-card)' }}
        >
            <div className="text-xs text-muted-3 uppercase tracking-wider font-semibold">{t('install.sidebar.progress')}</div>
            <div className="mt-1 text-sm text-muted-2">
                {t('install.sidebar.step', { n: Math.min(step, TOTAL_STEPS) })} {t('install.sidebar.of', { total: TOTAL_STEPS })}
            </div>
            <div
                className="mt-3 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-progress-track)' }}
                aria-hidden
            >
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${Math.min(100, Math.round((Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100))}%`,
                        background: 'var(--color-progress)',
                    }}
                />
            </div>
            <ol className="mt-5 space-y-4">
                {labels.map((label, i) => {
                    const n = i + 1;
                    const status: 'done' | 'current' | 'todo' =
                        n < step ? 'done' : n === step ? 'current' : 'todo';
                    return (
                        <li key={label} className="flex items-start gap-4">
                            <span
                                className={cn(
                                    'shrink-0 font-bold leading-none tabular-nums select-none',
                                    status === 'done' && 'text-[color:var(--color-brand-300)] text-3xl',
                                    status === 'current' && 'text-[color:var(--color-progress)] text-5xl',
                                    status === 'todo' && 'text-muted-4 text-3xl',
                                )}
                                aria-hidden
                                style={{ minWidth: '2ch' }}
                            >
                                {status === 'done' ? <Check width={20} height={20} /> : n}
                            </span>
                            <span
                                className={cn(
                                    'pt-1 text-sm',
                                    status === 'current' ? 'text-[color:var(--text-1)] font-semibold' : 'text-muted-2',
                                )}
                            >
                                {label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}

function Mark() {
    return (
        <span aria-hidden className="block w-7 h-7">
            <svg viewBox="0 0 32 32" fill="none" className="block w-full h-full">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#installmark)" />
                <path
                    d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                    stroke="#0a0a0c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient id="installmark" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0" stopColor="#c7f74a" />
                        <stop offset="1" stopColor="#7fe55a" />
                    </linearGradient>
                </defs>
            </svg>
        </span>
    );
}

// ---------- step components ----------

function StepWelcome({ brand, onNext }: { brand: string; onNext: () => void }) {
    const t = useT();
    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient-brand">
                {t('install.welcome.title', { brand })}
            </h1>
            <p className="mt-3 text-muted-2 text-sm">{t('install.welcome.subtitle')}</p>
            <p className="mt-2 text-xs text-muted-3">{t('install.welcome.note')}</p>

            <button type="button" className="cta mt-8 max-w-xs" onClick={onNext}>
                {t('install.welcome.cta')} <ChevronRight width={16} height={16} />
            </button>
        </div>
    );
}

function StepRequirements({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
    const t = useT();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<RequirementsResponse | null>(null);

    const run = (): void => {
        setLoading(true);
        setError(null);
        postJson<RequirementsResponse>('/install/requirements', {})
            .then((res) => setData(res))
            .catch((e: Error) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold">{t('install.requirements.title')}</h1>
            <p className="mt-1 text-sm text-muted-3">{t('install.requirements.subtitle')}</p>

            <div className="mt-6 space-y-2">
                {loading && (
                    <div className="flex items-center gap-2 text-muted-3 text-sm">
                        <span className="spinner" /> {t('install.requirements.subtitle')}
                    </div>
                )}
                {!loading && data?.checks.map((c) => (
                    <div
                        key={c.name}
                        className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border',
                            c.passed ? 'border-line-1 surface-card-2' : 'border-line-2 surface-input',
                        )}
                    >
                        <span
                            className="w-6 h-6 rounded-full grid place-items-center mt-0.5"
                            style={
                                c.passed
                                    ? { background: 'var(--color-brand-300)', color: 'var(--color-brand-ink)' }
                                    : { background: 'var(--warn-bg)', color: 'var(--warn)' }
                            }
                            aria-hidden
                        >
                            {c.passed ? <Check width={14} height={14} /> : <Triangle width={14} height={14} />}
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[color:var(--text-1)]">{c.name}</div>
                            {!c.passed && c.hint && <div className="text-xs text-muted-3 mt-0.5">{c.hint}</div>}
                        </div>
                    </div>
                ))}
                {!loading && error && (
                    <div className="text-sm text-[color:var(--warn)]">{error}</div>
                )}
            </div>

            {!loading && data && (
                <p className={cn('mt-4 text-sm', data.ok ? 'text-brand-300' : 'text-[color:var(--warn)]')}>
                    {data.ok ? t('install.requirements.all_ok') : t('install.requirements.has_fail')}
                </p>
            )}

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button type="button" onClick={onBack} className="cta cta-ghost sm:max-w-[160px]">
                    {t('install.btn.back')}
                </button>
                <div className="flex gap-3 sm:max-w-md w-full">
                    <button type="button" onClick={run} className="cta cta-ghost flex-1">
                        {t('install.requirements.rerun')}
                    </button>
                    <button
                        type="button"
                        disabled={!data?.ok || loading}
                        onClick={onNext}
                        className="cta flex-1"
                    >
                        {t('install.requirements.cta')} <ChevronRight width={16} height={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StepDatabase({
    defaultDriver,
    onBack,
    onNext,
}: {
    defaultDriver: Driver;
    onBack: () => void;
    onNext: () => void;
}) {
    const t = useT();
    const [form, setForm] = useState<DatabaseForm>({
        driver: defaultDriver,
        host: '127.0.0.1',
        port: defaultDriver === 'pgsql' ? '5432' : '3306',
        database: defaultDriver === 'sqlite' ? 'database/database.sqlite' : 'swapforge',
        username: '',
        password: '',
    });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<DatabaseResponse | null>(null);

    const update = <K extends keyof DatabaseForm>(key: K, value: DatabaseForm[K]): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const onDriverChange = (driver: Driver): void => {
        setForm((prev) => ({
            ...prev,
            driver,
            port: driver === 'pgsql' ? '5432' : driver === 'mysql' ? '3306' : '',
            database: driver === 'sqlite' ? 'database/database.sqlite' : prev.database || 'swapforge',
        }));
    };

    const submit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setSuccess(null);
        postJson<DatabaseResponse>('/install/database', { ...form })
            .then((res) => setSuccess(res))
            .catch((err: Error) => setError(err.message))
            .finally(() => setBusy(false));
    };

    return (
        <form onSubmit={submit}>
            <h1 className="text-2xl font-bold">{t('install.database.title')}</h1>
            <p className="mt-1 text-sm text-muted-3">{t('install.database.subtitle')}</p>

            <div className="mt-6 grid gap-4">
                <div className="field">
                    <span className="field-chip">{t('install.database.driver')}</span>
                    <label className="field-label" htmlFor="db-driver">
                        {t('install.database.driver')}
                    </label>
                    <select
                        id="db-driver"
                        value={form.driver}
                        onChange={(e) => onDriverChange(e.target.value as Driver)}
                        className="w-full bg-transparent text-[color:var(--text-1)] outline-none"
                    >
                        <option value="sqlite">{t('install.database.driver_sqlite')}</option>
                        <option value="mysql">{t('install.database.driver_mysql')}</option>
                        <option value="pgsql">{t('install.database.driver_pgsql')}</option>
                    </select>
                </div>

                {form.driver !== 'sqlite' && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="field col-span-2">
                            <label className="field-label" htmlFor="db-host">{t('install.database.host')}</label>
                            <input id="db-host" value={form.host} onChange={(e) => update('host', e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="db-port">{t('install.database.port')}</label>
                            <input id="db-port" value={form.port} onChange={(e) => update('port', e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="field">
                    <label className="field-label" htmlFor="db-database">{t('install.database.database')}</label>
                    <input
                        id="db-database"
                        value={form.database}
                        onChange={(e) => update('database', e.target.value)}
                    />
                    {form.driver === 'sqlite' && (
                        <p className="text-xs text-muted-3 mt-1">{t('install.database.sqlite_hint')}</p>
                    )}
                </div>

                {form.driver !== 'sqlite' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="field">
                            <label className="field-label" htmlFor="db-username">{t('install.database.username')}</label>
                            <input id="db-username" value={form.username} onChange={(e) => update('username', e.target.value)} autoComplete="username" />
                        </div>
                        <div className="field">
                            <label className="field-label" htmlFor="db-password">{t('install.database.password')}</label>
                            <input id="db-password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" />
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="mt-4 text-sm text-[color:var(--warn)]">{error}</p>}
            {success?.ok && (
                <p className="mt-4 text-sm text-brand-300">{t('install.database.success')}</p>
            )}

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button type="button" onClick={onBack} className="cta cta-ghost sm:max-w-[160px]">
                    {t('install.btn.back')}
                </button>
                {success?.ok ? (
                    <button type="button" onClick={onNext} className="cta sm:max-w-xs">
                        {t('install.btn.next')} <ChevronRight width={16} height={16} />
                    </button>
                ) : (
                    <button type="submit" disabled={busy} className="cta sm:max-w-xs">
                        {busy ? <span className="spinner" /> : t('install.database.cta')}
                    </button>
                )}
            </div>
        </form>
    );
}

function StepAdmin({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
    const t = useT();
    const [form, setForm] = useState<AdminForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof AdminForm, string>>>({});
    const [busy, setBusy] = useState(false);

    const update = <K extends keyof AdminForm>(key: K, value: AdminForm[K]): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        router.post('/install/admin', { ...form }, {
            preserveScroll: true,
            onError: (errs) => {
                setErrors(errs as Partial<Record<keyof AdminForm, string>>);
            },
            onSuccess: () => {
                onNext();
            },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <form onSubmit={submit}>
            <h1 className="text-2xl font-bold">{t('install.admin.title')}</h1>
            <p className="mt-1 text-sm text-muted-3">{t('install.admin.subtitle')}</p>

            <div className="mt-6 grid gap-4">
                <div className="field">
                    <label className="field-label" htmlFor="adm-name">{t('install.admin.name')}</label>
                    <input id="adm-name" required value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" />
                    {errors.name && <p className="text-xs text-[color:var(--warn)] mt-1">{errors.name}</p>}
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="adm-email">{t('install.admin.email')}</label>
                    <input id="adm-email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
                    {errors.email && <p className="text-xs text-[color:var(--warn)] mt-1">{errors.email}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    <div className="field">
                        <label className="field-label" htmlFor="adm-pass">{t('install.admin.password')}</label>
                        <input id="adm-pass" type="password" required minLength={12} value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" />
                        {errors.password && <p className="text-xs text-[color:var(--warn)] mt-1">{errors.password}</p>}
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="adm-pass2">{t('install.admin.password_confirmation')}</label>
                        <input id="adm-pass2" type="password" required minLength={12} value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} autoComplete="new-password" />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button type="button" onClick={onBack} className="cta cta-ghost sm:max-w-[160px]">
                    {t('install.btn.back')}
                </button>
                <button type="submit" disabled={busy} className="cta sm:max-w-xs">
                    {busy ? <span className="spinner" /> : t('install.admin.cta')}
                </button>
            </div>
        </form>
    );
}

function StepBranding({ defaultBrand, onBack, onNext }: { defaultBrand: string; onBack: () => void; onNext: () => void }) {
    const t = useT();
    const [form, setForm] = useState<BrandingForm>({
        brand: defaultBrand || 'CrossSwap',
        tagline: 'Exchange any crypto instantly',
        support_email: '',
        theme: 'dark',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof BrandingForm, string>>>({});
    const [busy, setBusy] = useState(false);

    const update = <K extends keyof BrandingForm>(key: K, value: BrandingForm[K]): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const submit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        router.post('/install/branding', { ...form }, {
            preserveScroll: true,
            onError: (errs) => setErrors(errs as Partial<Record<keyof BrandingForm, string>>),
            onSuccess: () => onNext(),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <form onSubmit={submit}>
            <h1 className="text-2xl font-bold">{t('install.branding.title')}</h1>
            <p className="mt-1 text-sm text-muted-3">{t('install.branding.subtitle')}</p>

            <div className="mt-6 grid gap-4">
                <div className="field">
                    <label className="field-label" htmlFor="br-brand">{t('install.branding.brand')}</label>
                    <input id="br-brand" required value={form.brand} onChange={(e) => update('brand', e.target.value)} />
                    {errors.brand && <p className="text-xs text-[color:var(--warn)] mt-1">{errors.brand}</p>}
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="br-tagline">{t('install.branding.tagline')}</label>
                    <input id="br-tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="br-support">{t('install.branding.support_email')}</label>
                    <input id="br-support" type="email" required value={form.support_email} onChange={(e) => update('support_email', e.target.value)} />
                    {errors.support_email && <p className="text-xs text-[color:var(--warn)] mt-1">{errors.support_email}</p>}
                </div>
                <div className="field">
                    <label className="field-label" htmlFor="br-theme">{t('install.branding.theme')}</label>
                    <select
                        id="br-theme"
                        value={form.theme}
                        onChange={(e) => update('theme', e.target.value as Theme)}
                        className="w-full bg-transparent text-[color:var(--text-1)] outline-none"
                    >
                        <option value="dark">{t('install.branding.theme_dark')}</option>
                        <option value="light">{t('install.branding.theme_light')}</option>
                        <option value="auto">{t('install.branding.theme_auto')}</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button type="button" onClick={onBack} className="cta cta-ghost sm:max-w-[160px]">
                    {t('install.btn.back')}
                </button>
                <button type="submit" disabled={busy} className="cta sm:max-w-xs">
                    {busy ? <span className="spinner" /> : t('install.branding.cta')}
                </button>
            </div>
        </form>
    );
}

function StepApi({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
    const t = useT();
    const [form, setForm] = useState<ApiForm>({
        changenow_api_key: '',
        changenow_referral: '',
        changenow_default_flow: 'standard',
    });
    const [reveal, setReveal] = useState<boolean>(false);
    const [busy, setBusy] = useState<boolean>(false);
    const [testing, setTesting] = useState<boolean>(false);
    const [tested, setTested] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const update = <K extends keyof ApiForm>(key: K, value: ApiForm[K]): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setTested(false);
    };

    const runTest = (): void => {
        if (!form.changenow_api_key) return;
        setTesting(true);
        setError(null);
        postJson<ApiResponse>('/install/api', { ...form, test_only: true })
            .then(() => setTested(true))
            .catch((err: Error) => {
                setError(err.message);
                setTested(false);
            })
            .finally(() => setTesting(false));
    };

    const submit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        postJson<ApiResponse>('/install/api', { ...form, test_only: false })
            .then(() => onNext())
            .catch((err: Error) => setError(err.message))
            .finally(() => setBusy(false));
    };

    return (
        <form onSubmit={submit}>
            <h1 className="text-2xl font-bold">{t('install.api.title')}</h1>
            <p className="mt-1 text-sm text-muted-3">{t('install.api.subtitle')}</p>

            <div className="mt-6 grid gap-4">
                <div className="field">
                    <label className="field-label" htmlFor="api-key">{t('install.api.key')}</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="api-key"
                            type={reveal ? 'text' : 'password'}
                            required
                            value={form.changenow_api_key}
                            onChange={(e) => update('changenow_api_key', e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <button
                            type="button"
                            onClick={() => setReveal((v) => !v)}
                            className="text-xs text-muted-3 hover:text-[color:var(--text-1)] shrink-0"
                        >
                            {reveal ? t('install.api.hide') : t('install.api.show')}
                        </button>
                    </div>
                </div>

                <div className="field">
                    <label className="field-label" htmlFor="api-ref">{t('install.api.referral')}</label>
                    <input
                        id="api-ref"
                        value={form.changenow_referral}
                        onChange={(e) => update('changenow_referral', e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <fieldset>
                    <legend className="text-xs text-muted-3 mb-2">{t('install.api.flow')}</legend>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {(['standard', 'fixed-rate'] as const).map((flow) => (
                            <label
                                key={flow}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer',
                                    form.changenow_default_flow === flow
                                        ? 'border-[color:var(--color-brand-300)] surface-card-2'
                                        : 'border-line-1 surface-input',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="flow"
                                    value={flow}
                                    checked={form.changenow_default_flow === flow}
                                    onChange={() => update('changenow_default_flow', flow)}
                                    className="accent-brand-300"
                                />
                                <span className="text-sm">
                                    {flow === 'standard' ? t('install.api.flow_std') : t('install.api.flow_fixed')}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <p className="text-xs text-muted-3">{t('install.api.help')}</p>
            </div>

            {error && <p className="mt-4 text-sm text-[color:var(--warn)]">{error}</p>}
            {tested && <p className="mt-4 text-sm text-brand-300">{t('install.api.tested')}</p>}

            <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
                <button type="button" onClick={onBack} className="cta cta-ghost sm:max-w-[160px]">
                    {t('install.btn.back')}
                </button>
                <div className="flex gap-3 sm:max-w-md w-full">
                    <button
                        type="button"
                        onClick={runTest}
                        disabled={!form.changenow_api_key || testing}
                        className="cta cta-ghost flex-1"
                    >
                        {testing ? <span className="spinner" /> : t('install.api.test')}
                    </button>
                    <button type="submit" disabled={busy || !form.changenow_api_key} className="cta flex-1">
                        {busy ? <span className="spinner" /> : t('install.api.cta')}
                    </button>
                </div>
            </div>
        </form>
    );
}

function StepDone({ brand }: { brand: string }) {
    const t = useT();
    const [busy, setBusy] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const finalize = (): void => {
        setBusy(true);
        setError(null);
        router.post('/install/finalize', {}, {
            onError: () => {
                setError(t('install.error.generic'));
                setBusy(false);
            },
        });
    };

    return (
        <div>
            <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full grid place-items-center bg-brand-300 text-brand-ink" aria-hidden>
                    <Check width={20} height={20} />
                </span>
                <h1 className="text-2xl font-bold">{t('install.done.title')}</h1>
            </div>
            <p className="mt-3 text-sm text-muted-2">{t('install.done.subtitle', { brand })}</p>

            {error && <p className="mt-4 text-sm text-[color:var(--warn)]">{error}</p>}

            <button type="button" onClick={finalize} disabled={busy} className="cta mt-8 max-w-xs">
                {busy ? <span className="spinner" /> : (
                    <>
                        {t('install.done.cta')} <ChevronRight width={16} height={16} />
                    </>
                )}
            </button>
        </div>
    );
}
