// Types shared by the server (Node 22, native TS) and the web UI (Vite). This file is the API contract (see SPEC.md §4).
// No runtime imports here.

export type ExamCode = 'CCAR-F' | 'CCDV-F' | 'CCAO-F' | 'CCAR-P';
export const EXAM_CODES: readonly ExamCode[] = ['CCAR-F', 'CCDV-F', 'CCAO-F', 'CCAR-P'];
export type DomainId = string; // "D1".."D8", per exam (exams.yaml)

// ── exams.yaml ──────────────────────────────────────────────────────────────

export interface DomainDef {
  id: DomainId;
  name: string;
  weight: number; // % of the real exam's questions
}

export interface ExamDef {
  code: ExamCode;
  name: string;
  short: string;
  questions: number;
  minutes: number;
  pass: number; // 720 (scale 100–1000)
  domains: DomainDef[];
  scenarioPick?: number; // CCAR-F: the real exam draws this many scenarios
  scenarios?: { id: string; name: string }[];
}

// ── bank/packs/*.yaml ───────────────────────────────────────────────────────

export type PackOrigin = 'imported' | 'official' | 'ai' | 'manual';
export type QuestionStatus = 'active' | 'draft' | 'retired';

export interface Pack {
  id: string;
  title: string;
  origin: PackOrigin;
  source?: string;
  description?: string;
  file: string; // relative to claude-cert/, e.g. "bank/packs/ccx.yaml"
  count: number;
  activeCount: number;
}

export interface Question {
  id: string; // unique across the bank
  pack: string;
  exams: Partial<Record<ExamCode, DomainId>>; // the exams this question belongs to → its domain in each
  scenario?: string; // CCAR-F scenario id (S1..S6)
  stem: string; // Markdown (English, like the real exam)
  options: string[]; // Markdown; letters are A, B, C… by index
  answer: string[]; // sorted letters; length > 1 = multiple answer ("Choose TWO")
  explanation: string; // Markdown, Vietnamese
  ref?: string; // note link: "<note path>#<anchor>", e.g. "lessons/05-claude-code.html#claude-md"
  status: QuestionStatus;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  created?: string; // YYYY-MM-DD
  reviewed?: string; // YYYY-MM-DD: last independent quality review (cert-review skill)
  file: string; // relative to claude-cert/
}

/** Bank list row (no answer / explanation; those come from GET /api/questions/:id). */
export interface QuestionSummary {
  id: string;
  pack: string;
  exams: Partial<Record<ExamCode, DomainId>>;
  scenario?: string;
  stem: string; // first ~200 chars, plain text
  multi: boolean;
  status: QuestionStatus;
  stats: QuestionStats;
}

export interface QuestionStats {
  attempts: number;
  correct: number;
  lastCorrect?: boolean;
  lastAt?: string; // ISO
  inReview: boolean; // in the wrong-answer review list (SPEC §3.3)
}

export interface QuestionDetail extends Question {
  stats: QuestionStats;
  history: { resultId: string; at: string; correct: boolean; chosen: string[] }[];
  issues: Issue[];
}

// ── tests (in progress: .local/active/<id>.json) ────────────────────────────

export type TestMode = 'mock' | 'domain' | 'review' | 'new' | 'random' | 'ids';
export type Feedback = 'exam' | 'practice'; // exam = answers revealed after submit · practice = after each question

export interface BuildTestRequest {
  exam: ExamCode;
  mode: TestMode;
  domains?: DomainId[]; // mode domain (and optional filter for review/new/random)
  count?: number; // ignored for mock (uses exam.questions)
  ids?: string[]; // mode ids
  feedback?: Feedback; // default: mock → exam, others → practice
  minutes?: number | null; // null = untimed; default: mock → exam.minutes, others → null
  title?: string;
}

/** A question as served inside a test: options already in display order; no answer while it may not be revealed. */
export interface TestQuestion {
  id: string;
  domain: DomainId; // domain in the test's exam
  scenario?: string;
  stem: string;
  options: { key: string; text: string }[]; // key = canonical letter (what is stored); display order = array order
  choose: number; // how many options to pick (answer length)
}

