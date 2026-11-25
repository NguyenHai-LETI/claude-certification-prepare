// AI jobs through the local Claude Code CLI (SPEC §7): "Hỏi AI" (read-only) and coach tasks (plan, fix-issues, generate,
// review). Each job spawns `claude -p <prompt> --output-format stream-json --verbose …` in the repo root and parses the
// stream: assistant text → job.text, tool_use → a log line, result → done.
import { spawn, type ChildProcess } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, examDef, loadConfig } from '../config.ts';
import { HttpError, broadcast } from '../http.ts';
import { EXAM_CODES, type AiJob, type AskRequest, type CoachRunRequest, type CoachState, type CoachTask, type ExamCode, type Question } from '../../shared/types.ts';
import { appRel, claudeCommand, inRepo, claudeStatus, dataRel, killTree, repoRoot } from './claude.ts';
import { getBank } from './bank.ts';
import { loadIssues } from './issues.ts';
import { getResult } from './results.ts';
import { getStored, openExamTestsWith } from './tests.ts';
import { letter } from './validate.ts';

const ASK_TIMEOUT_MS = Number(process.env.CERT_ASK_TIMEOUT_MS) || 5 * 60_000;
const COACH_TIMEOUT_MS = Number(process.env.CERT_COACH_TIMEOUT_MS) || 45 * 60_000;
const MAX_ASK = 2;
const KEEP_JOBS = 30;
const MAX_LOG = 2000;
const TASKS: CoachTask[] = ['plan', 'generate', 'review', 'fix-issues'];

export const ASK_TOOLS = ['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch'];
export const coachTools = () => ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'WebFetch', 'WebSearch', `Bash(node ${inRepo(appRel(), 'scripts/validate.ts')}*)`];

interface JobState {
  job: AiJob;
  child?: ChildProcess;
  raw?: fs.WriteStream;
  timer?: NodeJS.Timeout;
  emitTimer?: NodeJS.Timeout;
}

const jobs = new Map<string, JobState>();

/** Hooks the server installs (sync before/after a coach run, bank reload). Tests leave them empty. */
export interface AiHooks {
  syncBefore?: () => Promise<string>; // returns a log line
  afterCoach?: (ok: boolean) => Promise<string | undefined>;
}
let hooks: AiHooks = {};
export function setAiHooks(h: AiHooks) {
  hooks = h;
}

const clock = () => new Date().toTimeString().slice(0, 8);

function publicJob(js: JobState, withLog = false, since = 0): AiJob {
  const j = js.job;
  return { ...j, log: withLog ? j.log.slice(Math.max(0, since)) : [], logTotal: j.log.length };
}

function emit(js: JobState, now = false) {
  if (now) {
    clearTimeout(js.emitTimer);
    js.emitTimer = undefined;
    broadcast({ type: 'job', job: publicJob(js) });
    return;
  }
  js.emitTimer ??= setTimeout(() => {
    js.emitTimer = undefined;
    broadcast({ type: 'job', job: publicJob(js) });
  }, 250);
}

function log(js: JobState, line: string) {
  js.job.log.push(`${clock()} ${line}`);
  if (js.job.log.length > MAX_LOG) js.job.log.splice(0, js.job.log.length - MAX_LOG);
  js.job.logTotal = js.job.log.length;
  emit(js);
}

function finish(js: JobState, status: AiJob['status'], error?: string) {
  if (js.job.status !== 'running') return;
  js.job.status = status;
  js.job.finishedAt = new Date().toISOString();
  if (error) js.job.error = error;
  clearTimeout(js.timer);
  js.raw?.end();
  js.raw = undefined;
  emit(js, true);
}

function prune() {
  const all = [...jobs.values()].filter((j) => j.job.status !== 'running').sort((a, b) => a.job.startedAt.localeCompare(b.job.startedAt));
  while (jobs.size > KEEP_JOBS && all.length) jobs.delete(all.shift()!.job.id);
}

