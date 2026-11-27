// npm run crawl-cloudexam -- [slug ...] [--only <lesson-slug>] [--headed]
// Crawls the public "Kiến thức" lessons of https://anthropic.cloudexam.pro (third party, NOT official Anthropic docs)
// into notes/tai-lieu-nguon/<slug>/<lesson>.md, one Markdown file per lesson with front matter (nguon, ngay_tai, tieu_de),
// then regenerates notes/tai-lieu-nguon/README.md from every crawled folder.
// Default slugs: ccar-f ccdv-f ccdv-p ccar-p (ccao-f also works). Pages are public; no login is used.
// The HTML → Markdown conversion runs inside the page and knows the site's blocks: callouts, step diagrams,
// compare columns, hub/cycle diagrams, SVG / mermaid diagrams (text only), decision lists, tables, code, sources.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright';

const BASE = 'https://anthropic.cloudexam.pro';
const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const outRoot = path.join(root, 'notes', 'tai-lieu-nguon');
const DEFAULT_SLUGS = ['ccar-f', 'ccdv-f', 'ccdv-p', 'ccar-p'];

const args = process.argv.slice(2);
const headed = args.includes('--headed');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : '';
const slugs = args.filter((a, i) => !a.startsWith('--') && !(onlyIdx >= 0 && i === onlyIdx + 1));
const targets = slugs.length ? slugs : DEFAULT_SLUGS;
const today = new Date().toISOString().slice(0, 10);

type Lesson = { title: string; markdown: string };