export interface TestAnswer {
  chosen: string[]; // canonical letters
  flagged?: boolean;
  timeSec?: number; // seconds spent on this question
  checked?: boolean; // practice: the learner pressed "Kiểm tra" (locked afterwards)
}

export interface ActiveTest {
  id: string;
  exam: ExamCode;
  mode: TestMode;
  title: string;
  feedback: Feedback;
  minutes: number | null;
  createdAt: string;
  elapsedSec: number;
  current: number; // index of the question on screen
  scenarios?: string[]; // CCAR-F mock: the drawn scenarios
  questions: TestQuestion[];
  answers: Record<string, TestAnswer>; // by question id
}

export interface ActiveTestSummary {
  id: string;
  exam: ExamCode;
  mode: TestMode;
  title: string;
  createdAt: string;
  answered: number;
  total: number;
}

/** PUT /api/tests/:id body (autosave). */
export interface SaveTestRequest {
  answers: Record<string, TestAnswer>;
  elapsedSec: number;
  current: number;
}

/** POST /api/tests/:id/check (practice mode only) → reveals one question. */
export interface CheckRequest {
  qid: string;
  chosen: string[];
}
export interface CheckResponse {
  correct: boolean;
  answer: string[];
  explanation: string;
  ref?: string;
}

// ── results (results/<YYYY-MM>/<id>.json, synced with git) ──────────────────

export interface ResultItem {
  qid: string;
  domain: DomainId;
  chosen: string[];
  answer: string[]; // the key at the time of the test
  correct: boolean;
  flagged?: boolean;
  timeSec?: number;
}

export interface DomainScore {
  domain: DomainId;
  correct: number;
  total: number;
}

export interface Score {
  correct: number;
  total: number;
  pct: number; // 0..100, one decimal
  scaled: number; // estimated 100..1000 (SPEC §3.4)
  pass: boolean; // scaled >= exam.pass
}

export interface Result {
  id: string; // YYYYMMDD-HHMMSS-xxxx
  exam: ExamCode;
  mode: TestMode;
  title: string;
  feedback: Feedback;
  device: string; // "local" | "remote" (who submitted it)
  startedAt: string;
  finishedAt: string;
  durationSec: number;
  minutes: number | null;
  scenarios?: string[];
  items: ResultItem[];
  score: Score;
  byDomain: DomainScore[];
}

export interface ResultSummary {
  id: string;
  exam: ExamCode;
  mode: TestMode;
  title: string;
  finishedAt: string;
  durationSec: number;
  score: Score;
}

/** GET /api/results/:id: the result plus every question in full (answers revealed). */
export interface ResultDetail extends Result {
  questions: Record<string, Question>; // by qid; a question deleted from the bank is missing
}

// ── dashboard ───────────────────────────────────────────────────────────────

export interface DomainProgress {
  domain: DomainId;
  name: string;
  weight: number;
  questions: number; // active questions of this exam + domain in the bank
  seen: number; // distinct questions answered at least once
  answered: number; // answers counted (last 30 per question set, SPEC §3.5)
  correct: number;
  pct: number | null; // null = nothing answered
}

export interface Dashboard {
  exam: ExamCode;
  domains: DomainProgress[];
  estimate: { pct: number | null; scaled: number | null; pass: boolean | null }; // weighted by domain weight
  reviewCount: number;
  newCount: number;
  totalQuestions: number;
  lastMock?: ResultSummary;
  recent: ResultSummary[]; // last 5 results of this exam
  activeTests: ActiveTestSummary[];
}

// ── notes & search ──────────────────────────────────────────────────────────

export interface NoteEntry {
  path: string; // relative to notes/, e.g. "exams/CCAR-F.md", "lessons/05-claude-code.html"
  title: string;
  group: string; // section in the notes tree: "Tổng quan", "Kỳ thi", "Bài học"
  exams?: ExamCode[]; // which exams it is relevant to (frontmatter / lesson map)
}

