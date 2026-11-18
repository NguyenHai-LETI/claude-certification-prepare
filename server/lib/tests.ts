// Tests in progress (.local/active/<id>.json) — building (SPEC §3.2), autosave, practice check, submit → result.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, examDef, loadConfig } from '../config.ts';
import { HttpError } from '../http.ts';
import { EXAM_CODES, type ActiveTest, type ActiveTestSummary, type BuildTestRequest, type CheckResponse, type ExamCode, type ExamDef, type Feedback, type Question, type Result, type ResultItem, type SaveTestRequest, type TestAnswer, type TestMode, type TestQuestion } from '../../shared/types.ts';
import { domainIn, examQuestions, getBank } from './bank.ts';
import { lastWrongAt, newResultId, questionHistory, questionStats, saveResult } from './results.ts';
import { byDomain, largestRemainder, makeScore, sameKeys, shuffle } from './score.ts';
import { letter } from './validate.ts';

export const TEST_ID_RE = /^t-\d{8}-\d{6}-[0-9a-f]{4}$/;
const MODES: TestMode[] = ['mock', 'domain', 'review', 'new', 'random', 'ids'];
const MAX_COUNT = 300;

/** Stored form: the served ActiveTest plus the keys at build time (never sent before submit). */
interface StoredTest extends ActiveTest {
  keys: Record<string, string[]>;
}

const cache = new Map<string, StoredTest>();
let loaded = false;

function file(id: string) {
  return path.join(PATHS.active, `${id}.json`);
}

function loadAll() {
  if (loaded) return;
  loaded = true;
  let names: string[] = [];
  try {
    names = fs.readdirSync(PATHS.active).filter((f) => f.endsWith('.json'));
  } catch {
    return;
  }
  for (const n of names) {
    try {
      const t = JSON.parse(fs.readFileSync(path.join(PATHS.active, n), 'utf8')) as StoredTest;
      if (t && TEST_ID_RE.test(t.id) && Array.isArray(t.questions)) cache.set(t.id, t);
    } catch (e) {
      console.error(`  ⚠️ Bỏ qua bài đang làm lỗi ${n}: ${(e as Error).message}`);
    }
  }
}

