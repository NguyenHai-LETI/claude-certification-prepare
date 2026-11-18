// Every API route (SPEC §4). Imported for its side effects by server/app.ts.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PATHS, ROOT, appVersion, examDef, loadConfig, loadExams } from './config.ts';
import { HttpError, RawResponse, broadcast, route } from './http.ts';
import { EXAM_CODES, type AskRequest, type BuildTestRequest, type CheckRequest, type CoachRunRequest, type ExamCode, type Meta, type QuestionDetail, type ResultDetail, type SaveTestRequest, type SystemInfo } from '../shared/types.ts';
import { accessCode, clientIp, granted, setCookieHeader, tryCode } from './lib/access.ts';
import { ask, cancelJob, coachState, getJob, readPlan, runCoach } from './lib/ai.ts';
import { getBank } from './lib/bank.ts';
import { addIssue, loadIssues } from './lib/issues.ts';
import { listNotes, readNote, search } from './lib/notes.ts';
import { dashboard, questionSummary } from './lib/progress.ts';
import { RESULT_ID_RE, deleteResult, getResult, questionHistory, questionStats, resultSummaries } from './lib/results.ts';
import { fold } from './lib/notes.ts';
import { runSync, scheduleAutoSync, syncState, backgroundFetch } from './lib/sync.ts';
import { buildTest, checkAnswer, deleteTest, getTest, listTests, saveTest, submitTest } from './lib/tests.ts';

// ── server-provided runtime info ────────────────────────────────────────────

export const runtime = {
  port: 0,
  restart: undefined as undefined | (() => void),
};

const supervised = () => process.env.CERT_SUPERVISED === '1';

function examParam(url: URL, required = false): ExamCode | undefined {
  const e = url.searchParams.get('exam');
  if (!e) {
    if (required) throw new HttpError(400, 'Thiếu tham số exam');
    return undefined;
  }
  if (!EXAM_CODES.includes(e as ExamCode) || !examDef(e)) throw new HttpError(400, `Kỳ thi không hợp lệ: ${e}`);
  return e as ExamCode;
}

const okJson = (body: unknown, headers: Record<string, string> = {}) => new RawResponse(JSON.stringify(body), 'application/json; charset=utf-8', headers);

// ── meta / access / system ──────────────────────────────────────────────────

route('GET', '/api/meta', ({ req, local }) => {
  const cfg = loadConfig();
  const ex = loadExams();
  const meta: Meta = {
    version: appVersion(),
    exams: ex.exams,
    examVersion: ex.version,
    access: { local, remote: !local, granted: granted(req, local) },
    supervised: supervised(),
    defaults: { count: cfg.practice.default_count, shuffleOptions: cfg.practice.shuffle_options },
    scoring: { passPct: cfg.scoring.pass_pct, reviewStreak: cfg.scoring.review_streak },
  };
  return meta;
});

route('GET', '/api/access', ({ req, local }) => ({ required: !local, granted: granted(req, local) }));

route('POST', '/api/access', async ({ req, local, body }) => {
  if (local) return { granted: true };
  const { code } = await body<{ code?: unknown }>();
  const r = tryCode(clientIp(req), code);
  if (r === 'limited') throw new HttpError(429, 'Nhập sai quá nhiều lần — đợi 15 phút rồi thử lại.');
  if (r === 'wrong') throw new HttpError(401, 'Mã truy cập không đúng.');
  return okJson({ granted: true }, { 'Set-Cookie': setCookieHeader(req) });
});

function lanUrls(): string[] {
  if (!loadConfig().server.lan) return [];
  const out: string[] = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) if (a.family === 'IPv4' && !a.internal && !a.address.startsWith('169.254.')) out.push(`http://${a.address}:${runtime.port}`);
  }
  return out;
}