// Runs in the browser. Must be self-contained (it is serialised by Playwright).
function articleToMarkdown(base: string): Lesson {
  const art = document.querySelector('article');
  if (!art) throw new Error('no <article> on page');
  const SKIP = 'nav.crumb, p.presence-line, nav.lnav, div.ctaband, dialog, form, button, style, script, .vh, defs, marker, symbol';
  const abs = (href: string) => (href.startsWith('/') ? base + href : href);
  const clean = (s: string) => s.replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim();

  function inline(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\s+/g, ' ');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    if (el.matches(SKIP) || el.tagName.toLowerCase() === 'svg') return '';
    const inner = () => Array.from(el.childNodes).map(inline).join('');
    switch (el.tagName.toLowerCase()) {
      case 'strong': case 'b': { const t = inner(); return t.trim() ? `**${t.trim()}**` : t; }
      case 'em': case 'i': { const t = inner(); return t.trim() ? `_${t.trim()}_` : ''; }
      case 'code': return '`' + (el.textContent || '') + '`';
      case 'br': return '<br>';
      case 'a': {
        const t = inner().trim();
        const href = el.getAttribute('href') || '';
        if (!href || href.startsWith('#') || el.classList.contains('glink')) return t;
        return `[${t}](${abs(href)})`;
      }
      default: return inner();
    }
  }
  const line = (el: Element) => clean(inline(el)).replace(/\s*<br>\s*/g, '<br>');

  function list(el: Element, depth: number): string {
    const ordered = el.tagName.toLowerCase() === 'ol';
    let n = 0;
    const out: string[] = [];
    for (const li of Array.from(el.children)) {
      if (li.tagName.toLowerCase() !== 'li') continue;
      n++;
      const own = document.createElement('div');
      const nested: Element[] = [];
      for (const c of Array.from(li.childNodes)) {
        if (c.nodeType === Node.ELEMENT_NODE && /^(ul|ol)$/i.test((c as Element).tagName)) nested.push(c as Element);
        else own.appendChild(c.cloneNode(true));
      }
      const pad = '  '.repeat(depth);
      out.push(`${pad}${ordered ? n + '.' : '-'} ${line(own)}`);
      for (const s of nested) out.push(list(s, depth + 1));
    }
    return out.join('\n');
  }

  function table(t: Element): string {
    const rows = Array.from(t.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.children).map((c) => line(c).replace(/\|/g, '\\|') || ' '));
    if (!rows.length) return '';
    const w = Math.max(...rows.map((r) => r.length));
    const fmt = (r: string[]) => '| ' + [...r, ...Array(w - r.length).fill(' ')].join(' | ') + ' |';
    return [fmt(rows[0]), '|' + ' --- |'.repeat(w), ...rows.slice(1).map(fmt)].join('\n');
  }

  function box(b: Element): string {
    const strong = b.querySelector(':scope > strong');
    const rest = Array.from(b.childNodes).filter((c) => c !== strong);
    const tmp = document.createElement('div');
    rest.forEach((c) => tmp.appendChild(c.cloneNode(true)));
    const head = strong ? `**${clean(strong.textContent || '')}**` : '';
    const tail = line(tmp);
    return [head, tail].filter(Boolean).join(': ');
  }

  // Step diagram: <ol><li>[ldarrow label] <ul.ldrow><li.ldbox>…</ul></li>…</ol>
  function steps(ol: Element): string {
    const out: string[] = [];
    let n = 0;
    for (const li of Array.from(ol.children)) {
      const label = li.querySelector(':scope > .ldarrow .ldarrowlabel');
      if (label && clean(label.textContent || '')) out.push(`   ↓ _${clean(label.textContent || '')}_`);
      const note = li.querySelector(':scope > .ldlayernote');
      if (note) out.push(`   _(${clean(note.textContent || '')})_`);
      const boxes = Array.from(li.querySelectorAll(':scope > ul.ldrow > li.ldbox, :scope > .ldcbox, :scope > .ldresult'));
      if (!boxes.length) continue;
      n++;
      const parts = boxes.map((b) => b.classList.contains('ldresult')
        ? `**${clean(b.querySelector('.ldbig')?.textContent || '')}** ${clean(b.querySelector('small')?.textContent || '')}`.trim()
        : b.classList.contains('ldcbox') ? line(b) : box(b));
      out.push(parts.length > 1 ? `${n}. ${parts.join(' **|** ')}` : `${n}. ${parts[0]}`);
    }
    return out.join('\n');
  }

  function svgText(svg: Element): string {
    const out: string[] = [];
    const title = svg.querySelector(':scope > title');
    if (title && clean(title.textContent || '')) out.push(`_${clean(title.textContent || '')}_`, '');
    const texts = Array.from(svg.querySelectorAll('text, foreignObject')).filter((t) => !t.closest('title'));
    if (svg.querySelector('.messageText')) {
      const actors = Array.from(new Set(Array.from(svg.querySelectorAll('text.actor')).map((t) => clean(t.textContent || '')))).filter(Boolean);
      if (actors.length) out.push(`Bên tham gia: ${actors.join(', ')}`, '');
      Array.from(svg.querySelectorAll('text.messageText')).forEach((t, i) => out.push(`${i + 1}. ${clean(t.textContent || '')}`));
      return out.join('\n');
    }
    let cur = '';
    const flush = () => { if (cur.trim()) out.push('- ' + cur.trim()); cur = ''; };
    const seen = new Set<string>();
    for (const t of texts) {
      if (t.tagName.toLowerCase() === 'text' && t.closest('foreignObject')) continue;
      const s = clean(t.textContent || '');
      if (!s) continue;
      const cls = t.getAttribute('class') || '';
      if (/\bnum\b/.test(cls)) { flush(); cur = s + '. '; continue; }
      if (/\b(th|tl)\b/.test(cls)) { if (cur && !/\. $/.test(cur)) flush(); cur += `**${s}**`; continue; }
      if (t.tagName.toLowerCase() === 'foreignobject') { if (seen.has(s)) continue; seen.add(s); flush(); cur = s; flush(); continue; }
      cur += (cur && !/\. $/.test(cur) ? ': ' : '') + s;
      flush();
    }
    flush();
    return out.join('\n');
  }

  function figure(f: Element): string {
    const out: string[] = [];
    const head = f.querySelector(':scope > .ldhead');
    out.push(head ? `**Sơ đồ: ${clean(head.textContent || '')}**` : '**Sơ đồ**');
    if (f.classList.contains('ldcompare')) {
      for (const col of Array.from(f.querySelectorAll('section.ldcol'))) {
        const tone = col.classList.contains('ldtone-bad') ? '✗' : col.classList.contains('ldtone-good') ? '✓' : '•';
        const ch = col.querySelector('.ldcolhead');
        const label = ch ? Array.from(ch.children).filter((c) => !c.classList.contains('ldmark')).map((c) => clean(c.textContent || '')).join(' ') : '';
        out.push('', `${tone} _${label}_`);
        const body = col.querySelector('ol.ldcolbody');
        if (body) out.push(steps(body));
      }
    } else if (f.classList.contains('ldradial')) {
      const center = f.querySelector('.ldcenter');
      if (center) out.push(`- Trung tâm: ${box(center)}`);
      for (const n of Array.from(f.querySelectorAll('.ldnode:not(.ldcenter)'))) {
        const num = n.querySelector('.ldstepn');
        const copy = n.cloneNode(true) as Element;
        copy.querySelector('.ldstepn')?.remove();
        out.push(num ? `${clean(num.textContent || '')}. ${box(copy)}` : `- ${box(copy)}`);
      }
      const note = f.querySelector('.ldcenternote');
      if (note) out.push(`- ${clean(note.textContent || '')}`);
    } else if (f.querySelector(':scope svg[role], :scope .ldfig svg')) {
      const svg = f.querySelector('.ldfig > svg') || f.querySelector('svg');
      if (svg) out.push(svgText(svg));
    } else {
      const ol = f.querySelector(':scope > ol');
      if (ol) out.push(steps(ol));
      else out.push(clean((f as HTMLElement).innerText));
    }
    const cap = f.querySelector('figcaption');
    if (cap) out.push('', `_${clean(cap.textContent || '')}_`);
    return out.join('\n');
  }

  function blocks(parent: Element): string[] {
    const out: string[] = [];
    for (const el of Array.from(parent.children)) {
      if (el.matches(SKIP)) continue;
      const tag = el.tagName.toLowerCase();
      const cls = el.classList;
      if (/^h[1-6]$/.test(tag)) out.push('#'.repeat(Number(tag[1])) + ' ' + line(el));
      else if (tag === 'p') { const t = line(el); if (t) out.push(t); }
      else if (tag === 'ol' && cls.contains('lflow')) {
        let n = 0;
        out.push(Array.from(el.children).map((li) => {
          const q = clean(li.querySelector('.lflow-q')?.textContent || '');
          const a = line(li.querySelector('.lflow-a') || li);
          return li.classList.contains('lflow-else') ? `- **${q}** → ${a}` : `${++n}. **${q}** → ${a}`;
        }).join('\n'));
      }
      else if (tag === 'ul' || tag === 'ol') out.push(list(el, 0));
      else if (tag === 'table') out.push(table(el));
      else if (cls.contains('ltable')) { const t = el.querySelector('table'); if (t) out.push(table(t)); }
      else if (tag === 'pre') {
        const lang = (el.querySelector('code')?.className.match(/language-(\S+)/) || [])[1] || '';
        out.push('```' + (lang === 'text' ? '' : lang) + '\n' + (el.textContent || '').replace(/\n$/, '') + '\n```');
      }
      else if (tag === 'aside' && cls.contains('lcallout')) {
        const label = clean(el.querySelector('.lcallout-label')?.textContent || 'Ghi chú');
        const copy = el.cloneNode(true) as Element;
        copy.querySelector('.lcallout-label')?.remove();
        const body = blocks(copy).join('\n\n');
        out.push(`> **${label}**\n>\n` + body.split('\n').map((l) => (l ? '> ' + l : '>')).join('\n'));
      }
      else if (tag === 'figure' && cls.contains('ldiagram')) out.push(figure(el));
      else if (tag === 'nav' && cls.contains('ldeeper')) {
        const t = clean(el.querySelector('.ldeepertitle')?.textContent || 'Học kỹ hơn');
        const links = Array.from(el.querySelectorAll('a.ldeeperlink')).map((a) =>
          `- [${clean(a.querySelector('.ldeepertask')?.textContent || '')} ${clean(a.querySelector('.ldeepername')?.textContent || '')}](${abs(a.getAttribute('href') || '')})` +
          (a.querySelector('.ldeepermin') ? ` (${clean(a.querySelector('.ldeepermin')?.textContent || '')})` : ''));
        out.push(`**${t}**\n\n${links.join('\n')}`);
      }
      else if (tag === 'section' && cls.contains('lsources')) {
        const items = Array.from(el.querySelectorAll('a')).map((a, i) => `${i + 1}. [${clean(inline(a).replace(/^\[|\]\(.*$/g, ''))}](${abs(a.getAttribute('href') || '')})`);
        out.push('## Nguồn', items.join('\n'));
      }
      else if (tag === 'header' && cls.contains('lhd')) {
        const eyebrow = el.querySelector('.leyebrow');
        if (eyebrow) out.push(clean(Array.from(eyebrow.childNodes).filter((c) => c.nodeType !== Node.COMMENT_NODE).map((c) => (c as Element).classList?.contains('sep') ? ' · ' : c.textContent).join('')));
        const h1 = el.querySelector('h1');
        if (h1) out.push('# ' + line(h1));
        const lede = el.querySelector('.lede');
        if (lede) out.push(line(lede));
        const chips = Array.from(el.querySelectorAll('.lchips > li')).map((c) => '- ' + clean(c.textContent || ''));
        if (chips.length) out.push(chips.join('\n'));
      }
      else if (tag === 'section' && cls.contains('lgoals')) {
        out.push('## ' + clean(el.querySelector('h2')?.textContent || 'Đọc xong bạn nắm được'));
        out.push(Array.from(el.querySelectorAll('li')).map((li) => '- ' + line(li)).join('\n'));
      }
      else if (tag === 'svg') continue;
      else out.push(...blocks(el)); // div, section, etc.
    }
    return out.filter((s) => s.trim());
  }

  const title = clean(art.querySelector('h1')?.textContent || document.title);
  const md = blocks(art).join('\n\n').replace(/\n{3,}/g, '\n\n');
  return { title, markdown: md };
}

