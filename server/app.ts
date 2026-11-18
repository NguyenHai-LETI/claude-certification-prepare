// The HTTP server: access gate (SPEC §5), JSON API (routes.ts), SSE /api/events, the built UI (dist/) or Vite in --dev,
// file watchers (bank / notes / results → reload + SSE). startServer() is used by server/index.ts and by the tests.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { APP_DIR, PATHS, appVersion, loadConfig } from './config.ts';
import { HttpError, RawResponse, broadcast, decodeParam, json, readBody, routes, sendRaw, sseClients, type Ctx } from './http.ts';
import { granted, isLocalRequest } from './lib/access.ts';
import { cancelAll, runningCoach, setAiHooks } from './lib/ai.ts';
import { reloadBank } from './lib/bank.ts';
import { invalidateNotes, invalidateSearch } from './lib/notes.ts';
import { allResults, loadResults } from './lib/results.ts';
import { noBuildPage, serveDist } from './lib/static.ts';
import { onSyncDone, onSyncStateChange, runSync, setSyncGuard, stopAutoSync, syncInFlight, syncState } from './lib/sync.ts';
import { runtime } from './routes.ts';

/** Routes reachable by a remote client without the access cookie. */
const PUBLIC_API = new Set(['GET /api/meta', 'GET /api/access', 'POST /api/access']);

export interface StartOptions {
  port: number;
  host?: string; // default: 0.0.0.0 when server.lan, else 127.0.0.1 (+ ::1)
  dev?: boolean;
  startupSync?: boolean;
  quiet?: boolean;
}

export interface RunningServer {
  port: number;
  server: http.Server;
  close(): Promise<void>;
}

const pending = new Set<NodeJS.Timeout>();
let closed = false;
/** Debounced call; never throws (a half-written file or a vanished root is reported and retried on the next change). */
function debounce(fn: () => void, ms: number): () => void {
  let t: NodeJS.Timeout | undefined;
  return () => {
    if (closed) return;
    if (t) {
      clearTimeout(t);
      pending.delete(t);
    }
    t = setTimeout(() => {
      pending.delete(t!);
      try {
        fn();
      } catch (e) {
        console.error(`  ⚠️ Nạp lại thất bại: ${(e as Error).message}`);
      }
    }, ms);
    pending.add(t);
  };
}

function watch(dir: string, recursive: boolean, onChange: () => void): fs.FSWatcher | undefined {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const w = fs.watch(dir, { recursive, persistent: false }, (_ev, name) => {
      const n = String(name ?? '');
      if (n.endsWith('.tmp') || path.basename(n).startsWith('.')) return;
      onChange();
    });
    w.on('error', () => undefined);
    return w;
  } catch {
    return undefined;
  }
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL) {
  const local = isLocalRequest(req);
  // CSRF guard: cross-site pages cannot set a custom header without a CORS preflight (which we never answer)
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.headers['x-cert'] !== '1') return json(res, 403, { error: 'Thiếu header X-Cert: 1 (yêu cầu bị chặn để chống CSRF)' });
  if (!PUBLIC_API.has(`${req.method} ${url.pathname}`) && !granted(req, local)) return json(res, 401, { error: 'Cần mã truy cập: nhập mã hiển thị ở trang ⚙️ Hệ thống trên máy chạy app.' });

  if (url.pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 3000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'hello', version: appVersion() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }
  for (const r of routes) {
    if (r.method !== req.method) continue;
    const m = url.pathname.match(r.re);
    if (!m) continue;
    try {
      const params = m.slice(1).map(decodeParam);
      if (params.some((p) => p.includes('/') || p.includes('\\') || p === '..' || p.includes('\0'))) throw new HttpError(400, 'Đường dẫn không hợp lệ');
      let bodyRead: Promise<unknown> | undefined;
      const ctx: Ctx = {
        req,
        url,
        params,
        local,
        body: <T>() => (bodyRead ??= readBody<T>(req)) as Promise<T>,
      };
      const out = await r.fn(ctx);
      if (out instanceof RawResponse) return sendRaw(res, out);
      return json(res, 200, out ?? { ok: true });
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      return json(res, status, { error: status === 500 ? `Lỗi máy chủ: ${(e as Error).message}` : (e as Error).message });
    }
  }
  return json(res, 404, { error: 'Không có API này' });
}

