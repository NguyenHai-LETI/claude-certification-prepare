// API end to end on a temp copy of tests/fixtures/root (+ a bulk pack): bank, tests, results, dashboard, notes, search,
// issues, SSE.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { after, before, test } from 'node:test';
import type { ActiveTest, CheckResponse, Dashboard, NoteEntry, NoteFile, QuestionDetail, QuestionSummary, ResultDetail, ResultSummary, SearchHit, ServerEvent, SystemInfo } from '../shared/types.ts';
import { makeRoot, request, startApp, waitFor, writeBulkPack } from './helpers.ts';

const root = makeRoot();
const PER = 30;
writeBulkPack(root, PER);
let app: Awaited<ReturnType<typeof startApp>>;
let port = 0;
const events: ServerEvent[] = [];
let sse: http.ClientRequest | undefined;

const api = (method: string, p: string, body?: unknown) => request(port, method, p, { body });

const dist = path.join(path.dirname(root), 'dist');
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>SPA</title><div id="root"></div>');
fs.writeFileSync(path.join(dist, 'assets', 'app-abc.js'), 'console.log(1)');

before(async () => {
  app = await startApp(root, { CERT_DIST: dist });
  port = app.port;
  // SSE listener
  await new Promise<void>((resolve) => {
    sse = http.get({ host: '127.0.0.1', port, path: '/api/events', headers: { Host: `localhost:${port}` } }, (res) => {
      let buf = '';
      res.on('data', (c: Buffer) => {
        buf += c.toString('utf8');
        let i: number;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, i);
          buf = buf.slice(i + 2);
          const data = block
            .split('\n')
            .filter((l) => l.startsWith('data: '))
            .map((l) => l.slice(6))
            .join('\n');
          if (data) events.push(JSON.parse(data) as ServerEvent);
        }
      });
      resolve();
    });
  });
});

after(async () => {
  sse?.destroy();
  await app.close();
  fs.rmSync(path.dirname(root), { recursive: true, force: true });
});

test('meta, system, SSE hello', async () => {
  const m = await api('GET', '/api/meta');
  assert.equal(m.status, 200);
  assert.equal(m.body.exams.length, 4);
  assert.deepEqual(m.body.access, { local: true, remote: false, granted: true });
  assert.equal(m.body.supervised, false);
  assert.deepEqual(m.body.defaults, { count: 5, shuffleOptions: true });
  const s = (await api('GET', '/api/system')).body as SystemInfo;
  assert.match(s.accessCode!, /^[A-Z2-9]{8}$/);
  assert.equal(s.publicUrl, 'https://surreal-magnesium-mug.ngrok-free.dev');
  assert.ok(s.bank.problems.some((p) => p.level === 'error' && p.qid === 'F06'));
  await waitFor(() => events.find((e) => e.type === 'hello'));
  const r = await api('POST', '/api/system/restart');
  assert.equal(r.status, 409);
});

test('bank list filters and question detail', async () => {
  const all = (await api('GET', '/api/bank')).body as { questions: QuestionSummary[]; packs: unknown[] };
  assert.ok(!all.questions.some((q) => q.id === 'F05'), 'retired hidden by default');
  assert.ok(all.questions.some((q) => q.id === 'F04'), 'draft listed');
  assert.equal(all.packs.length, 2);
  const withRetired = (await api('GET', '/api/bank?status=all')).body.questions as QuestionSummary[];
  assert.ok(withRetired.some((q) => q.id === 'F05'));
  const d2 = (await api('GET', '/api/bank?exam=CCDV-F&domain=D2')).body.questions as QuestionSummary[];
  assert.deepEqual(d2.filter((q) => q.id.startsWith('F')).map((q) => q.id), ['F01', 'F02']);
  assert.equal(d2.find((q) => q.id === 'F02')!.multi, true);
  assert.equal(d2.find((q) => q.id === 'F01')!.stats.attempts, 0);
  assert.equal(d2.find((q) => q.id === 'F01')!.stem.includes('`'), false, 'plain text stem');
  const lesson = (await api('GET', '/api/bank?lesson=01&pack=fixture&status=all')).body.questions as QuestionSummary[];
  assert.deepEqual(lesson.map((q) => q.id), ['F01', 'F02', 'F03', 'F04', 'F05']);
  assert.equal((await api('GET', '/api/bank?lesson=02')).body.questions.length, 0);
  assert.equal((await api('GET', '/api/bank?lesson=x1')).status, 400);
  const q = (await api('GET', '/api/bank?q=OVERLOADED')).body.questions as QuestionSummary[];
  assert.deepEqual(q.map((x) => x.id), ['F02']);
  const det = (await api('GET', '/api/questions/F02')).body as QuestionDetail;
  assert.deepEqual(det.answer, ['A', 'C']);
  assert.equal(det.pack, 'fixture');
  assert.deepEqual(det.history, []);
  assert.equal((await api('GET', '/api/questions/NOPE')).status, 404);
  assert.equal((await api('GET', '/api/bank?exam=XX')).status, 400);
});

