// Shared test helpers: a temp copy of tests/fixtures/root, a bulk pack, HTTP requests with full header control.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE = path.join(TESTS_DIR, 'fixtures', 'root');
export const FAKE_CLAUDE = path.join(TESTS_DIR, 'fixtures', 'fake-claude.mjs');

/** Copies the fixture tree to `<tmp>/<sub>` and returns it. */
export function makeRoot(sub = 'claude-cert', base = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-test-'))): string {
  const root = path.join(base, sub);
  fs.cpSync(FIXTURE, root, { recursive: true });
  return root;
}

/** A pack with `perDomain` active questions in every domain of every exam (CCAR-F questions spread over S1..S6). */
export function writeBulkPack(root: string, perDomain = 20): number {
  const exams = (YAML.parse(fs.readFileSync(path.join(root, 'exams.yaml'), 'utf8')) as { exams: Record<string, { domains: Record<string, unknown> }> }).exams;
  const questions: unknown[] = [];
  for (const [code, e] of Object.entries(exams)) {
    for (const d of Object.keys(e.domains)) {
      for (let i = 1; i <= perDomain; i++) {
        const q: Record<string, unknown> = {
          id: `B-${code}-${d}-${String(i).padStart(2, '0')}`,
          exams: { [code]: d },
          stem: `Bulk question ${i} of ${code} ${d}: which option is correct?`,
          options: ['Option one is here', 'Option two is here', 'Option three is here', 'Option four is here'],
          answer: ['A'],
          explanation: 'Giải thích đủ dài để không bị cảnh báo: phương án một đúng vì lý do kiểm thử; các phương án khác sai.',
          ref: 'lessons/01-api.html#tong-quan',
        };
        if (code === 'CCAR-F') q.scenario = `S${(i % 6) + 1}`;
        questions.push(q);
      }
    }
  }
  fs.writeFileSync(path.join(root, 'bank', 'packs', 'bulk.yaml'), YAML.stringify({ id: 'bulk', title: 'Bulk', origin: 'manual', questions }));
  return questions.length;
}

export interface Resp {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  text: string;
}

/** HTTP request to 127.0.0.1:port. Default headers: Host localhost, X-Cert 1 on non-GET. */
export function request(port: number, method: string, p: string, opts: { body?: unknown; headers?: Record<string, string>; noCert?: boolean } = {}): Promise<Resp> {
  return new Promise((resolve, reject) => {
    const data = opts.body === undefined ? undefined : JSON.stringify(opts.body);
    const headers: Record<string, string> = { Host: `localhost:${port}`, ...(method !== 'GET' && !opts.noCert ? { 'X-Cert': '1' } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}), ...opts.headers };
    const req = http.request({ host: '127.0.0.1', port, method, path: p, headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let body: unknown = text;
        try {
          body = JSON.parse(text);
        } catch {
          // not JSON
        }
        resolve({ status: res.statusCode ?? 0, headers: res.headers, body, text });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

export async function waitFor<T>(fn: () => Promise<T | undefined> | T | undefined, ms = 10_000, step = 50): Promise<T> {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error('waitFor: timed out');
    await new Promise((r) => setTimeout(r, step));
  }
}

/** Points the server modules at `root` and starts the app on a free port (call once per test file). */
export async function startApp(root: string, env: Record<string, string> = {}) {
  process.env.CERT_ROOT = root;
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  await import('../server/routes.ts');
  const { startServer } = await import('../server/app.ts');
  return startServer({ port: 0, quiet: true, host: '127.0.0.1' });
}
