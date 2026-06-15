/**
 * Build the flattened single-file documentation set for the CodeCanyon archive.
 *
 *   node scripts/build-archive-docs.mjs <out-dir>
 *
 * Reads the per-chapter HTML pages from `public/documentation/`, stitches them
 * into ONE `documentation.html`, rewrites image paths from `img/...` to
 * `assets/img/...`, rewrites inter-page nav links to in-page anchors, and
 * emits to <out-dir>:
 *
 *   <out-dir>/documentation.html
 *   <out-dir>/CrossSwap-Documentation.pdf
 *   <out-dir>/assets/docs.css
 *   <out-dir>/assets/img/*.png
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = join(ROOT, 'public', 'documentation');
const OUT  = resolve(process.argv[2] ?? join(ROOT, 'dist', 'archive-docs'));

const CHAPTERS = [
    { file: 'index.html',           anchor: 'overview',         title: 'Overview' },
    { file: 'install.html',         anchor: 'install',          title: 'Installation' },
    { file: 'configure.html',       anchor: 'configure',        title: 'Configuration' },
    { file: 'customize.html',       anchor: 'customize',        title: 'Customization' },
    { file: 'api.html',             anchor: 'api',              title: 'API Reference' },
    { file: 'faq.html',             anchor: 'faq',              title: 'FAQ' },
    { file: 'troubleshooting.html', anchor: 'troubleshooting',  title: 'Troubleshooting' },
];

// Stale runs of this script can leave behind a partial OUT tree. Wipe it.
if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'assets', 'img'), { recursive: true });

// Copy CSS + every PNG screenshot into assets/
cpSync(join(SRC, 'assets', 'docs.css'), join(OUT, 'assets', 'docs.css'));
cpSync(join(SRC, 'img'), join(OUT, 'assets', 'img'), { recursive: true });

// Copy the pre-built PDF as-is
const pdfSrc = join(SRC, 'CrossSwap-Documentation.pdf');
if (existsSync(pdfSrc)) cpSync(pdfSrc, join(OUT, 'CrossSwap-Documentation.pdf'));

// Map every chapter file basename to its in-page anchor so nav links can be
// rewritten to `#chapter-<anchor>`.
const fileToAnchor = Object.fromEntries(CHAPTERS.map(c => [c.file, c.anchor]));

function extractMain(html) {
    return html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i)?.[1]
        ?? html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)?.[1]
        ?? html;
}

function rewriteAssetPaths(html) {
    return html
        // img/foo.png  →  assets/img/foo.png
        .replace(/(["'(])img\/([\w.-]+)\.(png|jpe?g|webp|svg)/gi, '$1assets/img/$2.$3')
        // href="install.html"  →  href="#chapter-install"
        .replace(/href=(["'])([\w-]+)\.html(#[^"']*)?\1/g, (_m, q, base, hash) => {
            const a = fileToAnchor[`${base}.html`];
            if (!a) return _m;
            // Drop the per-page hash — we're merging — and jump to chapter top.
            return `href=${q}#chapter-${a}${hash ?? ''}${q}`;
        });
}

const chapters = CHAPTERS.map((ch) => {
    const raw = readFileSync(join(SRC, ch.file), 'utf8');
    const main = extractMain(raw);
    return { ...ch, html: rewriteAssetPaths(main) };
});

const toc = chapters.map((c, i) => `
        <li>
            <a href="#chapter-${c.anchor}">
                <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="toc-title">${c.title}</span>
            </a>
        </li>
`).join('');

const body = chapters.map((c, i) => `
    <article class="chapter" id="chapter-${c.anchor}">
        <header class="chapter-header">
            <div class="chapter-eyebrow">Chapter ${i + 1}</div>
            <h1 class="chapter-title">${c.title}</h1>
        </header>
        ${c.html}
        <p class="back-to-top"><a href="#top">↑ Back to top</a></p>
    </article>
`).join('\n');

const docHtml = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<title>CrossSwap Documentation</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Official documentation for CrossSwap — installation, configuration, customization, API, and troubleshooting.">
<link rel="stylesheet" href="assets/docs.css">
<script>
(function () {
  var saved = null;
  try { saved = localStorage.getItem('crossswap-docs-theme'); } catch (e) {}
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }
})();
</script>
<style>
/* Single-file documentation tweaks — TOC sidebar + per-chapter blocks. */
body { display: block; }
.layout, .sidebar, .topbar { display: none !important; }
.archive-shell {
    display: grid; grid-template-columns: 280px 1fr;
    max-width: 1400px; margin: 0 auto; gap: 32px; padding: 32px 24px;
}
@media (max-width: 960px) { .archive-shell { grid-template-columns: 1fr; } }
.archive-toc {
    position: sticky; top: 24px; align-self: start;
    background: var(--bg-card, #14171c); border: 1px solid var(--line-1, #2a2e36);
    border-radius: 16px; padding: 20px;
}
.archive-toc h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--muted-3, #94a3b8); }
.archive-toc ol { list-style: none; padding: 0; margin: 0; counter-reset: toc; display: grid; gap: 4px; }
.archive-toc li { display: block; }
.archive-toc a {
    display: flex; align-items: baseline; gap: 12px; padding: 8px 10px;
    border-radius: 8px; text-decoration: none; color: var(--text-1, #e7e9ee);
    font-weight: 600; transition: background 120ms;
}
.archive-toc a:hover { background: var(--bg-card-2, #1a1d24); }
.toc-num { color: var(--brand-300, #bff15a); font-size: 12px; min-width: 22px; font-variant-numeric: tabular-nums; }
.archive-main { min-width: 0; }
.archive-hero {
    background: linear-gradient(135deg, rgba(191,241,90,0.08), rgba(90,214,166,0.04));
    border: 1px solid var(--line-1, #2a2e36); border-radius: 20px;
    padding: 28px 32px; margin-bottom: 32px;
}
.archive-hero h1 { margin: 0 0 8px; font-size: 28px; letter-spacing: -0.01em; }
.archive-hero p { margin: 0; color: var(--muted-2, #c0c5cf); }
.chapter { padding: 24px 0 48px; border-top: 1px solid var(--line-1, #2a2e36); }
.chapter:first-of-type { border-top: none; padding-top: 0; }
.chapter-header { margin: 0 0 24px; }
.chapter-eyebrow { color: var(--brand-300, #bff15a); font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; }
.chapter-title { font-size: 32px; margin: 0; letter-spacing: -0.015em; }
.back-to-top { text-align: right; margin: 32px 0 0; font-size: 13px; }
.back-to-top a { color: var(--muted-2, #c0c5cf); text-decoration: none; }
.back-to-top a:hover { color: var(--text-1, #e7e9ee); }
.pdf-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--brand-300, #bff15a); color: #0a0a0c;
    border-radius: 999px; padding: 8px 16px; font-weight: 700; font-size: 13px;
    text-decoration: none; margin-top: 14px;
}
.pdf-cta:hover { filter: brightness(1.05); }
</style>
</head>
<body id="top">
<div class="archive-shell">
    <nav class="archive-toc" aria-label="Documentation contents">
        <h2>Contents</h2>
        <ol>${toc}</ol>
        <a class="pdf-cta" href="CrossSwap-Documentation.pdf" target="_blank" rel="noopener">Download PDF</a>
    </nav>
    <main class="archive-main">
        <section class="archive-hero">
            <h1>CrossSwap — Documentation</h1>
            <p>Single-file reference for installation, configuration, customization, the ChangeNOW API, FAQs and troubleshooting.</p>
        </section>
        ${body}
    </main>
</div>
</body>
</html>`;

writeFileSync(join(OUT, 'documentation.html'), docHtml);
console.log(`✓ Built ${OUT}/documentation.html (${(docHtml.length / 1024).toFixed(0)} KB)`);
console.log(`  assets/docs.css + assets/img/ + CrossSwap-Documentation.pdf in place`);