export function getJob(id: string, since = 0): AiJob {
  const js = jobs.get(id);
  if (!js) throw new HttpError(404, 'Không tìm thấy lượt AI này (có thể app đã khởi động lại)');
  return publicJob(js, true, since);
}

export function runningCoach(): AiJob | undefined {
  const js = [...jobs.values()].find((j) => j.job.kind !== 'ask' && j.job.status === 'running');
  return js ? publicJob(js) : undefined;
}

export function cancelJob(id: string): boolean {
  const js = jobs.get(id);
  if (!js) throw new HttpError(404, 'Không tìm thấy lượt AI này');
  if (js.job.status !== 'running') return false;
  log(js, '⏹ Đã huỷ theo yêu cầu.');
  finish(js, 'cancelled');
  killTree(js.child);
  return true;
}

/** Stops every running job (server shutdown). */
export function cancelAll() {
  for (const js of jobs.values()) if (js.job.status === 'running') cancelJob(js.job.id);
}

// ── stream-json ─────────────────────────────────────────────────────────────

let realRoot: string | undefined;
function shortPath(p: string): string {
  const root = repoRoot();
  try {
    realRoot ??= fs.realpathSync(root);
  } catch {
    realRoot = root;
  }
  const base = [root, realRoot].find((b) => p.startsWith(b + path.sep) || p.startsWith(b + '/'));
  const r = base ? path.relative(base, p).split(path.sep).join('/') : p;
  return r.length > 120 ? r.slice(0, 117) + '…' : r;
}

export function toolLine(name: string, input: Record<string, unknown>): string {
  const s = (k: string) => (typeof input[k] === 'string' ? (input[k] as string) : '');
  switch (name) {
    case 'Read':
    case 'Write':
    case 'Edit':
    case 'MultiEdit':
    case 'NotebookEdit':
      return `${name} ${shortPath(s('file_path'))}`;
    case 'Glob':
      return `Glob ${s('pattern')}`;
    case 'Grep':
      return `Grep "${s('pattern')}"${s('path') ? ' in ' + shortPath(s('path')) : ''}`;
    case 'Bash':
      return `Bash ${s('command').slice(0, 160)}`;
    case 'WebFetch':
      return `WebFetch ${s('url')}`;
    case 'WebSearch':
      return `WebSearch "${s('query')}"`;
    case 'Skill':
      return `Skill ${s('skill') || s('name')}`;
    case 'TodoWrite':
      return `TodoWrite ${Array.isArray(input.todos) ? input.todos.length : 0} việc`;
    default:
      return `${name} ${JSON.stringify(input).slice(0, 120)}`;
  }
}

/** Applies one stream-json message to the job. Returns true on the final `result` message. */
export function handleStreamMessage(js: { job: AiJob }, msg: Record<string, unknown>, logLine: (l: string) => void): boolean {
  const type = msg.type;
  if (type === 'system' && msg.subtype === 'init') {
    logLine(`Bắt đầu · model ${String(msg.model ?? '?')}`);
    return false;
  }
  if (type === 'assistant') {
    const content = ((msg.message as { content?: unknown[] } | undefined)?.content ?? []) as Record<string, unknown>[];
    const texts: string[] = [];
    for (const c of content) {
      if (c.type === 'text' && typeof c.text === 'string' && c.text.trim()) texts.push(c.text.trim());
      if (c.type === 'tool_use') logLine(toolLine(String(c.name), (c.input ?? {}) as Record<string, unknown>));
    }
    if (texts.length) js.job.text = texts.join('\n\n'); // the latest assistant message (streaming answer)
    return false;
  }
  if (type === 'user') {
    const content = ((msg.message as { content?: unknown[] } | undefined)?.content ?? []) as Record<string, unknown>[];
    for (const c of content) {
      if (c.type === 'tool_result' && c.is_error) {
        const t = typeof c.content === 'string' ? c.content : JSON.stringify(c.content);
        logLine(`⚠️ Công cụ báo lỗi: ${t.slice(0, 300)}`);
      }
    }
    return false;
  }
  if (type === 'result') {
    if (typeof msg.result === 'string' && msg.result.trim()) js.job.text = msg.result.trim();
    const failed = !!msg.is_error || (typeof msg.subtype === 'string' && msg.subtype !== 'success');
    if (failed) js.job.error = `Claude Code báo lỗi: ${[msg.subtype !== 'success' ? String(msg.subtype ?? '') : '', typeof msg.result === 'string' ? msg.result.slice(0, 300) : ''].filter(Boolean).join(' — ') || 'error'}`;
    const cost = typeof msg.total_cost_usd === 'number' ? ` · ~$${msg.total_cost_usd.toFixed(3)}` : '';
    const turns = typeof msg.num_turns === 'number' ? ` · ${msg.num_turns} lượt` : '';
    logLine(`${failed ? '✗ Kết thúc lỗi' : '✓ Xong'}${turns}${cost}`);
    return true;
  }
  return false;
}

