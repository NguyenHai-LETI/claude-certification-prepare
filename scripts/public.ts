// npm run public = node scripts/public.ts — the app (supervisor of run.ts) + an ngrok tunnel on the fixed domain, with a
// watchdog (SPEC §9). Every public.check_seconds it GETs https://<domain>/api/meta (header ngrok-skip-browser-warning);
// not 200 → restart ngrok (and the app when the local check fails too). Writes .local/public.json {url, ok, checkedAt,
// error} and .local/{public,ngrok}.pid; ngrok's own log goes to .local/ngrok.log. Detects "endpoint already online"
// (ERR_NGROK_334: another machine / app holds the domain) and says so instead of hammering ngrok.
// macOS + Windows: processes are spawned without a shell (shell: false) and killed as a tree (taskkill /T on Windows).
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS, configuredPort, loadConfig } from '../server/config.ts';
import { Supervisor, appAnswers, killTree, onStopSignals, writePid } from './run.ts';

const IS_WIN = process.platform === 'win32';
const stamp = () => new Date().toTimeString().slice(0, 8);
const log = (s: string) => console.log(`[${stamp()}] [public] ${s}`);

// ── pure helpers (tested) ───────────────────────────────────────────────────

/** `ngrok http <port> --url=https://<domain>` (+ logfmt to stdout so errors can be read). `legacy` = ngrok < 3.16 (--domain). */
export function ngrokArgs(port: number, domain: string, legacy = false): string[] {
  const d = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  return ['http', String(port), legacy ? `--domain=${d}` : `--url=https://${d}`, '--log=stdout', '--log-format=logfmt'];
}

export type NgrokProblem = { kind: 'already-online' | 'auth' | 'old-version' | 'limit' | 'other'; code?: string; message: string };

/** Classifies ngrok output / log text. undefined = nothing wrong found. */
export function detectNgrokProblem(text: string): NgrokProblem | undefined {
  const code = text.match(/ERR_NGROK_\d+/)?.[0];
  if (/ERR_NGROK_334\b|is already online|endpoint .* already (online|in use)|already bound to another tunnel session/i.test(text)) {
    return {
      kind: 'already-online',
      code: code ?? 'ERR_NGROK_334',
      message:
        'Tên miền ngrok đang được giữ ở nơi khác (ERR_NGROK_334 — endpoint already online): một máy khác, hoặc app trainer AWS, đang mở tunnel cùng tên miền. ' +
        'Chỉ một máy được chạy chế độ công khai mỗi lúc — dừng tunnel ở đó rồi đợi ~1 phút; watchdog sẽ tự thử lại.',
    };
  }
  if (/ERR_NGROK_(4018|105|107)\b/.test(text) || (/authtoken|authentication/i.test(text) && /lvl=(eror|crit)|ERROR:|failed|invalid|required/i.test(text))) {
    return { kind: 'auth', code, message: 'ngrok chưa đăng nhập / authtoken sai: chạy `ngrok config add-authtoken <token>` (lấy token ở dashboard.ngrok.com) rồi chạy lại.' };
  }
  if (/unknown flag: --url|flag provided but not defined: -url/i.test(text)) {
    return { kind: 'old-version', message: 'Bản ngrok cũ không biết cờ --url — dùng --domain (nên cập nhật ngrok: `ngrok update`).' };
  }
  if (/ERR_NGROK_(108|702|703|725)\b|limited to \d+ simultaneous|session limit/i.test(text)) {
    return { kind: 'limit', code, message: `Tài khoản ngrok chạm giới hạn phiên${code ? ` (${code})` : ''} — có thể một agent ngrok khác đang chạy cùng tài khoản.` };
  }
  if (code || /\blvl=(eror|crit)\b/.test(text)) {
    const msg = text.match(/\berr="([^"]+)"/)?.[1] ?? text.trim().split('\n').pop() ?? '';
    return { kind: 'other', code, message: `ngrok báo lỗi${code ? ` ${code}` : ''}: ${msg.slice(0, 300)}` };
  }
  return undefined;
}

export interface PublicStatus {
  url: string;
  ok: boolean;
  checkedAt: string;
  error?: string;
}

export function publicStatus(domain: string, ok: boolean, error?: string, now = new Date()): PublicStatus {
  return { url: `https://${domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`, ok, checkedAt: now.toISOString(), ...(ok || !error ? {} : { error }) };
}

/** How long to wait before starting ngrok again after it exited / was found broken. */
export function ngrokRetryMs(problem: NgrokProblem | undefined, checkSeconds: number): number {
  if (problem?.kind === 'already-online' || problem?.kind === 'limit') return Math.max(60_000, checkSeconds * 1000);
  if (problem?.kind === 'auth') return 5 * 60_000;
  return 5_000;
}