test('CCAR-F mock: 60 questions by weight, 4 drawn scenarios, no answers before submit', async () => {
  const r = await api('POST', '/api/tests', { exam: 'CCAR-F', mode: 'mock' });
  assert.equal(r.status, 200, r.text);
  const t = r.body as ActiveTest;
  assert.equal(t.questions.length, 60);
  assert.equal(t.feedback, 'exam');
  assert.equal(t.minutes, 120);
  assert.equal(t.scenarios!.length, 4);
  const per: Record<string, number> = {};
  for (const q of t.questions) per[q.domain] = (per[q.domain] ?? 0) + 1;
  assert.deepEqual(per, { D1: 16, D2: 11, D3: 12, D4: 12, D5: 9 });
  for (const q of t.questions) if (q.scenario) assert.ok(t.scenarios!.includes(q.scenario), `${q.id} from undrawn ${q.scenario}`);
  assert.equal(new Set(t.questions.map((q) => q.id)).size, 60);
  assert.ok(!/"answer"|"explanation"|"keys"/.test(r.text), 'no key in the served test');
  const again = (await api('GET', `/api/tests/${t.id}`)).body;
  assert.ok(!('keys' in again));
  const chk = await api('POST', `/api/tests/${t.id}/check`, { qid: t.questions[0].id, chosen: ['A'] });
  assert.equal(chk.status, 403);
  // AI ask refused while the question sits in this unsubmitted exam test
  const ask = await api('POST', '/api/ai/ask', { qid: t.questions[0].id, testId: t.id, messages: [{ role: 'user', content: 'vì sao?' }] });
  assert.equal(ask.status, 403);
  assert.match(ask.body.error, /chưa nộp/);
  const list = (await api('GET', '/api/tests')).body;
  assert.ok(list.some((x: { id: string; total: number }) => x.id === t.id && x.total === 60));
  assert.equal((await api('DELETE', `/api/tests/${t.id}`)).status, 200);
  assert.equal((await api('GET', `/api/tests/${t.id}`)).status, 404);
});