// ── running ─────────────────────────────────────────────────────────────────

interface StartSpec {
  kind: AiJob['kind'];
  title: string;
  prompt: string;
  args: string[]; // after -p <prompt>
  timeoutMs: number;
  before?: () => Promise<string | undefined>;
  after?: (ok: boolean) => Promise<string | undefined>;
}

function newJobId(kind: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${kind}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${crypto.randomBytes(2).toString('hex')}`;
}

async function startJob(spec: StartSpec): Promise<AiJob> {
  const st = await claudeStatus();
  if (!st.available || !st.path) throw new HttpError(503, st.error ?? 'Không tìm thấy Claude Code CLI');
  const job: AiJob = { id: newJobId(spec.kind), kind: spec.kind, title: spec.title, status: 'running', startedAt: new Date().toISOString(), log: [], logTotal: 0, text: '' };
  const js: JobState = { job };
  jobs.set(job.id, js);
  prune();
  emit(js, true);
  void run(js, spec, st.path);
  return publicJob(js);
}

async function run(js: JobState, spec: StartSpec, bin: string) {
  try {
    if (spec.before) {
      const line = await spec.before().catch((e: Error) => `⚠️ ${e.message}`);
      if (line) log(js, line);
    }
    if (js.job.status !== 'running') return;
    const ok = await spawnCli(js, spec, bin);
    if (spec.after && (js.job.status as AiJob['status']) !== 'cancelled') {
      const line = await spec.after(ok).catch((e: Error) => `⚠️ ${e.message}`);
      if (line) log(js, line);
    }
    finish(js, ok ? 'done' : 'error', ok ? undefined : (js.job.error ?? 'Claude Code dừng bất thường'));
  } catch (e) {
    finish(js, 'error', (e as Error).message);
  }
}

function cliEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  // In -p mode an ANTHROPIC_API_KEY would win over the claude.ai login and bill the API account silently.
  if (!loadConfig().ai.use_api_key) delete env.ANTHROPIC_API_KEY;
  return env;
}

function spawnCli(js: JobState, spec: StartSpec, bin: string): Promise<boolean> {
  return new Promise((resolve) => {
    const { cmd, pre } = claudeCommand(bin);
    let child: ChildProcess;
    try {
      fs.mkdirSync(PATHS.runs, { recursive: true });
      js.raw = fs.createWriteStream(path.join(PATHS.runs, `${js.job.id}.jsonl`));
      js.raw.on('error', () => undefined);
    } catch {
      // logging the raw stream is optional
    }
    try {
      child = spawn(cmd, [...pre, '-p', spec.prompt, ...spec.args], {
        cwd: repoRoot(),
        env: cliEnv(),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        shell: false,
        detached: process.platform !== 'win32', // own process group → the whole tree can be killed
      });
    } catch (e) {
      js.job.error = `Không chạy được Claude Code: ${(e as Error).message}`;
      return resolve(false);
    }
    js.child = child;
    let gotResult = false;
    let buf = '';
    let stderr = '';
    const onLine = (line: string) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(line) as Record<string, unknown>;
      } catch {
        log(js, line.slice(0, 300));
        return;
      }
      if (js.job.status !== 'running') return;
      if (handleStreamMessage(js, msg, (l) => log(js, l))) gotResult = true;
      emit(js);
    };
    child.stdout!.on('data', (chunk: Buffer) => {
      js.raw?.write(chunk);
      buf += chunk.toString('utf8');
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line) onLine(line);
      }
    });
    child.stderr!.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString('utf8')).slice(-3000);
    });
    js.timer = setTimeout(() => {
      log(js, `⏱ Quá ${Math.round(spec.timeoutMs / 60_000)} phút — dừng.`);
      js.job.error = 'Hết thời gian chạy';
      killTree(child);
    }, spec.timeoutMs);
    child.on('error', (e) => {
      js.job.error = `Không chạy được Claude Code: ${e.message}`;
    });
    child.on('close', (code) => {
      clearTimeout(js.timer);
      if (buf.trim()) onLine(buf.trim());
      js.child = undefined;
      const ok = gotResult && !js.job.error && code === 0;
      if (!ok && !js.job.error) {
        const tail = stderr.trim().split('\n').slice(-3).join(' ').slice(0, 400);
        js.job.error = tail ? `Claude Code dừng (mã ${code}): ${tail}` : `Claude Code dừng (mã ${code}) mà không trả kết quả`;
      }
      resolve(ok);
    });
  });
}

// ── ask ─────────────────────────────────────────────────────────────────────

const MAX_PROMPT = 24_000;

/** The learner's choice for the question: from the active test `testId`, or the result `testId`. */
function learnerChoice(qid: string, testId?: string): string[] | undefined {
  if (!testId) return undefined;
  try {
    const a = getStored(testId).answers[qid];
    if (a?.chosen?.length) return a.chosen;
  } catch {
    // not an active test
  }
  return getResult(testId)?.items.find((i) => i.qid === qid)?.chosen;
}

export function buildAskPrompt(q: Question, messages: AskRequest['messages'], chosen?: string[]): string {
  const keys = q.answer;
  const opt = (t: string, i: number) => {
    const k = letter(i);
    return `- [${k}] ${t}${keys.includes(k) ? '  ✅ đáp án đúng' : ''}${chosen?.includes(k) ? '  ← người học đã chọn' : ''}`;
  };
  const exams = Object.entries(q.exams)
    .map(([e, d]) => `${e} ${d}${examDef(e)?.domains.find((x) => x.id === d) ? ` (${examDef(e)!.domains.find((x) => x.id === d)!.name})` : ''}`)
    .join(', ');
  const head = [
    'Bạn là gia sư luyện thi các chứng chỉ Claude của Anthropic (CCAR-F, CCDV-F, CCAO-F, CCAR-P, CCDV-P) cho một người học Việt Nam.',
    'Người học đang xem MỘT câu trắc nghiệm trong app luyện thi và hỏi bạn về nó. Trả lời đúng câu hỏi cuối cùng của người học.',
    '',
    'Yêu cầu:',
    '- Trả lời bằng tiếng Việt, ngắn gọn (tối đa ~250 từ), Markdown gọn; giữ thuật ngữ tiếng Anh (tool_use, prompt caching, subagent…).',
    '- Bám tài liệu chính thức của Anthropic (docs.claude.com, code.claude.com, modelcontextprotocol.io, support.claude.com, anthropic.com).',
    '  Dùng WebFetch / WebSearch để kiểm chứng khi cần; ghi URL nguồn ở cuối. Không bịa con số, tên tham số, giới hạn.',
    '- Gọi các phương án bằng NỘI DUNG, không bằng chữ cái: app xáo thứ tự phương án nên chữ cái người học thấy khác.',
    `- Có thể đọc ghi chú trong ${dataRel()}/notes/ (Read / Grep / Glob) — chỉ đọc, không sửa file, không chạy lệnh.`,
    '- Nếu đáp án hoặc giải thích trong ngân hàng có vẻ sai / mơ hồ, nói thẳng và gợi ý bấm “🐞 Báo lỗi”.',
    '',
    `## Câu hỏi \`${q.id}\` (${exams}${q.scenario ? ` · scenario ${q.scenario}` : ''})`,
    '',
    q.stem,
    '',
    '## Các phương án (chữ cái chỉ là khoá nội bộ)',
    ...q.options.map(opt),
    '',
    '## Giải thích hiện có trong ngân hàng',
    q.explanation || '(trống)',
    ...(q.ref ? ['', `Ghi chú liên quan: ${dataRel()}/notes/${q.ref}`] : []),
    '',
    chosen?.length ? `Người học đã chọn: ${chosen.map((k) => `“${q.options[k.charCodeAt(0) - 65] ?? k}”`).join(' + ')}.` : 'Người học chưa cho biết đã chọn gì.',
    '',
    '## Hội thoại',
  ];
  const turns = messages.map((m) => `**${m.role === 'user' ? 'Người học' : 'Gia sư'}:** ${m.content}`);
  // keep the prompt bounded (Windows command line ≈ 32k): oldest turns dropped first
  let body = turns.join('\n\n');
  while (turns.length > 1 && head.join('\n').length + body.length > MAX_PROMPT) {
    turns.shift();
    body = '_(các lượt cũ hơn đã lược bớt)_\n\n' + turns.join('\n\n');
  }
  return [...head, body, '', 'Trả lời lượt cuối của người học ngay, không mở đầu xã giao.'].join('\n').slice(0, MAX_PROMPT + 4000);
}