export async function startServer(opts: StartOptions): Promise<RunningServer> {
  closed = false;
  const say = (s: string) => {
    if (!opts.quiet) console.log(s);
  };
  for (const d of [PATHS.packs, PATHS.notes, PATHS.results, PATHS.plans, PATHS.runs, PATHS.active]) fs.mkdirSync(d, { recursive: true });
  const bank = reloadBank();
  loadResults();

  // ── reloads + SSE ──
  const resultIds = () => allResults().map((r) => r.id).join(',');
  let lastIds = resultIds();
  const reloadResults = (force = false) => {
    loadResults();
    const ids = resultIds();
    if (force || ids !== lastIds) broadcast({ type: 'results' });
    lastIds = ids;
  };
  const onBank = debounce(() => {
    const b = reloadBank();
    invalidateSearch();
    const errors = b.problems.filter((p) => p.level === 'error').length;
    say(`  ↻ Ngân hàng nạp lại: ${b.questions.length} câu${errors ? ` · ⚠️ ${errors} lỗi` : ''}`);
    broadcast({ type: 'bank' });
  }, 400);
  const onNotes = debounce(() => {
    invalidateNotes();
    broadcast({ type: 'notes' });
  }, 400);
  const onResults = debounce(() => reloadResults(), 600);
  const watchers = [watch(PATHS.packs, false, onBank), watch(PATHS.notes, true, onNotes), watch(PATHS.results, true, onResults)];

  onSyncDone((o) => {
    const dataRel = path.relative(path.dirname(PATHS.root), PATHS.root).split(path.sep).join('/');
    const touched = (dir: string) => o.changed.some((f) => f.includes(`${dir}/`) || f.startsWith(`${dataRel}/${dir}/`));
    if (touched('bank')) onBank();
    if (touched('notes')) onNotes();
    if (o.received) reloadResults(touched('results'));
    void syncState().then((state) => broadcast({ type: 'sync', state }));
  });
  onSyncStateChange(() => {
    void syncState().then((state) => broadcast({ type: 'sync', state }));
  });
  setSyncGuard(() => {
    const c = runningCoach();
    return c ? `AI Coach đang chạy (“${c.title}”) — đợi lượt chạy xong rồi đồng bộ, để không commit file đang ghi dở.` : undefined;
  });
  setAiHooks({
    syncBefore: async () => {
      if (!loadConfig().ai.sync_before || !loadConfig().sync.enabled) return '';
      const o = await runSync({ source: 'ai' });
      return `⇅ Đồng bộ trước khi chạy: ${o.message}`;
    },
    afterCoach: async (ok) => {
      onBank();
      const cfg = loadConfig();
      if (!ok || !cfg.ai.sync_after || !cfg.sync.enabled) return undefined;
      await new Promise((r) => setTimeout(r, 500)); // let the bank reload settle
      const o = await runSync({ source: 'ai' });
      return `⇅ Đồng bộ sau khi chạy: ${o.message}`;
    },
  });

  // ── HTTP ──
  const server = http.createServer();
  let vite: { middlewares: (req: http.IncomingMessage, res: http.ServerResponse, next?: () => void) => void; close(): Promise<void> } | undefined;
  if (opts.dev) {
    const { createServer } = await import('vite');
    const cfgFile = path.join(APP_DIR, 'vite.config.ts');
    vite = await createServer({
      root: APP_DIR,
      configFile: fs.existsSync(cfgFile) ? cfgFile : false,
      appType: 'spa',
      logLevel: 'warn',
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: loadConfig().server.public_hosts,
        fs: { deny: ['.env', '.env.*', '**/.local/**', '**/.git/**', '**/results/**', '**/coach/**'] },
        watch: { ignored: ['**/bank/**', '**/results/**', '**/coach/**', '**/notes/**', '**/.local/**', '**/dist/**', '**/node_modules/**'] },
      },
    });
  }
  const handle = async (req: http.IncomingMessage, res: http.ServerResponse) => {
    let url: URL;
    try {
      url = new URL(req.url ?? '/', 'http://localhost');
    } catch {
      return json(res, 400, { error: 'Yêu cầu không hợp lệ' });
    }
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Method not allowed');
    }
    if (vite) {
      // Vite's SPA fallback skips paths with an extension: client routes like /notes/exams/CCAR-F.md get index.html too
      if (url.pathname.startsWith('/notes/') && String(req.headers.accept ?? '').includes('text/html')) req.url = '/';
      return vite.middlewares(req, res);
    }
    if (!serveDist(req, res, url)) noBuildPage(res);
  };
  server.on('request', (req, res) => {
    handle(req, res).catch((e) => {
      console.error(e);
      if (!res.headersSent) json(res, 500, { error: String(e) });
    });
  });
  server.on('clientError', (_e, socket) => {
    try {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    } catch {
      // gone
    }
  });

  // env CERT_HOST: cloud deploy binds 0.0.0.0 (every request then comes through the host's proxy = remote, needs the code)
  const host = opts.host ?? (process.env.CERT_HOST || (loadConfig().server.lan ? '0.0.0.0' : '127.0.0.1'));
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(opts.port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });
  const port = (server.address() as { port: number }).port;
  runtime.port = port;
  // ngrok and browsers may resolve "localhost" to ::1 first: answer there too when bound to IPv4 loopback only
  let v6: http.Server | undefined;
  if (host === '127.0.0.1') {
    const s = http.createServer((req, res) => server.emit('request', req, res));
    s.on('upgrade', (req, socket, head) => server.emit('upgrade', req, socket, head));
    await new Promise<void>((resolve) => {
      s.once('error', () => resolve());
      s.listen(port, '::1', () => {
        v6 = s;
        resolve();
      });
    });
  }

  const ping = setInterval(() => {
    for (const c of sseClients) c.write(': ping\n\n');
  }, 25_000);
  ping.unref();

  const errors = bank.problems.filter((p) => p.level === 'error').length;
  const warnings = bank.problems.length - errors;
  say(`\n  🎓 Claude Cert → http://localhost:${port}`);
  say(`     Ngân hàng: ${bank.questions.length} câu / ${bank.packs.length} pack${errors || warnings ? ` · ${errors} lỗi, ${warnings} cảnh báo (npm run validate)` : ''} · Kết quả: ${allResults().length} bài`);
  if (opts.dev) say('     Chế độ dev: giao diện qua Vite (HMR)');
  else if (!fs.existsSync(path.join(PATHS.dist, 'index.html'))) say('     ⚠️ Chưa build giao diện — chạy npm run build (hoặc npm start để tự build)');

  // pull once at startup (sync.auto: idle) — in the background, the app is usable meanwhile
  const cfg = loadConfig();
  if (opts.startupSync && cfg.sync.enabled && cfg.sync.auto === 'idle') {
    void runSync({ source: 'startup' }).then((o) => say(`  ⇅ Đồng bộ khi mở app: ${o.message}${o.hint ? ` ${o.hint}` : ''}`));
  }

  return {
    port,
    server,
    async close() {
      closed = true;
      clearInterval(ping);
      for (const t of pending) clearTimeout(t);
      pending.clear();
      stopAutoSync();
      cancelAll();
      for (const w of watchers) w?.close();
      for (const c of sseClients) c.end();
      sseClients.clear();
      const inflight = syncInFlight();
      if (inflight) await Promise.race([inflight.catch(() => undefined), new Promise((r) => setTimeout(r, 10_000))]);
      await vite?.close();
      v6?.close();
      server.closeAllConnections?.();
      await new Promise<void>((r) => server.close(() => r()));
    },
  };
}

