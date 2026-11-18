// npm start = node scripts/run.ts [--open] — the supervisor (SPEC §9): builds dist/ when missing or older than the UI
// sources, runs server/index.ts with CERT_SUPERVISED=1, starts it again on exit code 75 (⚙️ restart button) or after a
// crash (back-off 1 s → 30 s; gives up after 8 quick crashes in a row). Writes .local/run.pid. Also used by public.ts.
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_DIR, PATHS, configuredPort } from '../server/config.ts';

export const RESTART_EXIT_CODE = 75;
const IS_WIN = process.platform === 'win32';
const stamp = () => new Date().toTimeString().slice(0, 8);
const log = (s: string) => console.log(`[${stamp()}] ${s}`);

// ── dist/ freshness ─────────────────────────────────────────────────────────

function newest(p: string): number {
  let st: fs.Stats;
  try {
    st = fs.statSync(p);
  } catch {
    return 0;
  }
  if (!st.isDirectory()) return st.mtimeMs;
  let m = 0;
  for (const e of fs.readdirSync(p)) if (!e.startsWith('.') && e !== 'node_modules') m = Math.max(m, newest(path.join(p, e)));
  return m;
}

/** Why dist/ must be (re)built, or undefined when it is fresh. */
export function buildReason(appDir = APP_DIR): string | undefined {
  if (!fs.existsSync(path.join(appDir, 'index.html'))) return undefined; // no UI sources (yet): nothing to build
  const built = newest(path.join(appDir, 'dist', 'index.html'));
  if (!built) return 'chưa có dist/';
  const src = Math.max(...['index.html', 'vite.config.ts', 'web', 'shared', 'package-lock.json'].map((p) => newest(path.join(appDir, p))));
  return src > built ? 'mã giao diện mới hơn bản build' : undefined;
}

export function buildUi(appDir = APP_DIR): boolean {
  const reason = buildReason(appDir);
  if (!reason) return true;
  const vite = path.join(appDir, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!fs.existsSync(vite)) {
    log('✗ Thiếu thư viện (node_modules) — chạy `npm install` trong thư mục app rồi mở lại.');
    return false;
  }
  log(`→ Build giao diện (${reason})…`);
  const r = spawnSync(process.execPath, [vite, 'build'], { cwd: appDir, stdio: 'inherit', windowsHide: true });
  if (r.status !== 0) {
    log('⚠️ Build giao diện lỗi — app vẫn chạy với bản build cũ (nếu có). Xem lỗi ở trên hoặc chạy `npm run build`.');
    return false;
  }
  return true;
}

// ── supervisor ──────────────────────────────────────────────────────────────

export function killTree(child: ChildProcess | undefined, graceful = true): void {
  if (!child?.pid || child.exitCode !== null) return;
  try {
    if (IS_WIN) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill(graceful ? 'SIGTERM' : 'SIGKILL');
  } catch {
    // already gone
  }
}

export interface SupervisorOptions {
  args?: string[]; // extra args for server/index.ts
  env?: NodeJS.ProcessEnv;
  maxQuickCrashes?: number;
}

export class Supervisor {
  child?: ChildProcess;
  stopping = false;
  private restartNow?: () => void;
  private opts: SupervisorOptions;
  constructor(opts: SupervisorOptions = {}) {
    this.opts = opts;
  }