export async function ask(body: Partial<AskRequest>): Promise<AiJob> {
  const qid = String(body?.qid ?? '').trim();
  const q = getBank().byId.get(qid);
  if (!q) throw new HttpError(400, 'Không có câu hỏi này trong ngân hàng');
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 4000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new HttpError(400, 'Hãy nhập câu hỏi cho AI');
  const testId = typeof body.testId === 'string' && body.testId ? body.testId : undefined;
  // SPEC §7: refused while the question sits in an unsubmitted exam-feedback test (the one named by testId or any other)
  const blocked = openExamTestsWith(qid).sort((a, b) => (a.id === testId ? -1 : b.id === testId ? 1 : 0));
  if (blocked.length) throw new HttpError(403, `Câu này đang nằm trong bài thi chưa nộp (“${blocked[0].title}”) — nộp bài (hoặc xoá bài đó) rồi mới hỏi AI được.`);
  const running = [...jobs.values()].filter((j) => j.job.kind === 'ask' && j.job.status === 'running').length;
  if (running >= MAX_ASK) throw new HttpError(429, `Đang có ${MAX_ASK} câu hỏi AI chạy — đợi một câu xong rồi hỏi tiếp.`);
  const cfg = loadConfig();
  const model = cfg.ai.ask_model || cfg.ai.model;
  const args = ['--output-format', 'stream-json', '--verbose', '--allowedTools', ...ASK_TOOLS, '--disallowedTools', 'Edit', 'Write', 'NotebookEdit', 'Bash', ...(model ? ['--model', model] : [])];
  return startJob({ kind: 'ask', title: `Hỏi AI · ${qid}`, prompt: buildAskPrompt(q, messages, learnerChoice(qid, testId)), args, timeoutMs: ASK_TIMEOUT_MS });
}