async function lessonLinks(page: Page, slug: string): Promise<string[]> {
  await page.goto(`${BASE}/kien-thuc/${slug}`, { waitUntil: 'networkidle' });
  const links = await page.$$eval(`a[href^="/kien-thuc/${slug}/"]`, (as) => as.map((a) => a.getAttribute('href') || ''));
  return [...new Set(links)].map((h) => h.split(/[?#]/)[0]).filter((h) => h.split('/').length === 4);
}

async function crawlLesson(page: Page, href: string): Promise<Lesson> {
  for (let attempt = 1; ; attempt++) {
    try {
      await page.goto(BASE + href, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForSelector('article h1', { timeout: 20_000 });
      // mermaid diagrams render client-side; give them a moment
      await page.waitForFunction(() => Array.from(document.querySelectorAll('figure.ldmermaid')).every((f) => f.getAttribute('data-state') !== 'pending' && f.querySelector('svg')), null, { timeout: 10_000 }).catch(() => {});
      return await page.evaluate(articleToMarkdown, BASE);
    } catch (e) {
      if (attempt >= 3) throw e;
      console.warn(`  retry ${attempt} ${href}: ${(e as Error).message.split('\n')[0]}`);
      await page.waitForTimeout(2000 * attempt);
    }
  }
}

function frontMatter(url: string, title: string): string {
  return `---\nnguon: ${url}\nngay_tai: ${today}\ntieu_de: ${title.replace(/\n/g, ' ')}\n---\n\n`;
}

function readFront(file: string): Record<string, string> | null {
  const m = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  return Object.fromEntries(m[1].split('\n').map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()]));
}

const naturalKey = (f: string) => (f.startsWith('on-nhanh') ? '0' : f.replace(/^(\d+)-(\d+)/, (_, a, b) => a.padStart(2, '0') + '-' + b.padStart(2, '0')));

function writeReadme(): void {
  const dirs = fs.readdirSync(outRoot).filter((d) => fs.statSync(path.join(outRoot, d)).isDirectory()).sort();
  const parts: string[] = [
    '# Tài liệu nguồn: bài "Kiến thức" của anthropic.cloudexam.pro',
    '',
    'Bản crawl từ https://anthropic.cloudexam.pro/kien-thuc/<kỳ thi>, mỗi bài một file Markdown, đầu file có `nguon` (URL gốc) và `ngay_tai`.',
    'Crawl lại: `npm run crawl-cloudexam -- [ccar-f ccdv-f ccdv-p ccar-p ccao-f]` (script `scripts/crawl-cloudexam.ts`, README này được sinh lại tự động).',
    'Sơ đồ trên trang được chuyển thành chữ (danh sách bước, cột so sánh), không giữ hình.',
    '',
    'Lưu ý: đây là tài liệu của bên thứ ba (cloudexam.pro), không phải tài liệu chính thức của Anthropic; mỗi bài có mục "Nguồn" trỏ tới docs gốc.',
    '',
    '| Bộ | Số bài |',
    '|---|---|',
  ];
  const sections: string[] = [];
  for (const d of dirs) {
    const files = fs.readdirSync(path.join(outRoot, d)).filter((f) => f.endsWith('.md')).sort((a, b) => naturalKey(a).localeCompare(naturalKey(b)));
    const crawled: string[] = [];
    const own: string[] = [];
    let date = '';
    for (const f of files) {
      const fm = readFront(path.join(outRoot, d, f));
      if (fm?.nguon) {
        crawled.push(`| [${f}](${d}/${f}) | ${f.startsWith('on-nhanh') ? 'Tổng quan ' + d.toUpperCase() : fm.tieu_de} |`);
        if (fm.ngay_tai > date) date = fm.ngay_tai;
      } else own.push(`| [${f}](${d}/${f}) | Tự soạn, không phải bản crawl |`);
    }
    if (!crawled.length) continue;
    parts.push(`| [${d.toUpperCase()}](#${d}) | ${crawled.length} (tải ${date}) |`);
    sections.push(`## ${d.toUpperCase()}\n\n| File | Bài |\n|---|---|\n${[...crawled, ...own].join('\n')}`);
  }
  fs.writeFileSync(path.join(outRoot, 'README.md'), parts.join('\n') + '\n\n' + sections.join('\n\n') + '\n');
}

const browser = await chromium.launch({ headless: !headed });
const page = await browser.newPage();
let failed = 0;
try {
  for (const slug of targets) {
    const links = (await lessonLinks(page, slug)).filter((h) => !only || h.endsWith('/' + only));
    if (!links.length) { console.error(`✗ ${slug}: no lessons found`); failed++; continue; }
    const dir = path.join(outRoot, slug);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`${slug}: ${links.length} pages`);
    for (const href of links) {
      const name = href.split('/').pop()!;
      try {
        const { title, markdown } = await crawlLesson(page, href);
        fs.writeFileSync(path.join(dir, name + '.md'), frontMatter(BASE + href, title) + markdown + '\n');
        console.log(`  ✓ ${name}  (${markdown.length} chars)`);
      } catch (e) {
        failed++;
        console.error(`  ✗ ${name}: ${(e as Error).message.split('\n')[0]}`);
      }
      await page.waitForTimeout(400); // be polite
    }
  }
} finally {
  await browser.close();
}
writeReadme();
console.log(failed ? `done with ${failed} failure(s)` : 'done');
process.exitCode = failed ? 1 : 0;
