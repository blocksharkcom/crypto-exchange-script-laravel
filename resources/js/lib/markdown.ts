/**
 * Tiny safe Markdown renderer.
 * Supports: headings (## ###), bold/italic/code, fenced blocks, ordered + unordered lists,
 * paragraphs, inline links. Everything else is escaped.
 *
 * Deliberately no library so the bundle stays small and the output is auditable.
 */
function escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c] as string);
}

function renderInline(src: string): string {
    let out = escapeHtml(src);

    // Inline code
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold + italic
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|\W)\*([^*]+)\*/g, '$1<em>$2</em>');
    // Links [text](url) — only allow http(s), /, # or mailto:
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, href: string) => {
        const safe = /^(https?:|\/|#|mailto:)/.test(href) ? href : '#';
        const ext  = /^https?:/.test(safe) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${safe}"${ext}>${text}</a>`;
    });

    return out;
}

export function renderMarkdown(src: string): string {
    const lines = src.replace(/\r\n/g, '\n').split('\n');
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Fenced code
        if (line.startsWith('```')) {
            const buf: string[] = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                buf.push(escapeHtml(lines[i]));
                i++;
            }
            i++;
            out.push(`<pre><code>${buf.join('\n')}</code></pre>`);
            continue;
        }

        // Heading
        const h = line.match(/^(#{2,3})\s+(.+)$/);
        if (h) {
            const lvl = h[1].length;
            out.push(`<h${lvl}>${renderInline(h[2])}</h${lvl}>`);
            i++;
            continue;
        }

        // Blockquote
        if (line.startsWith('> ')) {
            const buf: string[] = [];
            while (i < lines.length && lines[i].startsWith('> ')) {
                buf.push(lines[i].slice(2));
                i++;
            }
            out.push(`<blockquote>${renderInline(buf.join(' '))}</blockquote>`);
            continue;
        }

        // Ordered list
        if (/^\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                items.push(`<li>${renderInline(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
                i++;
            }
            out.push(`<ol>${items.join('')}</ol>`);
            continue;
        }

        // Unordered list
        if (/^- /.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^- /.test(lines[i])) {
                items.push(`<li>${renderInline(lines[i].slice(2))}</li>`);
                i++;
            }
            out.push(`<ul>${items.join('')}</ul>`);
            continue;
        }

        // Blank line
        if (line.trim() === '') { i++; continue; }

        // Paragraph (collect until blank line)
        const para: string[] = [];
        while (i < lines.length && lines[i].trim() !== '' && !/^(#{2,3} |```|> |- |\d+\.\s)/.test(lines[i])) {
            para.push(lines[i]);
            i++;
        }
        out.push(`<p>${renderInline(para.join(' '))}</p>`);
    }

    return out.join('\n');
}