// ── ngrok binary ────────────────────────────────────────────────────────────

/** env CERT_NGROK_BIN, else ngrok(.exe/.cmd) on PATH, else the usual install folders. */
export function findNgrok(): string | undefined {
  const cands: string[] = [];
  if (process.env.CERT_NGROK_BIN) cands.push(process.env.CERT_NGROK_BIN);
  const names = IS_WIN ? ['ngrok.exe', 'ngrok.cmd'] : ['ngrok'];
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) if (dir) for (const n of names) cands.push(path.join(dir, n));
  if (IS_WIN) {
    const local = process.env.LOCALAPPDATA ?? '';
    cands.push(path.join(local, 'Microsoft', 'WinGet', 'Links', 'ngrok.exe'), path.join(local, 'ngrok', 'ngrok.exe'), 'C:\\ProgramData\\chocolatey\\bin\\ngrok.exe');
  } else cands.push('/opt/homebrew/bin/ngrok', '/usr/local/bin/ngrok', '/snap/bin/ngrok');
  return cands.find((p) => {
    try {
      return fs.statSync(p).isFile();
    } catch {
      return false;
    }
  });
}

function spawnNgrok(bin: string, args: string[]): ChildProcess {
  // npm's ngrok.cmd shim needs cmd.exe; the arguments are fixed (port number, domain from config) — no user input.
  if (IS_WIN && /\.cmd$/i.test(bin)) return spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', bin, ...args], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: false });
  return spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: false });
}

async function get(url: string, headers: Record<string, string> = {}): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15_000), redirect: 'manual' });
    const body = await r.text().catch(() => '');
    const ngrokErr = body.match(/ERR_NGROK_\d+/)?.[0];
    const ok = r.status === 200 && !ngrokErr && body.trimStart().startsWith('{');
    return { ok, status: r.status, ...(ok ? {} : { error: ngrokErr ? `${ngrokErr} (HTTP ${r.status})` : `HTTP ${r.status}` }) };
  } catch (e) {
    return { ok: false, status: 0, error: (e as Error).message };
  }
}

// ── watchdog ────────────────────────────────────────────────────────────────

