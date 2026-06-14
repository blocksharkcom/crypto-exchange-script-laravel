import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Globe, Moon, Sun, X } from '@/components/ui/Icons';
import AiChatWidget from '@/components/chat/AiChatWidget';
import type { SharedProps } from '@/Types';

interface Props { children: ReactNode; }

export default function PublicLayout({ children }: Props) {
    const t = useT();
    const { props } = usePage<SharedProps>();
    const { brand, theme: initialTheme, i18n } = props;
    const [theme, setTheme] = useState<'dark' | 'light'>(() => (initialTheme === 'dark' ? 'dark' : 'light'));
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem('swapforge-theme', theme); } catch { /* ignore */ }
    }, [theme]);

    useEffect(() => {
        document.documentElement.style.overflow = mobileOpen ? 'hidden' : '';
    }, [mobileOpen]);

    const primaryLinks: NavLink[] = [
        { label: t('card.tab_exchange'), href: '/'      },
        { label: t('help.title'),        href: '/help'  },
        { label: t('faq.title'),         href: '/#faq'  },
        ...(props.nav?.header ?? []),
    ];

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <span className="page-glow" aria-hidden />

            <Header
                brand={brand.name}
                t={t}
                i18n={i18n}
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                links={primaryLinks}
                onOpenMobile={() => setMobileOpen(true)}
            />

            <MobileDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                t={t}
                i18n={i18n}
                theme={theme}
                onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                links={primaryLinks}
            />

            <main>{children}</main>

            <Footer brand={brand.name} legal={props.legal} footerLinks={props.nav?.footer ?? []} t={t} />

            {props.chat?.enabled && <AiChatWidget assistantName={props.chat.assistant_name} />}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

interface NavLink { label: string; href: string }

