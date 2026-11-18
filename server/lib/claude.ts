// Locating the Claude Code CLI (SPEC §7) on macOS / Linux / Windows, and killing process trees.
// Order: env CERT_CLAUDE_BIN (tests use a fake script) → config ai.claude_path → PATH → standard install locations.
import { execFile, spawn, spawnSync, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { APP_DIR, ROOT, loadConfig } from '../config.ts';

const IS_WIN = process.platform === 'win32';

export interface ClaudeStatus {
  available: boolean;
  path?: string;
  version?: string;
  error?: string;
}

function isFile(p: string): boolean {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function isExecutable(p: string): boolean {
  if (IS_WIN) return isFile(p);
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return isFile(p);
  } catch {
    return false;
  }
}

/** npm's Windows shim (claude.cmd) → the file it launches (`node_modules\@anthropic-ai\claude-code\cli.js`). */
export function shimTarget(shimText: string): string | undefined {
  for (const m of shimText.matchAll(/%~?dp0%?\\([^"%\r\n]+?\.(?:c?js|mjs|exe))/gi)) {
    if (!/(^|\\)node\.exe$/i.test(m[1])) return m[1];
  }
  return undefined;
}

const SCRIPT_RE = /\.(c?js|mjs|ts)$/i;

/** What to execute for a candidate: binaries as-is; npm `.cmd` shims resolved to their JS entry (run with node). */
export function resolveCandidate(p: string): string | undefined {
  if (/\.(cmd|bat)$/i.test(p)) {
    if (!isFile(p)) return undefined;
    const dir = path.dirname(p);
    let target: string | undefined;
    try {
      const t = shimTarget(fs.readFileSync(p, 'utf8'));
      if (t) target = path.join(dir, ...t.split('\\'));
    } catch {
      // unreadable shim → fallback below
    }
    return [target, path.join(dir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')].find((x): x is string => !!x && isFile(x));
  }
  if (SCRIPT_RE.test(p)) return isFile(p) ? p : undefined;
  return isExecutable(p) ? p : undefined;
}

/** How to spawn a resolved CLI path: JS / TS entry points run through this Node binary. Never through a shell. */
export function claudeCommand(p: string): { cmd: string; pre: string[] } {
  return SCRIPT_RE.test(p) ? { cmd: process.execPath, pre: [p] } : { cmd: p, pre: [] };
}

export function candidates(): string[] {
  const home = os.homedir();
  const out: string[] = [];
  if (process.env.CERT_CLAUDE_BIN) out.push(process.env.CERT_CLAUDE_BIN);
  const cfgPath = loadConfig().ai.claude_path.trim();
  if (cfgPath) out.push(cfgPath.replace(/^~(?=$|[\\/])/, home));
  const names = IS_WIN ? ['claude.exe', 'claude.cmd'] : ['claude'];
  for (const dir of (process.env.PATH ?? '').split(path.delimiter)) if (dir) for (const n of names) out.push(path.join(dir, n));
  const std = IS_WIN
    ? [path.join(home, '.local', 'bin', 'claude.exe'), path.join(home, '.claude', 'local', 'claude.exe'), ...(process.env.APPDATA ? [path.join(process.env.APPDATA, 'npm', 'claude.cmd')] : [])]
    : [path.join(home, '.claude', 'local', 'claude'), path.join(home, '.local', 'bin', 'claude'), '/opt/homebrew/bin/claude', '/usr/local/bin/claude'];
  out.push(...std);
  out.push(...editorBundled(home));
  return out;
}

/** The native CLI bundled with the Claude Code extension of VS Code / Cursor (newest version first) — often the only copy. */
function editorBundled(home: string): string[] {
  const bin = IS_WIN ? 'claude.exe' : 'claude';
  const found: { dir: string; ver: number[] }[] = [];
  for (const editor of ['.vscode', '.vscode-insiders', '.cursor', '.windsurf']) {
    const base = path.join(home, editor, 'extensions');
    let names: string[] = [];
    try {
      names = fs.readdirSync(base);
    } catch {
      continue;
    }
    for (const n of names) {
      const m = /^anthropic\.claude-code-(\d+)\.(\d+)\.(\d+)/.exec(n);
      if (m) found.push({ dir: path.join(base, n), ver: [Number(m[1]), Number(m[2]), Number(m[3])] });
    }
  }
  found.sort((a, b) => b.ver[0] - a.ver[0] || b.ver[1] - a.ver[1] || b.ver[2] - a.ver[2]);
  return found.map((f) => path.join(f.dir, 'resources', 'native-binary', bin));
}

const NOT_FOUND = IS_WIN
  ? 'Không tìm thấy Claude Code CLI. Cài bằng PowerShell `irm https://claude.ai/install.ps1 | iex` (hoặc `npm i -g @anthropic-ai/claude-code`), chạy `claude` một lần để đăng nhập, hoặc đặt đường dẫn ở config.yaml → ai.claude_path.'
  : 'Không tìm thấy Claude Code CLI. Cài bằng `curl -fsSL https://claude.ai/install.sh | bash` (hoặc `npm i -g @anthropic-ai/claude-code`), chạy `claude` một lần để đăng nhập, hoặc đặt đường dẫn ở config.yaml → ai.claude_path.';

function version(target: string): Promise<string | undefined> {
  const { cmd, pre } = claudeCommand(target);
  return new Promise((resolve) => {
    execFile(cmd, [...pre, '--version'], { encoding: 'utf8', timeout: 15_000, windowsHide: true }, (err, stdout) => resolve(err ? undefined : String(stdout).trim().split('\n')[0] || '?'));
  });
}

let cache: { at: number; status: ClaudeStatus; key: string } | undefined;
let detecting: Promise<ClaudeStatus> | undefined;
const TTL_MS = 60_000;

async function detect(): Promise<ClaudeStatus> {
  const tried = new Set<string>();
  for (const c of candidates()) {
    const target = resolveCandidate(c);
    if (!target || tried.has(target)) continue;
    tried.add(target);
    const v = await version(target);
    if (v) return { available: true, path: target, version: v };
  }
  return { available: false, error: NOT_FOUND };
}

/** Cached status; refreshed in the background after a minute (or when the configured path changed). */
export async function claudeStatus(fresh = false): Promise<ClaudeStatus> {
  const key = `${process.env.CERT_CLAUDE_BIN ?? ''}|${loadConfig().ai.claude_path}`;
  if (!fresh && cache && cache.key === key) {
    if (Date.now() - cache.at > TTL_MS && !detecting) void refresh(key);
    return cache.status;
  }
  return refresh(key);
}

function refresh(key: string): Promise<ClaudeStatus> {
  detecting ??= detect()
    .then((status) => {
      cache = { at: Date.now(), status, key };
      return status;
    })
    .finally(() => {
      detecting = undefined;
    });
  return detecting;
}

export function cachedClaudeStatus(): ClaudeStatus | undefined {
  return cache?.status;
}

let repoMemo: string | undefined;
/** The repo root (cwd of every AI run, so the root `.claude/skills/cert-*` load); fallback: parent of the data root. */
export function repoRoot(): string {
  if (repoMemo) return repoMemo;
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { cwd: ROOT, encoding: 'utf8', timeout: 10_000, windowsHide: true });
  const top = r.status === 0 ? r.stdout.trim() : '';
  repoMemo = top ? path.resolve(top) : path.dirname(ROOT);
  return repoMemo;
}

/** Repo-relative POSIX path of a directory ("claude-cert" inside a bigger repo, "." when the app is the repo root). */
export function relToRepo(dir: string): string {
  const rel = path.relative(repoRoot(), dir).split(path.sep).join('/');
  if (rel === '') return '.'; // the app is the repo root (standalone repo)
  return !rel.startsWith('..') && !path.isAbsolute(rel) ? rel : dir.split(path.sep).join('/');
}

/** `<rel>/<p>`, or just `<p>` when rel is the repo root ("."). */
export const inRepo = (rel: string, p: string): string => (rel === '.' ? p : `${rel}/${p}`);

export const appRel = () => relToRepo(APP_DIR);
export const dataRel = () => relToRepo(ROOT);

/** Kills a child and everything it started: process group on POSIX (spawned detached), taskkill /T on Windows. */
export function killTree(child: ChildProcess | undefined): void {
  if (!child?.pid || child.exitCode !== null) return;
  try {
    if (IS_WIN) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // already gone
    }
  }
  if (!IS_WIN) {
    const pid = child.pid;
    setTimeout(() => {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {
        // gone
      }
    }, 3000).unref();
  }
}