test('practice test: check, save, submit, result, dashboard, review list', async () => {
  const before = events.length;
  const r = await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'ids', ids: ['F02', 'F01', 'B-CCDV-F-D1-01', 'F05', 'NOPE'] });
  const t = r.body as ActiveTest;
  assert.deepEqual(
    t.questions.map((q) => q.id),
    ['F02', 'F01', 'B-CCDV-F-D1-01'],
    'ids: given order, retired + unknown dropped',
  );
  assert.equal(t.feedback, 'practice');
  assert.equal(t.minutes, null);
  assert.equal(t.questions[0].choose, 2);
  assert.deepEqual(t.questions[0].options.map((o) => o.key).sort(), ['A', 'B', 'C', 'D']);
  // check F02 wrong, then try to change it — locked
  const c1 = (await api('POST', `/api/tests/${t.id}/check`, { qid: 'F02', chosen: ['A'] })).body as CheckResponse;
  assert.deepEqual(c1, { correct: false, answer: ['A', 'C'], explanation: c1.explanation, ref: 'lessons/01-api.html#loi-http' });
  assert.ok(c1.explanation.length > 20);
  // reopening the test re-checks an already-checked question: same verdict, no change to the stored answer
  const reopened = (await api('GET', `/api/tests/${t.id}`)).body as ActiveTest;
  assert.deepEqual(reopened.answers.F02, { chosen: ['A'], checked: true });
  const c2 = (await api('POST', `/api/tests/${t.id}/check`, { qid: 'F02', chosen: ['A', 'C'] })).body as CheckResponse;
  assert.deepEqual(c2, c1, 'idempotent: checked answers are locked');
  assert.deepEqual(((await api('GET', `/api/tests/${t.id}`)).body as ActiveTest).answers, reopened.answers);
  const save = await api('PUT', `/api/tests/${t.id}`, { answers: { F02: { chosen: ['A', 'C'] }, F01: { chosen: ['b'], flagged: true, timeSec: 12 } }, elapsedSec: 40, current: 1 });
  assert.equal(save.status, 200);
  const saved = (await api('GET', `/api/tests/${t.id}`)).body as ActiveTest;
  assert.deepEqual(saved.answers.F02, { chosen: ['A'], checked: true });
  assert.deepEqual(saved.answers.F01, { chosen: ['B'], flagged: true, timeSec: 12 });
  assert.equal(saved.current, 1);
  const sub = await api('POST', `/api/tests/${t.id}/submit`, { answers: { ...saved.answers, 'B-CCDV-F-D1-01': { chosen: ['A'] } }, elapsedSec: 50, current: 2 });
  assert.equal(sub.status, 200, sub.text);
  const id = sub.body.resultId as string;
  assert.match(id, /^\d{8}-\d{6}-[0-9a-f]{4}$/);
  const file = path.join(root, 'results', `${id.slice(0, 4)}-${id.slice(4, 6)}`, `${id}.json`);
  assert.ok(fs.existsSync(file));
  await waitFor(() => events.slice(before).find((e) => e.type === 'results'));
  const res = (await api('GET', `/api/results/${id}`)).body as ResultDetail;
  assert.equal(res.score.correct, 2);
  assert.equal(res.score.total, 3);
  assert.equal(res.score.pct, 66.7);
  assert.equal(res.device, 'local');
  assert.deepEqual(res.items.map((i) => [i.qid, i.correct]), [
    ['F02', false],
    ['F01', true],
    ['B-CCDV-F-D1-01', true],
  ]);
  assert.deepEqual(res.byDomain, [
    { domain: 'D1', correct: 1, total: 1 },
    { domain: 'D2', correct: 1, total: 2 },
  ]);
  assert.equal(res.questions.F02.answer.join(''), 'AC');
  const sums = (await api('GET', '/api/results?exam=CCDV-F')).body as ResultSummary[];
  assert.equal(sums[0].id, id);
  assert.equal((await api('GET', '/api/results?exam=CCAR-F')).body.length, 0);
  assert.equal((await api('GET', `/api/tests/${t.id}`)).status, 404, 'active test removed after submit');

  // stats + review list
  const det = (await api('GET', '/api/questions/F02')).body as QuestionDetail;
  assert.deepEqual(det.stats, { attempts: 1, correct: 0, lastCorrect: false, lastAt: res.finishedAt, inReview: true });
  const review = (await api('GET', '/api/bank?exam=CCDV-F&review=1')).body.questions as QuestionSummary[];
  assert.deepEqual(review.map((q) => q.id), ['F02']);
  const dash = (await api('GET', '/api/dashboard?exam=CCDV-F')).body as Dashboard;
  assert.equal(dash.reviewCount, 1);
  const d2 = dash.domains.find((d) => d.domain === 'D2')!;
  assert.deepEqual([d2.seen, d2.answered, d2.correct, d2.pct], [2, 2, 1, 50]);
  assert.equal(dash.domains.find((d) => d.domain === 'D3')!.pct, null);
  assert.equal(dash.recent.length, 1);
  assert.equal(dash.lastMock, undefined);
  assert.equal(dash.totalQuestions, PER * 8 + 2);
  assert.equal(dash.newCount, dash.totalQuestions - 3);
  assert.ok(dash.estimate.pct !== null && dash.estimate.scaled !== null);

  // review mode serves F02; new mode never serves answered questions
  const rv = (await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'review' })).body as ActiveTest;
  assert.deepEqual(rv.questions.map((q) => q.id), ['F02']);
  const nw = (await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'new', count: 300 })).body as ActiveTest;
  assert.ok(!nw.questions.some((q) => ['F01', 'F02', 'B-CCDV-F-D1-01'].includes(q.id)));
  assert.equal(nw.questions.length, dash.newCount);
  // two correct answers in a row take F02 out of the review list
  for (let i = 0; i < 2; i++) {
    const x = (await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'ids', ids: ['F02'] })).body as ActiveTest;
    await api('POST', `/api/tests/${x.id}/submit`, { answers: { F02: { chosen: ['C', 'A'] } }, elapsedSec: 5, current: 0 });
  }
  const empty = await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'review' });
  assert.equal(empty.status, 400);
  assert.match(empty.body.error, /Không có câu nào/);
  // delete a result
  assert.equal((await api('DELETE', `/api/results/${id}`)).status, 200);
  assert.ok(!fs.existsSync(file));
  assert.equal((await api('GET', `/api/results/${id}`)).status, 404);
});

