// Git sync (SPEC §8) against a temp bare repo and two clones: commit data paths only, pull, push, conflicts, unattended.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { FIXTURE } from './helpers.ts';

const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'cert-sync-')));
const bare = path.join(base, 'remote.git');
const A = path.join(base, 'a');
const B = path.join(base, 'b');
const DATA = ['claude-cert/results', 'claude-cert/coach', 'claude-cert/bank'];

Object.assign(process.env, { GIT_AUTHOR_NAME: 'Test', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 'Test', GIT_COMMITTER_EMAIL: 't@example.com', CERT_ROOT: path.join(A, 'claude-cert') });

const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (file: string, text: string) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

let sync: typeof import('../server/lib/sync.ts');

before(async () => {
  git(base, 'init', '-q', '--bare', '-b', 'main', bare);
  git(base, 'init', '-q', '-b', 'main', A);
  fs.cpSync(FIXTURE, path.join(A, 'claude-cert'), { recursive: true });
  write(path.join(A, '.gitignore'), '.local/\n');
  write(path.join(A, 'claude-cert', 'results', '.gitkeep'), '');
  write(path.join(A, 'app.txt'), 'code v1\n');
  git(A, 'add', '-A');
  git(A, 'commit', '-q', '-m', 'init');
  git(A, 'remote', 'add', 'origin', bare);
  git(A, 'push', '-q', '-u', 'origin', 'main');
  git(base, 'clone', '-q', bare, B);
  sync = await import('../server/lib/sync.ts');
});
after(() => fs.rmSync(base, { recursive: true, force: true }));

const run = (repoDir: string, source: 'manual' | 'auto' = 'manual', host = 'test-host') => sync.runSync({ repoDir, dataPaths: DATA, host, source, now: new Date(2026, 10, 18, 9, 5) });

test('commits only the data paths, pushes; other edits stay uncommitted', async () => {
  write(path.join(A, 'claude-cert', 'results', '2026-11', '20261118-090000-abcd.json'), '{"id":"20261118-090000-abcd"}\n');
  write(path.join(A, 'app.txt'), 'code v2 (work in progress)\n');
  write(path.join(A, 'claude-cert', 'notes', 'scratch.md'), '# untracked note\n');
  const seen: string[] = [];
  const off = sync.onSyncDone((o) => seen.push(o.result));
  const o = await run(A);
  off();
  assert.equal(o.ok, true, `${o.message} ${o.hint ?? ''}`);
  assert.equal(o.result, 'ok');
  assert.equal(o.committed, 1);
  assert.equal(o.pushed, 1);
  assert.deepEqual(seen, ['ok']);
  assert.equal(git(bare, 'log', '-1', '--format=%s', 'main'), 'cert: sync từ test-host 2026-11-18 09:05');
  assert.equal(git(bare, 'show', '--name-only', '--format=', 'main'), 'claude-cert/results/2026-11/20261118-090000-abcd.json');
  assert.match(git(A, 'status', '--porcelain'), /M app\.txt/);
  assert.match(git(A, 'status', '--porcelain'), /\?\? claude-cert\/notes\/scratch\.md/);
  const again = await run(A);
  assert.equal(again.result, 'nothing');
  assert.match(again.message, /không có gì mới/);
  const st = await sync.syncState({ repoDir: A, dataPaths: DATA });
  assert.equal(st.repo, true);
  assert.equal(st.branch, 'main');
  assert.equal(st.remote, 'origin/main');
  assert.equal(st.dirty, 0);
  assert.equal(st.ahead, 0);
  assert.equal(st.lastResult, 'nothing');
});

test('the other clone receives it; changed files are reported', async () => {
  const o = await run(B, 'manual', 'host-b');
  assert.equal(o.ok, true, o.message);
  assert.equal(o.received, 1);
  assert.ok(o.changed.includes('claude-cert/results/2026-11/20261118-090000-abcd.json'));
  assert.ok(fs.existsSync(path.join(B, 'claude-cert', 'results', '2026-11', '20261118-090000-abcd.json')));
});

