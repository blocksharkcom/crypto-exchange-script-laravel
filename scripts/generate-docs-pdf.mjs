/**
 * Render the HTML documentation into a single CrossSwap-Documentation.pdf.
 *
 *   node scripts/generate-docs-pdf.mjs
 *
 * Output: public/documentation/CrossSwap-Documentation.pdf
 *
 * Strategy: spin up a static file server over public/documentation/, render
 * each chapter page through Playwright with print emulation, concatenate the
 * resulting PDFs into one. We avoid an external pdf-merge library by using
 * Chromium's own multi-page-per-render and a thin home-grown concatenator.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { stat, readFile } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'public', 'documentation');
const OUT_PDF = join(DOCS, 'CrossSwap-Documentation.pdf');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.woff2':'font/woff2',
};

const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        let p = decodeURIComponent(url.pathname);
        if (p === '/' || p.endsWith('/')) p = join(p, 'index.html');
        const fp = join(DOCS, p);
        if (!fp.startsWith(DOCS)) { res.statusCode = 403; return res.end(); }
        const st = await stat(fp).catch(() => null);
        if (!st || !st.isFile()) { res.statusCode = 404; return res.end('Not found'); }
        const body = await readFile(fp);
        res.setHeader('Content-Type', MIME[extname(fp)] ?? 'application/octet-stream');
        res.end(body);
    } catch (e) {
        res.statusCode = 500; res.end(String(e));
    }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const BASE = `http://127.0.0.1:${port}`;

const CHAPTERS = [
    { file: 'index.html',           title: 'Overview' },
    { file: 'install.html',         title: 'Installation' },
    { file: 'configure.html',       title: 'Configuration' },
    { file: 'customize.html',       title: 'Customization' },
    { file: 'api.html',             title: 'API Reference' },
    { file: 'faq.html',             title: 'FAQ' },
    { file: 'troubleshooting.html', title: 'Troubleshooting' },
];

// Build a single HTML "book" by concatenating chapter bodies into one
// printable page. Same stylesheet, page-break between chapters.
const css = readFileSync(join(DOCS, 'assets', 'docs.css'), 'utf8');

const chapters = await Promise.all(CHAPTERS.map(async (ch) => {
    const html = readFileSync(join(DOCS, ch.file), 'utf8');
    // Extract just the <main>...</main> content; fall back to <body> if no main tag
    const main = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i)?.[1]
               ?? html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)?.[1]
               ?? html;
    // Swap img/<name>.png references to img-pdf/<name>.jpg (smaller, JPEG-compressed
    // copies prepared at build time) so the PDF stays compact.
    const rewritten = main.replace(/(["'(])img\/([\w.-]+)\.png/g, '$1img-pdf/$2.jpg');
    return { ...ch, html: rewritten };
}));

const cover = `
<section class="pdf-cover">
    <div class="pdf-cover-mark">
        <svg viewBox="0 0 64 64" width="84" height="84">
            <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#g)"/>
            <path d="M22 22h14a6 6 0 0 1 6 6 6 6 0 0 1-6 6h-14l6 6M42 42h-14a6 6 0 0 1-6-6 6 6 0 0 1 6-6h14l-6-6"
                  stroke="#0a0a0c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="64" y2="64">
                    <stop offset="0" stop-color="#bff15a"/>
                    <stop offset="1" stop-color="#5ad6a6"/>
                </linearGradient>
            </defs>
        </svg>
    </div>
    <h1>CrossSwap</h1>
    <p class="pdf-cover-sub">Cross-Chain Multi-Blockchain Exchange with ChangeNOW Integration</p>
    <p class="pdf-cover-meta">Official documentation · v1.1.0</p>
    <p class="pdf-cover-demo">Live demo: <a href="https://cross-swap.blockshark.com">cross-swap.blockshark.com</a></p>
</section>
<section class="pdf-toc">
    <h2>Table of contents</h2>
    <ol>${chapters.map((c, i) => `<li><span>${i + 1}.</span> ${c.title}</li>`).join('')}</ol>
</section>
`;

const body = chapters.map((c, i) => `
<article class="pdf-chapter" data-chapter="${i + 1}">
    <header class="pdf-chapter-header">
        <span class="pdf-chapter-num">Chapter ${i + 1}</span>
        <h1 class="pdf-chapter-title">${c.title}</h1>
    </header>
    ${c.html}
</article>
`).join('\n');

const pdfHtml = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<title>CrossSwap Documentation</title>
<style>${css}</style>
<style>
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
html, body { background: #fff; color: #18181b; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
.sidebar, .topbar, .layout > nav { display: none !important; }
.layout { display: block; }
.content, main { max-width: none; padding: 0; }
a { color: #0b6e4f; word-break: break-word; }
img { max-width: 100%; height: auto; }
figure.doc-figure { break-inside: avoid; page-break-inside: avoid; margin: 16px 0; }
h1, h2, h3 { break-after: avoid; }
table { break-inside: auto; page-break-inside: auto; }

.pdf-cover {
    page-break-after: always; height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center; gap: 20px;
    background: linear-gradient(180deg, #ffffff 0%, #f5fff7 100%);
}
.pdf-cover h1 { font-size: 64px; margin: 0; letter-spacing: -0.02em; color: #0a0a0c; }
.pdf-cover-sub { color: #475569; font-size: 18px; margin: 0; max-width: 480px; }
.pdf-cover-meta { color: #64748b; margin-top: 32px; font-size: 14px; }
.pdf-cover-demo { color: #18181b; margin-top: 0; font-size: 15px; }

.pdf-toc { page-break-after: always; padding: 24px 0; }
.pdf-toc h2 { font-size: 28px; margin: 0 0 16px; }
.pdf-toc ol { list-style: none; padding: 0; counter-reset: toc; }
.pdf-toc li { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; font-size: 16px; }
.pdf-toc li span { font-weight: 700; color: #0b6e4f; min-width: 28px; }

.pdf-chapter { page-break-before: always; padding: 12px 0 36px; }
.pdf-chapter-header { margin: 0 0 24px; padding-bottom: 16px; border-bottom: 2px solid #0b6e4f; }
.pdf-chapter-num { font-size: 12px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: #0b6e4f; }
.pdf-chapter-title { font-size: 36px; margin: 4px 0 0; color: #0a0a0c; }
</style>
</head>
<body>
${cover}
${body}
</body>
</html>`;

const tmpPath = join(DOCS, '_pdf_print.html');
writeFileSync(tmpPath, pdfHtml);

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.emulateMedia({ media: 'print' });
await page.goto(`${BASE}/_pdf_print.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size:8px; width:100%; padding:0 12mm; color:#94a3b8; text-align:right;">CrossSwap · Documentation</div>',
    footerTemplate: '<div style="font-size:8px; width:100%; padding:0 12mm; color:#94a3b8; display:flex; justify-content:space-between;"><span>cross-swap.blockshark.com</span><span class="pageNumber"></span></div>',
});

await ctx.close();
await browser.close();
server.close();

// Clean the print scaffold
try { (await import('node:fs')).unlinkSync(tmpPath); } catch {}

// Compress the rendered PDF with ghostscript when available — Playwright/Chromium
// emits an uncompressed PDF that balloons to ~35 MB with embedded screenshots.
try {
    const { execSync } = await import('node:child_process');
    const tmp = OUT_PDF + '.tmp';
    execSync(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.5 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${tmp} ${OUT_PDF}`,
        { stdio: 'inherit' },
    );
    const { renameSync } = await import('node:fs');
    renameSync(tmp, OUT_PDF);
    console.log('  compressed via ghostscript');
} catch {
    console.warn('  ghostscript not available — keeping uncompressed PDF (install: brew install ghostscript)');
}

const sizeKb = (readFileSync(OUT_PDF).length / 1024).toFixed(0);
console.log(`✓ Wrote ${OUT_PDF} (${sizeKb} KB)`);
