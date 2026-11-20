// node scripts/import-lessons.ts <srcDir>
// Converts the lesson pages (and the glossary page) of the public study artifact https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf
// into cleaned HTML fragments under notes/lessons/ (SPEC §2.3), plus notes/lessons/index.yaml.
// <srcDir> holds the downloaded artifact: NN-*.html, glossary.html and assets/data.js.
// Lesson files in notes/lessons/ (NN-*.html) that the artifact no longer lists are deleted, so a restructure upstream
// leaves no orphan pages; run `npm run import-ccx` first so the bank's refs already point at the new files.
// Everything is processed statically by a small HTML tokenizer: no JS from the input is executed, and the output keeps no
// scripts, no inline event handlers and no javascript: URLs. Styling for the fragments lives in web/styles-lesson.css
// (every selector under `.lesson`; the page that shows a lesson wraps the fragment in an element with class "lesson").
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const outDir = path.join(root, 'notes', 'lessons');
const packFile = path.join(root, 'bank', 'packs', 'ccx.yaml');
const examsFile = path.join(root, 'exams.yaml');
const SOURCE = 'https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf';
const EXERCISE_IDS = new Set(['bai-tap', 'exercises']); // the quiz section's heading id (old / current artifact)
const GLOSSARY = 'glossary.html'; // artifact page with every lesson's exam keywords; imported under the same name

// ---------------------------------------------------------------- tokenizer + tree

type Attr = { name: string; value: string | null };
interface El {
  type: 'el';
  name: string; // lower-case
  attrs: Attr[];
  children: Node[];
  selfClosed: boolean; // written as <x/> (SVG) or a void element
}
interface Text {
  type: 'text';
  raw: string; // kept as in the source (already entity-escaped)
}
type Node = El | Text;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes', 'noscript']);

type Tok =
  | { k: 'text'; raw: string }
  | { k: 'start'; name: string; attrs: Attr[]; selfClosed: boolean }
  | { k: 'end'; name: string };

function parseAttrs(s: string): Attr[] {
  const attrs: Attr[] = [];
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /[\s/]/.test(s[i])) i++;
    if (i >= s.length) break;
    let name = '';
    while (i < s.length && !/[\s/>=]/.test(s[i])) name += s[i++];
    while (i < s.length && /\s/.test(s[i])) i++;
    let value: string | null = null;
    if (s[i] === '=') {
      i++;
      while (i < s.length && /\s/.test(s[i])) i++;
      const q = s[i];
      if (q === '"' || q === "'") {
        const end = s.indexOf(q, i + 1);
        value = s.slice(i + 1, end < 0 ? s.length : end);
        i = end < 0 ? s.length : end + 1;
      } else {
        value = '';
        while (i < s.length && !/\s/.test(s[i])) value += s[i++];
      }
    }
    if (name) attrs.push({ name, value });
  }
  return attrs;
}

function tokenize(html: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let text = '';
  const flush = () => {
    if (text) toks.push({ k: 'text', raw: text });
    text = '';
  };
  while (i < html.length) {
    const c = html[i];
    if (c !== '<') {
      text += c;
      i++;
      continue;
    }
    if (html.startsWith('<!--', i)) {
      flush();
      const end = html.indexOf('-->', i + 4);
      i = end < 0 ? html.length : end + 3; // comments are dropped
      continue;
    }
    if (html[i + 1] === '!' || html[i + 1] === '?') {
      flush();
      const end = html.indexOf('>', i);
      i = end < 0 ? html.length : end + 1; // doctype / processing instructions dropped
      continue;
    }
    const isEnd = html[i + 1] === '/';
    const nameStart = i + (isEnd ? 2 : 1);
    if (!/[A-Za-z]/.test(html[nameStart] ?? '')) {
      text += c; // a bare '<' in text
      i++;
      continue;
    }
    // Scan to the closing '>' while respecting quoted attribute values.
    let j = nameStart;
    let q: string | null = null;
    while (j < html.length) {
      const ch = html[j];
      if (q) {
        if (ch === q) q = null;
      } else if (ch === '"' || ch === "'") {
        // quotes only open inside attribute values (after '=')
        let k = j - 1;
        while (k > nameStart && /\s/.test(html[k])) k--;
        if (html[k] === '=') q = ch;
      } else if (ch === '>') break;
      j++;
    }
    flush();
    const inner = html.slice(nameStart, j);
    i = j + 1;
    const m = /^([A-Za-z][A-Za-z0-9:-]*)/.exec(inner)!;
    const name = m[1].toLowerCase();
    if (isEnd) {
      toks.push({ k: 'end', name });
      continue;
    }
    const rest = inner.slice(m[1].length);
    const selfClosed = /\/\s*$/.test(rest);
    toks.push({ k: 'start', name, attrs: parseAttrs(selfClosed ? rest.replace(/\/\s*$/, '') : rest), selfClosed });
    if (RAW_TEXT.has(name) && !selfClosed) {
      // raw text up to the matching end tag (never interpreted)
      const re = new RegExp(`</${name}\\s*>`, 'ig');
      re.lastIndex = i;
      const em = re.exec(html);
      const endAt = em ? em.index : html.length;
      if (endAt > i) toks.push({ k: 'text', raw: html.slice(i, endAt) });
      toks.push({ k: 'end', name });
      i = em ? em.index + em[0].length : html.length;
    }
  }
  flush();
  return toks;
}

