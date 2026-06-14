/**
 * Capture install-wizard step screenshots for the offline documentation.
 *
 * The InstallController honours `?step=N` ONLY when `SHOW_PREVIEW=true`,
 * so the wizard can jump straight to each step. The installed.lock is moved
 * aside while the script runs and restored afterwards.
 *
 *  node scripts/capture-installer.mjs
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE ?? 'http://127.0.0.1:8123';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = join(ROOT, 'public', 'preview-shots');
const LOCK = join(ROOT, 'storage', 'app', 'installed.lock');
const BAK  = LOCK + '.cap-bak';

mkdirSync(OUT, { recursive: true });

if (existsSync(LOCK)) {
    renameSync(LOCK, BAK);
    console.log('  ↳ moved installed.lock aside');
}
const restore = () => {
    if (existsSync(BAK) && !existsSync(LOCK)) {
        renameSync(BAK, LOCK);
        console.log('  ↳ restored installed.lock');
    }
};
process.on('SIGINT',  () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });

const STEPS = [
    { n: 1, name: 'installer-01-welcome',       prefill: null },
    { n: 2, name: 'installer-02-requirements',  prefill: null },
    { n: 3, name: 'installer-03-database',      prefill: null },
    { n: 4, name: 'installer-04-admin',         prefill: ({ page }) => fillAdmin(page) },
    { n: 5, name: 'installer-05-branding',      prefill: ({ page }) => fillBrand(page) },
    { n: 6, name: 'installer-06-api',           prefill: ({ page }) => fillApi(page) },
    { n: 7, name: 'installer-07-done',          prefill: null },
];

async function fillAdmin(page) {
    await page.fill('#adm-name', 'Acme Crypto').catch(() => {});
    await page.fill('#adm-email', 'you@your-domain.com').catch(() => {});
    await page.fill('#adm-password', 'AStrongPassword!12345').catch(() => {});
    await page.fill('#adm-password_confirmation', 'AStrongPassword!12345').catch(() => {});
}
async function fillBrand(page) {
    await page.fill('#br-brand', 'CrossSwap').catch(() => {});
    await page.fill('#br-tagline', 'Cross-chain swaps in 30 seconds, no account required').catch(() => {});
    await page.fill('#br-email', 'support@your-domain.com').catch(() => {});
}
async function fillApi(page) {
    await page.fill('#api-key', 'YOUR_CHANGENOW_API_KEY_HERE').catch(() => {});
    await page.fill('#api-ref', 'optional-affiliate-tag').catch(() => {});
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// On the requirements step, the React `Run check` button POSTs to /install/requirements.
// We synthesize a clean "all green" response so the screenshot looks healthy.
await page.route('**/install/requirements', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
            ok: true,
            checks: [
                { name: 'PHP 8.2+',                 passed: true,  hint: 'PHP 8.3.4' },
                { name: 'PDO + driver',             passed: true,  hint: 'sqlite, mysql, pgsql' },
                { name: 'cURL',                     passed: true,  hint: '' },
                { name: 'OpenSSL',                  passed: true,  hint: '' },
                { name: 'mbstring',                 passed: true,  hint: '' },
                { name: 'fileinfo',                 passed: true,  hint: '' },
                { name: 'gd or imagick',            passed: true,  hint: 'gd' },
                { name: 'storage/ writable',        passed: true,  hint: '' },
                { name: 'bootstrap/cache writable', passed: true,  hint: '' },
            ],
        }),
    });
});

try {
    for (const step of STEPS) {
        await page.goto(`${BASE}/install?step=${step.n}`, { waitUntil: 'networkidle' });
        await page.waitForSelector('h1, h2', { timeout: 8_000 }).catch(() => {});

        // Trigger requirements probe so the green ticks render before we shoot.
        if (step.n === 2) {
            const checkBtn = page.locator('button.cta-ghost').filter({ hasText: /check/i }).first();
            await checkBtn.click({ force: true }).catch(() => {});
            await page.waitForTimeout(700);
        }

        if (step.prefill) await step.prefill({ page });

        await page.waitForTimeout(500);
        await page.screenshot({ path: join(OUT, step.name + '.png') });
        console.log('  ✓ ' + step.name + '.png');
    }
} catch (e) {
    console.error('Capture failed:', e.message);
} finally {
    await ctx.close();
    await browser.close();
    restore();
}
