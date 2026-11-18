// Git sync of the learner data (SPEC §8): commit data_paths → pull --rebase → push. Serialised, never force-pushes, never
// stages anything outside sync.data_paths. Unattended runs (auto / startup / ai) never stash the learner's other edits:
// with tracked changes outside the data paths they skip the pull, and they never push local commits that touch code.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PATHS, ROOT, loadConfig } from '../config.ts';
import type { SyncState } from '../../shared/types.ts';
import { dataRel, inRepo } from './claude.ts';

export type SyncSource = 'manual' | 'auto' | 'startup' | 'ai' | 'cli';

export interface SyncOptions {
  repoDir?: string; // default: the git top level of the data root
  dataPaths?: string[]; // repo-relative, default configuredDataPaths()
  host?: string;
  source?: SyncSource;
  now?: Date;
  timeoutMs?: number;
}

export interface SyncOutcome {
  ok: boolean;
  result: 'ok' | 'error' | 'nothing';
  message: string;
  committed: number; // files committed
  received: number; // commits pulled
  pushed: number; // commits pushed
  changed: string[]; // repo-relative files changed by the pull
  hint?: string;
  steps: { cmd: string; ok: boolean; output: string }[];
}

interface GitRun {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  error?: string;
}

/** Environment that makes every credential / editor prompt fail fast instead of waiting for input. */
export function gitEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return {
    ...base,
    GIT_TERMINAL_PROMPT: '0',
    GIT_ASKPASS: '',
    SSH_ASKPASS_REQUIRE: 'never',
    GCM_INTERACTIVE: 'never',
    GIT_EDITOR: ':',
    GIT_SEQUENCE_EDITOR: ':',
    GIT_MERGE_AUTOEDIT: 'no',
    GIT_OPTIONAL_LOCKS: '0',
    LC_ALL: 'C',
  };
}

export function runGit(args: string[], cwd: string, timeoutMs = 60_000): Promise<GitRun> {
  return new Promise((resolve) => {
    let out = '';
    let err = '';
    let timedOut = false;
    let done = false;
    const finish = (r: Pick<GitRun, 'code' | 'error'>) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ...r, stdout: out, stderr: err, timedOut });
    };
    const cfg = ['-c', 'core.quotepath=off', '-c', 'commit.gpgsign=false', '-c', 'http.lowSpeedLimit=1000', '-c', 'http.lowSpeedTime=60'];
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn('git', [...cfg, ...args], { cwd, env: gitEnv(), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, detached: process.platform !== 'win32' });
    } catch (e) {
      resolve({ code: null, stdout: '', stderr: '', timedOut: false, error: (e as Error).message });
      return;
    }
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
        else process.kill(-(child.pid ?? 0), 'SIGKILL');
      } catch {
        child.kill('SIGKILL');
      }
    }, timeoutMs);
    child.stdout!.on('data', (c: Buffer) => (out = (out + c.toString('utf8')).slice(-200_000)));
    child.stderr!.on('data', (c: Buffer) => (err = (err + c.toString('utf8')).slice(-200_000)));
    child.on('error', (e) => finish({ code: null, error: e.message }));
    child.on('close', (code) => finish({ code }));
  });
}