route('GET', '/api/system', ({ local }) => {
  const cfg = loadConfig();
  const bank = getBank();
  const info: SystemInfo = {
    lanUrls: lanUrls(),
    node: process.version,
    platform: `${process.platform} ${os.arch()}`,
    root: ROOT,
    bank: { packs: bank.packs, questions: bank.questions.length, active: bank.questions.filter((q) => q.status === 'active').length, problems: bank.problems },
  };
  if (local) info.accessCode = accessCode();
  if (cfg.public.ngrok_domain) info.publicUrl = `https://${cfg.public.ngrok_domain}`;
  try {
    const pub = JSON.parse(fs.readFileSync(path.join(PATHS.local, 'public.json'), 'utf8')) as { ok?: unknown };
    if (typeof pub.ok === 'boolean') info.publicOk = pub.ok;
  } catch {
    // the watchdog never ran on this machine
  }
  return info;
});

route('POST', '/api/system/restart', () => {
  if (!supervised() || !runtime.restart) throw new HttpError(409, 'App không chạy qua trình giám sát (npm start / scripts/run.ts) nên không tự khởi động lại được — tắt rồi mở lại app.');
  setTimeout(() => runtime.restart?.(), 200);
  return { ok: true };
});

// ── bank ────────────────────────────────────────────────────────────────────

route('GET', '/api/bank', ({ url }) => {
  const bank = getBank();
  const exam = examParam(url);
  const domain = url.searchParams.get('domain') || undefined;
  const pack = url.searchParams.get('pack') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const q = fold((url.searchParams.get('q') ?? '').trim());
  const review = url.searchParams.get('review') === '1';
  const seen = url.searchParams.get('seen');
  const lessonRaw = url.searchParams.get('lesson');
  let lesson: string | undefined;
  if (lessonRaw) {
    if (!/^\d{1,2}$/.test(lessonRaw)) throw new HttpError(400, 'Tham số lesson phải là số bài (vd 05)');
    lesson = `lessons/${lessonRaw.padStart(2, '0')}-`;
  }
  const streak = loadConfig().scoring.review_streak;
  const rows = bank.questions.filter((x) => {
    if (status === 'all') {
      // every status
    } else if (status) {
      if (x.status !== status) return false;
    } else if (x.status === 'retired') return false;
    if (exam && x.exams[exam] === undefined) return false;
    if (domain && (exam ? x.exams[exam] !== domain : !Object.values(x.exams).includes(domain))) return false;
    if (pack && x.pack !== pack) return false;
    if (lesson && !(x.ref ?? '').replace(/^\/?(notes\/)?/, '').startsWith(lesson)) return false;
    if (q && !fold(`${x.id} ${x.stem} ${x.options.join(' ')}`).includes(q)) return false;
    return true;
  });
  let out = rows.map((x) => questionSummary(x, streak));
  if (review) out = out.filter((s) => s.stats.inReview);
  if (seen === '0') out = out.filter((s) => s.stats.attempts === 0);
  if (seen === '1') out = out.filter((s) => s.stats.attempts > 0);
  return { questions: out, packs: bank.packs };
});

route('GET', '/api/questions/:id', ({ params }) => {
  const q = getBank().byId.get(params[0]);
  if (!q) throw new HttpError(404, `Không tìm thấy câu ${params[0]}`);
  const detail: QuestionDetail = {
    ...q,
    stats: questionStats(q.id),
    history: questionHistory(q.id).map((h) => ({ resultId: h.resultId, at: h.at, correct: h.correct, chosen: h.chosen })),
    issues: loadIssues().filter((i) => i.qid === q.id),
  };
  return detail;
});

// ── tests ───────────────────────────────────────────────────────────────────

