// Playwright smoke test of the claude-cert web UI against a RUNNING server.
//   CERT_URL=http://127.0.0.1:3004 node tests/ui/smoke.mjs     (default URL shown)
// Checks: every route renders without page errors / console errors; a 5-question practice test is built through the UI,
// one question is answered + checked, the test is submitted and the result page shows; no horizontal overflow at 390 px;
// dark theme renders. The result created by the smoke run is deleted again at the end.
// Env: HEADED=1 show the browser · SMOKE_OUT=<dir> save screenshots.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.CERT_URL || 'http://127.0.0.1:3004').replace(/\/$/, '');
const OUT = process.env.SMOKE_OUT ? path.resolve(process.env.SMOKE_OUT) : '';
if (OUT) fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);

async function launch() {
  try {
    return await chromium.launch({ headless: !process.env.HEADED });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Executable doesn't exist|playwright install/i.test(msg)) {
      console.error('✗ Thiếu Chromium cho Playwright. Chạy một lần: npx playwright install chromium');
      process.exit(2);
    }
    throw e;
  }
}

// ── server reachable? ───────────────────────────────────────────────────────
try {
  const r = await fetch(`${BASE}/api/meta`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(`✗ Không kết nối được ${BASE}/api/meta (${e.message}). Chạy server trước: node server/index.ts`);
  process.exit(2);
}
const notes = await fetch(`${BASE}/api/notes`)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);
const firstNote = Array.isArray(notes) && notes.length ? notes.find((n) => n.path.startsWith('lessons/')) ?? notes[0] : undefined;

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
// default exam CCAR-F; make sure no earlier choice leaks in
await context.addInitScript(() => {
  try {
    if (!sessionStorage.getItem('smoke-init')) {
      localStorage.removeItem('cert.exam');
      sessionStorage.setItem('smoke-init', '1');
    }
  } catch {}
});
const page = await context.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/EventSource|api\/events/i.test(t)) return; // SSE reconnects are not page bugs
  problems.push(`console: ${t}`);
});
page.on('response', (r) => {
  if (r.url().includes('/api/') && r.status() >= 500) problems.push(`HTTP ${r.status()} ${r.url()}`);
});

const ROUTES = [
  ['/', 'tong-quan', '.kpi'],
  ['/new', 'tao-bai', '.mode-card'],
  ['/review', 'on-cau-sai', '.page-head'],
  ['/history', 'lich-su', '.page-head'],
  ['/notes', 'tai-lieu', '.notes-layout'],
  ...(firstNote ? [[`/notes/${firstNote.path}`, 'tai-lieu-bai', 'article.lesson']] : []),
  ['/bank', 'ngan-hang', '.qrow, .empty'],
  ['/coach', 'ai-coach', '.page-head'],
  ['/system', 'he-thong', '.page-head'],
];

async function visit(url, sel) {
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.waitForTimeout(250);
}

