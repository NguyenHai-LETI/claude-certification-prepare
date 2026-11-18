// Pack parsing + validation (SPEC §6). Used by the bank loader at server start / on change and by scripts/validate.ts.
// Never throws on bad data: a broken question is skipped and reported as an error problem; warnings keep the question.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { BankProblem, ExamCode, Pack, PackOrigin, Question, QuestionStatus } from '../../shared/types.ts';
import type { ExamsFile } from '../config.ts';

const ORIGINS: PackOrigin[] = ['imported', 'official', 'ai', 'manual'];
const STATUSES: QuestionStatus[] = ['active', 'draft', 'retired'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;

export const letter = (i: number) => String.fromCharCode(65 + i);

export interface ParsedBank {
  packs: Pack[];
  questions: Question[];
  problems: BankProblem[];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** "B", ["B"], "B, D", ["d","b"] → ["B","D"] (uppercase, unique, sorted). */
export function normalizeAnswer(v: unknown): string[] {
  const parts = Array.isArray(v) ? v.map(String) : typeof v === 'string' ? v.split(/[\s,;/]+/) : [];
  const out = new Set<string>();
  for (const p of parts) {
    const t = p.trim().toUpperCase();
    if (!t) continue;
    if (/^[A-Z]$/.test(t)) out.add(t);
    else if (/^[A-Z]+$/.test(t)) for (const ch of t) out.add(ch);
    else out.add(t); // invalid token kept → reported as an answer outside the options
  }
  return [...out].sort();
}

/** The stem states how many to choose ("Which TWO…", "(Choose two.)", "Select 2"). */
export function statesCount(stem: string): boolean {
  return /\b(choose|select|pick)\s+(two|three|four|2|3|4)\b|\b(which|what)\s+(two|three|four|2|3|4)\b|\b(two|three|four)\s+(answers|options|choices|statements|actions|steps)\b/i.test(stem);
}

/** Display length used by the giveaway check (Markdown markers ignored). */
const plainLen = (s: string) => s.replace(/[`*_]/g, '').trim().length;

export function parsePackText(text: string, file: string, exams: ExamsFile, seen: Map<string, string>, problems: BankProblem[]): { pack?: Pack; questions: Question[] } {
  const push = (level: BankProblem['level'], message: string, qid?: string) => problems.push({ level, file, ...(qid ? { qid } : {}), message });
  let doc: unknown;
  try {
    doc = YAML.parse(text);
  } catch (e) {
    push('error', `YAML lỗi cú pháp: ${(e as Error).message.split('\n')[0]}`);
    return { questions: [] };
  }
  if (!isObj(doc)) {
    push('error', 'Pack phải là một object YAML (id, title, questions)');
    return { questions: [] };
  }
  const packId = String(doc.id ?? path.basename(file, path.extname(file)));
  let origin = String(doc.origin ?? 'manual') as PackOrigin;
  if (!ORIGINS.includes(origin)) {
    push('warning', `origin "${origin}" không hợp lệ (imported | official | ai | manual) — coi là manual`);
    origin = 'manual';
  }
  const rawQs = Array.isArray(doc.questions) ? doc.questions : [];
  if (!Array.isArray(doc.questions)) push('error', 'Pack thiếu danh sách questions');
  const questions: Question[] = [];
  rawQs.forEach((raw, idx) => {
    if (!isObj(raw)) {
      push('error', `Câu thứ ${idx + 1} không phải object`);
      return;
    }
    const id = raw.id === undefined || raw.id === null ? '' : String(raw.id).trim();
    const label = id || `#${idx + 1}`;
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!id) errors.push(`câu thứ ${idx + 1} thiếu id`);
    else if (!ID_RE.test(id)) errors.push(`id "${id}" chứa ký tự không hợp lệ`);
    else if (seen.has(id)) errors.push(`trùng id với ${seen.get(id)}`);

    const stem = typeof raw.stem === 'string' ? raw.stem.trim() : raw.stem === undefined || raw.stem === null ? '' : String(raw.stem).trim();
    if (!stem) errors.push('thiếu stem');
    const options = Array.isArray(raw.options) ? raw.options.map((o) => (o === null || o === undefined ? '' : String(o).trim())) : [];
    if (!Array.isArray(raw.options) || !options.length) errors.push('thiếu options');
    else if (options.length < 2) errors.push(`chỉ có ${options.length} phương án (cần ≥ 2)`);
    else if (options.length > 6) warnings.push(`${options.length} phương án (nên 2–6)`);
    if (options.some((o) => !o)) errors.push('có phương án rỗng');
    const answer = normalizeAnswer(raw.answer);
    if (!answer.length) errors.push('thiếu answer');
    const letters = options.map((_, i) => letter(i));
    const bad = answer.filter((a) => !letters.includes(a));
    if (options.length && bad.length) errors.push(`đáp án ${bad.join(', ')} nằm ngoài các phương án (${letters.join('')})`);

    // exams membership
    const qExams: Partial<Record<ExamCode, string>> = {};
    if (!isObj(raw.exams) || !Object.keys(raw.exams).length) errors.push('thiếu exams (≥ 1 kỳ thi: {CCAR-F: D1})');
    else {
      for (const [code, dom] of Object.entries(raw.exams)) {
        const def = exams.byCode.get(code as ExamCode);
        const d = String(dom ?? '').trim();
        if (!def) errors.push(`kỳ thi không tồn tại: ${code}`);
        else if (!def.domains.some((x) => x.id === d)) errors.push(`domain không tồn tại trong ${code}: ${d || '(trống)'}`);
        else qExams[code as ExamCode] = d;
      }
    }
    let scenario: string | undefined;
    if (raw.scenario !== undefined && raw.scenario !== null && raw.scenario !== '') {
      scenario = String(raw.scenario).trim();
      const ccarf = exams.byCode.get('CCAR-F');
      if (!isObj(raw.exams) || !('CCAR-F' in raw.exams)) errors.push(`scenario ${scenario} nhưng câu không thuộc CCAR-F`);
      else if (!ccarf?.scenarios?.some((s) => s.id === scenario)) errors.push(`scenario không tồn tại: ${scenario}`);
    }
    let status = (raw.status === undefined || raw.status === null ? 'active' : String(raw.status)) as QuestionStatus;
    if (!STATUSES.includes(status)) {
      errors.push(`status "${status}" không hợp lệ (active | draft | retired)`);
      status = 'active';
    }
    const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : raw.explanation ? String(raw.explanation).trim() : '';

    // warnings (question kept)
    if (answer.length > 1 && stem && !statesCount(stem)) warnings.push(`nhiều đáp án (${answer.length}) nhưng stem không nói chọn mấy`);
    if (options.length >= 2 && answer.length && !bad.length) {
      const keyMax = Math.max(...answer.map((a) => plainLen(options[letters.indexOf(a)])));
      const others = options.filter((_, i) => !answer.includes(letters[i])).map(plainLen);
      const otherMax = others.length ? Math.max(...others) : 0;
      if (otherMax > 0 && keyMax > 1.6 * otherMax) warnings.push(`đáp án dài hơn hẳn các phương án nhiễu (${keyMax} so với ≤ ${otherMax} ký tự) — dễ đoán`);
    }
    if (explanation.length < 60) warnings.push(explanation ? `giải thích quá ngắn (${explanation.length} ký tự)` : 'thiếu giải thích');
    if (!raw.ref) warnings.push('thiếu ref (link tới tài liệu)');
    if (raw.difficulty !== undefined && !DIFFICULTIES.includes(String(raw.difficulty))) warnings.push(`difficulty "${String(raw.difficulty)}" không hợp lệ`);

    for (const w of warnings) push('warning', w, label);
    if (errors.length) {
      for (const e of errors) push('error', e, label);
      return; // broken question skipped
    }
    seen.set(id, file);
    const q: Question = { id, pack: packId, exams: qExams, stem, options, answer, explanation, status, file };
    if (scenario) q.scenario = scenario;
    if (raw.ref) q.ref = String(raw.ref);
    if (raw.difficulty && DIFFICULTIES.includes(String(raw.difficulty))) q.difficulty = String(raw.difficulty) as Question['difficulty'];
    if (Array.isArray(raw.tags)) q.tags = raw.tags.map(String);
    const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v ? String(v) : undefined);
    const created = day(raw.created);
    const reviewed = day(raw.reviewed);
    if (created) q.created = created;
    if (reviewed) q.reviewed = reviewed;
    questions.push(q);
  });
  const pack: Pack = {
    id: packId,
    title: String(doc.title ?? packId),
    origin,
    file,
    count: questions.length,
    activeCount: questions.filter((q) => q.status === 'active').length,
  };
  if (doc.source) pack.source = String(doc.source);
  if (doc.description) pack.description = String(doc.description);
  return { pack, questions };
}