// ── coach ───────────────────────────────────────────────────────────────────

const TASK_LABEL: Record<CoachTask, string> = {
  plan: 'Lập kế hoạch ôn',
  'fix-issues': 'Sửa câu bị báo lỗi',
  generate: 'Sinh câu hỏi mới',
  review: 'Kiểm định câu hỏi',
};
const TASK_SKILL: Record<CoachTask, string> = { plan: 'cert-coach', 'fix-issues': 'cert-coach', generate: 'cert-generate', review: 'cert-review' };

export interface CoachParams {
  task: CoachTask;
  exam?: ExamCode;
  domains?: string[];
  count?: number;
  note?: string;
}

export function cleanCoachRequest(body: Partial<CoachRunRequest>): CoachParams {
  const task = body?.task as CoachTask;
  if (!TASKS.includes(task)) throw new HttpError(400, `Tác vụ không hợp lệ: ${String(body?.task)} (plan | generate | review | fix-issues)`);
  const out: CoachParams = { task };
  if (body.exam !== undefined && body.exam !== null && (body.exam as string) !== '') {
    if (!EXAM_CODES.includes(body.exam)) throw new HttpError(400, `Kỳ thi không hợp lệ: ${String(body.exam)}`);
    out.exam = body.exam;
  }
  if (Array.isArray(body.domains) && body.domains.length) {
    const def = out.exam ? examDef(out.exam) : undefined;
    const doms = [...new Set(body.domains.map(String))];
    const bad = def ? doms.filter((d) => !def.domains.some((x) => x.id === d)) : doms.filter((d) => !/^D\d{1,2}$/.test(d));
    if (bad.length) throw new HttpError(400, `Domain không hợp lệ: ${bad.join(', ')}`);
    out.domains = doms;
  }
  if (body.count !== undefined && body.count !== null) {
    const n = Math.floor(Number(body.count));
    if (!Number.isFinite(n) || n < 1 || n > 100) throw new HttpError(400, 'Số câu phải từ 1 đến 100');
    out.count = n;
  }
  if (typeof body.note === 'string' && body.note.trim()) out.note = body.note.trim().slice(0, 2000);
  return out;
}

