# CrossSwap

**Cross-Chain Multi-Blockchain Exchange with ChangeNOW Integration**

A self-hosted, production-grade crypto exchange script. Buyers can launch a
no-custody, no-KYC swap business in under 10 minutes, earn a commission on
every swap, and run the whole thing from a single PHP host.

Live demo: see your CodeCanyon item description. Demo credentials: `admin@demo.com` / `user@demo.com` (password `password!321`).

---

## What's inside

- **Public swap card** — 4-step flow (pair → address → deposit → done) on every breakpoint.
- **Limit orders** and **Recurring (DCA) swaps** alongside the instant exchange.
- **Rate slider on limit orders** — target rate is a slider (-50% to +200% around the live market rate) with quick chips (-10%, -5%, Market, +10%, +25%); market rate is fetched on pair change so the slider is anchored before amount entry.
- **Customer accounts** — optional sign-up, dashboard with lifetime swaps / fees / volume, swap history, ticket inbox, settings.
- **Real ChangeNOW v2 integration** — currencies, estimate, min-amount, create, status sync, address validation.
- **Typewriter hero headline** — animated multi-word cycle on the homepage, localized across all shipped languages and respecting `prefers-reduced-motion`.
- **Searchable help center** — 5 categories, 17 articles, full-text search, ticket portal with magic-link reply.
- **AI live chat widget** — provider abstraction (OpenAI / Anthropic / disabled).
- **Advanced admin panel** — dashboard, KPIs, stuck-swap monitor, audit log, ticket queue, API management, settings.
- **Multi-locale Pages CMS** — per-locale title/excerpt/body via a `page_translations` table; admin Edit screen uses a locale-tab pill strip with filled-dot completeness indicators; public `/p/{slug}` resolves the active locale with fallback to the default locale and then to legacy columns.
- **Editable marketing-content sections (Content CMS)** — admins edit four homepage sections per locale without touching code: Highlights (4 value props under the hero), Reviews carousel (3-at-a-time), Stats counter (animated tiles), and How it works (4-step walkthrough). Backed by a `content_sections` table with sensible defaults so a clean install still renders the homepage.
- **Markdown editor in admin Pages** — tabbed Write/Preview UI with a toolbar (heading, bold, italic, code, list, numbered, link, quote), no external editor dependency.
- **Web-based installer** — requirements check, DB wizard, admin account, brand, API key probe.
- **Offline documentation** under `/documentation/`.
- 4 language packs out of the box: English, Spanish, German, French.
- Light + dark theme.
- Branded error pages (404 / 419 / 500 / 503).
- Background jobs + scheduled tasks for status sync and stuck-swap detection.

---

## Requirements

- PHP **8.2** or later
- Composer 2.x
- Node.js 20+ (only needed if you want to rebuild assets)
- A relational DB: **SQLite** (default), MySQL 8, or PostgreSQL 14+
- (Optional, recommended for production) Redis for Horizon-backed queues
- A ChangeNOW partner API key — free at <https://changenow.io/affiliate>

---

## Installation

The fastest path is the **web installer**.

1. Upload the contents of this archive to your web root.
2. Point your domain at `/public`.
3. Copy `.env.example` to `.env` and run `php artisan key:generate`.
4. Visit `https://your-domain.com/install` in a browser.
5. Walk through the wizard:
   - Requirements check
   - Database connection
   - Admin account creation
   - Branding
   - ChangeNOW API key
6. On the final step you'll be redirected straight into the admin panel.

Full installation, configuration, customisation, API reference, and troubleshooting docs ship offline at `/documentation/` once the project is uploaded.

### Manual install

If you prefer the CLI:

```bash
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
# edit .env to set DB, MAIL, CHANGENOW_API_KEY
php artisan migrate --force
php artisan db:seed --class=AdminRolesSeeder --force
```

Then visit `/install` to create the admin account and finalize.

---

## Operating in production

### Queue worker

The platform schedules background jobs every minute (limit-order polling) and every
5 minutes (recurring schedules). A queue worker must be running.

With Horizon (recommended):
```bash
php artisan horizon
```

With the default driver:
```bash
php artisan queue:work --tries=3 --timeout=60
```

### Scheduler

Add this cron entry to your server:
```cron
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### Mail

Edit `.env` to configure SMTP. Receipts, ticket replies, and stuck-swap alerts all go through Laravel's mail system.

### Updates

When CodeCanyon publishes an update, re-download the archive, replace files,
preserve your `.env` + `storage/` + `database/database.sqlite` (or your real DB),
then run:

```bash
php artisan migrate --force
php artisan optimize:clear
```

---

## Packaging an update for CodeCanyon

If you are the author re-bundling the archive:

```bash
npm run build
php artisan crossswap:prepare-archive   # wipes sensitive data
bin/package-codecanyon.sh 1.0.0          # produces dist/crossswap-1.0.0.zip
```

`prepare-archive` removes the install lock, sensitive settings rows, sessions, caches and the SQLite database, then leaves a clean placeholder for the buyer.

---

## Earning on every swap

ChangeNOW pays partners a percentage of the spread on every successful swap
placed through your API key. By default partners earn **~0.4% of swap volume**;
rate goes up with volume and top partners negotiate custom tiers.

- Sign up: <https://changenow.io/affiliate>
- API documentation: <https://documenter.getpostman.com/view/8180765/SVfTPnM8>
- Track your share inside the admin panel: **API Management → Partner stats**.

---

## Support

Support is provided to CodeCanyon buyers via the item's comments tab. Please include:

- Your CodeCanyon username
- The exact PHP version (`php -v`)
- The exact error message + screenshots
- Any custom code you added near the issue

---

## Licence

See `LICENSE.md`.

## Changelog

See `CHANGELOG.md`.