  /** Runs until stop() or the server exits 0 / gives up. Resolves with the exit code for this process. */
  async run(): Promise<number> {
    let backoff = 1000;
    let quick = 0;
    for (;;) {
      if (this.stopping) return 0;
      buildUi();
      const started = Date.now();
      log('▶ Khởi động server');
      const code = await new Promise<number>((resolve) => {
        const child = spawn(process.execPath, [path.join(APP_DIR, 'server', 'index.ts'), ...(this.opts.args ?? [])], {
          cwd: APP_DIR,
          env: { ...process.env, ...this.opts.env, CERT_SUPERVISED: '1' },
          stdio: 'inherit',
          windowsHide: true,
        });
        this.child = child;
        child.on('exit', (c, sig) => resolve(c ?? (sig ? 143 : 0)));
        child.on('error', (e) => {
          log(`✗ Không chạy được server: ${e.message}`);
          resolve(1);
        });
      });
      this.child = undefined;
      if (this.stopping) return 0;
      if (this.restartNow) {
        this.restartNow = undefined;
        continue;
      }
      if (code === 0) {
        log('■ Server đã dừng.');
        return 0;
      }
      if (code === RESTART_EXIT_CODE) {
        log('↻ Khởi động lại theo yêu cầu');
        backoff = 1000;
        continue;
      }
      const ran = Date.now() - started;
      quick = ran < 30_000 ? quick + 1 : 0;
      if (ran > 60_000) backoff = 1000;
      if (quick >= (this.opts.maxQuickCrashes ?? 8)) {
        log(`✗ Server dừng lỗi ${quick} lần liên tiếp ngay sau khi chạy (mã ${code}) — bỏ cuộc. Xem lỗi ở trên.`);
        return 1;
      }
      log(`⚠️ Server dừng bất thường (mã ${code}) — chạy lại sau ${Math.round(backoff / 1000)} giây`);
      await new Promise((r) => setTimeout(r, backoff));
      backoff = Math.min(30_000, backoff * 2);
    }
  }

  /** Restart the server at once (no back-off). */
  restart(): void {
    if (!this.child) return;
    this.restartNow = () => undefined;
    killTree(this.child);
  }

  stop(): Promise<void> {
    this.stopping = true;
    const c = this.child;
    if (!c || c.exitCode !== null) return Promise.resolve();
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        killTree(c, false);
        resolve();
      }, 15_000);
      c.once('exit', () => {
        clearTimeout(t);
        resolve();
      });
      killTree(c);
    });
  }
}

/** The app already answers on this port (another run.ts, npm run server, …). */
export async function appAnswers(port: number): Promise<boolean> {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/api/meta`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch {
    return false;
  }
}

export function openBrowser(url: string): void {
  const cmd = process.platform === 'darwin' ? 'open' : IS_WIN ? 'cmd' : 'xdg-open';
  const args = IS_WIN ? ['/c', 'start', '', url] : [url];
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true, windowsHide: true }).unref();
  } catch {
    // no launcher: the URL is printed anyway
  }
}

export function writePid(name: string): () => void {
  const file = path.join(PATHS.local, `${name}.pid`);
  try {
    fs.mkdirSync(PATHS.local, { recursive: true });
    fs.writeFileSync(file, String(process.pid));
  } catch {
    // not critical
  }
  return () => {
    try {
      if (fs.readFileSync(file, 'utf8').trim() === String(process.pid)) fs.rmSync(file, { force: true });
    } catch {
      // gone
    }
  };
}

/** Ctrl+C / window closed / kill → stop the supervisor (and its server) once. */
export function onStopSignals(fn: () => void): void {
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK'] as const) process.on(sig, fn);
}

async function main() {
  const port = configuredPort();
  const url = `http://localhost:${port}`;
  if (await appAnswers(port)) {
    log(`✓ App đã chạy sẵn → ${url}`);
    if (process.argv.includes('--open')) openBrowser(url);
    return 0;
  }
  const removePid = writePid('run');
  const sup = new Supervisor({ args: process.argv.includes('--dev') ? ['--dev'] : [] });
  let stopping = false;
  onStopSignals(() => {
    if (stopping) process.exit(0);
    stopping = true;
    log('■ Đang dừng…');
    void sup.stop().then(() => {
      removePid();
      process.exit(0);
    });
  });
  if (process.argv.includes('--open')) {
    void (async () => {
      for (let i = 0; i < 120 && !(await appAnswers(port)); i++) await new Promise((r) => setTimeout(r, 1000));
      openBrowser(url);
    })();
  }
  const code = await sup.run();
  removePid();
  return code;
}

const norm = (p: string) => (process.platform === 'win32' ? path.resolve(p).toLowerCase() : path.resolve(p));
if (process.argv[1] && norm(process.argv[1]) === norm(fileURLToPath(import.meta.url))) {
  main().then(
    (code) => process.exit(code),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}
