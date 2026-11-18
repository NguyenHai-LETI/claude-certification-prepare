// Results: results/<YYYY-MM>/<id>.json (SPEC §2.2), all kept in memory; per-question answer history derived from them.
// An item with nothing chosen (skipped / not reached) counts in the score but is not an "answer" for history, stats,
// the review list or "never answered" — submitting a practice test early must not flood the review list.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, loadConfig } from '../config.ts';
import type { ExamCode, QuestionStats, Result, ResultSummary } from '../../shared/types.ts';
import { inReview } from './score.ts';

export const RESULT_ID_RE = /^\d{8}-\d{6}-[0-9a-f]{4}$/;

export interface HistoryEntry {
  resultId: string;
  at: string;
  correct: boolean;
  chosen: string[];
}

const results = new Map<string, { result: Result; file: string }>();
let timeline: Map<string, HistoryEntry[]> | undefined;

function walk(dir: string, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function valid(r: unknown): r is Result {
  const x = r as Result;
  return !!x && typeof x === 'object' && typeof x.id === 'string' && typeof x.exam === 'string' && Array.isArray(x.items) && typeof x.finishedAt === 'string';
}

/** (Re)reads every result file. Returns the number loaded; broken files are logged and skipped. */
export function loadResults(): number {
  results.clear();
  timeline = undefined;
  for (const file of walk(PATHS.results)) {
    try {
      const r = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
      if (!valid(r)) throw new Error('thiếu trường bắt buộc (id, exam, items, finishedAt)');
      results.set(r.id, { result: r, file });
    } catch (e) {
      console.error(`  ⚠️ Bỏ qua file kết quả lỗi ${path.relative(PATHS.root, file)}: ${(e as Error).message}`);
    }
  }
  return results.size;
}

export function allResults(): Result[] {
  return [...results.values()].map((x) => x.result).sort((a, b) => a.finishedAt.localeCompare(b.finishedAt) || a.id.localeCompare(b.id));
}

export function getResult(id: string): Result | undefined {
  return results.get(id)?.result;
}

export function summary(r: Result): ResultSummary {
  return { id: r.id, exam: r.exam, mode: r.mode, title: r.title, finishedAt: r.finishedAt, durationSec: r.durationSec, score: r.score };
}

/** Newest first, optionally of one exam. */
export function resultSummaries(exam?: ExamCode): ResultSummary[] {
  return allResults()
    .filter((r) => !exam || r.exam === exam)
    .reverse()
    .map(summary);
}

/** YYYYMMDD-HHMMSS-xxxx in local time. */
export function newResultId(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  let id: string;
  do id = `${stamp}-${crypto.randomBytes(2).toString('hex')}`;
  while (results.has(id));
  return id;
}

export function saveResult(r: Result): string {
  const month = `${r.id.slice(0, 4)}-${r.id.slice(4, 6)}`;
  const dir = path.join(PATHS.results, month);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${r.id}.json`);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(r, null, 2) + '\n');
  fs.renameSync(tmp, file);
  results.set(r.id, { result: r, file });
  timeline = undefined;
  return file;
}

export function deleteResult(id: string): boolean {
  const x = results.get(id);
  if (!x) return false;
  fs.rmSync(x.file, { force: true });
  try {
    fs.rmdirSync(path.dirname(x.file)); // the month folder when it became empty
  } catch {
    // not empty
  }
  results.delete(id);
  timeline = undefined;
  return true;
}

/** qid → answers (chosen non-empty) in time order: results by finishedAt, items in their order. */
export function answerTimeline(): Map<string, HistoryEntry[]> {
  if (timeline) return timeline;
  const m = new Map<string, HistoryEntry[]>();
  for (const r of allResults()) {
    for (const it of r.items) {
      if (!it || !Array.isArray(it.chosen) || !it.chosen.length) continue;
      const list = m.get(it.qid) ?? [];
      list.push({ resultId: r.id, at: r.finishedAt, correct: !!it.correct, chosen: it.chosen });
      m.set(it.qid, list);
    }
  }
  timeline = m;
  return m;
}

export function questionHistory(qid: string): HistoryEntry[] {
  return answerTimeline().get(qid) ?? [];
}

export function questionStats(qid: string, streak = loadConfig().scoring.review_streak): QuestionStats {
  const h = questionHistory(qid);
  const last = h[h.length - 1];
  const s: QuestionStats = { attempts: h.length, correct: h.filter((x) => x.correct).length, inReview: inReview(h, streak) };
  if (last) {
    s.lastCorrect = last.correct;
    s.lastAt = last.at;
  }
  return s;
}

/** Time of the last wrong answer (for "oldest-wrong first"). */
export function lastWrongAt(qid: string): string | undefined {
  const h = questionHistory(qid);
  for (let i = h.length - 1; i >= 0; i--) if (!h[i].correct) return h[i].at;
  return undefined;
}
