// Study notes (SPEC §2.3): list, one file with its headings, and the in-memory full-text search over notes + questions.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { PATHS } from '../config.ts';
import { HttpError } from '../http.ts';
import { EXAM_CODES, type ExamCode, type NoteEntry, type NoteFile, type SearchHit } from '../../shared/types.ts';
import { getBank } from './bank.ts';
import { plainText } from './progress.ts';

const GROUP_ORDER = ['Tổng quan', 'Kỳ thi', 'Bài học'];
const NOTE_RE = /\.(md|html?)$/i;

// ── text helpers ────────────────────────────────────────────────────────────

/** GitHub-style heading anchor: lowercase, letters (incl. Vietnamese) / digits / `-` / `_` kept, spaces → `-`. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, '')
    .replace(/ /g, '-');
}

/** github-slugger behaviour for repeated headings: "x", "x-1", "x-2". */
export function slugger() {
  const occ = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    let id = base;
    while (occ.has(id)) {
      const n = (occ.get(base) ?? 0) + 1;
      occ.set(base, n);
      id = `${base}-${n}`;
    }
    occ.set(id, 0);
    return id;
  };
}

/** Inline Markdown → text (code spans, emphasis, links, images, HTML tags). */
export function mdInlineText(s: string): string {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/~~(.+?)~~/g, '$1')
    .trim();
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rarr: '→', larr: '←', laquo: '«', raquo: '»', copy: '©', times: '×' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** HTML fragment → plain text (scripts/styles dropped, block tags → spaces). */
export function htmlText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Accent-insensitive fold: NFD without combining marks, đ → d, lowercase. */
export function fold(s: string): string {
  return s.replace(/[đĐ]/g, 'd').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Fold with a map from each folded char back to its index in `s` (for snippets). */
function foldMapped(s: string): { text: string; map: number[] } {
  let text = '';
  const map: number[] = [];
  let i = 0;
  for (const ch of s) {
    const f = fold(ch);
    for (let k = 0; k < f.length; k++) map.push(i);
    text += f;
    i += ch.length;
  }
  map.push(s.length);
  return { text, map };
}

// ── frontmatter ─────────────────────────────────────────────────────────────

export function splitFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const m = text.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { data: {}, body: text.replace(/^﻿/, '') };
  let data: Record<string, unknown> = {};
  try {
    const d = YAML.parse(m[1]) as unknown;
    if (d && typeof d === 'object' && !Array.isArray(d)) data = d as Record<string, unknown>;
  } catch {
    // broken frontmatter: treated as absent
  }
  return { data, body: text.slice(m[0].length) };
}

const examList = (v: unknown): ExamCode[] | undefined => {
  const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(/[\s,]+/) : [];
  const out = arr.map((x) => String(x).trim().toUpperCase()).filter((x): x is ExamCode => EXAM_CODES.includes(x as ExamCode));
  return out.length ? [...new Set(out)] : undefined;
};

// ── headings ────────────────────────────────────────────────────────────────

export interface Heading {
  id: string;
  text: string;
  level: number;
  pos: number; // offset in the content
}