function Header({
    brand, t, i18n, theme, onToggleTheme, links, onOpenMobile,
}: {
    brand: string;
    t: (k: string, r?: Record<string, string | number>) => string;
    i18n: SharedProps['i18n'];
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
    links: NavLink[];
    onOpenMobile: () => void;
}) {
    return (
        <header className="relative z-30">
            <div className="container-edge h-16 sm:h-20 flex items-center justify-between gap-3">
                {/* Left: brand + flat desktop links */}
                <div className="flex items-center gap-2 sm:gap-5 lg:gap-8 min-w-0">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-[color:var(--text-1)] shrink-0">
                        <Mark />
                        <span className="text-base tracking-tight hidden sm:inline">{brand}</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Primary">
                        {links.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="inline-flex items-center px-3 py-2 rounded-full font-medium text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 sm:gap-3 text-sm">
                    <LangSwitcher i18n={i18n} className="hidden md:flex" />
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} className="hidden sm:inline-flex" />
                    <ProfileBtn t={t} />

                    <button
                        type="button"
                        aria-label="Open menu"
                        onClick={onOpenMobile}
                        className="lg:hidden ml-1 w-10 h-10 grid place-items-center rounded-full border border-line-2 text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] transition"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}


function LangSwitcher({ i18n, className }: { i18n: SharedProps['i18n']; className?: string }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener('mousedown', onDown);
        return () => window.removeEventListener('mousedown', onDown);
    }, [open]);

    return (
        <div ref={ref} className={cn('relative', className)}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-muted-2 hover:text-[color:var(--text-1)] transition px-2 py-1.5 rounded-full"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <Globe width={16} height={16} />
                <span className="font-medium">{i18n.locale.toUpperCase()}</span>
            </button>
            {open && (
                <ul className="absolute right-0 mt-2 min-w-32 surface-card border border-line-2 rounded-xl py-1 shadow-2xl" role="listbox">
                    {i18n.available.map((code) => (
                        <li key={code}>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    router.post(`/lang/${code}`, {}, {
                                        preserveScroll: true,
                                        onSuccess: () => router.reload({ only: ['i18n'] }),
                                    });
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
    );
}

function ThemeToggle({ theme, onToggle, className }: { theme: 'dark' | 'light'; onToggle: () => void; className?: string }) {
    const isDark = theme === 'dark';
    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={onToggle}
            className={cn(
                'relative w-12 h-6 rounded-full transition shrink-0',
                isDark
                    ? 'bg-[color:var(--color-progress)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.18)]'
                    : 'bg-[color:var(--surface-card-2)] shadow-[inset_0_0_0_1px_var(--line-3)]',
                className,
            )}
        >
            <span className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full grid place-items-center transition-all bg-white text-[color:var(--color-progress)]',
                'shadow-[0_2px_4px_rgba(0,0,0,0.18),0_0_0_0.5px_rgba(0,0,0,0.04)]',
                isDark ? 'left-[26px]' : 'left-0.5',
            )}>
                {isDark ? <Moon width={12} height={12} /> : <Sun width={12} height={12} />}
            </span>
        </button>
    );
}

function ProfileBtn({ t }: { t: (k: string, r?: Record<string, string | number>) => string }) {
    const { props } = usePage<SharedProps>();
    const user = props.auth.user;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('mousedown', onDown);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const initials = (() => {
        const src = user?.name ?? user?.email ?? '';
        return src
            .split(/\s+|@/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0])
            .join('')
            .toUpperCase() || '·';
    })();

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={user ? user.email : 'Account'}
                onClick={() => setOpen((v) => !v)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full grid place-items-center bg-[color:var(--surface-card-2)] text-muted-2 border border-line-2 hover:text-[color:var(--text-1)] hover:border-line-3 transition shrink-0"
            >
                {user ? (
                    <span className="text-xs font-semibold text-[color:var(--text-1)]">{initials}</span>
                ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                        <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                    </svg>
                )}
            </button>
            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 min-w-56 surface-card border border-line-2 rounded-2xl py-2 shadow-2xl z-50"
                >
                    {user ? (
                        <>
                            <div className="px-4 py-2 border-b border-line-1">
                                <div className="text-sm font-semibold truncate">{user.name ?? user.email}</div>
                                <div className="text-xs text-muted-3 truncate">{user.email}</div>
                            </div>
                            <Link
                                href="/account"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition"
                            >
                                {t('account.nav.dashboard')}
                            </Link>
                            <Link
                                href="/account/transactions"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition"
                            >
                                {t('account.nav.transactions')}
                            </Link>
                            <Link
                                href="/account/tickets"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition"
                            >
                                {t('account.nav.tickets')}
                            </Link>
                            <Link
                                href="/account/settings"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition"
                            >
                                {t('account.nav.settings')}
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    router.post('/sign-out');
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-muted-2 hover:bg-[color:var(--surface-card-2)] hover:text-[color:var(--text-1)] transition border-t border-line-1 mt-1"
                            >
                                {t('account.nav.sign_out')}
                            </button>
                        </>
                    ) : (
                        <div className="px-3 py-2 grid gap-2">
                            <Link
                                href="/sign-in"
                                onClick={() => setOpen(false)}
                                className="cta !py-2 !text-sm"
                            >
                                {t('account.nav.sign_in')}
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setOpen(false)}
                                className="cta cta-ghost !py-2 !text-sm"
                            >
                                {t('account.nav.register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DRAWER
// ─────────────────────────────────────────────────────────────────────────────

function MobileDrawer({
    open, onClose, t, i18n, theme, onToggleTheme, links,
}: {
    open: boolean;
    onClose: () => void;
    t: (k: string, r?: Record<string, string | number>) => string;
    i18n: SharedProps['i18n'];
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
    links: NavLink[];
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 lg:hidden transition-opacity duration-200',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            )}
            aria-hidden={!open}
        >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <aside
                className={cn(
                    'absolute right-0 top-0 h-full w-[88%] max-w-sm surface-card border-l border-line-1 shadow-2xl transition-transform duration-300 ease-out',
                    open ? 'translate-x-0' : 'translate-x-full',
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between px-5 h-16 border-b border-line-1">
                    <span className="font-semibold text-[color:var(--text-1)]">Menu</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="w-9 h-9 grid place-items-center rounded-full text-muted-2 hover:text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] transition"
                    >
                        <X />
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-4rem)] px-5 py-4 space-y-6">
                    <ul className="space-y-0.5">
                        {links.map((l) => (
                            <li key={l.href}>
                                <a
                                    href={l.href}
                                    onClick={onClose}
                                    className="block px-3 py-2.5 rounded-xl text-[15px] font-medium text-[color:var(--text-1)] hover:bg-[color:var(--surface-card-2)] transition"
                                >
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="pt-2 border-t border-line-1">
                        <div className="flex items-center justify-between px-2 py-3">
                            <div className="flex items-center gap-2 text-sm text-muted-2">
                                <Globe width={16} height={16} />
                                <span>{t('nav.language')}</span>
                            </div>
                            <div className="flex gap-1.5">
                                {i18n.available.map((code) => (
                                    <button
                                        key={code}
                                        type="button"
                                        onClick={() => router.post(`/lang/${code}`, {}, {
                                            preserveScroll: true,
                                            onSuccess: () => { onClose(); router.reload({ only: ['i18n'] }); },
                                        })}
                                        className={cn(
                                            'px-2.5 py-1 rounded-md text-xs font-semibold',
                                            code === i18n.locale
                                                ? 'bg-[color:var(--color-brand-300)] text-[color:var(--color-brand-ink)]'
                                                : 'text-muted-2 hover:bg-[color:var(--surface-card-2)]',
                                        )}
                                    >
                                        {code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2 py-3">
                            <div className="flex items-center gap-2 text-sm text-muted-2">
                                {theme === 'dark' ? <Moon width={16} height={16} /> : <Sun width={16} height={16} />}
                                <span>Theme</span>
                            </div>
                            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        </div>
                    </div>

                    <MobileAuthBlock t={t} onClose={onClose} />
                </div>
            </aside>
        </div>
    );
}

function MobileAuthBlock({ t, onClose }: { t: (k: string, r?: Record<string, string | number>) => string; onClose: () => void }) {
    const { props } = usePage<SharedProps>();
    const user = props.auth.user;
    if (user) {
        return (
            <div className="mt-2 grid gap-2">
                <Link href="/account" onClick={onClose} className="cta">
                    {t('account.nav.dashboard')}
                </Link>
                <button
                    type="button"
                    onClick={() => {
                        onClose();
                        router.post('/sign-out');
                    }}
                    className="cta cta-ghost"
                >
                    {t('account.nav.sign_out')}
                </button>
            </div>
        );
    }
    return (
        <div className="mt-2 grid gap-2">
            <Link href="/sign-in" onClick={onClose} className="cta">
                {t('account.nav.sign_in')}
            </Link>
            <Link href="/register" onClick={onClose} className="cta cta-ghost">
                {t('account.nav.register')}
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer({ brand, legal, footerLinks, t }: {
    brand: string;
    legal: SharedProps['legal'];
    footerLinks: NavLink[];
    t: (k: string, r?: Record<string, string | number>) => string;
}) {
    return (
        <footer className="relative z-10 border-t border-line-1 mt-20 sm:mt-24">
            <div className="container-edge py-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div className="space-y-3">
                    <div className="flex items-center gap-2.5 font-bold">
                        <Mark />
                        <span>{brand}</span>
                    </div>
                    <p className="text-muted-3 max-w-xs">{t('footer.disclaimer')}</p>
                </div>
                <FooterCol heading={t('footer.product')} items={[
                    { href: '/#features',  label: t('feature.title', { brand }) },
                    { href: '/#how',       label: t('how.title') },
                    { href: '/#faq',       label: t('faq.title') },
                ]} />
                <FooterCol heading={t('footer.company')} items={[
                    { href: '/help',             label: t('footer.contact') },
                    { href: '/documentation/',   label: t('footer.docs') },
                ]} />
                <FooterCol heading={t('footer.legal')} items={[
                    { href: legal.terms   ?? '#', label: t('footer.terms') },
                    { href: legal.privacy ?? '#', label: t('footer.privacy') },
                    { href: legal.aml     ?? '#', label: t('footer.aml') },
                    ...footerLinks,
                ]} />
            </div>
            <div className="container-edge py-5 text-xs text-muted-3 border-t border-line-1">
                {t('footer.copyright', { year: new Date().getFullYear(), brand })}
            </div>
        </footer>
    );
}

function FooterCol({ heading, items }: { heading: string; items: { href: string; label: string }[] }) {
    return (
        <div>
            <h4 className="text-[color:var(--text-1)] font-semibold mb-3">{heading}</h4>
            <ul className="space-y-2 text-muted-3">
                {items.map((it) => (
                    <li key={it.label}>
                        <a href={it.href} className="hover:text-[color:var(--text-1)] transition">{it.label}</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Mark() {
    const { props } = usePage<SharedProps>();
    const logo = props.brand.logo;
    if (logo) {
        return (
            <img
                src={logo}
                alt={props.brand.name}
                className="block w-7 h-7 sm:w-8 sm:h-8 object-contain"
                draggable={false}
            />
        );
    }
    return (
        <span aria-hidden className="block w-7 h-7 sm:w-8 sm:h-8">
            <svg viewBox="0 0 32 32" fill="none" className="block w-full h-full">
                <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#brandg)" />
                <path
                    d="M11 11h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3h-7l3 3M21 21h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3h7l-3-3"
                    stroke="#0a0a0c"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient id="brandg" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0" stopColor="#bff15a" />
                        <stop offset="1" stopColor="#7be09a" />
                    </linearGradient>
                </defs>
            </svg>
        </span>
    );
}
