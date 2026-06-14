# Changelog

All notable changes to **CrossSwap** are documented here.
The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to semantic versioning.

## [1.1.0] — 2026-06-14

### Added

- **Multi-locale Pages CMS**: per-locale title/excerpt/body via a new `page_translations` table; admin Edit screen shows a locale-tab pill strip with filled-dot completeness indicators; public `/p/{slug}` resolves the active locale with fallback to the default locale and then to legacy columns (`App\Models\Page::translated()`, `App\Models\PageTranslation`).
- **Editable marketing-content sections (Content CMS)**: admins edit four homepage sections per locale — Highlights, Reviews carousel, Stats counter, and How it works — without touching code. Backed by a new `content_sections` table, `App\Models\ContentSection`, `App\Support\Content`, `App\Http\Controllers\Admin\ContentController`, and an `/admin/content` admin nav entry. `Content::defaults()` ships defaults so a clean install still renders the homepage; per-section locale tabs on the edit screen.
- **Markdown editor in admin Pages**: new `resources/js/components/admin/MarkdownEditor.tsx` with a tabbed Write/Preview UI and toolbar (heading, bold, italic, code, list, numbered, link, quote); preview uses the existing `renderMarkdown` helper, no external editor dependency.
- **Rate slider on the Limit order form**: the target-rate input is a slider from -50% to +200% around the live market rate, with quick chips (-10%, -5%, Market, +10%, +25%); market rate is fetched independently with `amount=1` on pair change so the slider is anchored before amount entry (`resources/js/components/exchange/LimitCard.tsx`).
- **Typewriter hero headline**: animated multi-word typewriter cycles through "instantly", "in seconds", "across 30+ chains", and "with zero KYC" on the homepage; respects `prefers-reduced-motion`; localized in all four shipped languages via `hero.rotate_1/2/3` keys.

### Changed

- Limit-order target-rate input replaced with a slider plus quick-chip presets, anchored on the live market rate.
- Homepage hero headline now uses a typewriter animation in place of the static string.

---

## [1.0.0] — Initial CodeCanyon release

### Added

- Public, mobile-responsive swap card with 4-step flow (pair → address → deposit → done).
- **Limit orders** and **Recurring (DCA) swaps** tabs alongside the instant exchange.
- Customer accounts (optional): sign-up, sign-in, magic-link password reset, dashboard
  with lifetime swaps / fees / volume, swap history, ticket inbox, settings.
- **Real-time** ChangeNOW v2 integration (currencies, estimate, min-amount, create,
  status sync, address validation) with cached estimates and rate limiting.
- Searchable **Help center**: 5 categories, 17 articles, full-text search, ticket portal
  with magic-link customer reply flow and email notifications.
- **AI live chat widget** with provider abstraction (OpenAI / Anthropic / disabled),
  admin-configurable system prompt + assistant name.
- Advanced **admin panel**: dashboard with 14-day chart, KPIs, recent transactions,
  stuck-swap monitor, audit log (Owen-It), API management, ticket queue, user
  management, branding + theme settings, and a per-tab settings page.
- **Web-based installer**: requirements check, database wizard, admin account, brand,
  API key probe, install lock + redirect to admin panel on finalize.
- Offline documentation site at `/documentation/`.
- 4 language packs out of the box: English, Spanish, German, French.
- Light + dark theme with brand-tunable tokens.
- Branded error pages: 404 / 419 / 500 / 503.
- Background jobs: stuck-transaction flagger, transaction status poller, limit-order
  poller, recurring-schedule runner, receipt mailer.
- Scheduled cleanups: API log pruning, expired-order sweep.
- PWA manifest + theme-aware Open Graph image.

### Security

- Strict separation between customer (`web`) and admin (`admin`) auth guards.
- Password hashing via Argon2id (Laravel default).
- CSRF protection on every form; signed routes for one-shot ticket portal reads.
- Spatie permissions for admin role separation.
- Honeypot field on public auth + ticket forms.
- Strict TLS scheme enforcement when `APP_ENV=production`.
- Security headers middleware (X-Frame-Options DENY, Content-Type-Options,
  Permissions-Policy, Referrer-Policy, COOP, CORP).

### Tech stack

- Laravel 12, PHP 8.2+
- React 19 + TypeScript (strict) + Inertia v2
- Tailwind CSS v4 + Vite 7
- Horizon-backed queues (Redis recommended)
- SQLite / MySQL 8 / PostgreSQL supported

---

## Upgrade notes

This is the first release. Future upgrade notes will appear here.