/** All `<packsDir>/*.yaml` (sorted by name). `relBase` = the directory pack `file` paths are relative to (the data root). */
export function parseBank(packsDir: string, relBase: string, exams: ExamsFile): ParsedBank {
  const problems: BankProblem[] = [];
  const packs: Pack[] = [];
  const questions: Question[] = [];
  const seen = new Map<string, string>();
  const packIds = new Map<string, string>();
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(packsDir)
      .filter((f) => /\.ya?ml$/i.test(f) && !f.startsWith('.'))
      .sort();
  } catch {
    // no packs directory yet
  }
  for (const f of files) {
    const abs = path.join(packsDir, f);
    const rel = path.relative(relBase, abs).split(path.sep).join('/');
    let text: string;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch (e) {
      problems.push({ level: 'error', file: rel, message: `Không đọc được file: ${(e as Error).message}` });
      continue;
    }
    const r = parsePackText(text, rel, exams, seen, problems);
    if (!r.pack) continue;
    if (packIds.has(r.pack.id)) problems.push({ level: 'warning', file: rel, message: `pack id "${r.pack.id}" trùng với ${packIds.get(r.pack.id)}` });
    packIds.set(r.pack.id, rel);
    packs.push(r.pack);
    questions.push(...r.questions);
  }
  return { packs, questions, problems };
}
