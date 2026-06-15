/**
 * Render a clean, minimal PDF documentation for CrossSwap.
 *
 *   node scripts/generate-docs-pdf.mjs
 *
 * The PDF is hand-authored here as plain semantic HTML to keep it readable
 * and predictable. No image embedding, no dark-theme CSS to fight, no fancy
 * callouts that break across pages.
 *
 * Output: public/documentation/CrossSwap-Documentation.pdf
 */
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, unlinkSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'public', 'documentation');
const OUT_PDF = join(DOCS, 'CrossSwap-Documentation.pdf');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CrossSwap — Cross-Chain Multi-Blockchain Exchange with ChangeNOW Integration · Documentation</title>
<style>
@page { size: A4; margin: 22mm 20mm; }
@page :first { margin: 0; }

* { box-sizing: border-box; }

html, body {
    margin: 0; padding: 0;
    background: #ffffff;
    color: #1f2937;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

a { color: #0b6e4f; text-decoration: none; }
strong { color: #0a0a0c; font-weight: 700; }

h1, h2, h3 {
    color: #0a0a0c;
    margin: 0;
    page-break-after: avoid;
    break-after: avoid;
    font-weight: 700;
}
h1 { font-size: 22pt; letter-spacing: -0.01em; margin: 0 0 6px; }
h2 { font-size: 14pt; margin: 26px 0 8px; padding-bottom: 6px;
     border-bottom: 1px solid #e5e7eb; letter-spacing: -0.005em; }
h3 { font-size: 11pt; margin: 18px 0 6px; color: #111827; }

p { margin: 6px 0 10px; }

ul, ol { margin: 6px 0 12px; padding-left: 22px; }
li { margin: 4px 0; page-break-inside: avoid; break-inside: avoid; }

code {
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 9pt;
    color: #0a0a0c;
}
pre {
    background: #f7f8fa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px 12px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 9pt;
    line-height: 1.5;
    margin: 10px 0 14px;
    overflow: hidden;
    white-space: pre-wrap;
    page-break-inside: avoid;
    break-inside: avoid;
    color: #0a0a0c;
}
pre code { background: transparent; border: 0; padding: 0; font-size: 9pt; }

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 9.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
}
th, td { border: 1px solid #e5e7eb; padding: 7px 9px; vertical-align: top; text-align: left; }
th { background: #f9fafb; font-weight: 700; color: #0a0a0c; }

.note {
    border-left: 3px solid #0b6e4f;
    background: #f7fbf9;
    padding: 8px 12px;
    margin: 10px 0 14px;
    border-radius: 4px;
    page-break-inside: avoid;
    break-inside: avoid;
}
.note strong { color: #0b6e4f; }

/* Small inline installer screenshots — kept compact so the doc stays light. */
figure.shot {
    margin: 12px auto;
    width: 62%;
    page-break-inside: avoid;
    break-inside: avoid;
    text-align: center;
}
figure.shot img {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
}
figure.shot figcaption {
    margin-top: 6px;
    font-size: 8.5pt;
    color: #6b7280;
    font-style: italic;
}

/* Architecture / key-value summary box. */
.kv {
    display: grid;
    grid-template-columns: 36% 1fr;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    margin: 10px 0 14px;
    font-size: 9.5pt;
}
.kv > div {
    padding: 8px 12px;
    border-top: 1px solid #e5e7eb;
}
.kv > div:nth-child(-n+2) { border-top: 0; }
.kv > div:nth-child(odd) {
    background: #f9fafb;
    font-weight: 700;
    color: #0a0a0c;
}

/* COVER */
.cover {
    page-break-after: always;
    break-after: page;
    width: 210mm;
    height: 297mm;
    padding: 60mm 24mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.cover-eyebrow {
    font-size: 9pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #0b6e4f;
    font-weight: 700;
    margin-bottom: 12px;
}
.cover h1 {
    font-size: 36pt;
    letter-spacing: -0.015em;
    line-height: 1.1;
    margin: 0;
    color: #0a0a0c;
}
.cover-sub {
    margin-top: 14px;
    font-size: 13pt;
    color: #475569;
    line-height: 1.4;
    font-weight: 400;
}
.cover-rule {
    width: 50px;
    height: 3px;
    background: #0b6e4f;
    margin: 32px 0 28px;
    border-radius: 2px;
}
.cover-block {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px 20px;
    margin: 0 0 14px;
}
.cover-block-label {
    font-size: 8.5pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 700;
    margin-bottom: 6px;
}
.cover-block-value {
    font-size: 12pt;
    color: #0a0a0c;
    font-weight: 600;
}
.cover-creds {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 10px;
}
.cover-creds > div {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 10px;
}
.cover-creds dt {
    font-size: 7.5pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #6b7280;
    margin: 0 0 2px;
    font-weight: 700;
}
.cover-creds dd {
    margin: 0;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 9pt;
    color: #0a0a0c;
}

/* TOC */
.toc { page-break-after: always; break-after: page; }
.toc h2 {
    font-size: 18pt;
    border: 0;
    margin: 0 0 18px;
    padding: 0;
}
.toc ol {
    list-style: none;
    padding: 0;
    margin: 0;
    counter-reset: toc;
}
.toc li {
    counter-increment: toc;
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;
    font-size: 11pt;
    color: #0a0a0c;
}
.toc li::before {
    content: counter(toc, decimal-leading-zero);
    color: #0b6e4f;
    font-weight: 700;
    margin-right: 14px;
    font-variant-numeric: tabular-nums;
}

/* CHAPTERS */
.chapter { page-break-before: always; break-before: page; }
.chapter-eyebrow {
    font-size: 8.5pt;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #0b6e4f;
    font-weight: 700;
}
.chapter > h1 {
    font-size: 22pt;
    padding-bottom: 10px;
    border-bottom: 2px solid #0b6e4f;
    margin: 4px 0 18px;
}
</style>
</head>
<body>

<!-- ============================== COVER ============================== -->
<section class="cover">
    <div class="cover-eyebrow">Official documentation · v1.1.0</div>
    <h1>CrossSwap</h1>
    <p class="cover-sub">Cross-Chain Multi-Blockchain Exchange<br>with ChangeNOW Integration</p>
    <div class="cover-rule"></div>

    <div class="cover-block">
        <div class="cover-block-label">Live demo</div>
        <div class="cover-block-value">https://cross-swap.blockshark.com</div>
    </div>

    <div class="cover-block">
        <div class="cover-block-label">Demo credentials</div>
        <dl class="cover-creds">
            <div><dt>Admin</dt><dd>admin@demo.com</dd></div>
            <div><dt>Customer</dt><dd>user@demo.com</dd></div>
            <div><dt>Password</dt><dd>password!321</dd></div>
        </dl>
    </div>
</section>

<!-- ============================== TOC ============================== -->
<section class="toc">
    <h2>Contents</h2>
    <ol>
        <li>Requirements</li>
        <li>Installation</li>
        <li>Configuration</li>
    </ol>
</section>

<!-- ============================== CHAPTER 1 — REQUIREMENTS ============================== -->
<section class="chapter">
    <div class="chapter-eyebrow">Chapter 01</div>
    <h1>Requirements</h1>

    <p>CrossSwap is a self-hosted Laravel 12 + Inertia + React application. It runs on any PHP-capable host — shared, VPS, container, or bare-metal — provided the runtime versions below are available.</p>

    <h2>Architecture at a glance</h2>
    <div class="kv">
        <div>Storefront</div><div>React 19 + Inertia, served as a single-page app from Laravel.</div>
        <div>Backend</div><div>Laravel 12 (PHP 8.2+) with queued jobs for status polling.</div>
        <div>Database</div><div>SQLite by default; MySQL / MariaDB / PostgreSQL supported.</div>
        <div>Exchange engine</div><div>ChangeNOW v2 partner API (non-custodial).</div>
        <div>Cache &amp; queues</div><div>Database driver works out of the box; Redis + Horizon recommended for production.</div>
        <div>Mail</div><div>Any SMTP server, Mailgun, Postmark, SES, or log driver.</div>
    </div>

    <h2>Server versions</h2>
    <table>
        <thead>
            <tr><th style="width:32%">Component</th><th>Minimum</th><th>Recommended</th></tr>
        </thead>
        <tbody>
            <tr><td>PHP</td><td>8.2</td><td>8.3 or 8.4</td></tr>
            <tr><td>Composer</td><td>2.x</td><td>Latest stable</td></tr>
            <tr><td>Web server</td><td>Apache 2.4 / Nginx 1.20</td><td>Nginx 1.24+</td></tr>
            <tr><td>Database</td><td>SQLite 3.35 / MySQL 8.0 / MariaDB 10.6 / PostgreSQL 14</td><td>MySQL 8.0+ or PostgreSQL 16+</td></tr>
            <tr><td>Node.js</td><td>not required at runtime</td><td>20+ only if rebuilding assets</td></tr>
            <tr><td>Memory (RAM)</td><td>256 MB</td><td>512 MB+</td></tr>
            <tr><td>Disk</td><td>250 MB free</td><td>1 GB+</td></tr>
        </tbody>
    </table>
    <div class="note"><strong>Node is optional.</strong> The archive ships a fully built <code>public/build/</code> directory. You only need Node + npm if you want to recompile the front-end after editing Tailwind tokens or React source.</div>

    <h2>PHP extensions</h2>
    <p>The runtime needs the following PHP extensions. Most are bundled with the default PHP package on Ubuntu, Debian, RHEL, and almost every shared host.</p>
    <p><code>bcmath</code>, <code>ctype</code>, <code>curl</code>, <code>dom</code>, <code>fileinfo</code>, <code>json</code>, <code>mbstring</code>, <code>openssl</code>, <code>pcre</code>, <code>pdo</code> (plus one of <code>pdo_sqlite</code>, <code>pdo_mysql</code>, <code>pdo_pgsql</code>), <code>tokenizer</code>, <code>xml</code>, <code>zip</code>, <code>intl</code>, <code>sodium</code>, and either <code>gd</code> or <code>imagick</code> for image processing.</p>
    <p>To install everything on a fresh Ubuntu/Debian box:</p>
    <pre><code>sudo apt update
sudo apt install -y php8.2-cli php8.2-fpm php8.2-mbstring php8.2-xml \\
    php8.2-curl php8.2-zip php8.2-bcmath php8.2-intl php8.2-gd \\
    php8.2-sqlite3 php8.2-mysql php8.2-pgsql php8.2-redis</code></pre>
    <div class="note"><strong>Recommended optional extension:</strong> <code>redis</code> — enables Horizon-backed queues for background jobs (status sync, stuck-swap detection, recurring orders, mail send).</div>

    <h2>External services</h2>
    <ul>
        <li><strong>ChangeNOW partner API key</strong> — free, sign up at <code>changenow.io/affiliate</code>. Earnings post automatically to your partner balance.</li>
        <li><strong>Outbound HTTPS</strong> to <code>api.changenow.io</code> on TCP/443.</li>
        <li><strong>SMTP credentials</strong> (optional) for ticket replies, password resets, swap receipts. Configurable later in the admin.</li>
        <li><strong>OpenAI or Anthropic API key</strong> (optional) for the AI chat widget. Falls back to the ticket portal if not configured.</li>
    </ul>

    <h2>Hosting checklist</h2>
    <p>Before running the installer, confirm:</p>
    <ul>
        <li>Document root points to <code>public/</code>, not the project root.</li>
        <li>URL rewriting enabled (mod_rewrite for Apache, <code>try_files</code> for Nginx).</li>
        <li>HTTPS available — Let's Encrypt via <code>certbot</code> is enough.</li>
        <li><code>storage/</code> and <code>bootstrap/cache/</code> writable by the web server user.</li>
        <li>A cron entry that runs <code>php artisan schedule:run</code> every minute.</li>
        <li>A long-running queue worker via <code>php artisan queue:work</code> or <code>php artisan horizon</code>.</li>
    </ul>
</section>

<!-- ============================== CHAPTER 2 — INSTALLATION ============================== -->
<section class="chapter">
    <div class="chapter-eyebrow">Chapter 02</div>
    <h1>Installation</h1>

    <h2>Step 1 — Upload</h2>
    <p>Extract the archive on your local machine, then upload the contents of <code>main_files/crossswap/</code> to your web hosting account. Use SFTP, SSH/rsync, or the file manager built into cPanel/Plesk.</p>

    <h2>Step 2 — Document root</h2>
    <p>Point your domain at the <code>public/</code> directory of the uploaded files. On cPanel/Plesk, edit the domain's "document root" setting. On a custom VPS, edit the nginx or Apache vhost so the root maps to <code>/path/to/crossswap/public</code>.</p>

    <h3>Example Nginx vhost</h3>
    <pre><code>server {
    listen 80;
    server_name your-domain.com;
    root /var/www/crossswap/public;
    index index.php;

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \\.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    location ~ /\\.(?!well-known).* { deny all; }
}</code></pre>

    <h2>Step 3 — Permissions</h2>
    <p>Two directories need to be writable by the web server user (usually <code>www-data</code>):</p>
    <pre><code>chown -R www-data:www-data /path/to/crossswap
chmod -R 775 /path/to/crossswap/storage
chmod -R 775 /path/to/crossswap/bootstrap/cache</code></pre>

    <h2>Step 4 — Web installer</h2>
    <p>Open <code>https://your-domain.com/install</code> in a browser. The seven-step wizard walks you through the rest. Each screen has a "Next" button at the bottom — the installer will not advance until the current step is valid.</p>

    <h3>4.1 Welcome</h3>
    <p>Introductory screen with a brief overview and a "Get started" button. No input required.</p>
    <figure class="shot">
        <img src="img-pdf/installer-01-welcome.jpg" alt="Installer welcome screen.">
        <figcaption>Step 01 — Welcome.</figcaption>
    </figure>

    <h3>4.2 Requirements check</h3>
    <p>The installer audits PHP version, every required extension, and folder permissions on <code>storage/</code> and <code>bootstrap/cache/</code>. Each row is green or red. Fix any reds before continuing — you can refresh the page after each fix.</p>
    <figure class="shot">
        <img src="img-pdf/installer-02-requirements.jpg" alt="Installer requirements check screen.">
        <figcaption>Step 02 — Requirements check.</figcaption>
    </figure>

    <h3>4.3 Database</h3>
    <p>Pick a driver. SQLite is the zero-config default — the installer creates <code>database/database.sqlite</code> for you. For MySQL or PostgreSQL, enter host, port, database name, username, and password; the installer runs a test connection before moving on.</p>
    <figure class="shot">
        <img src="img-pdf/installer-03-database.jpg" alt="Installer database step.">
        <figcaption>Step 03 — Database.</figcaption>
    </figure>

    <h3>4.4 Admin account</h3>
    <p>Create the first admin user — email, full name, password. This account is granted the <code>superadmin</code> role and can manage every other admin from <strong>Admin → Users</strong>.</p>
    <figure class="shot">
        <img src="img-pdf/installer-04-admin.jpg" alt="Installer admin account step.">
        <figcaption>Step 04 — Admin account.</figcaption>
    </figure>

    <h3>4.5 Branding</h3>
    <p>Upload a logo (PNG/SVG/JPG), set the brand name, tagline, and primary brand colour. All of these can be changed later under <strong>Admin → Settings → Brand</strong>.</p>
    <figure class="shot">
        <img src="img-pdf/installer-05-branding.jpg" alt="Installer branding step.">
        <figcaption>Step 05 — Branding.</figcaption>
    </figure>

    <h3>4.6 ChangeNOW API key</h3>
    <p>Paste your partner API key. The installer probes the ChangeNOW currencies endpoint and shows a green check on success or a clear error on failure (most often "invalid key" or "network blocked").</p>
    <figure class="shot">
        <img src="img-pdf/installer-06-api.jpg" alt="Installer ChangeNOW API key step.">
        <figcaption>Step 06 — ChangeNOW API key.</figcaption>
    </figure>

    <h3>4.7 Done</h3>
    <p>The finalise step writes <code>storage/app/installed.lock</code>, runs <code>migrate</code> + <code>db:seed</code>, optimises the app caches, and redirects you to the admin login. Sign in with the credentials from step 4.4.</p>
    <figure class="shot">
        <img src="img-pdf/installer-07-done.jpg" alt="Installer done screen.">
        <figcaption>Step 07 — Done.</figcaption>
    </figure>

    <div class="note"><strong>The installer can be re-run safely.</strong> Delete <code>storage/app/installed.lock</code> and visit <code>/install</code> again. The DB schema migration is idempotent and existing rows are preserved.</div>

    <h2>Step 5 — Background workers (recommended)</h2>
    <p>CrossSwap uses queued jobs to poll swap status, flag stuck transactions, send receipts, and process recurring (DCA) orders. Configure a queue worker:</p>
    <pre><code># With Redis + Horizon (recommended)
php artisan horizon

# Or with the database driver (no Redis needed)
php artisan queue:work --tries=3 --timeout=60</code></pre>

    <h3>Cron entry</h3>
    <p>Add the Laravel scheduler to cron so prune jobs and recurring orders fire on time:</p>
    <pre><code>* * * * * cd /path/to/crossswap && php artisan schedule:run &gt;&gt; /dev/null 2&gt;&amp;1</code></pre>

    <h2>Step 6 — Verify</h2>
    <ul>
        <li>Visit <code>/</code> — the storefront swap card should load with live rates.</li>
        <li>Visit <code>/admin</code> — sign in with the credentials you created.</li>
        <li>Open <strong>Admin → Dashboard</strong> — KPIs and the 14-day chart should render.</li>
        <li>Place a test swap (e.g. BTC → ETH for a small amount) — it should appear in <strong>Admin → Transactions</strong>.</li>
    </ul>
</section>

<!-- ============================== CHAPTER 3 — CONFIGURATION ============================== -->
<section class="chapter">
    <div class="chapter-eyebrow">Chapter 03</div>
    <h1>Configuration</h1>

    <p>All day-to-day configuration lives in the admin panel under <strong>Admin → Settings</strong>. Each tab persists immediately to the <code>settings</code> table and is read back into the running application without a deploy or cache flush.</p>

    <h2>Where things live</h2>
    <div class="kv">
        <div><code>.env</code></div><div>Runtime secrets — DB credentials, app key, ChangeNOW API key, SMTP password. Never commit this file.</div>
        <div><code>config/</code></div><div>Default values for everything. Read once at boot; override via <code>.env</code> or the admin.</div>
        <div><code>lang/</code></div><div>One folder per locale (<code>en</code>, <code>es</code>, <code>de</code>, <code>fr</code>). Flat PHP arrays.</div>
        <div><code>storage/app/public/</code></div><div>Uploaded brand logo + content media. Symlinked to <code>public/storage</code> by <code>storage:link</code>.</div>
        <div><code>storage/logs/</code></div><div>Application logs. Tail <code>laravel.log</code> when debugging.</div>
        <div><code>database/database.sqlite</code></div><div>Default SQLite file (only when DB driver is sqlite).</div>
    </div>

    <h2>Brand</h2>
    <ul>
        <li><strong>Logo</strong> — drag-and-drop PNG/SVG/JPG. Stored in <code>storage/app/public/</code> and linked via <code>php artisan storage:link</code>.</li>
        <li><strong>Brand name</strong> — appears in nav, footer, emails, and the document <code>&lt;title&gt;</code>.</li>
        <li><strong>Tagline</strong> — homepage subtitle and the Open Graph description.</li>
        <li><strong>Social links</strong> — Twitter/X, Telegram, Discord, GitHub. Hidden in the footer when blank.</li>
        <li><strong>Legal URLs</strong> — privacy, terms, cookies. Either external URLs, or use the bundled Pages CMS to host them on the same domain.</li>
    </ul>

    <h2>Theme</h2>
    <p>Pick light or dark as the default and override the brand colour from the swatch palette. For colour tuning beyond the admin UI, edit the <code>@theme</code> block at the top of <code>resources/css/app.css</code> and rebuild with <code>npm run build</code>. The archive ships a pre-built bundle so Node + npm are only needed when you change tokens or React source.</p>

    <h2>ChangeNOW API</h2>
    <p>Set under <strong>Admin → Settings → API</strong>. The page includes a <strong>Test connection</strong> button that calls the ChangeNOW currencies endpoint and reports the response. If the API is unreachable or the key is invalid, the storefront falls back to a static featured-pair list and surfaces a friendly error in the swap card.</p>
    <p>Common <code>.env</code> overrides:</p>
    <pre><code>CHANGENOW_API_KEY=your-partner-key
CHANGENOW_BASE_URL=https://api.changenow.io/v2
CHANGENOW_FLOW=standard        # or "fixed-rate"
CHANGENOW_RATE_TYPE=expected
CHANGENOW_CACHE_TTL=120        # seconds</code></pre>

    <h2>SMTP / Mail</h2>
    <p>Configure under <strong>Admin → Settings → Mail</strong>. The <strong>Send test email</strong> button at the bottom of the form delivers a marked test message to a target address so you can validate credentials without leaving the admin. The same form also lets you set the "From" name and address used on outbound mail.</p>

    <h2>Currency picker</h2>
    <p><strong>Admin → Settings → Currencies</strong> shows every coin returned by ChangeNOW with a search box and two per-coin toggles:</p>
    <ul>
        <li><strong>Featured</strong> — promotes a coin into the homepage "Popular pairs" rail.</li>
        <li><strong>Blacklist</strong> — hides a coin from the storefront entirely (still visible in the admin).</li>
    </ul>

    <h2>Content CMS</h2>
    <p>The four marketing blocks below the swap card — <strong>Highlights</strong>, <strong>Reviews</strong>, <strong>Stats counter</strong>, and <strong>How it works</strong> — are admin-editable per locale at <strong>Admin → Content</strong>. Each block ships a sensible default so a clean install renders out of the box; the defaults are replaced the moment an admin saves an override.</p>

    <h2>Pages (multi-locale)</h2>
    <p>Privacy, terms, cookies, about, and any other long-form page is a record under <strong>Admin → Pages</strong>. Each page can be translated into the active locales (per-locale tabs at the top of the editor) using a built-in tabbed Write / Preview Markdown editor. Header/footer visibility and sort order are admin-controlled. Public URL pattern: <code>/p/{slug}</code>.</p>

    <h2>Translations</h2>
    <p>The shipped archive includes four locales — English, Spanish, German, French — each at full key parity (1134 keys). Translation files live at <code>lang/&lt;locale&gt;/site.php</code> as flat PHP arrays. To add a new locale:</p>
    <ol>
        <li>Copy <code>lang/en/site.php</code> to <code>lang/&lt;new-locale&gt;/site.php</code>.</li>
        <li>Translate each value, leaving the keys intact.</li>
        <li>Add the locale code to the <code>supported_locales</code> array in <code>config/app.php</code>.</li>
        <li>Run <code>php artisan optimize:clear</code> to refresh the cache.</li>
    </ol>
    <p>To verify all locales are at the same key count:</p>
    <pre><code>php -r "\\$flat = function(\\$a,\\$p='') use (&amp;\\$flat){\\$o=[];foreach(\\$a as \\$k=&gt;\\$v){\\$key=\\$p===''?\\$k:\"\\$p.\\$k\";if(is_array(\\$v))\\$o+=\\$flat(\\$v,\\$key);else \\$o[\\$key]=\\$v;}return \\$o;};
foreach(['en','es','de','fr'] as \\$l) echo \"\\$l: \".count(\\$flat(include \"lang/\\$l/site.php\")).PHP_EOL;"</code></pre>

    <h2>Updating CrossSwap</h2>
    <p>When a new release is published on CodeCanyon:</p>
    <ol>
        <li>Back up <code>.env</code> and the database.</li>
        <li>Download the new ZIP and extract.</li>
        <li>Upload the new <code>main_files/crossswap/</code> contents on top of the existing install. Keep your <code>.env</code> and the <code>storage/</code> tree intact.</li>
        <li>Run <code>php artisan migrate --force</code>.</li>
        <li>Run <code>php artisan optimize:clear</code>.</li>
        <li>Restart your queue worker (Horizon or <code>queue:work</code>).</li>
    </ol>

    <h2>Common issues</h2>
    <ul>
        <li><strong>419 PAGE EXPIRED</strong> — usually a stale cookie. Clear browser cookies for the domain and try again. If it persists, run <code>php artisan optimize:clear</code>.</li>
        <li><strong>500 Server Error</strong> — check <code>storage/logs/laravel.log</code>; the most common cause is missing write permissions on <code>storage/</code>.</li>
        <li><strong>ChangeNOW returned 401</strong> — invalid API key. Re-paste it in <strong>Admin → Settings → API</strong>.</li>
        <li><strong>Mixed content over HTTPS</strong> — set <code>APP_URL=https://your-domain.com</code> in <code>.env</code> and run <code>php artisan config:cache</code>.</li>
    </ul>
</section>

</body>
</html>`;

const tmpPath = join(DOCS, '_pdf_print.html');
writeFileSync(tmpPath, html);

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.emulateMedia({ media: 'print' });
await page.goto('file://' + tmpPath, { waitUntil: 'load' });
await page.waitForTimeout(400);

await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    margin: { top: '22mm', right: '20mm', bottom: '20mm', left: '20mm' },
    headerTemplate: '<div></div>',
    footerTemplate:
        '<div style="font-size:8pt; width:100%; padding:0 20mm; text-align:right; color:#94a3b8; font-family:Helvetica,Arial,sans-serif;">' +
            '<span class="pageNumber"></span> / <span class="totalPages"></span>' +
        '</div>',
});

await ctx.close();
await browser.close();

try { unlinkSync(tmpPath); } catch {}

try {
    const tmp = OUT_PDF + '.tmp';
    execSync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${tmp} ${OUT_PDF}`,
        { stdio: 'inherit' },
    );
    renameSync(tmp, OUT_PDF);
    console.log('  compressed via ghostscript');
} catch {
    console.warn('  ghostscript not available — keeping uncompressed PDF (install: brew install ghostscript)');
}

const sizeKb = (readFileSync(OUT_PDF).length / 1024).toFixed(0);
console.log(`✓ Wrote ${OUT_PDF} (${sizeKb} KB)`);