test('domain mode: count split over the chosen domains; bad input → 400', async () => {
  const t = (await api('POST', '/api/tests', { exam: 'CCAR-P', mode: 'domain', domains: ['D1', 'D7'], count: 10 })).body as ActiveTest;
  assert.equal(t.questions.length, 10);
  assert.ok(t.questions.every((q) => q.domain === 'D1' || q.domain === 'D7'));
  assert.match(t.title, /D1, D7/);
  const def = (await api('POST', '/api/tests', { exam: 'CCAO-F', mode: 'random' })).body as ActiveTest;
  assert.equal(def.questions.length, 5, 'default count from config');
  assert.equal((await api('POST', '/api/tests', { exam: 'CCAR-P', mode: 'domain', domains: ['D9'] })).status, 400);
  assert.equal((await api('POST', '/api/tests', { exam: 'NOPE', mode: 'mock' })).status, 400);
  const bad = await api('POST', '/api/tests', { exam: 'CCAR-P', mode: 'ids', ids: ['zzz'] });
  assert.equal(bad.status, 400);
  assert.match(bad.body.error, /Không tìm thấy câu/);
});

test('notes: list, file + headings, path safety', async () => {
  const list = (await api('GET', '/api/notes')).body as NoteEntry[];
  assert.deepEqual(
    list.map((n) => [n.path, n.group, n.title]),
    [
      ['00-tong-quan.md', 'Tổng quan', 'Tổng quan bốn kỳ thi'],
      ['exams/CCAR-F.md', 'Kỳ thi', 'CCAR-F · Architect Foundations'],
      ['lessons/01-api.html', 'Bài học', 'Messages API và tích hợp'],
    ],
  );
  assert.deepEqual(list[2].exams, ['CCDV-F', 'CCAR-F']);
  const md = (await api('GET', '/api/notes/file?path=00-tong-quan.md')).body as NoteFile;
  assert.equal(md.format, 'md');
  assert.ok(!md.content.startsWith('---'), 'frontmatter stripped');
  assert.deepEqual(
    md.headings.map((h) => h.id),
    ['tổng-quan', 'định-dạng-đề-thi', 'định-dạng-đề-thi-1'],
  );
  const html = (await api('GET', '/api/notes/file?path=lessons/01-api.html')).body as NoteFile;
  assert.deepEqual(
    html.headings.map((h) => [h.id, h.level]),
    [
      ['tong-quan', 2],
      ['stop-reason', 2],
      ['loi-http', 3],
    ],
  );
  for (const bad of ['../config.yaml', 'lessons/../../config.yaml', '/etc/passwd', 'x.yaml', '%2e%2e/config.yaml']) {
    const r = await api('GET', `/api/notes/file?path=${encodeURIComponent(bad)}`);
    assert.equal(r.status, 400, bad);
  }
  assert.equal((await api('GET', '/api/notes/file?path=nope.md')).status, 404);
  assert.equal((await api('GET', '/api/coach/plans/..%2Fconfig.yaml')).status, 400);
});

test('search: accent-insensitive over notes and questions, exam filter, snippets', async () => {
  const hits = (await api('GET', `/api/search?q=${encodeURIComponent('bo nho dem')}`)).body as SearchHit[];
  assert.equal(hits[0].kind, 'note');
  assert.equal(hits[0].path, 'exams/CCAR-F.md#domain-1-agentic-architecture--orchestration');
  assert.match(hits[0].snippet, /«Bộ nhớ đệm»/);
  const q = (await api('GET', '/api/search?q=overloaded_error')).body as SearchHit[];
  assert.ok(q.some((h) => h.kind === 'question' && h.qid === 'F02'));
  const filtered = (await api('GET', '/api/search?q=overloaded_error&exam=CCAR-F')).body as SearchHit[];
  assert.ok(!filtered.some((h) => h.qid === 'F02'));
  const sec = (await api('GET', '/api/search?q=duong%20di')).body as SearchHit[];
  assert.equal(sec[0].path, 'lessons/01-api.html#loi-http');
  assert.ok(!(await api('GET', '/api/search?q=alert')).body.some((h: SearchHit) => /alert\(1\)/.test(h.snippet)), 'scripts are not indexed');
  const many = (await api('GET', '/api/search?q=option')).body as SearchHit[];
  assert.equal(many.length, 40);
  assert.deepEqual((await api('GET', '/api/search?q=a')).body, []);
});

