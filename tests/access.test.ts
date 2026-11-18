// SPEC §5: local vs remote, access code → cookie, attempt limiting, X-Cert CSRF guard.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { makeRoot, request, startApp } from './helpers.ts';

const root = makeRoot();
let app: Awaited<ReturnType<typeof startApp>>;
let port = 0;
const NGROK = 'surreal-magnesium-mug.ngrok-free.dev';

before(async () => {
  app = await startApp(root);
  port = app.port;
});
after(async () => {
  await app.close();
  fs.rmSync(path.dirname(root), { recursive: true, force: true });
});

const code = () => fs.readFileSync(path.join(root, '.local', 'access-code'), 'utf8').trim();

test('loopback + localhost Host = local', async () => {
  for (const host of [`localhost:${port}`, `127.0.0.1:${port}`, `[::1]:${port}`, 'localhost']) {
    const m = await request(port, 'GET', '/api/meta', { headers: { Host: host } });
    assert.deepEqual(m.body.access, { local: true, remote: false, granted: true }, host);
  }
  assert.equal((await request(port, 'GET', '/api/bank')).status, 200);
  const sys = await request(port, 'GET', '/api/system');
  assert.match(sys.body.accessCode, /^[A-Z2-9]{8}$/);
  assert.equal(sys.body.accessCode, code(), 'stored in .local/access-code');
});

test('loopback + X-Forwarded-For (or Forwarded) = remote', async () => {
  const m = await request(port, 'GET', '/api/meta', { headers: { 'X-Forwarded-For': '203.0.113.9' } });
  assert.deepEqual(m.body.access, { local: false, remote: true, granted: false });
  const f = await request(port, 'GET', '/api/meta', { headers: { Forwarded: 'for=203.0.113.9' } });
  assert.equal(f.body.access.remote, true);
});

test('loopback + public ngrok Host = remote; other hosts too (DNS rebinding)', async () => {
  const m = await request(port, 'GET', '/api/meta', { headers: { Host: NGROK } });
  assert.deepEqual(m.body.access, { local: false, remote: true, granted: false });
  const evil = await request(port, 'GET', '/api/meta', { headers: { Host: 'evil.example:80' } });
  assert.equal(evil.body.access.remote, true);
  const acc = await request(port, 'GET', '/api/access', { headers: { Host: NGROK } });
  assert.deepEqual(acc.body, { required: true, granted: false });
});

test('remote without cookie → 401 on /api/*; meta/access stay open', async () => {
  const h = { Host: NGROK, 'X-Forwarded-For': '198.51.100.1' };
  const r = await request(port, 'GET', '/api/bank', { headers: h });
  assert.equal(r.status, 401);
  assert.match(r.body.error, /mã truy cập/);
  assert.equal((await request(port, 'GET', '/api/events', { headers: h })).status, 401);
  assert.equal((await request(port, 'POST', '/api/tests', { headers: h, body: { exam: 'CCAR-F', mode: 'mock' } })).status, 401);
  assert.equal((await request(port, 'GET', '/api/meta', { headers: h })).status, 200);
  assert.equal((await request(port, 'GET', '/api/access', { headers: h })).status, 200);
});

test('correct code → cookie → 200 (no access code shown remotely); wrong cookie refused', async () => {
  const h = { Host: NGROK, 'X-Forwarded-For': '198.51.100.2', 'X-Forwarded-Proto': 'https' };
  const typed = code().toLowerCase().replace(/^(.{4})/, '$1-'); // case and dashes ignored
  const r = await request(port, 'POST', '/api/access', { headers: h, body: { code: typed } });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual(r.body, { granted: true });
  const set = String(r.headers['set-cookie']);
  assert.match(set, /^cert_access=[\w-]+; Path=\/; Max-Age=15552000; HttpOnly; SameSite=Lax; Secure$/);
  const cookie = set.split(';')[0];
  const bank = await request(port, 'GET', '/api/bank', { headers: { ...h, Cookie: cookie } });
  assert.equal(bank.status, 200);
  const meta = await request(port, 'GET', '/api/meta', { headers: { ...h, Cookie: cookie } });
  assert.deepEqual(meta.body.access, { local: false, remote: true, granted: true });
  const sys = await request(port, 'GET', '/api/system', { headers: { ...h, Cookie: cookie } });
  assert.equal(sys.status, 200);
  assert.equal(sys.body.accessCode, undefined, 'the code itself is never sent to a remote client');
  assert.equal((await request(port, 'GET', '/api/bank', { headers: { ...h, Cookie: 'cert_access=forged' } })).status, 401);
  // a plain-http forwarded request gets no Secure flag
  const r2 = await request(port, 'POST', '/api/access', { headers: { Host: NGROK, 'X-Forwarded-For': '198.51.100.3' }, body: { code: code() } });
  assert.doesNotMatch(String(r2.headers['set-cookie']), /Secure/);
});

test('changing the code invalidates cookies', async () => {
  const h = { Host: NGROK, 'X-Forwarded-For': '198.51.100.4' };
  const r = await request(port, 'POST', '/api/access', { headers: h, body: { code: code() } });
  const cookie = String(r.headers['set-cookie']).split(';')[0];
  assert.equal((await request(port, 'GET', '/api/bank', { headers: { ...h, Cookie: cookie } })).status, 200);
  const file = path.join(root, '.local', 'access-code');
  const old = code();
  fs.writeFileSync(file, 'NEWCODE2\n');
  const t = new Date(Date.now() + 5000);
  fs.utimesSync(file, t, t);
  assert.equal((await request(port, 'GET', '/api/bank', { headers: { ...h, Cookie: cookie } })).status, 401);
  fs.writeFileSync(file, old + '\n');
  const t2 = new Date(Date.now() + 10_000);
  fs.utimesSync(file, t2, t2);
});

test('10 wrong attempts per IP → the 11th gets 429 (even with the right code); other IPs unaffected', async () => {
  const h = { Host: NGROK, 'X-Forwarded-For': '192.0.2.77, 10.0.0.1' };
  for (let i = 1; i <= 10; i++) {
    const r = await request(port, 'POST', '/api/access', { headers: h, body: { code: 'WRONG' + i } });
    assert.equal(r.status, 401, `attempt ${i}`);
  }
  const eleventh = await request(port, 'POST', '/api/access', { headers: h, body: { code: 'WRONG11' } });
  assert.equal(eleventh.status, 429);
  assert.match(eleventh.body.error, /15 phút/);
  assert.equal((await request(port, 'POST', '/api/access', { headers: h, body: { code: code() } })).status, 429);
  const other = await request(port, 'POST', '/api/access', { headers: { Host: NGROK, 'X-Forwarded-For': '192.0.2.78' }, body: { code: code() } });
  assert.equal(other.status, 200);
});

test('missing X-Cert header on a non-GET request → 403 (local and remote)', async () => {
  const r = await request(port, 'POST', '/api/tests', { body: { exam: 'CCAR-F', mode: 'mock' }, noCert: true });
  assert.equal(r.status, 403);
  assert.match(r.body.error, /X-Cert/);
  assert.equal((await request(port, 'DELETE', '/api/results/20261118-101500-abcd', { noCert: true })).status, 403);
  assert.equal((await request(port, 'POST', '/api/access', { headers: { Host: NGROK }, body: { code: code() }, noCert: true })).status, 403);
  assert.equal((await request(port, 'POST', '/api/tests', { body: { exam: 'CCAR-F', mode: 'mock' }, headers: { 'X-Cert': '0' } })).status, 403);
});
