// AI jobs with a fake `claude` (tests/fixtures/fake-claude.mjs prints stream-json): ask, coach run, cancel, limits.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, test } from 'node:test';
import type { AiJob, CoachState } from '../shared/types.ts';
import { FAKE_CLAUDE, makeRoot, request, startApp, waitFor } from './helpers.ts';

const root = makeRoot();
const base = path.dirname(root);
const argsFile = path.join(base, 'args.json');
const childPidFile = path.join(base, 'child.pid');
let app: Awaited<ReturnType<typeof startApp>>;
let port = 0;
const api = (method: string, p: string, body?: unknown) => request(port, method, p, { body });

before(async () => {
  app = await startApp(root, { CERT_CLAUDE_BIN: FAKE_CLAUDE, FAKE_CLAUDE_ARGS: argsFile, FAKE_CLAUDE_CHILD_PID: childPidFile, FAKE_CLAUDE_MODE: 'ok' });
  port = app.port;
});
after(async () => {
  await app.close();
  fs.rmSync(base, { recursive: true, force: true });
});

const finished = (id: string) =>
  waitFor(async () => {
    const j = (await api('GET', `/api/ai/jobs/${id}`)).body as AiJob;
    return j.status !== 'running' ? j : undefined;
  }, 15_000);

const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

test('coach state reports the CLI', async () => {
  const s = (await api('GET', '/api/coach')).body as CoachState;
  assert.equal(s.claude.available, true);
  assert.equal(s.claude.version, '9.9.9 (Claude Code)');
  assert.deepEqual(s.plans, []);
  fs.writeFileSync(path.join(root, 'coach', 'plans', '2026-11-18-ccar-f-7-ngay.md'), '# Kế hoạch 7 ngày\n\nNội dung');
  const s2 = (await api('GET', '/api/coach')).body as CoachState;
  assert.deepEqual(s2.plans, [{ file: '2026-11-18-ccar-f-7-ngay.md', title: 'Kế hoạch 7 ngày', date: '2026-11-18' }]);
  const plan = (await api('GET', '/api/coach/plans/2026-11-18-ccar-f-7-ngay.md')).body;
  assert.match(plan.content, /Nội dung/);
  assert.equal((await api('GET', '/api/coach/plans/nope.md')).status, 404);
});

test('ask: read-only run in the repo root, streamed text + log, final answer', async () => {
  const r = await api('POST', '/api/ai/ask', { qid: 'F02', messages: [{ role: 'user', content: 'Vì sao 429 retry được?' }] });
  assert.equal(r.status, 200, r.text);
  const job = r.body as AiJob;
  assert.equal(job.kind, 'ask');
  assert.equal(job.status, 'running');
  const done = await finished(job.id);
  assert.equal(done.status, 'done', done.error);
  assert.equal(done.text, 'Câu trả lời **cuối**. Nguồn: https://docs.claude.com');
  assert.ok(done.log.some((l) => /Read claude-cert\/notes\/lessons\/01-api\.html$/.test(l)), done.log.join('\n'));
  assert.ok(done.log.some((l) => /✓ Xong · 2 lượt/.test(l)));
  const { args, cwd } = JSON.parse(fs.readFileSync(argsFile, 'utf8')) as { args: string[]; cwd: string };
  assert.equal(fs.realpathSync(cwd), fs.realpathSync(base), 'cwd = repo root (parent of the data root outside git)');
  assert.equal(args[0], '-p');
  const prompt = args[1];
  assert.match(prompt, /tiếng Việt/);
  assert.match(prompt, /Which TWO errors/);
  assert.match(prompt, /\[A\] HTTP 429 rate_limit_error {2}✅ đáp án đúng/);
  assert.match(prompt, /Vì sao 429 retry được\?/);
  assert.match(prompt, /docs\.claude\.com/);
  assert.deepEqual(args.slice(2, 5), ['--output-format', 'stream-json', '--verbose']);
  const at = args.indexOf('--allowedTools');
  assert.deepEqual(args.slice(at + 1, at + 6), ['Read', 'Grep', 'Glob', 'WebFetch', 'WebSearch']);
  assert.ok(args.includes('--disallowedTools'));
  assert.ok(!args.includes('Edit') || args.indexOf('Edit') > args.indexOf('--disallowedTools'));
  // log paging
  const page = (await api('GET', `/api/ai/jobs/${job.id}?since=2`)).body as AiJob;
  assert.equal(page.logTotal, done.logTotal);
  assert.deepEqual(page.log, done.log.slice(2));
  assert.ok(fs.existsSync(path.join(root, 'coach', 'runs', `${job.id}.jsonl`)), 'raw stream saved');
});

