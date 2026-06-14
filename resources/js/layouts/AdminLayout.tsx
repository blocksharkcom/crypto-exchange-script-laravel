import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Moon, Sun, ChevronDown, ExternalLink, Search as SearchIcon } from '@/components/ui/Icons';
import type { SharedProps } from '@/Types';

interface Props {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
}

interface NavItem {
    key: string;
    href: string;
    label: string;
    icon: ReactNode;
}

export default function AdminLayout({ children, title, subtitle, actions }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const admin = props.auth.admin;
    const [theme, setTheme] = useState<'dark' | 'light'>(() => readInitialTheme(props.theme));
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Lock body scroll while the mobile nav drawer is open
    useEffect(() => {
        document.documentElement.style.overflow = mobileNavOpen ? 'hidden' : '';
    }, [mobileNavOpen]);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem('swapforge-admin-theme', theme);
        } catch {
            // ignore
        }
    }, [theme]);

    // Flash toast support
    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success);
        if (props.flash?.error)   toast.error(props.flash.error);
        if (props.flash?.info)    toast.info(props.flash.info);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.flash?.success, props.flash?.error, props.flash?.info]);

    // Close profile menu on outside click
    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!menuOpen) return;
            const el = menuRef.current;
            if (el && !el.contains(e.target as Node)) setMenuOpen(false);
        }
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [menuOpen]);

    if (admin === null) {
        // Server-side middleware handles redirect, but bail out client-side too.
        if (typeof window !== 'undefined') {
            router.visit(route('admin.login'), { replace: true });
        }
        return null;
    }

    const nav: NavItem[] = [
        { key: 'dashboard',    href: route('admin.dashboard'),         label: t('admin.nav.dashboard'),    icon: <NavIcon path="M3 12h6V3H3v9zm0 9h6v-6H3v6zm9 0h9V11h-9v10zM12 3v6h9V3h-9z" /> },
        { key: 'transactions', href: route('admin.transactions.index'),label: t('admin.nav.transactions'), icon: <NavIcon path="M4 7h12l-3-3m3 11H4l3 3" /> },
        { key: 'stuck',        href: route('admin.transactions.stuck'),label: t('admin.nav.stuck'),        icon: <NavIcon path="M12 9v4m0 4h.01M3 17h18L12 3 3 17z" /> },
        { key: 'users',        href: route('admin.users.index'),       label: t('admin.nav.users'),        icon: <NavIcon path="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm6 9v-1a5 5 0 0 0-5-5h-2m-9 6v-1a5 5 0 0 1 5-5h2" /> },
        { key: 'tickets',      href: route('admin.tickets.index'),     label: t('admin.nav.tickets'),      icon: <NavIcon path="M21 11.5a8.38 8.38 0 0 1-9 8.5 9 9 0 1 1 9-8.5z" /> },
        { key: 'campaigns',    href: route('admin.campaigns.index'),   label: t('admin.nav.campaigns'),    icon: <NavIcon path="M3 7l9 6 9-6M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" /> },
        { key: 'pages',        href: route('admin.pages.index'),       label: t('admin.nav.pages'),        icon: <NavIcon path="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6zM14 3v6h6M8 13h8M8 17h5" /> },
        { key: 'content',      href: route('admin.content.index'),     label: t('admin.nav.content'),      icon: <NavIcon path="M4 6h16M4 12h16M4 18h10" /> },
        { key: 'api',          href: route('admin.api.index'),         label: t('admin.nav.api'),          icon: <NavIcon path="M3 12h4l3-9 4 18 3-9h4" /> },
        { key: 'settings',     href: route('admin.settings.index'),    label: t('admin.nav.settings'),     icon: <NavIcon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm9 4l-2 1.6.3 2.5-2.4.8-1 2.3-2.5-.5L12 21l-1.4-1.3-2.5.5-1-2.3-2.4-.8.3-2.5L3 12l2-1.6-.3-2.5 2.4-.8 1-2.3 2.5.5L12 3l1.4 1.3 2.5-.5 1 2.3 2.4.8-.3 2.5L21 12z" /> },
        { key: 'audit',        href: route('admin.audit.index'),       label: t('admin.nav.audit'),        icon: <NavIcon path="M9 11l3 3L22 4M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" /> },
    ];

    const currentUrl = props.ziggy && typeof props.ziggy === 'object' && 'location' in props.ziggy
        ? String((props.ziggy as { location?: string }).location ?? '')
        : (typeof window !== 'undefined' ? window.location.href : '');

    const currentPath = (() => {
        try { return new URL(currentUrl, 'http://x.local').pathname; }
        catch { return '/'; }
    })();

    // Pick the single navigation item whose pathname is the longest prefix of
    // the current pathname. Exact match always beats prefix; nested routes
    // (e.g. /admin/transactions/stuck) light up the most specific item.
    const bestMatchHref = (() => {
        let best = '';
        for (const item of nav) {
            try {
                const path = new URL(item.href, 'http://x.local').pathname;
                if (currentPath === path || currentPath.startsWith(path + '/')) {
                    if (path.length > best.length) best = path;
                }
            } catch { /* skip */ }
        }
        return best;
    })();

    function isActive(href: string): boolean {
        try {
            const path = new URL(href, 'http://x.local').pathname;
            return path === bestMatchHref;
        } catch { return false; }
    }

    const Sidebar = (
        <>
            <div className="px-5 h-16 flex items-center gap-2.5 border-b border-line-1">
                <Mark />
                <span className="font-bold tracking-tight truncate">{props.brand.name}</span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-3 px-1.5 py-0.5 rounded bg-[color:var(--surface-card-2)]">
                    {t('admin.nav.badge')}
                </span>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {nav.map((item) => (
                    <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={cn('admin-nav-item', isActive(item.href) && 'is-active')}
                    >
                        <span className="admin-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="px-3 py-3 border-t border-line-1">
                <a
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-3 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)]"
                >
                    <ExternalLink width={14} height={14} />
                    {t('admin.nav.open_app')}
                </a>
            </div>
        </>
    );

    return (
        <div
            className="relative min-h-screen flex lg:grid"
            style={{ ['--admin-rail' as string]: '240px', gridTemplateColumns: 'minmax(0, var(--admin-rail)) 1fr', background: 'var(--surface-page)' }}
        >
            <span className="page-glow-admin" aria-hidden />

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col border-r border-line-1 surface-card sticky top-0 h-screen relative z-10">
                {Sidebar}
            </aside>

            {/* Mobile drawer */}
            <div
                className={cn(
                    'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
                    mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                )}
                aria-hidden={!mobileNavOpen}
            >
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
                <aside
                    role="dialog"
                    aria-modal="true"
                    className={cn(
                        'absolute left-0 top-0 h-full w-[84%] max-w-xs surface-card border-r border-line-1 shadow-2xl flex flex-col transition-transform duration-300 ease-out',
                        mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
                    )}
                >
                    {Sidebar}
                </aside>
            </div>

            <div className="relative z-10 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 surface-card border-b border-line-1">
                    <div className="h-16 px-3 sm:px-6 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(true)}
                            aria-label="Open menu"
                            className="lg:hidden w-10 h-10 grid place-items-center rounded-lg text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] border border-line-1"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                                <path d="M4 7h16M4 12h16M4 17h16" />
                            </svg>
                        </button>
                        <div className="lg:hidden flex items-center gap-2 font-bold min-w-0">
                            <Mark />
                            <span className="truncate hidden sm:inline">{props.brand.name}</span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md surface-input border border-line-1 rounded-lg px-3 py-1.5">
                            <SearchIcon width={14} height={14} className="text-muted-3" />
                            <input
                                type="search"
                                placeholder={t('admin.common.search')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const v = (e.target as HTMLInputElement).value.trim();
                                        if (v.length > 0) {
                                            router.visit(`${route('admin.transactions.index')}?q=${encodeURIComponent(v)}`);
                                        }
                                    }
                                }}
                                className="bg-transparent border-0 outline-none text-sm w-full text-[color:var(--text-1)] placeholder:text-muted-3"
                                aria-label={t('admin.common.search')}
                            />
                            <kbd className="hidden sm:inline text-[10px] text-muted-3 border border-line-2 rounded px-1 py-0.5">↵</kbd>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Toggle theme"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-lg text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] border border-line-1"
                            >
                                {theme === 'dark' ? <Sun width={16} height={16} /> : <Moon width={16} height={16} />}
                            </button>

                            <div className="relative" ref={menuRef}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg border border-line-1 hover:bg-[color:var(--surface-card-2)]"
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen}
                                >
                                    <Avatar name={admin.name} />
                                    <span className="hidden sm:inline text-sm font-semibold text-[color:var(--text-1)]">{admin.name}</span>
                                    <ChevronDown width={12} height={12} className="text-muted-3" />
                                </button>
                                {menuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 mt-2 w-60 surface-card border border-line-2 rounded-xl shadow-2xl py-2 z-40"
                                    >
                                        <div className="px-3 py-2 border-b border-line-1">
                                            <div className="text-sm font-semibold truncate">{admin.name}</div>
                                            <div className="text-xs text-muted-3 truncate">{admin.email}</div>
                                            {admin.roles.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {admin.roles.map((r) => (
                                                        <span
                                                            key={r}
                                                            className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[color:var(--surface-card-2)] text-muted-2"
                                                        >
                                                            {r}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                router.post(route('admin.logout'));
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)]"
                                        >
                                            {t('admin.auth.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {(title || subtitle || actions) && (
                        <div className="px-4 sm:px-6 pb-4 pt-1 flex flex-wrap items-end gap-4">
                            <div className="min-w-0">
                                {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
                                {subtitle && <p className="text-sm text-muted-3 mt-0.5">{subtitle}</p>}
                            </div>
                            {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
                        </div>
                    )}
                </header>

                <main className="px-4 sm:px-6 py-6 flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}

function readInitialTheme(serverTheme: SharedProps['theme']): 'dark' | 'light' {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('swapforge-admin-theme');
            if (stored === 'dark' || stored === 'light') return stored;
        } catch {
            // ignore
        }
    }
    return serverTheme === 'light' ? 'light' : 'dark';
}

function Mark() {
    const { props } = usePage<SharedProps>();
    const logo = props.brand.logo;
    if (logo) {
        return (
            <img
                src={logo}
                alt={props.brand.name}
                className="block w-7 h-7 object-contain"
                draggable={false}
            />
        );
    }
    return (
        <span aria-hidden className="block w-7 h-7">
            <svg viewBox="0 0 32 32" fill="none" className="block w-full h-full">
                <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#admMarkG)" />
                <path
                    d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                    stroke="#0a0a0c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient id="admMarkG" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0" stopColor="#c7f74a" />
                        <stop offset="1" stopColor="#7fe55a" />
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
            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[color:var(--surface-card-2)] text-xs font-semibold text-[color:var(--text-1)] ring-1 ring-inset ring-[color:var(--line-2)]"
        >
            {initials || '·'}
        </span>
    );
}

function NavIcon({ path }: { path: string }) {
    return (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={path} />
        </svg>
    );
}