export interface NoteFile extends NoteEntry {
  format: 'md' | 'html';
  content: string; // Markdown, or an HTML fragment (sanitized again in the browser)
  headings: { id: string; text: string; level: number }[];
}

export interface SearchHit {
  kind: 'note' | 'question';
  path?: string; // note path (with #anchor when the hit is under a heading)
  qid?: string;
  title: string;
  snippet: string; // plain text with the match inside «…»
}

// ── issues (bank/issues.md) ─────────────────────────────────────────────────

export interface Issue {
  id: string; // ISS-YYYYMMDD-HHMMSS
  qid: string;
  at: string;
  message: string;
  status: 'open' | 'fixed' | 'wontfix';
  resolution?: string;
}

// ── AI (local Claude Code CLI) ──────────────────────────────────────────────

export type CoachTask = 'plan' | 'generate' | 'review' | 'fix-issues';

export interface AskRequest {
  qid: string;
  testId?: string; // refused while that test is in exam feedback mode and not submitted
  messages: { role: 'user' | 'assistant'; content: string }[]; // conversation so far, ending with the learner's turn
}

export interface CoachRunRequest {
  task: CoachTask;
  exam?: ExamCode;
  domains?: DomainId[];
  count?: number; // generate: number of questions
  note?: string; // extra instruction from the learner
}

export type JobStatus = 'running' | 'done' | 'error' | 'cancelled';

export interface AiJob {
  id: string;
  kind: 'ask' | CoachTask;
  title: string;
  status: JobStatus;
  startedAt: string;
  finishedAt?: string;
  log: string[]; // progress lines (tool calls, notes); GET ?since=n returns log.slice(n) and logTotal
  logTotal: number;
  text: string; // the assistant's final (or streaming) answer, Markdown
  error?: string;
}

export interface CoachState {
  claude: { available: boolean; path?: string; version?: string; error?: string };
  running?: AiJob;
  jobs: AiJob[]; // recent, newest first (log omitted)
  plans: { file: string; title: string; date: string }[]; // coach/plans/*.md newest first
  openIssues: number;
}

// ── sync (git) ──────────────────────────────────────────────────────────────

export interface SyncState {
  enabled: boolean;
  repo: boolean; // inside a git work tree
  branch?: string;
  remote?: string;
  dirty: number; // changed files under data_paths
  ahead: number;
  behind: number;
  running: boolean;
  lastSync?: string;
  lastResult?: 'ok' | 'error' | 'nothing';
  lastMessage?: string;
  autoAt?: string; // next automatic sync (idle mode)
}

// ── meta / access ───────────────────────────────────────────────────────────

export interface Meta {
  version: string;
  exams: ExamDef[];
  examVersion: string; // exams.yaml version
  access: { local: boolean; remote: boolean; granted: boolean }; // remote = through LAN / ngrok
  supervised: boolean; // started by scripts/run.ts or scripts/public.ts (restart available)
  defaults: { count: number; shuffleOptions: boolean };
  scoring?: { passPct: number; reviewStreak: number }; // config.yaml scoring (pass_pct → 720, review_streak)
}

/** GET /api/system — this machine's settings page. accessCode only for local requests. */
export interface SystemInfo {
  accessCode?: string;
  lanUrls: string[];
  publicUrl?: string; // https://<ngrok_domain>
  publicOk?: boolean; // last watchdog check (scripts/public.ts writes .local/public.json)
  node: string;
  platform: string;
  root: string;
  bank: { packs: Pack[]; questions: number; active: number; problems: BankProblem[] };
}

export interface BankProblem {
  level: 'error' | 'warning';
  file: string;
  qid?: string;
  message: string;
}

/** Server-sent events on GET /api/events. */
export type ServerEvent =
  | { type: 'hello'; version: string }
  | { type: 'bank' } // bank files changed on disk → refetch
  | { type: 'results' } // a result was added / removed / pulled by sync
  | { type: 'job'; job: AiJob } // AI job progress (log omitted; poll /api/ai/jobs/:id for log)
  | { type: 'sync'; state: SyncState }
  | { type: 'notes' };