function buildTree(toks: Tok[]): El {
  const root: El = { type: 'el', name: '#root', attrs: [], children: [], selfClosed: false };
  const stack: El[] = [root];
  for (const t of toks) {
    const top = stack[stack.length - 1];
    if (t.k === 'text') top.children.push({ type: 'text', raw: t.raw });
    else if (t.k === 'start') {
      const el: El = { type: 'el', name: t.name, attrs: t.attrs, children: [], selfClosed: t.selfClosed || VOID.has(t.name) };
      top.children.push(el);
      if (!el.selfClosed) stack.push(el);
    } else {
      // pop to the matching open element; a stray end tag is ignored
      let k = stack.length - 1;
      while (k > 0 && stack[k].name !== t.name) k--;
      if (k > 0) stack.length = k;
    }
  }
  return root;
}

const escAttr = (v: string) => v.replace(/"/g, '&quot;').replace(/</g, '&lt;');

function serialize(n: Node): string {
  if (n.type === 'text') return n.raw;
  const attrs = n.attrs.map((a) => (a.value === null ? ` ${a.name}` : ` ${a.name}="${escAttr(a.value)}"`)).join('');
  if (n.selfClosed) return VOID.has(n.name) ? `<${n.name}${attrs}>` : `<${n.name}${attrs}/>`;
  return `<${n.name}${attrs}>${n.children.map(serialize).join('')}</${n.name}>`;
}

// ---------------------------------------------------------------- helpers

const attr = (el: El, name: string) => el.attrs.find((a) => a.name.toLowerCase() === name)?.value ?? null;
const hasClass = (el: El, c: string) => (attr(el, 'class') ?? '').split(/\s+/).includes(c);
const setAttr = (el: El, name: string, value: string | null) => {
  const a = el.attrs.find((x) => x.name.toLowerCase() === name);
  if (a) a.value = value;
  else el.attrs.push({ name, value });
};
const delAttr = (el: El, name: string) => {
  el.attrs = el.attrs.filter((a) => a.name.toLowerCase() !== name);
};
const isEl = (n: Node | undefined): n is El => !!n && n.type === 'el';
const mkText = (raw: string): Text => ({ type: 'text', raw });

function walk(el: El, fn: (e: El, parent: El) => void) {
  for (const c of [...el.children]) if (isEl(c)) {
    fn(c, el);
    walk(c, fn);
  }
}
function find(el: El, pred: (e: El) => boolean): El | undefined {
  for (const c of el.children) if (isEl(c)) {
    if (pred(c)) return c;
    const r = find(c, pred);
    if (r) return r;
  }
}
/** Removes (recursively) every element matching pred; returns how many were removed. */
function removeWhere(el: El, pred: (e: El, parent: El) => boolean): number {
  let n = 0;
  el.children = el.children.filter((c) => {
    if (isEl(c) && pred(c, el)) {
      n++;
      return false;
    }
    return true;
  });
  for (const c of el.children) if (isEl(c)) n += removeWhere(c, pred);
  return n;
}
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(colon|tab|newline);/gi, (_, n) => ({ colon: ':', tab: '\t', newline: '\n' })[n.toLowerCase() as 'colon'])
    .replace(/&amp;/g, '&');
}
const isDangerousUrl = (v: string) =>
  /^(javascript|vbscript|data):/i.test(decodeEntities(v).replace(/[\u0000- \u007f]+/g, ''));