/** Hide credentials embedded in URLs (https://user:token@host). */
export function redact(text: string): string {
  return text.replace(/(\b[a-z][a-z0-9+.-]*:\/\/)[^\s/@'"]+@/gi, '$1***@');
}

/** Vietnamese advice for a failed git command. */
export function explainGitError(o: string, timedOut = false): string | undefined {
  if (timedOut) return 'Lệnh git chạy quá lâu nên đã bị dừng — mạng chậm, hoặc git đang chờ đăng nhập. Thử lại; nếu vẫn treo, chạy `git pull` trong Terminal để xem git hỏi gì.';
  if (/ENOENT|spawn git/i.test(o)) return 'Không tìm thấy lệnh git. Cài Git (macOS: `xcode-select --install`, Windows: https://git-scm.com) rồi mở lại app.';
  if (/not a git repository/i.test(o)) return 'Thư mục này không phải repo git (có thể bạn tải bản .zip) — `git clone` repo để đồng bộ được.';
  if (/index\.lock|Unable to create '.*\.lock'/i.test(o)) return 'Một lệnh git khác đang chạy (có thể app trainer AWS đang đồng bộ). Đợi vài giây rồi thử lại.';
  if (/could not read (Username|Password)|terminal prompts disabled|Authentication failed|Invalid username or (password|token)|returned error: 40[13]|Permission to \S+ denied/i.test(o)) {
    return 'Git cần đăng nhập GitHub (app không hỏi mật khẩu để khỏi bị treo). Mở Terminal, chạy `git pull` một lần trong repo và đăng nhập / dán Personal Access Token để máy lưu lại.';
  }
  if (/Repository not found/i.test(o)) return 'GitHub báo không tìm thấy repo — sai URL remote hoặc tài khoản trên máy này không có quyền.';
  if (/Permission denied \(publickey\)|Host key verification failed/i.test(o)) return 'SSH bị từ chối — kiểm tra SSH key đã thêm vào GitHub, hoặc đổi remote sang HTTPS.';
  if (/Could not resolve host|Failed to connect|Couldn't connect|Connection refused|timed out|Network is unreachable|Could not read from remote|unable to access/i.test(o)) return 'Không kết nối được tới GitHub — kiểm tra mạng rồi thử lại.';
  if (/Please tell me who you are|Author identity unknown/i.test(o)) return 'Git chưa biết tên/email của bạn: chạy `git config --global user.name "Tên"` và `git config --global user.email "email@example.com"`.';
  if (/\[rejected\]|non-fast-forward|fetch first|failed to push/i.test(o)) return 'Máy kia vừa đẩy dữ liệu mới trong lúc đồng bộ — bấm Đồng bộ lại.';
  if (/would be overwritten/i.test(o)) return 'Có file chưa commit trùng với file máy kia gửi về — đổi tên / chuyển chúng đi rồi đồng bộ lại.';
  return undefined;
}

/** config sync.data_paths are relative to the app's data root; turn them repo-relative (an already-prefixed path is kept). */
export function configuredDataPaths(): string[] {
  const rel = dataRel();
  return loadConfig().sync.data_paths.map((p) => {
    const n = p.trim().replace(/\\/g, '/').replace(/^\.\//, '');
    return rel === '.' || n === rel || n.startsWith(rel + '/') ? n : inRepo(rel, n);
  });
}

export function normalizePaths(paths: string[]): string[] {
  return paths.map((p) => p.trim().replace(/\\/g, '/').replace(/\/+$/, '')).filter((p) => p && !p.split('/').includes('..'));
}

export function inDataPaths(file: string, dataPaths: string[]): boolean {
  return dataPaths.some((p) => file === p || file.startsWith(p + '/'));
}

function parsePorcelain(z: string): string[] {
  const parts = z.split('\0');
  const files: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i];
    if (e.length < 4) continue;
    files.push(e.slice(3));
    if (e[0] === 'R' || e[0] === 'C') i++;
  }
  return files;
}

const fmtStamp = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const listed = (files: string[], max = 5) => files.slice(0, max).join(', ') + (files.length > max ? `, … (+${files.length - max})` : '');

// ── guards & state ──────────────────────────────────────────────────────────

let guard: (() => string | undefined) | undefined;
/** A reason to refuse non-AI syncs right now (e.g. an AI Coach run writing the bank). */
export function setSyncGuard(fn: () => string | undefined) {
  guard = fn;
}

interface Persisted {
  lastSync?: string;
  lastResult?: SyncState['lastResult'];
  lastMessage?: string;
}
let persisted: Persisted | undefined;
const stateFile = () => path.join(PATHS.local, 'sync.json');

function lastRun(): Persisted {
  if (persisted) return persisted;
  try {
    persisted = JSON.parse(fs.readFileSync(stateFile(), 'utf8')) as Persisted;
  } catch {
    persisted = {};
  }
  return persisted;
}

function remember(o: SyncOutcome) {
  persisted = { lastSync: new Date().toISOString(), lastResult: o.result, lastMessage: o.hint ? `${o.message} ${o.hint}` : o.message };
  try {
    fs.mkdirSync(PATHS.local, { recursive: true });
    fs.writeFileSync(stateFile(), JSON.stringify(persisted, null, 2));
  } catch {
    // not critical
  }
}

const listeners = new Set<(o: SyncOutcome, source: SyncSource) => void>();
export function onSyncDone(fn: (o: SyncOutcome, source: SyncSource) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
const stateListeners = new Set<() => void>();
/** Called when `running` / autoAt changed (the server broadcasts the state). */
export function onSyncStateChange(fn: () => void) {
  stateListeners.add(fn);
}
const changedState = () => {
  for (const f of stateListeners) f();
};

let running: Promise<SyncOutcome> | undefined;
export const isSyncing = () => !!running;
export const syncInFlight = () => running;

let repoMemo: string | null | undefined;
async function repoTop(dir = ROOT): Promise<string | undefined> {
  if (dir === ROOT && repoMemo !== undefined) return repoMemo ?? undefined;
  const r = await runGit(['rev-parse', '--show-toplevel'], dir, 10_000);
  const top = r.code === 0 ? path.resolve(r.stdout.trim()) : undefined;
  if (dir === ROOT) repoMemo = top ?? null;
  return top;
}

/** Serialised: a call while a sync runs returns the running one. */
export function runSync(opts: SyncOptions = {}): Promise<SyncOutcome> {
  if (running) return running;
  running = doSync(opts)
    .catch(
      (e: Error): SyncOutcome => ({ ok: false, result: 'error', message: `Đồng bộ lỗi: ${e.message}`, committed: 0, received: 0, pushed: 0, changed: [], steps: [] }),
    )
    .then((o) => {
      remember(o);
      for (const f of listeners) {
        try {
          f(o, opts.source ?? 'manual');
        } catch (e) {
          console.error(e);
        }
      }
      return o;
    })
    .finally(() => {
      running = undefined;
      changedState();
    });
  changedState();
  return running;
}

async function doSync(opts: SyncOptions): Promise<SyncOutcome> {
  const cfg = loadConfig();
  const source = opts.source ?? 'manual';
  const unattended = source === 'auto' || source === 'startup' || source === 'ai';
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const steps: SyncOutcome['steps'] = [];
  const changed = new Set<string>();
  let committed = 0;
  let received = 0;
  let pushed = 0;
  const out = (ok: boolean, message: string, hint?: string): SyncOutcome => ({
    ok,
    result: !ok ? 'error' : committed || received || pushed ? 'ok' : 'nothing',
    message,
    committed,
    received,
    pushed,
    changed: [...changed],
    ...(hint ? { hint } : {}),
    steps,
  });
  if (!opts.repoDir && !cfg.sync.enabled) return out(false, 'Đồng bộ đang tắt (config.yaml → sync.enabled: false).');
  const blocked = source !== 'ai' && guard?.();
  if (blocked) return out(false, blocked);
  const repoDir = opts.repoDir ?? (await repoTop());
  if (!repoDir) return out(false, 'Thư mục app không nằm trong repo git — không đồng bộ được.', explainGitError('not a git repository'));
  const git = async (args: string[], record = true) => {
    const r = await runGit(args, repoDir, timeoutMs);
    const output = redact(r.error ?? [r.stdout, r.stderr].filter((s) => s.trim()).join('\n')).trim();
    if (record) steps.push({ cmd: `git ${args.join(' ')}`, ok: r.code === 0 && !r.timedOut, output: output.slice(-2000) });
    return { ...r, ok: r.code === 0 && !r.timedOut, output };
  };
  const fail = (what: string, r: { output: string; timedOut: boolean }) => out(false, `Đồng bộ thất bại ở bước ${what}.`, explainGitError(r.output, r.timedOut) ?? r.output.split('\n').slice(-3).join(' ').slice(0, 300));

  // 1. preconditions
  const gitDir = (await git(['rev-parse', '--absolute-git-dir'], false)).stdout.trim();
  for (const [f, op] of [
    ['rebase-merge', 'rebase'],
    ['rebase-apply', 'rebase'],
    ['MERGE_HEAD', 'merge'],
    ['CHERRY_PICK_HEAD', 'cherry-pick'],
  ] as const) {
    if (gitDir && fs.existsSync(path.join(gitDir, f))) return out(false, `Repo đang có một ${op} dở dang.`, `Mở Terminal tại ${repoDir}: hoàn tất hoặc huỷ (\`git ${op} --abort\`) rồi bấm ⇅ Đồng bộ lại.`);
  }
  const branch = (await git(['symbolic-ref', '--short', '-q', 'HEAD'], false)).stdout.trim();
  if (!branch) return out(false, 'Repo đang ở trạng thái “detached HEAD”.', 'Chuyển về nhánh chính (git switch main) rồi đồng bộ lại.');
  const upRef = (await git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], false)).stdout.trim();
  if (!upRef) return out(false, `Nhánh ${branch} chưa gắn với nhánh trên GitHub (chưa có upstream).`, `Chạy một lần trong Terminal: git push -u ${cfg.sync.remote || 'origin'} ${branch}`);
  const remote = upRef.slice(0, upRef.indexOf('/'));
  const upBranch = upRef.slice(upRef.indexOf('/') + 1);
  if (upBranch !== branch) return out(false, `Nhánh hiện tại (${branch}) theo dõi ${upRef} — khác tên nên app không đồng bộ, để không đẩy nhầm nhánh.`, `Chuyển về nhánh ${upBranch} rồi đồng bộ.`);
  const trackRef = `${remote}/${upBranch}`;

  // 2. commit the data paths only
  const dataNorm = normalizePaths(opts.dataPaths ?? configuredDataPaths());
  const usable: string[] = [];
  for (const p of dataNorm) {
    if (fs.existsSync(path.join(repoDir, ...p.split('/'))) || (await git(['ls-files', '--', p], false)).stdout.trim()) usable.push(p);
  }
  const commitData = async (): Promise<SyncOutcome | undefined> => {
    if (!usable.length) return undefined;
    const add = await git(['add', '-A', '--', ...usable]);
    if (!add.ok) return fail('git add', add);
    const staged = (await git(['diff', '--cached', '--name-only', '-z', '--', ...usable], false)).stdout.split('\0').filter(Boolean);
    if (!staged.length) return undefined;
    const touched = usable.filter((p) => staged.some((f) => inDataPaths(f, [p])));
    const msg = `cert: sync từ ${opts.host ?? os.hostname()} ${fmtStamp(opts.now ?? new Date())}`;
    const c = await git(['commit', '--no-verify', '-q', '-m', msg, '--', ...touched]);
    if (!c.ok) return fail('git commit', c);
    committed += staged.length;
    return undefined;
  };
  const committedFail = await commitData();
  if (committedFail) return committedFail;

  // 3. pull --rebase (abort on conflict; the local commit stays safe)
  let pullSkipped: string[] | undefined;
  const pull = async (): Promise<SyncOutcome | undefined> => {
    if (unattended) {
      const st = await git(['status', '--porcelain=v1', '-z', '--untracked-files=no'], false);
      const dirty = parsePorcelain(st.stdout).filter((f) => !inDataPaths(f, dataNorm));
      if (dirty.length) {
        pullSkipped = dirty;
        steps.push({ cmd: 'git pull (bỏ qua)', ok: false, output: `Có sửa đổi chưa commit ngoài thư mục dữ liệu: ${listed(dirty, 10)}` });
        return undefined;
      }
    }
    const before = (await git(['rev-parse', 'HEAD'], false)).stdout.trim();
    const r = await git(['pull', '--rebase', unattended ? '--no-autostash' : '--autostash', remote, upBranch]);
    if (!r.ok) {
      if (gitDir && (fs.existsSync(path.join(gitDir, 'rebase-merge')) || fs.existsSync(path.join(gitDir, 'rebase-apply')))) {
        const conflicts = (await git(['diff', '--name-only', '--diff-filter=U'], false)).stdout.split('\n').filter(Boolean);
        const abort = await git(['rebase', '--abort']);
        return out(
          false,
          `Xung đột khi gộp dữ liệu hai máy${conflicts.length ? `: ${listed(conflicts)}` : ''}.`,
          (abort.ok ? 'Đã huỷ rebase — dữ liệu máy này vẫn an toàn trong commit cục bộ (chưa đẩy lên). ' : 'Không huỷ được rebase — chạy `git rebase --abort` trong Terminal. ') +
            `Xử lý tay: mở Terminal tại ${repoDir}, chạy \`git pull --rebase\`, sửa file xung đột, \`git add\` rồi \`git rebase --continue\`, sau đó bấm Đồng bộ lại.`,
        );
      }
      return fail('git pull', r);
    }
    const n = await git(['rev-list', '--count', `${before}..FETCH_HEAD`], false);
    const got = n.ok ? Number(n.stdout.trim()) || 0 : 0;
    received += got;
    if (got) for (const f of (await git(['diff', '--name-only', '-z', before, 'HEAD'], false)).stdout.split('\0').filter(Boolean)) changed.add(f);
    return undefined;
  };
  const pulled = await pull();
  if (pulled) return pulled;

  // 4. push (once more after a pull when the other machine pushed in between). Never --force.
  const ahead = async () => {
    const r = await git(['rev-list', '--count', `${trackRef}..HEAD`], false);
    return r.ok ? Number(r.stdout.trim()) || 0 : 0;
  };
  let toPush = await ahead();
  let heldBack: string[] | undefined;
  if (toPush > 0) {
    const outgoing = (await git(['diff', '--name-only', '-z', `${trackRef}...HEAD`], false)).stdout.split('\0').filter(Boolean);
    const code = outgoing.filter((f) => !inDataPaths(f, dataNorm));
    if (code.length && unattended) {
      heldBack = code;
      steps.push({ cmd: 'git push (giữ lại)', ok: false, output: `Các commit chưa đẩy có thay đổi ngoài thư mục dữ liệu: ${listed(code, 10)}` });
    } else {
      let push = await git(['push', remote, `HEAD:refs/heads/${upBranch}`]);
      const rejected = () => /\[rejected\]|non-fast-forward|fetch first/i.test(push.output);
      if (!push.ok && rejected() && !pullSkipped) {
        const again = await pull();
        if (again) return again;
        toPush = await ahead();
        push = await git(['push', remote, `HEAD:refs/heads/${upBranch}`]);
      }
      if (push.ok) pushed = toPush;
      else if (!(pullSkipped && rejected())) return fail('git push', push);
      // else: the other machine pushed and the pull was skipped → data stays committed locally (reported below)
    }
  }
  const parts: string[] = [];
  if (committed) parts.push(`commit ${committed} file`);
  if (pushed) parts.push(`đẩy ${pushed} commit`);
  if (received) parts.push(`nhận ${received} commit từ máy khác`);
  if (heldBack || pullSkipped) {
    const why = [
      pullSkipped ? `chưa kéo về${pushed ? '' : ' (nên chưa đẩy được, dữ liệu đã nằm trong commit cục bộ)'} vì có sửa đổi chưa commit ngoài dữ liệu (${listed(pullSkipped)})` : '',
      heldBack ? `chưa đẩy vì commit cục bộ có thay đổi ngoài dữ liệu (${listed(heldBack)})` : '',
    ].filter(Boolean);
    return out(false, `Đồng bộ tự động chỉ làm được một phần${parts.length ? ` (${parts.join(', ')})` : ''}: ${why.join('; ')}.`, 'Bấm ⇅ Đồng bộ (thủ công) để đồng bộ đầy đủ, hoặc commit / đẩy code của bạn bằng tay.');
  }
  return out(true, parts.length ? `Đã đồng bộ: ${parts.join(', ')}.` : 'Đã đồng bộ — không có gì mới.');
}

// ── state for the UI ────────────────────────────────────────────────────────

let fetchInfo: { at: number; running?: Promise<void> } = { at: 0 };
const FETCH_EVERY_MS = 120_000;

/** Fetch the remote in the background (at most every 2 min); `onDone` when it finished. */
export function backgroundFetch(onDone?: () => void): void {
  const cfg = loadConfig();
  if (!cfg.sync.enabled || fetchInfo.running || Date.now() - fetchInfo.at < FETCH_EVERY_MS || running) return;
  fetchInfo.at = Date.now();
  fetchInfo.running = (async () => {
    const repo = await repoTop();
    if (!repo) return;
    const up = (await runGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], repo, 10_000)).stdout.trim();
    const remote = up ? up.slice(0, up.indexOf('/')) : cfg.sync.remote;
    await runGit(['fetch', '--no-tags', '-q', remote], repo, 20_000);
  })()
    .catch(() => undefined)
    .finally(() => {
      fetchInfo.running = undefined;
      onDone?.();
    });
}

