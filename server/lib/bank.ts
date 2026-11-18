// In-memory question bank: every bank/packs/*.yaml parsed + validated (SPEC §2.1, §6). Reloaded when the files change.
import { PATHS, ROOT, loadExams } from '../config.ts';
import type { BankProblem, ExamCode, Pack, Question } from '../../shared/types.ts';
import { parseBank } from './validate.ts';

export interface BankState {
  packs: Pack[];
  questions: Question[];
  byId: Map<string, Question>;
  problems: BankProblem[];
  loadedAt: number;
}

let state: BankState | undefined;

export function reloadBank(): BankState {
  const parsed = parseBank(PATHS.packs, ROOT, loadExams());
  state = { ...parsed, byId: new Map(parsed.questions.map((q) => [q.id, q])), loadedAt: Date.now() };
  return state;
}

export function getBank(): BankState {
  return state ?? reloadBank();
}

/** Active questions of an exam (SPEC §3.1). */
export function examQuestions(exam: ExamCode, bank: BankState = getBank()): Question[] {
  return bank.questions.filter((q) => q.status === 'active' && q.exams[exam] !== undefined);
}

/** Domain of a question in `exam`, else its first exam's domain. */
export function domainIn(q: Question, exam: ExamCode): string {
  return q.exams[exam] ?? Object.values(q.exams)[0] ?? '';
}