export function buildCoachPrompt(p: CoachParams, now = new Date()): string {
  const d = dataRel();
  const app = appRel();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const def = p.exam ? examDef(p.exam) : undefined;
  const domainNames = p.domains?.map((x) => `${x}${def?.domains.find((y) => y.id === x) ? ` (${def.domains.find((y) => y.id === x)!.name})` : ''}`);
  const skill = TASK_SKILL[p.task];
  const req = [
    `- task: ${p.task}`,
    `- exam: ${p.exam ?? '(không chỉ định — tự chọn hợp lý và ghi lại lựa chọn)'}`,
    `- domains: ${domainNames?.length ? domainNames.join(', ') : '(tất cả)'}`,
    `- count: ${p.count ?? '(mặc định của skill)'}`,
    `- note (ghi chú của người học): ${p.note ?? '(không có)'}`,
  ];
  const what: Record<CoachTask, string> = {
    plan: `Phân tích kết quả trong ${d}/results/ và viết MỘT kế hoạch ôn mới vào ${d}/coach/plans/YYYY-MM-DD-<slug>.md (hôm nay: ${today}).`,
    'fix-issues': `Xử lý các mục \`open\` trong ${d}/bank/issues.md: sửa câu trong ${d}/bank/packs/*.yaml, rồi đổi trạng thái mục thành fixed / wontfix kèm dòng \`Xử lý: …\`.`,
    generate: `Sinh ${p.count ?? 'một số'} câu hỏi mới thành một pack mới trong ${d}/bank/packs/ (id dạng AI-<EXAM bỏ dấu gạch>-NNN, vd AI-CCARP-001; origin: ai; status: active; created: ${today}).`,
    review: `Kiểm định độc lập các câu chưa được review (hoặc theo phạm vi yêu cầu) trong ${d}/bank/packs/, sửa lỗi rõ ràng, ghi báo cáo vào ${d}/bank/reviews/ và mục mới vào ${d}/bank/issues.md khi cần.`,
  };
  return [
    `Bạn là AI Coach của app luyện thi chứng chỉ Claude (thư mục \`${d}/\` trong repo này). Chạy không có người giám sát: không hỏi lại, tự quyết định hợp lý.`,
    '',
    `Làm theo skill \`${skill}\` (file .claude/skills/${skill}/SKILL.md ở gốc repo) — tác vụ: **${p.task}** (${TASK_LABEL[p.task]}).`,
    what[p.task],
    '',
    'Yêu cầu từ app:',
    ...req,
    '',
    'Quy ước file (đường dẫn tính từ gốc repo = thư mục làm việc hiện tại):',
    `- Định nghĩa kỳ thi / domain / trọng số / scenario: ${d}/exams.yaml · cấu hình: ${d}/config.yaml · thiết kế: ${app}/SPEC.md (§2 định dạng file).`,
    `- Pack câu hỏi: ${d}/bank/packs/*.yaml (sửa tối thiểu bằng Edit; không đổi thứ tự / số phương án của câu đã có).`,
    `- Kế hoạch ôn: ${d}/coach/plans/YYYY-MM-DD-<slug>.md · báo lỗi: ${d}/bank/issues.md · báo cáo review: ${d}/bank/reviews/*.md.`,
    `- Kết quả bài làm (chỉ đọc, không sửa / xoá): ${d}/results/**/*.json · ghi chú: ${d}/notes/**.`,
    `- Sau khi sửa / thêm câu: chạy \`node ${app}/scripts/validate.ts\` và sửa hết lỗi (error) ở các câu bạn đã đụng.`,
    `- Không sửa code (${app}/server, web, shared, scripts, tests), không sửa .local/, không commit / push (app tự đồng bộ git).`,
    '',
    'Kết thúc bằng một tóm tắt ngắn tiếng Việt (Markdown): đã làm gì, file nào đã ghi / sửa.',
  ].join('\n');
}