test('ask: validation and the learner choice from a test', async () => {
  assert.equal((await api('POST', '/api/ai/ask', { qid: 'NOPE', messages: [{ role: 'user', content: 'x' }] })).status, 400);
  assert.equal((await api('POST', '/api/ai/ask', { qid: 'F01', messages: [{ role: 'assistant', content: 'x' }] })).status, 400);
  const t = (await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'ids', ids: ['F01'] })).body;
  await api('PUT', `/api/tests/${t.id}`, { answers: { F01: { chosen: ['A'] } }, elapsedSec: 1, current: 0 });
  const r = await api('POST', '/api/ai/ask', { qid: 'F01', testId: t.id, messages: [{ role: 'user', content: 'Sao sai?' }, { role: 'assistant', content: 'Vì…' }, { role: 'user', content: 'Thêm ví dụ' }] });
  assert.equal(r.status, 200, 'practice test: allowed');
  await finished(r.body.id);
  const prompt = (JSON.parse(fs.readFileSync(argsFile, 'utf8')) as { args: string[] }).args[1];
  assert.match(prompt, /Người học đã chọn: “Retry the identical request/);
  assert.match(prompt, /\*\*Gia sư:\*\* Vì…/);
  // exam-feedback test containing the question → 403
  const mock = (await api('POST', '/api/tests', { exam: 'CCDV-F', mode: 'ids', ids: ['F01'], feedback: 'exam' })).body;
  const blocked = await api('POST', '/api/ai/ask', { qid: 'F01', testId: mock.id, messages: [{ role: 'user', content: 'hint?' }] });
  assert.equal(blocked.status, 403);
  await api('POST', `/api/tests/${mock.id}/submit`, { answers: {}, elapsedSec: 1, current: 0 });
  const allowed = await api('POST', '/api/ai/ask', { qid: 'F01', testId: mock.id, messages: [{ role: 'user', content: 'giờ thì sao?' }] });
  assert.equal(allowed.status, 200, 'after submit: allowed');
  await finished(allowed.body.id);
});