test('issues: report, list, show on the question', async () => {
  const r = await api('POST', '/api/issues', { qid: 'F01', message: 'Đáp án B có vẻ sai.\n## không phải heading' });
  assert.equal(r.status, 200, r.text);
  assert.match(r.body.id, /^ISS-\d{8}-\d{6}/);
  assert.equal(r.body.status, 'open');
  const r2 = await api('POST', '/api/issues', { qid: 'F01', message: 'Lần hai' });
  assert.notEqual(r2.body.id, r.body.id);
  const text = fs.readFileSync(path.join(root, 'bank', 'issues.md'), 'utf8');
  assert.match(text, /^# Báo lỗi câu hỏi/);
  assert.match(text, new RegExp(`## ${r.body.id} · F01 · open`));
  const list = (await api('GET', '/api/issues?qid=F01&status=open')).body;
  assert.equal(list.length, 2);
  assert.equal(list[1].message, 'Đáp án B có vẻ sai.\n\\## không phải heading');
  assert.equal(((await api('GET', '/api/questions/F01')).body as QuestionDetail).issues.length, 2);
  assert.equal((await api('POST', '/api/issues', { qid: 'NOPE', message: 'abc' })).status, 400);
  assert.equal((await api('POST', '/api/issues', { qid: 'F01', message: '' })).status, 400);
  const coach = (await api('GET', '/api/coach')).body;
  assert.equal(coach.openIssues, 2);
});

test('bank files changed on disk → reload + SSE bank event', async () => {
  const n = events.length;
  fs.writeFileSync(
    path.join(root, 'bank', 'packs', 'zz-new.yaml'),
    'id: zz\ntitle: New\norigin: ai\nquestions:\n  - id: AI-CCAOF-001\n    exams: { CCAO-F: D3 }\n    stem: New one?\n    options: [yes, no]\n    answer: [A]\n    explanation: "Giải thích đủ dài để không bị cảnh báo khi kiểm tra ngân hàng câu hỏi trong test."\n    ref: lessons/01-api.html\n',
  );
  await waitFor(() => events.slice(n).find((e) => e.type === 'bank'), 8000);
  const det = await api('GET', '/api/questions/AI-CCAOF-001');
  assert.equal(det.status, 200);
  const n2 = events.length;
  fs.writeFileSync(path.join(root, 'notes', 'new-note.md'), '# Ghi chú mới\n');
  await waitFor(() => events.slice(n2).find((e) => e.type === 'notes'), 8000);
  assert.ok(((await api('GET', '/api/notes')).body as NoteEntry[]).some((x) => x.path === 'new-note.md'));
});

test('errors are JSON in Vietnamese; unknown API → 404', async () => {
  const r = await api('GET', '/api/nothing');
  assert.equal(r.status, 404);
  assert.equal(typeof r.body.error, 'string');
  const bad = await request(port, 'POST', '/api/tests', { headers: { 'Content-Type': 'application/json' }, body: undefined });
  assert.equal(bad.status, 400);
});

test('static UI: dist files, SPA fallback for client routes (also /notes/…md), 404 for missing assets', async () => {
  const idx = await request(port, 'GET', '/');
  assert.equal(idx.status, 200);
  assert.match(idx.text, /<title>SPA<\/title>/);
  assert.equal(idx.headers['cache-control'], 'no-cache');
  for (const p of ['/notes/exams/CCAR-F.md', '/notes/lessons/01-api.html#stop-reason', '/bank', '/results/20261118-101500-abcd', '/tests/t-1']) {
    const r = await request(port, 'GET', p);
    assert.equal(r.status, 200, p);
    assert.match(r.text, /<title>SPA/, p);
  }
  const js = await request(port, 'GET', '/assets/app-abc.js');
  assert.equal(js.status, 200);
  assert.match(String(js.headers['content-type']), /javascript/);
  assert.match(String(js.headers['cache-control']), /immutable/);
  assert.equal((await request(port, 'GET', '/assets/missing.js')).status, 404);
  assert.equal((await request(port, 'GET', '/favicon.ico')).status, 404);
  assert.equal((await request(port, 'GET', '/%2e%2e/config.yaml')).status, 200, 'traversal → SPA page, never the file');
  assert.doesNotMatch((await request(port, 'GET', '/../config.yaml')).text, /scoring/);
  assert.equal((await request(port, 'POST', '/bank')).status, 405);
  assert.deepEqual((await api('GET', '/api/meta')).body.scoring, { passPct: 72, reviewStreak: 2 });
});
