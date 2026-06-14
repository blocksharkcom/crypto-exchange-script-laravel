import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronDown, Globe, Moon, Sun } from '@/components/ui/Icons';
import type { SharedProps } from '@/Types';

interface Props {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
}

interface SubNavItem {
    href: string;
    label: string;
}

export default function AccountLayout({ children, title, subtitle, actions }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const { brand, theme: initialTheme, i18n } = props;
    const user = props.auth.user;

    const [theme, setTheme] = useState<'dark' | 'light'>(() => (initialTheme === 'light' ? 'light' : 'dark'));
    const [langOpen, setLangOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success);
        if (props.flash?.error)   toast.error(props.flash.error);
        if (props.flash?.info)    toast.info(props.flash.info);
    }, [props.flash?.success, props.flash?.error, props.flash?.info]);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!profileOpen) return;
            const el = profileRef.current;
            if (el && !el.contains(e.target as Node)) setProfileOpen(false);
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [profileOpen]);

    const subnav: SubNavItem[] = [
        { href: route('account.dashboard'),    label: t('account.nav.dashboard') },
        { href: route('account.transactions'), label: t('account.nav.transactions') },
        { href: route('account.limit-orders'), label: t('account.nav.limit_orders') },
        { href: route('account.recurring'),    label: t('account.nav.recurring') },
        { href: route('account.tickets'),      label: t('account.nav.tickets') },
        { href: route('account.settings'),     label: t('account.nav.settings') },
    ];

    const currentUrl =
        props.ziggy && typeof props.ziggy === 'object' && 'location' in props.ziggy
            ? String((props.ziggy as { location?: string }).location ?? '')
            : (typeof window !== 'undefined' ? window.location.href : '');

    function isActive(href: string): boolean {
        try {
            const a = new URL(href, 'http://x.local');
            const b = new URL(currentUrl, 'http://x.local');
            return a.pathname === b.pathname;
        } catch {
            return false;
        }
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <span className="page-glow" aria-hidden />

            <header className="relative z-30">
                <div className="container-edge h-20 grid grid-cols-3 items-center">
                    <div className="flex items-center gap-7">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-[color:var(--text-1)] shrink-0">
                            <Mark />
                            <span className="text-base tracking-tight">{brand.name}</span>
                        </Link>
                    </div>

                    <div />

                    <div className="flex items-center justify-end gap-5 text-sm">
                        <Link href="/help" className="hidden md:inline-flex text-muted-2 hover:text-[color:var(--text-1)] transition">
                            {t('nav.support')}
                        </Link>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setLangOpen((v) => !v)}
                                className="inline-flex items-center gap-1.5 text-muted-2 hover:text-[color:var(--text-1)] transition"
                                aria-haspopup="listbox"
                                aria-expanded={langOpen}
                            >
                                <Globe width={16} height={16} />
                                <span className="font-medium">{i18n.locale.toUpperCase()}</span>
                            </button>
                            {langOpen && (
                                <ul
                                    className="absolute right-0 mt-3 min-w-32 surface-card border border-line-2 rounded-xl py-1 shadow-2xl"
                                    role="listbox"
                                >
                                    {i18n.available.map((code) => (
                                        <li key={code}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLangOpen(false);
                                                    router.post(`/lang/${code}`, {}, { preserveScroll: true });
                                                }}
                                                className={cn(
                                                    'w-full text-left px-3 py-1.5 text-sm hover:bg-[color:var(--surface-card-2)] rounded-md',
                                                    code === i18n.locale ? 'text-[color:var(--text-1)] font-semibold' : 'text-muted-2',
                                                )}
                                            >
                                                {code.toUpperCase()}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />

                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen((v) => !v)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-line-2 hover:bg-[color:var(--surface-card-2)]"
                                aria-haspopup="menu"
                                aria-expanded={profileOpen}
                            >
                                <Avatar name={user?.name ?? user?.email ?? '·'} />
                                <span className="hidden sm:inline text-sm font-semibold text-[color:var(--text-1)] truncate max-w-[120px]">
                                    {user?.name ?? user?.email ?? ''}
                                </span>
                                <ChevronDown width={12} height={12} className="text-muted-3" />
                            </button>
                            {profileOpen && user && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-56 surface-card border border-line-2 rounded-xl shadow-2xl py-2 z-40"
                                >
                                    <div className="px-3 py-2 border-b border-line-1">
                                        <div className="text-sm font-semibold truncate">{user.name ?? user.email}</div>
                                        <div className="text-xs text-muted-3 truncate">{user.email}</div>
                                    </div>
                                    <Link
                                        href={route('account.dashboard')}
                                        className="block px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)]"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        {t('account.nav.dashboard')}
                                    </Link>
                                    <Link
                                        href={route('account.transactions')}
                                        className="block px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)]"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        {t('account.nav.transactions')}
                                    </Link>
                                    <Link
                                        href={route('account.tickets')}
                                        className="block px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)]"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        {t('account.nav.tickets')}
                                    </Link>
                                    <Link
                                        href={route('account.settings')}
                                        className="block px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)]"
                                        onClick={() => setProfileOpen(false)}
                                    >
                                        {t('account.nav.settings')}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileOpen(false);
                                            router.post(route('auth.logout'));
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] border-t border-line-1 mt-1"
                                    >
                                        {t('account.nav.sign_out')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container-edge pb-4">
                    <nav className="flex flex-wrap items-center gap-1.5">
                        {subnav.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-3.5 py-1.5 rounded-full text-sm transition border border-transparent',
                                        active
                                            ? 'surface-card-2 ring-1 ring-line-2 text-[color:var(--text-1)] font-semibold'
                                            : 'text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)]',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="container-edge pb-16">
                {(title || subtitle || actions) && (
                    <div className="flex flex-wrap items-end gap-4 mb-6">
                        <div className="min-w-0">
                            {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                            {subtitle && <p className="text-sm text-muted-3 mt-0.5">{subtitle}</p>}
                        </div>
                        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}

function ThemeToggle({ theme, onToggle }: { theme: 'dark' | 'light'; onToggle: () => void }) {
    const isDark = theme === 'dark';
    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={onToggle}
            className={cn(
                'relative w-12 h-6 rounded-full transition',
                isDark ? 'bg-[color:var(--color-progress)]' : 'bg-[color:var(--surface-card-2)] border border-line-2',
            )}
        >
            <span
                className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full grid place-items-center transition-all bg-white text-[color:var(--color-progress)]',
                    isDark ? 'left-[26px]' : 'left-0.5',
                )}
            >
                {isDark ? <Moon width={12} height={12} /> : <Sun width={12} height={12} />}
            </span>
        </button>
    );
}

function Mark() {
    return (
        <span aria-hidden className="block w-8 h-8">
            <svg viewBox="0 0 32 32" fill="none" className="block w-full h-full">
                <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#accLg)" />
                <path
                    d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                    stroke="#0a0a0c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient id="accLg" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0" stopColor="#bff15a" />
                        <stop offset="1" stopColor="#7be09a" />
                    </linearGradient>
                </defs>
            </svg>
        </span>
    );
}

function Avatar({ name }: { name: string }) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
    return (
        <span
            aria-hidden
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[color:var(--surface-card-2)] text-xs font-semibold text-[color:var(--text-1)] ring-1 ring-inset ring-[color:var(--line-2)]"
        >
            {initials || '·'}
        </span>
    );
}