export function mdHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  const slug = slugger();
  let fence: string | undefined;
  let pos = 0;
  for (const line of body.split('\n')) {
    const f = line.match(/^\s{0,3}(```+|~~~+)/);
    if (f) {
      if (!fence) fence = f[1][0];
      else if (f[1][0] === fence) fence = undefined;
    } else if (!fence) {
      const m = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (m) {
        const text = mdInlineText(m[2]);
        out.push({ id: slug(text), text, level: m[1].length, pos });
      }
    }
    pos += line.length + 1;
  }
  return out;
}

export function htmlHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  for (const m of html.matchAll(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi)) {
    const id = m[2].match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!id) continue;
    out.push({ id, text: htmlText(m[3]), level: Number(m[1]), pos: m.index ?? 0 });
  }
  return out;
}

// ── notes index ─────────────────────────────────────────────────────────────

interface NoteRecord extends NoteEntry {
  format: 'md' | 'html';
  abs: string;
  order: number;
}

let notesCache: NoteRecord[] | undefined;

export function invalidateNotes() {
  notesCache = undefined;
  searchIndex = undefined;
}

function walk(dir: string, rel = '', out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name.startsWith('_')) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) walk(path.join(dir, e.name), r, out);
    else if (e.isFile() && NOTE_RE.test(e.name)) out.push(r);
  }
  return out;
}

interface LessonMeta {
  title?: string;
  exams?: ExamCode[];
  order: number;
}

function lessonIndex(): Map<string, LessonMeta> {
  const m = new Map<string, LessonMeta>();
  let doc: unknown;
  try {
    doc = YAML.parse(fs.readFileSync(path.join(PATHS.notes, 'lessons', 'index.yaml'), 'utf8'));
  } catch {
    return m; // no index (yet) or unreadable
  }
  const list = Array.isArray(doc) ? doc : doc && typeof doc === 'object' && Array.isArray((doc as { lessons?: unknown }).lessons) ? (doc as { lessons: unknown[] }).lessons : [];
  list.forEach((x, i) => {
    if (!x || typeof x !== 'object') return;
    const e = x as { file?: unknown; title?: unknown; exams?: unknown };
    if (!e.file) return;
    const f = String(e.file).replace(/^\.?\/?(notes\/)?/, '');
    const key = f.startsWith('lessons/') ? f : `lessons/${f}`;
    m.set(key, { title: e.title ? String(e.title) : undefined, exams: examList(e.exams), order: i });
  });
  return m;
}

function groupOf(rel: string): string {
  const dir = rel.includes('/') ? rel.slice(0, rel.indexOf('/')) : '';
  if (!dir) return 'Tổng quan';
  if (dir === 'exams') return 'Kỳ thi';
  if (dir === 'lessons') return 'Bài học';
  return dir;
}

function titleOf(rel: string, format: 'md' | 'html', body: string, data: Record<string, unknown>, lesson?: LessonMeta): string {
  if (lesson?.title) return lesson.title;
  if (typeof data.title === 'string' && data.title.trim()) return data.title.trim();
  if (format === 'md') {
    const h = mdHeadings(body).find((x) => x.level === 1);
    if (h) return h.text;
  }
  const h1 = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return htmlText(h1[1]);
  return path.basename(rel).replace(NOTE_RE, '');
}

function readNoteRecords(): NoteRecord[] {
  if (notesCache) return notesCache;
  const lessons = lessonIndex();
  const out: NoteRecord[] = [];
  for (const rel of walk(PATHS.notes)) {
    const abs = path.join(PATHS.notes, ...rel.split('/'));
    const format: 'md' | 'html' = /\.md$/i.test(rel) ? 'md' : 'html';
    let text = '';
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const { data, body } = splitFrontmatter(text);
    const lesson = lessons.get(rel);
    const exams = lesson?.exams ?? examList(data.exams) ?? (rel.startsWith('exams/') ? examList(path.basename(rel).replace(NOTE_RE, '')) : undefined);
    const rec: NoteRecord = { path: rel, title: titleOf(rel, format, body, data, lesson), group: groupOf(rel), format, abs, order: lesson?.order ?? 10_000 };
    if (exams) rec.exams = exams;
    out.push(rec);
  }
  const g = (x: string) => (GROUP_ORDER.indexOf(x) < 0 ? 99 : GROUP_ORDER.indexOf(x));
  out.sort((a, b) => g(a.group) - g(b.group) || a.group.localeCompare(b.group) || a.order - b.order || a.path.localeCompare(b.path, 'en', { numeric: true }));
  notesCache = out;
  return out;
}

export function listNotes(): NoteEntry[] {
  return readNoteRecords().map(({ path: p, title, group, exams }) => ({ path: p, title, group, ...(exams ? { exams } : {}) }));
}

/** `notes/`-relative path from a request → absolute path inside notes/ (400 on traversal / bad type). */
export function safeNotePath(p: unknown): { rel: string; abs: string } {
  const raw = String(p ?? '')
    .replace(/\\/g, '/')
    .replace(/#.*$/, '')
    .replace(/^\/+/, '')
    .replace(/^notes\//, '');
  if (!raw || raw.split('/').some((s) => s === '..' || s === '.' || s === '') || raw.includes('\0') || !NOTE_RE.test(raw)) throw new HttpError(400, 'Đường dẫn tài liệu không hợp lệ');
  const abs = path.resolve(PATHS.notes, ...raw.split('/'));
  const base = path.resolve(PATHS.notes);
  if (!abs.startsWith(base + path.sep)) throw new HttpError(400, 'Đường dẫn tài liệu không hợp lệ');
  return { rel: raw, abs };
}

export function readNote(p: unknown): NoteFile {
  const { rel, abs } = safeNotePath(p);
  let text: string;
  try {
    const real = fs.realpathSync(abs);
    if (!real.startsWith(fs.realpathSync(PATHS.notes) + path.sep)) throw new HttpError(400, 'Đường dẫn tài liệu không hợp lệ');
    text = fs.readFileSync(real, 'utf8');
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(404, `Không tìm thấy tài liệu ${rel}`);
  }
  const rec = readNoteRecords().find((r) => r.path === rel);
  const format: 'md' | 'html' = /\.md$/i.test(rel) ? 'md' : 'html';
  const { data, body } = splitFrontmatter(text);
  const content = format === 'md' ? body : text;
  const headings = (format === 'md' ? mdHeadings(content) : htmlHeadings(content)).map(({ id, text: t, level }) => ({ id, text: t, level }));
  const out: NoteFile = {
    path: rel,
    title: rec?.title ?? titleOf(rel, format, body, data),
    group: rec?.group ?? groupOf(rel),
    format,
    content,
    headings,
  };
  if (rec?.exams) out.exams = rec.exams;
  return out;
}

// ── search ──────────────────────────────────────────────────────────────────

interface SearchDoc {
  kind: 'note' | 'question';
  path?: string;
  qid?: string;
  title: string;
  text: string; // original plain text
  folded: string; // fold(title + " " + text)
  foldedTitle: string;
  exams?: ExamCode[];
}

let searchIndex: { bankAt: number; docs: SearchDoc[] } | undefined;

export function invalidateSearch() {
  searchIndex = undefined;
}

function noteDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const rec of readNoteRecords()) {
    let text: string;
    try {
      text = fs.readFileSync(rec.abs, 'utf8');
    } catch {
      continue;
    }
    const body = rec.format === 'md' ? splitFrontmatter(text).body : text;
    const heads = rec.format === 'md' ? mdHeadings(body) : htmlHeadings(body);
    const cuts = [{ id: '', text: '', pos: 0 }, ...heads];
    for (let i = 0; i < cuts.length; i++) {
      const chunk = body.slice(cuts[i].pos, i + 1 < cuts.length ? cuts[i + 1].pos : body.length);
      const plain = rec.format === 'md' ? mdInlineText(chunk.replace(/^#{1,6}\s+/gm, '')).replace(/\s+/g, ' ').trim() : htmlText(chunk);
      if (!plain) continue;
      const title = cuts[i].id ? `${rec.title} › ${cuts[i].text}` : rec.title;
      docs.push({ kind: 'note', path: cuts[i].id ? `${rec.path}#${cuts[i].id}` : rec.path, title, text: plain, folded: fold(`${title} ${plain}`), foldedTitle: fold(title), exams: rec.exams });
    }
  }
  return docs;
}