function persist(t: StoredTest) {
  fs.mkdirSync(PATHS.active, { recursive: true });
  const tmp = `${file(t.id)}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(t, null, 1));
  fs.renameSync(tmp, file(t.id));
  cache.set(t.id, t);
}

function served(t: StoredTest): ActiveTest {
  const { keys: _keys, ...rest } = t;
  return rest;
}

export function getStored(id: string): StoredTest {
  loadAll();
  if (!TEST_ID_RE.test(id)) throw new HttpError(400, 'Mã bài test không hợp lệ');
  const t = cache.get(id);
  if (!t) throw new HttpError(404, 'Không tìm thấy bài test (có thể đã nộp hoặc đã xoá)');
  return t;
}

export function getTest(id: string): ActiveTest {
  return served(getStored(id));
}

function summaryOf(t: ActiveTest): ActiveTestSummary {
  return { id: t.id, exam: t.exam, mode: t.mode, title: t.title, createdAt: t.createdAt, answered: Object.values(t.answers).filter((a) => a?.chosen?.length).length, total: t.questions.length };
}

/** Newest first. */
export function listTests(exam?: ExamCode): ActiveTestSummary[] {
  loadAll();
  return [...cache.values()]
    .filter((t) => !exam || t.exam === exam)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(summaryOf);
}

/** Unsubmitted exam-feedback tests containing `qid` (AI ask is refused for those). */
export function openExamTestsWith(qid: string): ActiveTestSummary[] {
  loadAll();
  return [...cache.values()].filter((t) => t.feedback === 'exam' && t.questions.some((q) => q.id === qid)).map(summaryOf);
}

export function deleteTest(id: string): void {
  getStored(id);
  fs.rmSync(file(id), { force: true });
  cache.delete(id);
}

// ── selection ───────────────────────────────────────────────────────────────

/** 0 never answered · 1 in review · 2 other (SPEC §3.2). */
function tierOf(q: Question, streak: number): number {
  const s = questionStats(q.id, streak);
  return s.attempts === 0 ? 0 : s.inReview ? 1 : 2;
}

/** Random order, then stably sorted by the key tuple. */
function ordered(pool: Question[], key: (q: Question) => number[], rand: () => number): Question[] {
  const keyed = shuffle(pool, rand).map((q) => ({ q, k: key(q) }));
  keyed.sort((a, b) => {
    for (let i = 0; i < Math.max(a.k.length, b.k.length); i++) {
      const d = (a.k[i] ?? 0) - (b.k[i] ?? 0);
      if (d) return d;
    }
    return 0;
  });
  return keyed.map((x) => x.q);
}

/**
 * Per-domain quotas by weight; within a domain the `key` order; a domain that runs short is filled from the rest of
 * the pool (same order).
 */
function byQuota(pool: Question[], exam: ExamDef, domains: ExamDef['domains'], total: number, key: (q: Question) => number[], rand: () => number): Question[] {
  const quotas = largestRemainder(total, domains);
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const d of domains) {
    const want = quotas.get(d.id) ?? 0;
    for (const q of ordered(
      pool.filter((x) => x.exams[exam.code] === d.id),
      key,
      rand,
    ).slice(0, want)) {
      picked.push(q);
      used.add(q.id);
    }
  }
  if (picked.length < total) {
    for (const q of ordered(
      pool.filter((x) => !used.has(x.id)),
      key,
      rand,
    )) {
      if (picked.length >= total) break;
      picked.push(q);
      used.add(q.id);
    }
  }
  return picked;
}

const DEFAULT_TITLES: Record<TestMode, string> = {
  mock: 'Thi thử',
  domain: 'Luyện theo domain',
  review: 'Ôn câu sai',
  new: 'Câu chưa làm',
  random: 'Ngẫu nhiên',
  ids: 'Câu chọn lọc',
};

function newTestId(now = new Date()): string {
  return `t-${newResultId(now).slice(0, 15)}-${crypto.randomBytes(2).toString('hex')}`;
}

export interface BuildOptions {
  rand?: () => number;
  now?: Date;
}

export function buildTest(input: BuildTestRequest, opts: BuildOptions = {}): ActiveTest {
  const rand = opts.rand ?? Math.random;
  const cfg = loadConfig();
  const streak = cfg.scoring.review_streak;
  if (!input || typeof input !== 'object') throw new HttpError(400, 'Thiếu thông tin bài test');
  const exam = EXAM_CODES.includes(input.exam) ? examDef(input.exam) : undefined;
  if (!exam) throw new HttpError(400, `Kỳ thi không hợp lệ: ${String(input.exam)}`);
  const mode = input.mode;
  if (!MODES.includes(mode)) throw new HttpError(400, `Chế độ không hợp lệ: ${String(mode)}`);
  const domainIds = Array.isArray(input.domains) ? [...new Set(input.domains.map(String))] : [];
  const unknown = domainIds.filter((d) => !exam.domains.some((x) => x.id === d));
  if (unknown.length) throw new HttpError(400, `Domain không có trong ${exam.code}: ${unknown.join(', ')}`);
  const doms = domainIds.length ? exam.domains.filter((d) => domainIds.includes(d.id)) : exam.domains;
  const inDoms = (q: Question) => doms.some((d) => d.id === q.exams[exam.code]);
  let count = Number.isFinite(Number(input.count)) && Number(input.count) > 0 ? Math.floor(Number(input.count)) : cfg.practice.default_count;
  count = Math.min(count, MAX_COUNT);

  let chosen: Question[] = [];
  let scenarios: string[] | undefined;
  const pool = examQuestions(exam.code);
  if (mode === 'mock') {
    if (exam.scenarioPick && exam.scenarios?.length) {
      scenarios = shuffle(
        exam.scenarios.map((s) => s.id),
        rand,
      )
        .slice(0, exam.scenarioPick)
        .sort();
    }
    // within a domain: drawn scenario → no scenario → undrawn scenario (only to reach the count); then never answered → review → other
    const scen = (q: Question) => (!scenarios ? 0 : !q.scenario ? 1 : scenarios.includes(q.scenario) ? 0 : 2);
    chosen = byQuota(pool, exam, exam.domains, exam.questions, (q) => [scen(q), tierOf(q, streak)], rand);
  } else if (mode === 'domain') {
    chosen = byQuota(pool.filter(inDoms), exam, doms, count, (q) => [tierOf(q, streak)], rand);
  } else if (mode === 'review') {
    chosen = pool
      .filter((q) => inDoms(q) && questionStats(q.id, streak).inReview)
      .map((q) => ({ q, at: lastWrongAt(q.id) ?? '' }))
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(0, count)
      .map((x) => x.q);
  } else if (mode === 'new') {
    chosen = shuffle(
      pool.filter((q) => inDoms(q) && !questionHistory(q.id).length),
      rand,
    ).slice(0, count);
  } else if (mode === 'random') {
    chosen = shuffle(pool.filter(inDoms), rand).slice(0, count);
  } else {
    const bank = getBank();
    const ids = Array.isArray(input.ids) ? [...new Set(input.ids.map(String))] : [];
    chosen = ids.map((id) => bank.byId.get(id)).filter((q): q is Question => !!q && q.status !== 'retired');
  }
  if (!chosen.length) {
    const why: Record<TestMode, string> = {
      mock: `Ngân hàng chưa có câu active nào của ${exam.code}.`,
      domain: 'Không có câu active nào trong các domain đã chọn.',
      review: 'Không có câu nào trong danh sách ôn câu sai (theo bộ lọc đã chọn). Làm thêm bài rồi quay lại.',
      new: 'Bạn đã làm hết các câu theo bộ lọc này — không còn câu chưa làm.',
      random: 'Không có câu active nào theo bộ lọc đã chọn.',
      ids: 'Không tìm thấy câu nào theo danh sách id.',
    };
    throw new HttpError(400, why[mode]);
  }
  const order = mode === 'ids' ? chosen : shuffle(chosen, rand);
  const shuffleOptions = cfg.practice.shuffle_options;
  const questions: TestQuestion[] = order.map((q) => {
    const opts = q.options.map((text, i) => ({ key: letter(i), text }));
    const tq: TestQuestion = { id: q.id, domain: domainIn(q, exam.code), stem: q.stem, options: shuffleOptions ? shuffle(opts, rand) : opts, choose: q.answer.length };
    if (q.scenario) tq.scenario = q.scenario;
    return tq;
  });
  const feedback: Feedback = input.feedback === 'exam' || input.feedback === 'practice' ? input.feedback : mode === 'mock' ? 'exam' : 'practice';
  let minutes: number | null = mode === 'mock' ? exam.minutes : null;
  if (input.minutes === null) minutes = null;
  else if (input.minutes !== undefined && Number(input.minutes) > 0) minutes = Math.min(600, Math.round(Number(input.minutes)));
  const now = opts.now ?? new Date();
  const scopeLabel = mode === 'domain' || (domainIds.length && mode !== 'mock' && mode !== 'ids') ? ` · ${doms.map((d) => d.id).join(', ')}` : '';
  const title = (typeof input.title === 'string' && input.title.trim() ? input.title.trim().slice(0, 120) : `${DEFAULT_TITLES[mode]} ${exam.code}${scopeLabel}`) as string;
  const t: StoredTest = {
    id: newTestId(now),
    exam: exam.code,
    mode,
    title,
    feedback,
    minutes,
    createdAt: now.toISOString(),
    elapsedSec: 0,
    current: 0,
    ...(scenarios ? { scenarios } : {}),
    questions,
    answers: {},
    keys: Object.fromEntries(order.map((q) => [q.id, [...q.answer]])),
  };
  persist(t);
  return served(t);
}

// ── answering ───────────────────────────────────────────────────────────────

function cleanChosen(v: unknown, tq: TestQuestion): string[] {
  const keys = new Set(tq.options.map((o) => o.key));
  return Array.isArray(v) ? [...new Set(v.map((x) => String(x).toUpperCase()))].filter((k) => keys.has(k)).sort() : [];
}

function applySave(t: StoredTest, body: Partial<SaveTestRequest>) {
  if (body.answers && typeof body.answers === 'object') {
    for (const tq of t.questions) {
      const a = (body.answers as Record<string, Partial<TestAnswer>>)[tq.id];
      const prev = t.answers[tq.id];
      if (!a || typeof a !== 'object') continue;
      const next: TestAnswer = { chosen: prev?.checked ? prev.chosen : cleanChosen(a.chosen, tq) };
      if (a.flagged) next.flagged = true;
      if (Number.isFinite(Number(a.timeSec)) && Number(a.timeSec) > 0) next.timeSec = Math.round(Number(a.timeSec));
      if (prev?.checked) next.checked = true;
      t.answers[tq.id] = next;
    }
  }
  if (Number.isFinite(Number(body.elapsedSec)) && Number(body.elapsedSec) >= 0) t.elapsedSec = Math.round(Number(body.elapsedSec));
  if (Number.isInteger(Number(body.current))) t.current = Math.max(0, Math.min(t.questions.length - 1, Number(body.current)));
}

export function saveTest(id: string, body: Partial<SaveTestRequest>): void {
  const t = getStored(id);
  applySave(t, body ?? {});
  persist(t);
}

/** Practice feedback: reveals one question (locked afterwards; calling again returns the same verdict). */
export function checkAnswer(id: string, qid: string, chosenRaw: unknown): CheckResponse {
  const t = getStored(id);
  if (t.feedback !== 'practice') throw new HttpError(403, 'Bài này ở chế độ thi (feedback exam): đáp án chỉ hiện sau khi nộp bài.');
  const tq = t.questions.find((q) => q.id === qid);
  if (!tq) throw new HttpError(404, 'Câu này không thuộc bài test');
  const prev = t.answers[qid];
  const chosen = prev?.checked ? prev.chosen : cleanChosen(chosenRaw, tq);
  if (!prev?.checked) {
    t.answers[qid] = { ...(prev ?? {}), chosen, checked: true };
    persist(t);
  }
  const key = t.keys[qid] ?? [];
  const q = getBank().byId.get(qid);
  const out: CheckResponse = { correct: chosen.length > 0 && sameKeys(chosen, key), answer: key, explanation: q?.explanation ?? '' };
  if (q?.ref) out.ref = q.ref;
  return out;
}

export function submitTest(id: string, body: Partial<SaveTestRequest>, device: 'local' | 'remote', now = new Date()): Result {
  const t = getStored(id);
  applySave(t, body ?? {});
  const exam = examDef(t.exam);
  if (!exam) throw new HttpError(400, `Kỳ thi ${t.exam} không còn trong exams.yaml`);
  const cfg = loadConfig();
  const items: ResultItem[] = t.questions.map((tq) => {
    const a = t.answers[tq.id];
    const chosen = a?.chosen ?? [];
    const answer = t.keys[tq.id] ?? [];
    const it: ResultItem = { qid: tq.id, domain: tq.domain, chosen, answer, correct: chosen.length > 0 && sameKeys(chosen, answer) };
    if (a?.flagged) it.flagged = true;
    if (a?.timeSec) it.timeSec = a.timeSec;
    return it;
  });
  const correct = items.filter((i) => i.correct).length;
  const result: Result = {
    id: newResultId(now),
    exam: t.exam,
    mode: t.mode,
    title: t.title,
    feedback: t.feedback,
    device,
    startedAt: t.createdAt,
    finishedAt: now.toISOString(),
    durationSec: t.elapsedSec,
    minutes: t.minutes,
    ...(t.scenarios ? { scenarios: t.scenarios } : {}),
    items,
    score: makeScore(correct, items.length, exam, cfg.scoring.pass_pct),
    byDomain: byDomain(items, exam),
  };
  saveResult(result);
  fs.rmSync(file(id), { force: true });
  cache.delete(id);
  return result;
}

/** Forget the in-memory cache (tests). */
export function resetTestsCache() {
  cache.clear();
  loaded = false;
}