let autoTimer: NodeJS.Timeout | undefined;
let autoAt: string | undefined;

export async function syncState(opts: { repoDir?: string; dataPaths?: string[] } = {}): Promise<SyncState> {
  const cfg = loadConfig();
  const last = lastRun();
  const base: SyncState = { enabled: cfg.sync.enabled, repo: false, dirty: 0, ahead: 0, behind: 0, running: !!running };
  if (last.lastSync) base.lastSync = last.lastSync;
  if (last.lastResult) base.lastResult = last.lastResult;
  if (last.lastMessage) base.lastMessage = last.lastMessage;
  if (autoAt) base.autoAt = autoAt;
  const repoDir = opts.repoDir ?? (await repoTop());
  if (!repoDir) return base;
  base.repo = true;
  const g = (args: string[]) => runGit(args, repoDir, 10_000);
  const [br, up] = await Promise.all([g(['symbolic-ref', '--short', '-q', 'HEAD']), g(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])]);
  if (br.code === 0 && br.stdout.trim()) base.branch = br.stdout.trim();
  const upRef = up.code === 0 ? up.stdout.trim() : '';
  if (upRef) base.remote = upRef;
  const paths = normalizePaths(opts.dataPaths ?? configuredDataPaths());
  const [st, counts] = await Promise.all([
    paths.length ? g(['status', '--porcelain=v1', '-z', '-uall', '--', ...paths]) : Promise.resolve({ code: 0, stdout: '' } as GitRun),
    upRef ? g(['rev-list', '--left-right', '--count', `${upRef}...HEAD`]) : Promise.resolve(undefined),
  ]);
  if (st.code === 0) base.dirty = parsePorcelain(st.stdout).length;
  if (counts && counts.code === 0) {
    const [behind, ahead] = counts.stdout.trim().split(/\s+/).map(Number);
    base.behind = behind || 0;
    base.ahead = ahead || 0;
  }
  return base;
}

/** sync.auto: idle → a sync `auto_delay_minutes` after the latest submit / issue / AI run. */
export function scheduleAutoSync(): void {
  const cfg = loadConfig();
  if (!cfg.sync.enabled || cfg.sync.auto !== 'idle') return;
  clearTimeout(autoTimer);
  const ms = Math.max(5_000, cfg.sync.auto_delay_minutes * 60_000);
  autoAt = new Date(Date.now() + ms).toISOString();
  autoTimer = setTimeout(() => {
    autoTimer = undefined;
    autoAt = undefined;
    if (guard?.()) {
      scheduleAutoSync(); // an AI run is writing: try again later
      return;
    }
    void runSync({ source: 'auto' });
  }, ms);
  autoTimer.unref?.();
  changedState();
}

export function stopAutoSync(): void {
  clearTimeout(autoTimer);
  autoTimer = undefined;
  autoAt = undefined;
}