async function overflow() {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

// ── every route, desktop ────────────────────────────────────────────────────
for (const [url, name, sel] of ROUTES) {
  const before = problems.length;
  try {
    await visit(url, sel);
    if (OUT) await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
    if (problems.length > before) fail(`${url}: ${problems.slice(before).join(' | ')}`);
    else ok(`${url}`);
  } catch (e) {
    fail(`${url}: ${e.message.split('\n')[0]}`);
  }
}

// ── note anchor scroll ──────────────────────────────────────────────────────
if (firstNote) {
  try {
    const file = await fetch(`${BASE}/api/notes/file?path=${encodeURIComponent(firstNote.path)}`).then((r) => r.json());
    const h = file.headings?.find((x) => x.level >= 2) ?? file.headings?.[0];
    if (h) {
      await visit(`/notes/${firstNote.path}#${h.id}`, 'article.lesson');
      await page.waitForTimeout(400);
      const top = await page.evaluate((id) => document.getElementById(id)?.getBoundingClientRect().top ?? null, h.id);
      if (top === null) fail(`anchor #${h.id} not found in ${firstNote.path}`);
      else if (top < -5 || top > 400) fail(`anchor #${h.id} not scrolled into view (top=${Math.round(top)})`);
      else ok(`anchor #${h.id} scrolled into view`);
    }
  } catch (e) {
    fail(`anchor: ${e.message.split('\n')[0]}`);
  }
}

// ── build a 5-question practice test, answer + check one, submit ───────────
let resultId;
try {
  const before = problems.length;
  await visit('/new', '.mode-card');
  await page.getByRole('radio', { name: /Ngẫu nhiên/ }).click();
  await page.getByLabel('Số câu').fill('5');
  await page.getByRole('button', { name: /Luyện/ }).click();
  await page.getByRole('button', { name: /Bắt đầu/ }).click();
  await page.waitForURL(/\/test\//, { timeout: 15000 });
  await page.waitForSelector('.opt', { timeout: 15000 });
  const total = await page.locator('.qnav button').count();
  if (total !== 5) fail(`runner shows ${total} questions, expected 5`);
  // answer: as many options as the question asks for
  const hint = await page.locator('.q-hint').textContent().catch(() => null);
  const need = hint ? Number(/Chọn (\d+)/.exec(hint)?.[1] ?? 1) : 1;
  for (let i = 0; i < need; i++) await page.locator('.opt').nth(i).click();
  await page.locator('.q-actions').getByRole('button', { name: /Kiểm tra/ }).click();
  await page.waitForSelector('.explain', { timeout: 15000 });
  ok('practice question answered and checked');
  // keyboard: next question, pick option 1
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('1');
  const answered = await page.locator('.qnav button.answered').count();
  if (answered < 2) fail(`keyboard answer not registered (answered=${answered})`);
  await page.getByRole('button', { name: 'Nộp bài' }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Nộp bài' }).click();
  await page.waitForURL(/\/result\//, { timeout: 15000 });
  await page.waitForSelector('.kpi', { timeout: 15000 });
  resultId = decodeURIComponent(page.url().split('/result/')[1] ?? '');
  await page.locator('.rq-head').first().click();
  await page.waitForSelector('.rq-body .opt');
  if (OUT) await page.screenshot({ path: path.join(OUT, 'ket-qua.png'), fullPage: true });
  if (problems.length > before) fail(`test flow: ${problems.slice(before).join(' | ')}`);
  else ok(`test built, submitted, result ${resultId}`);
} catch (e) {
  fail(`test flow: ${e.message.split('\n')[0]}`);
  if (OUT) await page.screenshot({ path: path.join(OUT, 'test-flow-fail.png'), fullPage: true }).catch(() => {});
}

// ── phone width: no horizontal overflow ─────────────────────────────────────
await page.setViewportSize({ width: 390, height: 844 });
const phoneRoutes = [...ROUTES, ...(resultId ? [[`/result/${resultId}`, 'ket-qua', '.kpi']] : [])];
for (const [url, name, sel] of phoneRoutes) {
  try {
    await visit(url, sel);
    const over = await overflow();
    if (OUT) await page.screenshot({ path: path.join(OUT, `390-${name}.png`), fullPage: true });
    if (over > 1) fail(`390px ${url}: horizontal overflow ${over}px`);
    else ok(`390px ${url}`);
  } catch (e) {
    fail(`390px ${url}: ${e.message.split('\n')[0]}`);
  }
}

// ── runner on a phone (build a test through the API, then discard it) ──────
try {
  const r = await page.request.post(`${BASE}/api/tests`, {
    headers: { 'X-Cert': '1' },
    data: { exam: 'CCAR-F', mode: 'random', count: 3, feedback: 'practice', minutes: 10 },
  });
  if (!r.ok()) throw new Error(`POST /api/tests ${r.status()}`);
  const t = await r.json();
  await visit(`/test/${t.id}`, '.opt');
  const over = await overflow();
  if (OUT) await page.screenshot({ path: path.join(OUT, '390-runner.png'), fullPage: true });
  if (over > 1) fail(`390px runner: horizontal overflow ${over}px`);
  else ok('390px runner');
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.request.delete(`${BASE}/api/tests/${t.id}`, { headers: { 'X-Cert': '1' } });
} catch (e) {
  fail(`390px runner: ${e.message.split('\n')[0]}`);
}

// ── dark theme ──────────────────────────────────────────────────────────────
try {
  await page.setViewportSize({ width: 1280, height: 900 });
  await visit('/', '.kpi');
  await page.getByRole('button', { name: /giao diện tối/ }).click();
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if (theme !== 'dark') fail(`theme toggle: data-theme=${theme}`);
  else ok(`dark theme (${bg})`);
  if (OUT) await page.screenshot({ path: path.join(OUT, 'dark.png'), fullPage: true });
  await page.evaluate(() => localStorage.removeItem('cert.theme'));
} catch (e) {
  fail(`dark theme: ${e.message.split('\n')[0]}`);
}

// ── clean up the smoke result ───────────────────────────────────────────────
if (resultId) {
  const r = await page.request.delete(`${BASE}/api/results/${encodeURIComponent(resultId)}`, { headers: { 'X-Cert': '1' } });
  if (!r.ok()) console.warn(`! could not delete smoke result ${resultId} (HTTP ${r.status()})`);
}

await browser.close();
if (failures) {
  console.error(`\n✗ UI smoke: ${failures} lỗi`);
  process.exit(1);
}
console.log('\n✓ UI smoke: OK');