test('coach run: prompt names the skill, request and file conventions; tools; one at a time; cancel kills the tree', async () => {
  process.env.FAKE_CLAUDE_MODE = 'slow';
  const r = await api('POST', '/api/coach/run', { task: 'generate', exam: 'CCAR-P', domains: ['D7'], count: 5, note: 'tập trung vào hooks' });
  assert.equal(r.status, 200, r.text);
  const job = r.body as AiJob;
  assert.equal(job.kind, 'generate');
  assert.match(job.title, /Sinh câu hỏi mới · CCAR-P · D7 · 5 câu/);
  await waitFor(() => fs.existsSync(childPidFile) && fs.readFileSync(childPidFile, 'utf8').trim(), 10_000);
  const { args } = JSON.parse(fs.readFileSync(argsFile, 'utf8')) as { args: string[] };
  const prompt = args[1];
  assert.match(prompt, /skill `cert-generate`/);
  assert.match(prompt, /exam: CCAR-P/);
  assert.match(prompt, /domains: D7 \(Developer Productivity & Operational Enablement\)/);
  assert.match(prompt, /count: 5/);
  assert.match(prompt, /tập trung vào hooks/);
  assert.match(prompt, /claude-cert\/bank\/packs/);
  assert.match(prompt, /claude-cert\/coach\/plans\/YYYY-MM-DD-<slug>\.md/);
  assert.match(prompt, /node \S*scripts\/validate\.ts/);
  assert.ok(args.includes('acceptEdits'));
  assert.ok(args.some((a) => /^Bash\(node \S*scripts\/validate\.ts\*\)$/.test(a)), args.join(' '));
  for (const t of ['Read', 'Grep', 'Glob', 'Edit', 'Write', 'WebFetch', 'WebSearch']) assert.ok(args.includes(t), t);
  // a second coach job is refused while one runs
  const second = await api('POST', '/api/coach/run', { task: 'plan' });
  assert.equal(second.status, 409);
  const state = (await api('GET', '/api/coach')).body as CoachState;
  assert.equal(state.running?.id, job.id);
  assert.deepEqual(state.running?.log, []);
  // cancel: status cancelled, the CLI and its children are gone
  const grandchild = Number(fs.readFileSync(childPidFile, 'utf8'));
  assert.ok(alive(grandchild));
  assert.deepEqual((await api('POST', `/api/ai/jobs/${job.id}/cancel`)).body, { ok: true });
  const done = await finished(job.id);
  assert.equal(done.status, 'cancelled');
  if (process.platform !== 'win32') await waitFor(() => !alive(grandchild), 8000);
  assert.deepEqual((await api('POST', `/api/ai/jobs/${job.id}/cancel`)).body, { ok: false });
  fs.rmSync(childPidFile, { force: true });
});

test('coach prompts for plan / fix-issues / review name their skill', async () => {
  process.env.FAKE_CLAUDE_MODE = 'ok';
  for (const [task, skill] of [
    ['plan', 'cert-coach'],
    ['fix-issues', 'cert-coach'],
    ['review', 'cert-review'],
  ] as const) {
    const r = await api('POST', '/api/coach/run', { task, exam: 'CCAR-F' });
    assert.equal(r.status, 200, r.text);
    const done = await finished(r.body.id);
    assert.equal(done.status, 'done');
    const prompt = (JSON.parse(fs.readFileSync(argsFile, 'utf8')) as { args: string[] }).args[1];
    assert.match(prompt, new RegExp(`skill \`${skill}\``), task);
    assert.match(prompt, new RegExp(`tác vụ: \\*\\*${task}\\*\\*`));
  }
  assert.equal((await api('POST', '/api/coach/run', { task: 'nope' })).status, 400);
  assert.equal((await api('POST', '/api/coach/run', { task: 'plan', exam: 'CCAR-F', domains: ['D9'] })).status, 400);
});

test('CLI error → job error; concurrent asks limited to 2', async () => {
  process.env.FAKE_CLAUDE_MODE = 'error';
  const r = await api('POST', '/api/ai/ask', { qid: 'F03', messages: [{ role: 'user', content: 'x?' }] });
  const done = await finished(r.body.id);
  assert.equal(done.status, 'error');
  assert.match(done.error!, /overloaded/);
  process.env.FAKE_CLAUDE_MODE = 'slow';
  const a = await api('POST', '/api/ai/ask', { qid: 'F03', messages: [{ role: 'user', content: '1' }] });
  const b = await api('POST', '/api/ai/ask', { qid: 'F03', messages: [{ role: 'user', content: '2' }] });
  const c = await api('POST', '/api/ai/ask', { qid: 'F03', messages: [{ role: 'user', content: '3' }] });
  assert.deepEqual([a.status, b.status, c.status], [200, 200, 429]);
  await api('POST', `/api/ai/jobs/${a.body.id}/cancel`);
  await api('POST', `/api/ai/jobs/${b.body.id}/cancel`);
  process.env.FAKE_CLAUDE_MODE = 'ok';
  const jobs = ((await api('GET', '/api/coach')).body as CoachState).jobs;
  assert.ok(jobs.length >= 8);
  assert.ok(jobs.every((j) => j.log.length === 0 && typeof j.logTotal === 'number'));
  assert.equal((await api('GET', '/api/ai/jobs/nope')).status, 404);
});