test('conflict on the same bank line: rebase aborted, local commit kept, error reported, never forced', async () => {
  const pack = (dir: string) => path.join(dir, 'claude-cert', 'bank', 'packs', 'fixture.yaml');
  const edit = (dir: string, title: string) => fs.writeFileSync(pack(dir), fs.readFileSync(pack(dir), 'utf8').replace(/^title: .*$/m, `title: ${title}`));
  edit(A, 'Tiêu đề A');
  assert.equal((await run(A)).ok, true);
  edit(B, 'Tiêu đề B');
  const remoteBefore = git(bare, 'rev-parse', 'main');
  const o = await run(B, 'manual', 'host-b');
  assert.equal(o.ok, false);
  assert.match(o.message, /Xung đột/);
  assert.match(o.message, /fixture\.yaml/);
  assert.match(o.hint!, /Đã huỷ rebase/);
  assert.equal(git(bare, 'rev-parse', 'main'), remoteBefore, 'remote untouched');
  const gitDir = path.join(B, '.git');
  assert.ok(!fs.existsSync(path.join(gitDir, 'rebase-merge')) && !fs.existsSync(path.join(gitDir, 'rebase-apply')));
  assert.equal(git(B, 'log', '-1', '--format=%s'), 'cert: sync từ host-b 2026-11-18 09:05');
  assert.match(fs.readFileSync(pack(B), 'utf8'), /title: Tiêu đề B/);
  // resolve by hand: take A's version, then sync works again
  git(B, 'reset', '-q', '--hard', 'origin/main');
  git(B, 'pull', '-q', '--rebase', 'origin', 'main');
  assert.equal((await run(B, 'manual', 'host-b')).ok, true);
});

test('unattended sync: never stashes edits outside the data paths, never pushes code commits', async () => {
  // A has app.txt modified (tracked, outside data) since test 1
  write(path.join(B, 'claude-cert', 'coach', 'plans', '2026-11-18-plan.md'), '# Plan\n');
  assert.equal((await run(B, 'manual', 'host-b')).ok, true);
  write(path.join(A, 'claude-cert', 'results', '2026-11', '20261118-100000-beef.json'), '{}\n');
  const o = await run(A, 'auto');
  assert.equal(o.ok, false);
  assert.match(o.message, /chỉ làm được một phần/);
  assert.match(o.message, /app\.txt/);
  assert.equal(o.committed, 1, 'data still committed locally');
  assert.equal(fs.readFileSync(path.join(A, 'app.txt'), 'utf8'), 'code v2 (work in progress)\n', 'WIP untouched');
  assert.ok(!fs.existsSync(path.join(A, 'claude-cert', 'coach', 'plans', '2026-11-18-plan.md')), 'pull skipped');
  // a manual sync autostashes the WIP, pulls, pushes and puts the WIP back
  const m = await run(A);
  assert.equal(m.ok, true, `${m.message} ${m.hint ?? ''}`);
  assert.ok(fs.existsSync(path.join(A, 'claude-cert', 'coach', 'plans', '2026-11-18-plan.md')));
  assert.equal(fs.readFileSync(path.join(A, 'app.txt'), 'utf8'), 'code v2 (work in progress)\n');
  // a local commit touching code is held back by an auto sync
  git(A, 'stash', '-q');
  write(path.join(A, 'app.txt'), 'code v3\n');
  git(A, 'commit', '-q', '-am', 'code change');
  const held = await run(A, 'auto');
  assert.equal(held.ok, false);
  assert.match(held.message, /chưa đẩy/);
  assert.notEqual(git(bare, 'log', '-1', '--format=%s', 'main'), 'code change');
});

test('not a repo / no upstream → clear Vietnamese errors', async () => {
  const plain = path.join(base, 'plain');
  fs.mkdirSync(plain);
  const o = await sync.runSync({ repoDir: plain, dataPaths: DATA, source: 'manual' });
  assert.equal(o.ok, false);
  const lone = path.join(base, 'lone');
  git(base, 'init', '-q', '-b', 'main', lone);
  write(path.join(lone, 'x.txt'), 'x');
  git(lone, 'add', '-A');
  git(lone, 'commit', '-q', '-m', 'x');
  const u = await sync.runSync({ repoDir: lone, dataPaths: DATA, source: 'manual' });
  assert.equal(u.ok, false);
  assert.match(u.message, /upstream/);
  assert.match(u.hint!, /git push -u origin main/);
});