function index(): SearchDoc[] {
  const bank = getBank();
  if (searchIndex && searchIndex.bankAt === bank.loadedAt) return searchIndex.docs;
  const docs = noteDocs();
  for (const q of bank.questions) {
    if (q.status === 'retired') continue;
    const title = `${q.id} · ${plainText(q.stem, 90)}`;
    const text = [plainText(q.stem, 100_000), ...q.options.map((o) => plainText(o, 10_000)), plainText(q.explanation, 100_000)].join(' · ');
    docs.push({ kind: 'question', qid: q.id, title, text, folded: fold(`${q.id} ${text}`), foldedTitle: fold(q.id), exams: Object.keys(q.exams) as ExamCode[] });
  }
  searchIndex = { bankAt: bank.loadedAt, docs };
  return docs;
}

const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);

/** First index ≥ from where `term` starts a word in the folded text (prefix match), -1 if none. */
export function wordIndex(hay: string, term: string, from = 0): number {
  for (let i = hay.indexOf(term, from); i >= 0; i = hay.indexOf(term, i + 1)) {
    if (!isWordChar(hay[i - 1]) || !isWordChar(term[0])) return i;
  }
  return -1;
}

function snippet(text: string, terms: string[], phrase: string): string {
  const { text: f, map } = foldMapped(text);
  let at = phrase && phrase.includes(' ') ? wordIndex(f, phrase) : -1;
  let len = phrase.length;
  if (at < 0) {
    for (const t of terms) {
      const i = wordIndex(f, t);
      if (i >= 0 && (at < 0 || i < at)) {
        at = i;
        len = t.length;
      }
    }
  }
  if (at < 0) return text.slice(0, 160) + (text.length > 160 ? '…' : '');
  const s = map[at];
  const e = map[Math.min(at + len, map.length - 1)];
  const from = Math.max(0, s - 70);
  const to = Math.min(text.length, e + 110);
  const pre = text.slice(from, s);
  const cut = from > 0 ? pre.replace(/^\S*\s/, '') : pre;
  const post = text.slice(e, to);
  const cutPost = to < text.length ? post.replace(/\s\S*$/, '') : post;
  return `${from > 0 ? '…' : ''}${cut}«${text.slice(s, e)}»${cutPost}${to < text.length ? '…' : ''}`;
}

export function search(q: unknown, exam?: ExamCode, limit = 40): SearchHit[] {
  const phrase = fold(String(q ?? '').trim()).replace(/\s+/g, ' ');
  if (phrase.length < 2) return [];
  const terms = [...new Set(phrase.split(' ').filter(Boolean))];
  const scored: { d: SearchDoc; score: number }[] = [];
  for (const d of index()) {
    if (exam && d.exams && !d.exams.includes(exam)) continue;
    if (!terms.every((t) => wordIndex(d.folded, t) >= 0)) continue;
    let score = wordIndex(d.folded, phrase) >= 0 ? 10 + 2 * terms.length : 0;
    for (const t of terms) {
      if (wordIndex(d.foldedTitle, t) >= 0) score += 4;
      let n = 0;
      for (let i = wordIndex(d.folded, t); i >= 0 && n < 10; i = wordIndex(d.folded, t, i + t.length)) n++;
      score += n;
    }
    if (d.kind === 'note') score += 1;
    scored.push({ d, score });
  }
  scored.sort((a, b) => b.score - a.score || a.d.title.localeCompare(b.d.title));
  return scored.slice(0, limit).map(({ d }) => {
    const hit: SearchHit = { kind: d.kind, title: d.title, snippet: snippet(d.text, terms, phrase) };
    if (d.path) hit.path = d.path;
    if (d.qid) hit.qid = d.qid;
    return hit;
  });
}
