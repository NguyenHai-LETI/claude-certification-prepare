// Dashboard (SPEC §3.5) and the bank list rows.
import { loadConfig } from '../config.ts';
import type { Dashboard, DomainProgress, ExamDef, Question, QuestionSummary } from '../../shared/types.ts';
import { examQuestions } from './bank.ts';
import { allResults, questionHistory, questionStats, summary } from './results.ts';
import { round1, scaledScore } from './score.ts';
import { listTests } from './tests.ts';

const LAST_N = 3;

export function dashboard(exam: ExamDef): Dashboard {
  const cfg = loadConfig();
  const pool = examQuestions(exam.code);
  const domains: DomainProgress[] = exam.domains.map((d) => {
    const qs = pool.filter((q) => q.exams[exam.code] === d.id);
    let seen = 0;
    let answered = 0;
    let correct = 0;
    for (const q of qs) {
      const h = questionHistory(q.id);
      if (!h.length) continue;
      seen++;
      for (const a of h.slice(-LAST_N)) {
        answered++;
        if (a.correct) correct++;
      }
    }
    return { domain: d.id, name: d.name, weight: d.weight, questions: qs.length, seen, answered, correct, pct: answered ? round1((correct / answered) * 100) : null };
  });
  const withData = domains.filter((d) => d.pct !== null);
  const wsum = withData.reduce((s, d) => s + d.weight, 0);
  const pct = withData.length && wsum > 0 ? round1(withData.reduce((s, d) => s + (d.pct ?? 0) * d.weight, 0) / wsum) : null;
  const scaled = pct === null ? null : scaledScore(pct, cfg.scoring.pass_pct);
  const streak = cfg.scoring.review_streak;
  const mine = allResults()
    .filter((r) => r.exam === exam.code)
    .reverse();
  const lastMock = mine.find((r) => r.mode === 'mock');
  const out: Dashboard = {
    exam: exam.code,
    domains,
    estimate: { pct, scaled, pass: scaled === null ? null : scaled >= exam.pass },
    reviewCount: pool.filter((q) => questionStats(q.id, streak).inReview).length,
    newCount: pool.filter((q) => !questionHistory(q.id).length).length,
    totalQuestions: pool.length,
    recent: mine.slice(0, 5).map(summary),
    activeTests: listTests(exam.code),
  };
  if (lastMock) out.lastMock = summary(lastMock);
  return out;
}

/** Plain text of a Markdown string (first `max` chars). */
export function plainText(md: string, max = 200): string {
  const t = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(?=\S)(.+?)(?<=\S)\1/g, '$2')
    .replace(/(^|[\s(])[*_](?=\S)(.+?)(?<=\S)[*_](?=[\s).,!?:;]|$)/g, '$1$2')
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}

export function questionSummary(q: Question, streak = loadConfig().scoring.review_streak): QuestionSummary {
  const s: QuestionSummary = { id: q.id, pack: q.pack, exams: q.exams, stem: plainText(q.stem), multi: q.answer.length > 1, status: q.status, stats: questionStats(q.id, streak) };
  if (q.scenario) s.scenario = q.scenario;
  return s;
}