export async function runCoach(body: Partial<CoachRunRequest>): Promise<AiJob> {
  const p = cleanCoachRequest(body);
  const cur = runningCoach();
  if (cur) throw new HttpError(409, `AI Coach đang chạy (“${cur.title}”) — đợi xong hoặc huỷ rồi chạy tác vụ mới.`);
  const cfg = loadConfig();
  const args = ['--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--allowedTools', ...coachTools(), ...(cfg.ai.model ? ['--model', cfg.ai.model] : [])];
  const title = `${TASK_LABEL[p.task]}${p.exam ? ` · ${p.exam}` : ''}${p.domains?.length ? ` · ${p.domains.join(', ')}` : ''}${p.task === 'generate' && p.count ? ` · ${p.count} câu` : ''}`;
  return startJob({
    kind: p.task,
    title,
    prompt: buildCoachPrompt(p),
    args,
    timeoutMs: COACH_TIMEOUT_MS,
    before: hooks.syncBefore,
    after: hooks.afterCoach,
  });
}

// ── coach state ─────────────────────────────────────────────────────────────

export function listPlans(): CoachState['plans'] {
  let names: string[] = [];
  try {
    names = fs.readdirSync(PATHS.plans).filter((f) => f.endsWith('.md') && !f.startsWith('.'));
  } catch {
    return [];
  }
  return names
    .map((file) => {
      const abs = path.join(PATHS.plans, file);
      let title = file.replace(/\.md$/, '');
      let date = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
      try {
        const text = fs.readFileSync(abs, 'utf8');
        const h = text.match(/^#\s+(.+)$/m);
        if (h) title = h[1].trim();
        if (!date) date = fs.statSync(abs).mtime.toISOString().slice(0, 10);
      } catch {
        // unreadable: keep the file name
      }
      return { file, title, date };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file));
}

export function readPlan(file: string): { file: string; content: string } {
  if (!/^[\w.-]+\.md$/.test(file) || file.startsWith('.')) throw new HttpError(400, 'Tên file kế hoạch không hợp lệ');
  try {
    return { file, content: fs.readFileSync(path.join(PATHS.plans, file), 'utf8') };
  } catch {
    throw new HttpError(404, 'Không tìm thấy kế hoạch này');
  }
}

export async function coachState(): Promise<CoachState> {
  const st = await claudeStatus();
  const claude: CoachState['claude'] = { available: st.available };
  if (st.path) claude.path = st.path;
  if (st.version) claude.version = st.version;
  if (st.error) claude.error = st.error;
  const all = [...jobs.values()].sort((a, b) => b.job.startedAt.localeCompare(a.job.startedAt)).map((js) => publicJob(js));
  const out: CoachState = { claude, jobs: all, plans: listPlans(), openIssues: loadIssues().filter((i) => i.status === 'open').length };
  const running = runningCoach();
  if (running) out.running = running;
  return out;
}
