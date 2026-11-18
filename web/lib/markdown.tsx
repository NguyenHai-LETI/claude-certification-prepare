// Markdown (marked) and lesson HTML → sanitized HTML (DOMPurify). Heading ids for Markdown notes, link rewriting
// (relative note links → /notes/…, external → new tab), anchor lookup.
import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

/** GitHub-style slug (same rule as the backend): lowercase, keep letters (Vietnamese too) / digits / - / _, spaces → '-'. */
export function slugify(text: string): string {
  return text
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

/** Looser form for matching an anchor against ids: diacritics dropped, runs of '-' collapsed. */
function looseSlug(text: string): string {
  return slugify(text)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const MD_PURIFY = { ADD_ATTR: ['target', 'id'] };
const LESSON_PURIFY = {
  USE_PROFILES: { html: true, svg: true, svgFilters: true },
  ADD_ATTR: ['id', 'target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta', 'base'],
};

interface PostOpts {
  base?: string; // note path the content belongs to (for relative links)
  headings?: { id: string; text: string; level: number }[]; // backend heading ids (Markdown notes)
  addIds?: boolean;
}

function resolveNotePath(base: string, rel: string): string {
  const dir = base.split('/').slice(0, -1);
  for (const seg of rel.split('/')) {
    if (seg === '..') dir.pop();
    else if (seg !== '.' && seg !== '') dir.push(seg);
  }
  return dir.join('/');
}

function postProcess(html: string, opts: PostOpts): string {
  if (typeof document === 'undefined') return html;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const root = tpl.content;
  if (opts.addIds) {
    const used = new Set<string>();
    const pool = [...(opts.headings ?? [])];
    for (const h of root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')) {
      if (h.id) {
        used.add(h.id);
        continue;
      }
      const text = (h.textContent ?? '').trim();
      const i = pool.findIndex((x) => x.text.trim() === text);
      let id: string;
      if (i >= 0) {
        id = pool[i].id;
        pool.splice(i, 1);
      } else {
        const s = slugify(text) || 'muc';
        id = s;
        for (let n = 1; used.has(id); n++) id = `${s}-${n}`;
      }
      used.add(id);
      h.id = id;
    }
  }
  for (const a of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    if (/^(https?:)?\/\//i.test(href)) {
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
    } else if (/^(mailto|tel):/i.test(href) || href.startsWith('#') || href.startsWith('/')) {
      // keep: in-page anchor or app path (/notes/…)
    } else if (opts.base !== undefined && !/^[a-z]+:/i.test(href)) {
      const [p, anchor] = href.split('#');
      if (/\.(md|html?)$/i.test(p)) {
        const target = resolveNotePath(opts.base, decodeURI(p));
        a.setAttribute('href', `/notes/${target}${anchor ? `#${anchor}` : ''}`);
      }
    }
  }
  return tpl.innerHTML;
}

export function renderMarkdown(src: string, opts: PostOpts = {}): string {
  const raw = marked.parse(src ?? '', { async: false }) as string;
  return postProcess(DOMPurify.sanitize(raw, MD_PURIFY) as string, opts);
}

export function renderInline(src: string): string {
  const raw = marked.parseInline(src ?? '', { async: false }) as string;
  return postProcess(DOMPurify.sanitize(raw, MD_PURIFY) as string, {});
}

export function sanitizeLesson(html: string, base: string): string {
  return postProcess(DOMPurify.sanitize(html, LESSON_PURIFY) as unknown as string, { base });
}

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const html = useMemo(() => renderMarkdown(text), [text]);
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function InlineMarkdown({ text }: { text: string }) {
  const html = useMemo(() => renderInline(text), [text]);
  return <span className="md-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Element for an anchor: exact id, else a loose slug match (diacritics, repeated hyphens). */
export function findAnchor(root: ParentNode, anchor: string): HTMLElement | null {
  if (!anchor) return null;
  const exact = [...root.querySelectorAll<HTMLElement>('[id]')].find((el) => el.id === anchor);
  if (exact) return exact;
  const want = looseSlug(anchor);
  if (!want) return null;
  return [...root.querySelectorAll<HTMLElement>('[id]')].find((el) => looseSlug(el.id) === want) ?? null;
}
