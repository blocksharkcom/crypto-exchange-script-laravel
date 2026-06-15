# Cross-Chain Crypto Exchange Script (Laravel + React)

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg)](LICENSE)
[![Laravel 12](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel)](https://laravel.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Live demo](https://img.shields.io/badge/demo-cross--swap.blockshark.com-22c55e)](https://cross-swap.blockshark.com)

A self-hosted, non-custodial cross-chain crypto swap interface built on
Laravel 12 + React 19, with ChangeNOW v2 integration. Ships with a full admin
panel, multi-locale CMS, web installer, helpdesk, AI chat widget, customer
accounts, limit orders, and recurring (DCA) swaps. Operators run a branded
swap interface across 30+ chains without custody, KYC, or liquidity provision.

> **Need a custom build, white-label deployment, or commercial license?**
> [Blockshark](https://blockshark.com) ships production crypto infrastructure
> on demand. → [blockshark.com/contact](https://blockshark.com/contact)

## Live demo

**[cross-swap.blockshark.com](https://cross-swap.blockshark.com)**

| Account  | Email           | Password    |
|----------|-----------------|-------------|
| Admin    | admin@demo.com  | password!321 |
| Customer | user@demo.com   | password!321 |

The demo is wired to a real ChangeNOW partner key — every rate, currency, and
estimate is live.

## What it does

- Four-step swap card (pair → address → deposit → done) on every breakpoint.
- Limit orders and recurring (DCA) swaps alongside instant swaps.
- Customer accounts with lifetime swap volume, fees paid, swap history,
  ticket inbox, and 2FA.
- Hand-rolled admin: dashboard with KPIs and 14-day chart, transactions table,
  stuck-swap monitor, audit log, ticket queue, user management, mass-email
  campaigns, multi-locale Content CMS, multi-locale Pages CMS with a tabbed
  Markdown editor, settings tabs for brand / theme / mail / currencies / API /
  AI chat / security.
- AI chat widget with OpenAI / Anthropic provider abstraction (optional).
- Searchable help center with categorized articles + ticket portal +
  magic-link email reply.
- Branded error pages, signed routes, Spatie CSP, Spatie Permissions,
  Owen-It Audit, Horizon-backed queues.
- Web installer: seven-step wizard with requirements check, DB setup,
  ChangeNOW key probe, and finalize lock.
- Four locales out of the box (English, Spanish, German, French) at full
  key parity. Adding a new locale is one PHP file.

## Quick start

Requires PHP 8.2+, Composer 2, Node 20 (only if rebuilding assets), and
one of SQLite / MySQL 8 / MariaDB 10.6 / PostgreSQL 14+.

```bash
git clone https://github.com/blocksharkcom/crypto-exchange-script-laravel.git
cd crypto-exchange-script-laravel
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

Point your web server at the `public/` directory, then open
`https://your-domain.com/install` in a browser. The seven-step wizard handles
the rest. Full documentation is in [`public/documentation/`](public/documentation/).

## Requirements

- PHP **8.2+** with extensions: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`,
  `json`, `mbstring`, `openssl`, `pcre`, `pdo` (+ one of `pdo_sqlite`,
  `pdo_mysql`, `pdo_pgsql`), `tokenizer`, `xml`, `zip`, `intl`, `sodium`, and
  either `gd` or `imagick`.
- Composer 2.x.
- Node.js 20+ (only if you want to recompile the frontend).
- A relational database.
- Apache 2.4+ or Nginx 1.20+.
- Outbound HTTPS to `api.changenow.io`.
- A free ChangeNOW partner API key (sign up at
  [changenow.io/affiliate](https://changenow.io/affiliate)).
- Recommended: Redis + Laravel Horizon for queues and cache.

## How it works

1. A visitor opens the storefront. The React 19 + Inertia frontend loads from
   your domain, served by Laravel.
2. They pick a pair. Laravel calls the ChangeNOW currencies and estimate
   endpoints server-side, caches the result, and returns the live rate.
3. They paste a destination address. Laravel asks ChangeNOW to validate the
   address format.
4. On submit, Laravel creates a ChangeNOW exchange, persists the transaction,
   and returns a unique one-time deposit address.
5. The customer sends the deposit on-chain. A queued job polls the ChangeNOW
   status endpoint until the swap reaches a terminal state.
6. ChangeNOW settles the trade and pays out directly to the destination.
   No customer funds touch your server.

## Stack

| Layer           | Tech                                                    |
|-----------------|---------------------------------------------------------|
| Backend         | Laravel 12 (PHP 8.2+)                                   |
| Frontend        | React 19 + Inertia v2 + TypeScript (strict)             |
| Styling         | Tailwind CSS v4 with `@theme` brand tokens              |
| Exchange engine | ChangeNOW v2 partner API                                |
| Database        | SQLite (default), MySQL, MariaDB, PostgreSQL            |
| Cache / queues  | Redis + Horizon (recommended) or database driver        |
| Auth            | Separate guards for customers (web) and admins (admin)  |
| Permissions     | Spatie Laravel Permission                               |
| Audit log       | Owen-It Laravel Auditing                                |
| CSP             | Spatie Laravel CSP                                      |

## Documentation

- `public/documentation/index.html` — full HTML reference.
- `public/documentation/CrossSwap-Documentation.pdf` — printable PDF.
- Covers: requirements, installation, configuration, branding, translations,
  features management, updates, and common issues.

## Commercial use & custom development

This project is licensed under the **GNU AGPL-3.0**. That's fine for personal
projects, internal company use, open-source forks, and any deployment where you
publish your modifications.

If you want to:

- Deploy as a closed-source SaaS without releasing your modifications,
- Bundle this into a proprietary product or white-label it for a client,
- Get a custom integration, feature, or full re-skin,
- Get a managed production deployment with monitoring and incident response,

then [**Blockshark**](https://blockshark.com) sells commercial licenses and
ships custom crypto-product engineering on demand.

→ **[Contact us at blockshark.com/contact](https://blockshark.com/contact)**

See [COMMERCIAL.md](COMMERCIAL.md) for details.

## Sponsors

<a href="https://blockshark.com"><strong>Blockshark</strong></a> — custom
crypto infrastructure, smart-contract review, and managed deployments.

## License

[GNU AGPL-3.0](LICENSE). Maintained by [Blockshark](https://blockshark.com).
For commercial licensing, [get in touch](https://blockshark.com/contact).
