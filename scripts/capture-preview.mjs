/**
 * Capture real screenshots of the running app for the /preview CodeCanyon page.
 *
 *  Prereq: app dev server running at BASE (default http://127.0.0.1:8123)
 *          and Playwright installed (`npm i -D playwright`).
 *  Usage:  node scripts/capture-preview.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE ?? 'http://127.0.0.1:8123';
const OUT  = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'preview-shots');

const DESKTOP = { width: 1440, height: 900,  scale: 1 };
const TABLET  = { width: 1024, height: 768,  scale: 1 };

mkdirSync(OUT, { recursive: true });

const SHOTS = [
    { name: 'home-hero',     path: '/',                               vp: DESKTOP, waitForSel: '#exchange-card' },
    { name: 'home-features', path: '/#features',                      vp: DESKTOP, waitForSel: '#features',     scroll: true },
    { name: 'home-pairs',    path: '/',                               vp: DESKTOP, waitForSel: '#exchange-card', scrollTo: '#exchange-card' },
    { name: 'help-center',   path: '/help',                           vp: DESKTOP, waitForSel: 'h1' },
    { name: 'help-article',  path: '/help/article/floating-vs-fixed', vp: DESKTOP, waitForSel: 'h1' },
    { name: 'sign-in',       path: '/sign-in',                        vp: DESKTOP, waitForSel: 'form' },
    { name: 'admin-login',   path: '/admin/login',                    vp: DESKTOP, waitForSel: 'form' },
];

const ADMIN_LOGIN = {
    email:    process.env.ADMIN_EMAIL    ?? 'admin@demo.com',
    password: process.env.ADMIN_PASSWORD ?? 'password!321',
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
    viewport: { width: DESKTOP.width, height: DESKTOP.height },
    deviceScaleFactor: 2,
    colorScheme: 'light',
});

for (const shot of SHOTS) {
    const page = await ctx.newPage();
    try {
        const resp = await page.goto(BASE + shot.path, { waitUntil: 'networkidle', timeout: 30_000 });
        if (!shot.allow404 && resp && resp.status() >= 400) {
            console.warn(`  → ${shot.path} → HTTP ${resp.status()} (skipping)`);
            await page.close();
            continue;
        }
        await page.waitForSelector(shot.waitForSel, { timeout: 10_000 }).catch(() => {});
        // Give the page a moment for fonts and animations to settle.
        await page.waitForTimeout(800);
        if (shot.scroll) {
            // Trigger lazy components (Stats counters, etc.)
            await page.evaluate(async () => {
                for (let y = 0; y < document.body.scrollHeight; y += 600) {
                    window.scrollTo(0, y);
                    await new Promise(r => setTimeout(r, 60));
                }
                window.scrollTo(0, 0);
            });
            await page.waitForTimeout(400);
        }

        const file = join(OUT, `${shot.name}.png`);
        await page.screenshot({ path: file, fullPage: !!shot.fullPage });
        console.log(`  ✓ ${shot.name}.png`);
    } catch (e) {
        console.warn(`  ✗ ${shot.name} → ${e.message}`);
    } finally {
        await page.close();
    }
}

// Admin-authenticated shots (best-effort)
try {
    const page = await ctx.newPage();
    await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="email"]', { timeout: 8_000 });
    await page.fill('input[type="email"]',    ADMIN_LOGIN.email);
    await page.fill('input[type="password"]', ADMIN_LOGIN.password);
    await page.click('button[type="submit"]');
    try {
        await page.waitForURL(u => !u.pathname.endsWith('/login'), { timeout: 8_000 });
    } catch { /* still on login = creds rejected */ }

    if (!page.url().endsWith('/login')) {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(800);
        await page.screenshot({ path: join(OUT, 'admin-dashboard.png') });
        console.log('  ✓ admin-dashboard.png');

        await page.goto(BASE + '/admin/transactions', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(OUT, 'admin-transactions.png') });
        console.log('  ✓ admin-transactions.png');

        await page.goto(BASE + '/admin/content', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(OUT, 'admin-content.png') });
        console.log('  ✓ admin-content.png');

        await page.goto(BASE + '/admin/pages', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);
        await page.screenshot({ path: join(OUT, 'admin-pages.png') });
        console.log('  ✓ admin-pages.png');

        // Click the first page row to reach the multi-locale editor
        const editLink = await page.$('a[href*="/admin/pages/"][href$="/edit"]');
        if (editLink) {
            await editLink.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(700);
            await page.screenshot({ path: join(OUT, 'admin-page-editor.png') });
            console.log('  ✓ admin-page-editor.png');
        }
    } else {
        console.warn('  ✗ admin login rejected — credentials may be stale');
    }
    await page.close();
} catch (e) {
    console.warn(`  ✗ admin-dashboard → ${e.message}`);
}

// Write a manifest the React page reads at build time.
writeFileSync(
    join(OUT, 'manifest.json'),
    JSON.stringify({ generated_at: new Date().toISOString(), shots: SHOTS.map(s => s.name) }, null, 2),
);
console.log(`\nWrote ${SHOTS.length} screenshots to /public/preview/`);

await ctx.close();
await browser.close();
