// Pure scoring / selection helpers (SPEC §3.2–3.5). No I/O.
import type { DomainScore, ExamDef, ResultItem, Score } from '../../shared/types.ts';

/** Estimated scaled score: 0% → 100, passPct → 720, 100% → 1000, piecewise linear, rounded to the nearest 10. */
export function scaledScore(pct: number, passPct: number): number {
  const p = Math.max(0, Math.min(100, pct));
  const pp = Math.max(1, Math.min(99, passPct));
  const v = p <= pp ? 100 + (p / pp) * 620 : 720 + ((p - pp) / (100 - pp)) * 280;
  return Math.round(v / 10) * 10;
}

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function makeScore(correct: number, total: number, exam: Pick<ExamDef, 'pass'>, passPct: number): Score {
  const pct = total ? round1((correct / total) * 100) : 0;
  const scaled = scaledScore(total ? (correct / total) * 100 : 0, passPct);
  return { correct, total, pct, scaled, pass: scaled >= exam.pass };
}

/** All-or-nothing comparison of two letter sets. */
export function sameKeys(a: string[], b: string[]): boolean {
  const x = [...new Set(a)].sort();
  const y = [...new Set(b)].sort();
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

/** Per-domain counts by weight with the largest-remainder method (ties → larger weight, then order). */
export function largestRemainder(total: number, weights: { id: string; weight: number }[]): Map<string, number> {
  const sum = weights.reduce((s, w) => s + Math.max(0, w.weight), 0);
  const out = new Map<string, number>();
  if (!sum || total <= 0) {
    for (const w of weights) out.set(w.id, 0);
    return out;
  }
  const raw = weights.map((w, i) => {
    const exact = (total * Math.max(0, w.weight)) / sum;
    return { id: w.id, i, w: w.weight, floor: Math.floor(exact), rem: exact - Math.floor(exact) };
  });
  let left = total - raw.reduce((s, r) => s + r.floor, 0);
  for (const r of raw) out.set(r.id, r.floor);
  const order = [...raw].sort((a, b) => b.rem - a.rem || b.w - a.w || a.i - b.i);
  for (const r of order) {
    if (left <= 0) break;
    out.set(r.id, (out.get(r.id) ?? 0) + 1);
    left--;
  }
  return out;
}

export function byDomain(items: ResultItem[], exam: ExamDef): DomainScore[] {
  const m = new Map<string, DomainScore>();
  for (const it of items) {
    const d = m.get(it.domain) ?? { domain: it.domain, correct: 0, total: 0 };
    d.total++;
    if (it.correct) d.correct++;
    m.set(it.domain, d);
  }
  const order = exam.domains.map((d) => d.id);
  return [...m.values()].sort((a, b) => {
    const ia = order.indexOf(a.domain);
    const ib = order.indexOf(b.domain);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.domain.localeCompare(b.domain);
  });
}

/** Fisher–Yates shuffle (copy). `rand` injectable for tests. */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface AnswerEvent {
  at: string; // finishedAt of the result
  correct: boolean;
}

/** SPEC §3.3: ≥ 1 wrong answer and fewer than `streak` consecutive correct answers after the last wrong one. */
export function inReview(events: AnswerEvent[], streak: number): boolean {
  let lastWrong = -1;
  for (let i = events.length - 1; i >= 0; i--) {
    if (!events[i].correct) {
      lastWrong = i;
      break;
    }
  }
  if (lastWrong < 0) return false;
  return events.length - 1 - lastWrong < streak;
}
