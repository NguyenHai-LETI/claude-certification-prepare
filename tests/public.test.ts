// scripts/public.ts + scripts/run.ts pure helpers (the real ngrok domain cannot be tested here).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { detectNgrokProblem, ngrokArgs, ngrokRetryMs, publicStatus } from '../scripts/public.ts';
import { buildReason } from '../scripts/run.ts';

test('ngrok arguments', () => {
  assert.deepEqual(ngrokArgs(3004, 'surreal-magnesium-mug.ngrok-free.dev'), ['http', '3004', '--url=https://surreal-magnesium-mug.ngrok-free.dev', '--log=stdout', '--log-format=logfmt']);
  assert.deepEqual(ngrokArgs(3004, 'https://x.ngrok-free.dev/', true).slice(0, 3), ['http', '3004', '--domain=x.ngrok-free.dev']);
});

test('"endpoint already online" (ERR_NGROK_334) is recognised in log lines and error pages', () => {
  const logLine =
    't=2026-11-18T10:00:00+0700 lvl=eror msg="failed to reconnect session" obj=tunnels.session err="failed to start tunnel: The endpoint \'https://surreal-magnesium-mug.ngrok-free.dev\' is already online. Either\\n1. stop your existing endpoint first, or\\n2. start both endpoints with `--pooling-enabled`\\n\\nERR_NGROK_334\\n"';
  const p = detectNgrokProblem(logLine);
  assert.equal(p?.kind, 'already-online');
  assert.equal(p?.code, 'ERR_NGROK_334');
  assert.match(p!.message, /một máy/);
  const console = 'ERROR:  failed to start tunnel: The endpoint is already online.\nERROR:  ERR_NGROK_334';
  assert.equal(detectNgrokProblem(console)?.kind, 'already-online');
  assert.equal(detectNgrokProblem('<html>… ERR_NGROK_334 …</html>')?.kind, 'already-online');
});

test('other ngrok problems: auth, old version, limits, generic errors; normal lines pass', () => {
  assert.equal(detectNgrokProblem('ERROR:  authentication failed: Usage of ngrok requires a verified account and authtoken.\nERROR:  ERR_NGROK_4018')?.kind, 'auth');
  assert.equal(detectNgrokProblem('ERROR: unknown flag: --url')?.kind, 'old-version');
  assert.equal(detectNgrokProblem('ERROR: Your account is limited to 1 simultaneous ngrok agent sessions. ERR_NGROK_108')?.kind, 'limit');
  assert.equal(detectNgrokProblem('t=x lvl=eror msg="session closed" err="dial tcp: lookup connect.ngrok-agent.com: no such host"')?.kind, 'other');
  for (const ok of [
    't=2026-11-18T10:00:00+0700 lvl=info msg="started tunnel" obj=tunnels name=command_line addr=http://localhost:3004 url=https://surreal-magnesium-mug.ngrok-free.dev',
    't=2026-11-18T10:00:00+0700 lvl=info msg="open config file" path=/Users/x/Library/Application Support/ngrok/ngrok.yml err=nil',
    't=2026-11-18T10:00:00+0700 lvl=info msg="client session established" obj=tunnels.session',
  ]) {
    assert.equal(detectNgrokProblem(ok), undefined, ok);
  }
});

test('retry delays and the status file shape', () => {
  assert.equal(ngrokRetryMs({ kind: 'already-online', message: '' }, 60), 60_000);
  assert.equal(ngrokRetryMs({ kind: 'already-online', message: '' }, 120), 120_000);
  assert.equal(ngrokRetryMs({ kind: 'auth', message: '' }, 60), 300_000);
  assert.equal(ngrokRetryMs(undefined, 60), 5_000);
  const now = new Date('2026-11-18T03:00:00Z');
  assert.deepEqual(publicStatus('x.ngrok-free.dev', true, undefined, now), { url: 'https://x.ngrok-free.dev', ok: true, checkedAt: '2026-11-18T03:00:00.000Z' });
  assert.deepEqual(publicStatus('x.ngrok-free.dev', false, 'HTTP 502', now), { url: 'https://x.ngrok-free.dev', ok: false, checkedAt: '2026-11-18T03:00:00.000Z', error: 'HTTP 502' });
});

test('run.ts: dist/ rebuilt when missing or older than the UI sources', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-build-'));
  try {
    assert.equal(buildReason(dir), undefined, 'no index.html: nothing to build');
    fs.writeFileSync(path.join(dir, 'index.html'), '<div id=root>');
    fs.mkdirSync(path.join(dir, 'web'));
    fs.writeFileSync(path.join(dir, 'web', 'main.tsx'), '');
    assert.match(buildReason(dir)!, /chưa có dist/);
    fs.mkdirSync(path.join(dir, 'dist'));
    fs.writeFileSync(path.join(dir, 'dist', 'index.html'), '');
    const future = new Date(Date.now() + 60_000);
    fs.utimesSync(path.join(dir, 'dist', 'index.html'), future, future);
    assert.equal(buildReason(dir), undefined);
    const later = new Date(Date.now() + 120_000);
    fs.utimesSync(path.join(dir, 'web', 'main.tsx'), later, later);
    assert.match(buildReason(dir)!, /mới hơn/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