async function main(): Promise<number> {
  const cfg = loadConfig();
  const port = configuredPort();
  const domain = cfg.public.ngrok_domain.trim();
  const checkMs = Math.max(15, cfg.public.check_seconds || 60) * 1000;
  if (!domain) {
    log('✗ Chưa cấu hình tên miền: config.yaml → public.ngrok_domain');
    return 1;
  }
  const bin = findNgrok();
  if (!bin) {
    log(`✗ Không tìm thấy ngrok. Cài: ${IS_WIN ? '`winget install ngrok.ngrok` (hoặc `npm i -g ngrok`)' : '`brew install ngrok`'}, rồi \`ngrok config add-authtoken <token>\`.`);
    return 1;
  }
  const ver = spawnSync(bin, ['version'], { encoding: 'utf8', windowsHide: true, shell: IS_WIN && /\.cmd$/i.test(bin) });
  log(`ngrok: ${bin} (${(ver.stdout || ver.stderr || '?').trim().split('\n')[0]})`);

  const statusFile = path.join(PATHS.local, 'public.json');
  const ngrokLog = path.join(PATHS.local, 'ngrok.log');
  fs.mkdirSync(PATHS.local, { recursive: true });
  const writeStatus = (s: PublicStatus) => {
    try {
      fs.writeFileSync(statusFile, JSON.stringify(s, null, 2));
    } catch {
      // not critical
    }
  };
  const removePid = writePid('public');
  const ngrokPidFile = path.join(PATHS.local, 'ngrok.pid');

  // the app: our own supervisor unless one already answers (then we cannot restart it, only watch)
  let sup: Supervisor | undefined;
  let supDone: Promise<number> | undefined;
  if (await appAnswers(port)) log(`App đã chạy sẵn ở cổng ${port} — dùng app đó (watchdog không khởi động lại được app này).`);
  else {
    sup = new Supervisor();
    supDone = sup.run();
  }

  let ngrok: ChildProcess | undefined;
  let problem: NgrokProblem | undefined;
  let legacy = false;
  let stopping = false;
  let nextNgrokAt = 0;
  let lastLogged = '';

  const appendLog = (text: string) => {
    try {
      if (fs.existsSync(ngrokLog) && fs.statSync(ngrokLog).size > 2_000_000) fs.renameSync(ngrokLog, `${ngrokLog}.1`);
      fs.appendFileSync(ngrokLog, text);
    } catch {
      // not critical
    }
  };
  const startNgrok = () => {
    if (stopping || ngrok) return;
    const args = ngrokArgs(port, domain, legacy);
    log(`▶ ngrok ${args.slice(0, 3).join(' ')}`);
    problem = undefined;
    const child = spawnNgrok(bin, args);
    ngrok = child;
    try {
      fs.writeFileSync(ngrokPidFile, String(child.pid ?? ''));
    } catch {
      // not critical
    }
    const onData = (c: Buffer) => {
      const text = c.toString('utf8');
      appendLog(text);
      const p = detectNgrokProblem(text);
      if (p) {
        problem = p;
        if (p.kind === 'old-version') legacy = true;
        if (p.message !== lastLogged) log(`⚠️ ${p.message}`);
        lastLogged = p.message;
        writeStatus(publicStatus(domain, false, p.message));
      } else if (/msg="started tunnel"|url=https:\/\//.test(text)) {
        if (lastLogged !== 'started') log(`✓ Tunnel: https://${domain} → http://localhost:${port}`);
        lastLogged = 'started';
      }
    };
    child.stdout!.on('data', onData);
    child.stderr!.on('data', onData);
    child.on('error', (e) => {
      problem = { kind: 'other', message: `Không chạy được ngrok: ${e.message}` };
      log(`✗ ${problem.message}`);
    });
    child.on('exit', (code) => {
      if (ngrok === child) ngrok = undefined;
      if (stopping) return;
      const wait = ngrokRetryMs(problem, checkMs / 1000);
      nextNgrokAt = Date.now() + wait;
      log(`ngrok thoát (mã ${code ?? '?'})${problem ? ` — ${problem.kind}` : ''}; thử lại sau ${Math.round(wait / 1000)} giây`);
      if (problem?.kind === 'old-version') nextNgrokAt = Date.now() + 1000;
    });
  };
  const restartNgrok = () => {
    const c = ngrok;
    ngrok = undefined;
    killTree(c, false);
    nextNgrokAt = Date.now() + 2000;
  };

  // wait for the app (first build can take a while), then the tunnel
  for (let i = 0; i < 180 && !stopping && !(await appAnswers(port)); i++) await new Promise((r) => setTimeout(r, 1000));
  startNgrok();

  let localFails = 0;
  let publicFails = 0;
  const check = async () => {
    if (stopping) return;
    if (!ngrok && Date.now() >= nextNgrokAt) startNgrok();
    const local = await get(`http://127.0.0.1:${port}/api/meta`);
    if (!local.ok) {
      localFails++;
      log(`⚠️ App không trả lời ở cổng ${port} (${local.error}) — lần ${localFails}`);
      writeStatus(publicStatus(domain, false, `App local không trả lời: ${local.error}`));
      if (localFails >= 2 && sup && !sup.stopping) {
        log('↻ Khởi động lại app');
        sup.restart();
        localFails = 0;
      }
      return;
    }
    localFails = 0;
    const pub = await get(`https://${domain}/api/meta`, { 'ngrok-skip-browser-warning': '1', 'User-Agent': 'claude-cert-watchdog' });
    if (pub.ok) {
      if (publicFails) log(`✓ Công khai OK lại: https://${domain}`);
      publicFails = 0;
      writeStatus(publicStatus(domain, true));
      return;
    }
    publicFails++;
    const why = problem && problem.kind !== 'other' ? problem.message : `https://${domain}/api/meta → ${pub.error}`;
    log(`⚠️ URL công khai lỗi (lần ${publicFails}): ${why}`);
    writeStatus(publicStatus(domain, false, why));
    if (ngrok && (problem?.kind === 'already-online' || problem?.kind === 'auth' || problem?.kind === 'limit')) return; // ngrok will exit; retry is scheduled
    if (ngrok && publicFails >= 2) {
      log('↻ Khởi động lại ngrok');
      restartNgrok();
      publicFails = 0;
    }
  };
  const first = setTimeout(() => void check(), 15_000);
  const timer = setInterval(() => void check(), checkMs);

  return new Promise<number>((resolve) => {
    const stop = async (code = 0) => {
      if (stopping) process.exit(code);
      stopping = true;
      clearTimeout(first);
      clearInterval(timer);
      log('■ Đang dừng (ngrok + app)…');
      killTree(ngrok, false);
      await sup?.stop();
      writeStatus(publicStatus(domain, false, 'Đã dừng chế độ công khai'));
      for (const f of [ngrokPidFile]) fs.rmSync(f, { force: true });
      removePid();
      resolve(code);
    };
    onStopSignals(() => void stop(0));
    void supDone?.then((code) => {
      if (!stopping) {
        log(`App dừng hẳn (mã ${code}) — dừng luôn tunnel.`);
        void stop(code);
      }
    });
  });
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