// ---------------------------------------------------------------- conversion

const DROP_TAGS = new Set([
  'script', 'noscript', 'style', 'link', 'meta', 'base', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet',
  'template', 'form', 'button', 'input', 'select', 'textarea', 'dialog', 'portal', 'foreignobject',
]);
const URL_ATTRS = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'srcset', 'background', 'data']);
// Attributes that only drive anim.js / toc.js / quiz.js. The static final state needs none of them.
const JS_ONLY_ATTRS = new Set(['data-anim', 'data-step', 'data-track', 'data-dim', 'data-lesson', 'data-count-lesson']);

interface Stats {
  removed: Record<string, number>;
  links: Record<string, number>;
  unresolved: string[];
}
const bump = (r: Record<string, number>, k: string, n = 1) => {
  if (n) r[k] = (r[k] ?? 0) + n;
};

function convert(html: string, file: string, nn: string, lessonFiles: Set<string>, st: Stats): string {
  const tree = buildTree(tokenize(html));
  const main = find(tree, (e) => e.name === 'main' && hasClass(e, 'page'));
  if (!main) throw new Error(`${file}: no <main class="page">`);

  // 1. Elements that are scripts, active content, or only work with the artifact's JS.
  bump(st.removed, 'script/noscript/active elements', removeWhere(main, (e) => DROP_TAGS.has(e.name)));
  bump(st.removed, 'nav.docnav (artifact page list)', removeWhere(main, (e) => e.name === 'nav' && hasClass(e, 'docnav')));
  // Transient highlights (data-until) are hidden in the artifact's static final state: drop them.
  bump(st.removed, 'animation-only highlights [data-until]', removeWhere(main, (e) => attr(e, 'data-until') !== null));
  // Cover meta: the "Bài tập: N câu" row is filled in by quiz.js.
  walk(main, (dl) => {
    if (dl.name !== 'dl') return;
    const kids = dl.children;
    for (let i = 0; i < kids.length; i++) {
      const dd = kids[i];
      if (isEl(dd) && dd.name === 'dd' && find(dd, (e) => attr(e, 'data-count-lesson') !== null)) {
        let k = i - 1;
        while (k >= 0 && !isEl(kids[k])) k--;
        const from = k >= 0 && isEl(kids[k]) && (kids[k] as El).name === 'dt' ? k : i;
        kids.splice(from, i - from + 1);
        bump(st.removed, 'cover row "Bài tập" (count filled by quiz.js)');
        i = from - 1;
      }
    }
  });

  // 2. The "Bài tập" section (h2#bai-tap + the quiz container) → one line pointing to the bank.
  const kids = main.children;
  const h = kids.findIndex((c) => isEl(c) && /^h[1-6]$/.test(c.name) && EXERCISE_IDS.has(attr(c, 'id') ?? ''));
  if (h >= 0) {
    let end = h + 1;
    while (end < kids.length) {
      const c = kids[end];
      if (isEl(c) && (/^h[12]$/.test(c.name) || c.name === 'footer' || (c.name === 'div' && hasClass(c, 'pager')))) break;
      end++;
    }
    const practice = buildTree(
      tokenize(`<p class="lesson-practice">Luyện câu hỏi của bài này trong <a href="/bank?lesson=${nn}">🗂️ Ngân hàng</a>.</p>`),
    ).children;
    kids.splice(h, end - h, ...practice, mkText('\n\n'));
    bump(st.removed, 'section "Bài tập" (quiz.js)');
  }
  bump(st.removed, 'other quiz containers', removeWhere(main, (e) => hasClass(e, 'quiz')));

  // 3. TOC: the artifact's floating panel (toc.js) becomes a static, collapsible <details>.
  walk(main, (toc, parent) => {
    if (toc.name !== 'nav' || !hasClass(toc, 'toc')) return;
    const body = find(toc, (e) => hasClass(e, 'toc-body'));
    const list = body ? body.children : toc.children;
    const ol = list.filter(isEl);
    for (const o of ol) removeWhere(o, (e) => e.name === 'li' && !!find(e, (a) => a.name === 'a' && EXERCISE_IDS.has((attr(a, 'href') ?? '').slice(1))));
    const det: El = {
      type: 'el',
      name: 'details',
      attrs: [{ name: 'class', value: 'toc' }],
      children: [mkText('\n'), ...buildTree(tokenize('<summary>Mục lục</summary>')).children, mkText('\n'), ...list, mkText('\n')],
      selfClosed: false,
    };
    parent.children[parent.children.indexOf(toc)] = det;
  });

  // 4. Tables always scroll inside their own container.
  walk(main, (t, parent) => {
    if (t.name !== 'table' || (parent.name === 'div' && hasClass(parent, 'tw'))) return;
    parent.children[parent.children.indexOf(t)] = { type: 'el', name: 'div', attrs: [{ name: 'class', value: 'tw' }], children: [t], selfClosed: false };
    bump(st.links, 'tables wrapped in .tw');
  });

  // 5. Attributes: event handlers, dangerous URLs, JS-only data attributes; link rewriting.
  walk(main, (e) => {
    for (const a of [...e.attrs]) {
      const n = a.name.toLowerCase();
      if (n.startsWith('on')) {
        delAttr(e, n);
        bump(st.removed, 'on* attributes');
      } else if (URL_ATTRS.has(n) && a.value !== null && isDangerousUrl(a.value)) {
        delAttr(e, n);
        bump(st.removed, 'javascript:/data: URLs');
      } else if (n === 'style' && a.value && /expression\(|url\s*\(|javascript:|@import/i.test(decodeEntities(a.value))) {
        delAttr(e, n);
        bump(st.removed, 'unsafe style attributes');
      } else if (JS_ONLY_ATTRS.has(n)) {
        delAttr(e, n);
      }
    }
    if (e.name === 'a') {
      const href = attr(e, 'href');
      if (href === null) return;
      const out = rewriteHref(href, nn, lessonFiles);
      if (out.kind === 'external') {
        setAttr(e, 'target', '_blank');
        setAttr(e, 'rel', 'noopener');
      }
      if (out.kind === 'unresolved') {
        delAttr(e, 'href');
        st.unresolved.push(`${file}: ${href}`);
      } else setAttr(e, 'href', out.href);
      bump(st.links, out.kind);
    }
  });
  // ids of the TOC panel parts were only for toc.js
  walk(main, (e) => {
    if (['toc', 'toc-body', 'toc-toggle'].includes(attr(e, 'id') ?? '')) delAttr(e, 'id');
  });

  const body = tidy(main.children.map(serialize).join(''));
  const head =
    `<p class="lesson-source">Nguồn: tài liệu ôn tập công khai <a href="${SOURCE}" target="_blank" rel="noopener">artifact 3NhHr42…</a> ` +
    `(${nn === GLOSSARY ? 'trang thuật ngữ' : `bài ${nn}`}). Không thuộc và không được Anthropic xác nhận.</p>`;
  return `${head}\n${body}\n`;
}

/** Drops whitespace-only lines left behind by removed elements (outside <pre>). */
function tidy(html: string): string {
  return html
    .split(/(<pre[\s>][\s\S]*?<\/pre>)/)
    .map((part, i) => (i % 2 ? part : part.replace(/^[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').replace(/>\n\n+(\s*<\/(?:ol|ul|dl|details)>)/g, '>\n$1')))
    .join('')
    .trim();
}

type Rewrite = { kind: 'anchor' | 'app' | 'lesson' | 'overview' | 'practice' | 'bank' | 'external' | 'mailto'; href: string } | { kind: 'unresolved'; href: string };

function rewriteHref(href: string, nn: string, lessonFiles: Set<string>): Rewrite {
  const h = href.trim();
  if (EXERCISE_IDS.has(h.slice(1)) && h.startsWith('#')) return { kind: 'bank', href: `/bank?lesson=${nn}` };
  if (h.startsWith('#')) return { kind: 'anchor', href: h };
  if (/^\/(?!\/)/.test(h)) return { kind: 'app', href: h }; // app routes this script inserted itself
  if (/^https?:\/\//i.test(h)) return { kind: 'external', href: h };
  if (/^mailto:/i.test(h)) return { kind: 'mailto', href: h };
  const m = /^(?:\.\/)?([^?#]+)(\?[^#]*)?(#.*)?$/.exec(h);
  if (m) {
    const [, f, , hash = ''] = m;
    if (f === 'index.html') return { kind: 'overview', href: '/notes/00-tong-quan.md' };
    if (f === '30-luyen-de.html' || f === 'practice.html')
      return { kind: 'practice', href: /mode=mistakes/.test(m[2] ?? '') ? '/review' : '/new' };
    if (f === GLOSSARY) return { kind: 'lesson', href: `/notes/lessons/${GLOSSARY}${hash}` };
    if (lessonFiles.has(f)) {
      if (EXERCISE_IDS.has(hash.slice(1))) return { kind: 'bank', href: `/bank?lesson=${f.slice(0, 2)}` };
      return { kind: 'lesson', href: `/notes/lessons/${f}${hash}` };
    }
  }
  return { kind: 'unresolved', href: h };
}

// ---------------------------------------------------------------- lesson list, exams, ref check

/** Reads `lessons: { "01": { t: "…", f: "…" } }` from assets/data.js with a regex (never executed). */
function readLessonList(srcDir: string): { nn: string; title: string; file: string }[] {
  const js = fs.readFileSync(path.join(srcDir, 'assets', 'data.js'), 'utf8');
  const block = /lessons\s*:\s*\{([\s\S]*?)\n\s*\}/.exec(js);
  const out: { nn: string; title: string; file: string }[] = [];
  const re = /"(\d\d)"\s*:\s*\{\s*t\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*f\s*:\s*"([^"]+)"/g;
  for (const m of (block?.[1] ?? '').matchAll(re)) out.push({ nn: m[1], title: JSON.parse(`"${m[2]}"`), file: m[3] });
  return out;
}

function idsIn(fragment: string): Map<string, string> {
  const ids = new Map<string, string>(); // id → tag name
  for (const t of tokenize(fragment)) if (t.k === 'start') {
    const id = t.attrs.find((a) => a.name.toLowerCase() === 'id')?.value;
    if (id) ids.set(id, t.name);
  }
  return ids;
}

function safetyProblems(fragment: string): string[] {
  const p: string[] = [];
  if (/<\s*script/i.test(fragment)) p.push('<script');
  if (/<\s*noscript/i.test(fragment)) p.push('<noscript');
  if (/javascript:/i.test(fragment)) p.push('javascript:');
  for (const t of tokenize(fragment)) if (t.k === 'start') {
    for (const a of t.attrs) if (/^on/i.test(a.name)) p.push(`${t.name}[${a.name}]`);
  }
  return p;
}

function main() {
  const srcDir = process.argv[2];
  if (!srcDir || !fs.existsSync(path.join(srcDir, 'assets', 'data.js'))) {
    console.error('usage: node scripts/import-lessons.ts <srcDir>   (srcDir holds NN-*.html and assets/data.js)');
    process.exit(2);
  }
  const lessons = readLessonList(srcDir);
  if (lessons.length === 0) throw new Error('no lessons found in assets/data.js');
  const lessonFiles = new Set(lessons.map((l) => l.file));
  const pages: { nn: string; title: string; file: string }[] = [...lessons];
  if (fs.existsSync(path.join(srcDir, GLOSSARY))) pages.push({ nn: GLOSSARY, title: 'Thuật ngữ và từ khoá đề thi', file: GLOSSARY });

  const pack = YAML.parse(fs.readFileSync(packFile, 'utf8')) as { questions: { id: string; ref?: string; exams?: Record<string, string> }[] };
  const examOrder = Object.keys((YAML.parse(fs.readFileSync(examsFile, 'utf8')) as { exams: Record<string, unknown> }).exams);
  const byFile = new Map<string, Set<string>>();
  for (const q of pack.questions) {
    const f = q.ref?.match(/^lessons\/([^#]+)/)?.[1];
    if (!f) continue;
    const s = byFile.get(f) ?? new Set<string>();
    for (const code of Object.keys(q.exams ?? {})) s.add(code);
    byFile.set(f, s);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const st: Stats = { removed: {}, links: {}, unresolved: [] };
  const index: { file: string; title: string; exams: string[] }[] = [];
  const outputs = new Map<string, string>();
  let total = 0;
  for (const l of pages) {
    const srcFile = path.join(srcDir, l.file);
    if (!fs.existsSync(srcFile)) {
      console.warn(`missing source page: ${l.file}`);
      continue;
    }
    const src = fs.readFileSync(srcFile, 'utf8');
    const frag = convert(src, l.file, l.nn, lessonFiles, st);
    const bad = safetyProblems(frag);
    if (bad.length) throw new Error(`${l.file}: unsafe output: ${bad.join(', ')}`);
    fs.writeFileSync(path.join(outDir, l.file), frag);
    outputs.set(l.file, frag);
    total += Buffer.byteLength(frag);
    // exams: those whose questions reference the lesson; else the exam tags on the page itself
    const fromBank = byFile.get(l.file) ?? new Set<string>();
    const fromPage = examOrder.filter((c) => new RegExp(`class="tag xt\\d">${c}\\b`).test(src));
    index.push({ file: l.file, title: l.title, exams: examOrder.filter((c) => fromBank.has(c) || fromPage.includes(c)) });
    console.log(`${l.file.padEnd(36)} ${(Buffer.byteLength(src) / 1024).toFixed(0).padStart(4)} KB → ${(Buffer.byteLength(frag) / 1024).toFixed(0).padStart(4)} KB`);
  }
  const yaml =
    '# Generated by scripts/import-lessons.ts from the public study artifact ' + SOURCE + '\n' +
    '# exams = exams whose ccx questions reference the lesson, plus the exam tags on the lesson page itself.\n' +
    YAML.stringify(index, { lineWidth: 0, flow: false }).replace(/exams:\n((?:\s+- .+\n)+)/g, (_, items: string) =>
      `exams: [${items.trim().split('\n').map((s) => s.replace(/^\s*- /, '')).join(', ')}]\n`,
    );
  fs.writeFileSync(path.join(outDir, 'index.yaml'), yaml);
  // lesson pages the artifact no longer has (renamed / merged upstream)
  const stale = fs.readdirSync(outDir).filter((f) => /^\d\d-.*\.html$/.test(f) && !outputs.has(f));
  for (const f of stale) fs.unlinkSync(path.join(outDir, f));
  if (stale.length) console.log(`removed ${stale.length} stale lesson file(s): ${stale.join(', ')}`);

  // ref check: every ref in ccx.yaml must hit an existing file and (if it has one) an existing heading id
  let ok = 0;
  const missing: string[] = [];
  const notHeading: string[] = [];
  const idCache = new Map<string, Map<string, string>>();
  for (const q of pack.questions) {
    if (!q.ref) continue;
    const m = /^lessons\/([^#]+)(?:#(.+))?$/.exec(q.ref);
    if (!m) {
      missing.push(`${q.id}: ${q.ref} (not a lesson ref)`);
      continue;
    }
    const frag = outputs.get(m[1]);
    if (!frag) {
      missing.push(`${q.id}: ${q.ref} (no such lesson)`);
      continue;
    }
    if (!m[2]) {
      ok++;
      continue;
    }
    if (!idCache.has(m[1])) idCache.set(m[1], idsIn(frag));
    const tag = idCache.get(m[1])!.get(m[2]);
    if (!tag) missing.push(`${q.id}: ${q.ref}`);
    else {
      ok++;
      if (!/^h[1-6]$/.test(tag)) notHeading.push(`${q.id}: ${q.ref} (<${tag}>)`);
    }
  }

  console.log(`\n${outputs.size} lessons, ${(total / 1024).toFixed(0)} KB total → ${path.relative(root, outDir)}/ (+ index.yaml)`);
  console.log('removed:', JSON.stringify(st.removed));
  console.log('links:', JSON.stringify(st.links));
  if (st.unresolved.length) console.log(`unresolved links (href dropped):\n  ${st.unresolved.join('\n  ')}`);
  console.log(`refs: ${ok} ok, ${missing.length} missing`);
  for (const x of missing) console.log(`  missing ${x}`);
  if (notHeading.length) console.log(`refs pointing at a non-heading element: ${notHeading.length}\n  ${notHeading.join('\n  ')}`);
  if (missing.length) process.exitCode = 1;
}

main();