route('POST', '/api/tests', async ({ body }) => buildTest(await body<BuildTestRequest>()));
route('GET', '/api/tests', () => listTests());
route('GET', '/api/tests/:id', ({ params }) => getTest(params[0]));
route('PUT', '/api/tests/:id', async ({ params, body }) => {
  saveTest(params[0], await body<SaveTestRequest>());
  return { ok: true };
});
route('POST', '/api/tests/:id/check', async ({ params, body }) => {
  const b = await body<CheckRequest>();
  return checkAnswer(params[0], String(b.qid ?? ''), b.chosen);
});
route('POST', '/api/tests/:id/submit', async ({ params, body, local }) => {
  const r = submitTest(params[0], await body<SaveTestRequest>(), local ? 'local' : 'remote');
  broadcast({ type: 'results' });
  scheduleAutoSync();
  return { resultId: r.id };
});
route('DELETE', '/api/tests/:id', ({ params }) => {
  deleteTest(params[0]);
  return { ok: true };
});

// ── results / dashboard ─────────────────────────────────────────────────────

route('GET', '/api/results', ({ url }) => resultSummaries(examParam(url)));

route('GET', '/api/results/:id', ({ params }) => {
  if (!RESULT_ID_RE.test(params[0])) throw new HttpError(400, 'Mã kết quả không hợp lệ');
  const r = getResult(params[0]);
  if (!r) throw new HttpError(404, 'Không tìm thấy kết quả này');
  const bank = getBank();
  const questions: ResultDetail['questions'] = {};
  for (const it of r.items) {
    const q = bank.byId.get(it.qid);
    if (q) questions[it.qid] = q;
  }
  return { ...r, questions } satisfies ResultDetail;
});

route('DELETE', '/api/results/:id', ({ params }) => {
  if (!RESULT_ID_RE.test(params[0])) throw new HttpError(400, 'Mã kết quả không hợp lệ');
  if (!deleteResult(params[0])) throw new HttpError(404, 'Không tìm thấy kết quả này');
  broadcast({ type: 'results' });
  scheduleAutoSync();
  return { ok: true };
});

route('GET', '/api/dashboard', ({ url }) => dashboard(examDef(examParam(url, true)!)!));

// ── notes / search ──────────────────────────────────────────────────────────

route('GET', '/api/notes', () => listNotes());
route('GET', '/api/notes/file', ({ url }) => readNote(url.searchParams.get('path')));
route('GET', '/api/search', ({ url }) => search(url.searchParams.get('q'), examParam(url)));

// ── issues ──────────────────────────────────────────────────────────────────

route('GET', '/api/issues', ({ url }) => {
  const qid = url.searchParams.get('qid');
  const status = url.searchParams.get('status');
  return loadIssues()
    .filter((i) => (!qid || i.qid === qid) && (!status || i.status === status))
    .reverse();
});

route('POST', '/api/issues', async ({ body, local }) => {
  const b = await body<{ qid?: unknown; message?: unknown }>();
  const qid = String(b.qid ?? '').trim();
  if (!getBank().byId.has(qid)) throw new HttpError(400, 'Không có câu hỏi này trong ngân hàng');
  const issue = addIssue(qid, String(b.message ?? ''), local ? 'local' : 'remote');
  scheduleAutoSync();
  return issue;
});

// ── AI ──────────────────────────────────────────────────────────────────────

route('POST', '/api/ai/ask', async ({ body }) => ask(await body<AskRequest>()));
route('GET', '/api/ai/jobs/:id', ({ params, url }) => getJob(params[0], Math.max(0, Number(url.searchParams.get('since')) || 0)));
route('POST', '/api/ai/jobs/:id/cancel', ({ params }) => ({ ok: cancelJob(params[0]) }));
route('GET', '/api/coach', () => coachState());
route('POST', '/api/coach/run', async ({ body }) => runCoach(await body<CoachRunRequest>()));
route('GET', '/api/coach/plans/:file', ({ params }) => readPlan(params[0]));

// ── sync ────────────────────────────────────────────────────────────────────

route('GET', '/api/sync', async () => {
  const s = await syncState();
  backgroundFetch(() => {
    void syncState().then((state) => broadcast({ type: 'sync', state }));
  });
  return s;
});

route('POST', '/api/sync', async () => {
  await runSync({ source: 'manual' });
  return syncState();
});
