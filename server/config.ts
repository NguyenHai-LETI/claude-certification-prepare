// Paths, config.yaml and exams.yaml. The data root (exams.yaml, config.yaml, bank/, notes/, results/, coach/, .local/) is
// env CERT_ROOT (tests point it at a temp copy) or the claude-cert directory itself. The app code (server/, web/, dist/)
// always lives in APP_DIR.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { EXAM_CODES, type ExamCode, type ExamDef } from '../shared/types.ts';

export const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ROOT = path.resolve(process.env.CERT_ROOT || APP_DIR);

export const PATHS = {
  root: ROOT,
  exams: path.join(ROOT, 'exams.yaml'),
  config: path.join(ROOT, 'config.yaml'),
  bank: path.join(ROOT, 'bank'),
  packs: path.join(ROOT, 'bank', 'packs'),
  issues: path.join(ROOT, 'bank', 'issues.md'),
  notes: path.join(ROOT, 'notes'),
  results: path.join(ROOT, 'results'),
  coach: path.join(ROOT, 'coach'),
  plans: path.join(ROOT, 'coach', 'plans'),
  runs: path.join(ROOT, 'coach', 'runs'),
  local: path.join(ROOT, '.local'),
  active: path.join(ROOT, '.local', 'active'),
  dist: process.env.CERT_DIST ? path.resolve(process.env.CERT_DIST) : path.join(APP_DIR, 'dist'), // env: tests
};

export interface AppConfig {
  server: { port: number; lan: boolean; public_hosts: string[] };
  public: { ngrok_domain: string; check_seconds: number };
  scoring: { pass_pct: number; review_streak: number };
  practice: { shuffle_options: boolean; default_count: number };
  ai: { claude_path: string; model: string; ask_model: string; sync_before: boolean; sync_after: boolean; use_api_key: boolean };
  sync: { enabled: boolean; data_paths: string[]; auto: 'idle' | 'off'; auto_delay_minutes: number; remote: string };
}

export const DEFAULT_CONFIG: AppConfig = {
  server: { port: 3004, lan: false, public_hosts: [] },
  public: { ngrok_domain: '', check_seconds: 60 },
  scoring: { pass_pct: 72, review_streak: 2 },
  practice: { shuffle_options: true, default_count: 20 },
  ai: { claude_path: '', model: '', ask_model: '', sync_before: true, sync_after: true, use_api_key: false },
  sync: { enabled: true, data_paths: ['results', 'coach', 'bank'], auto: 'idle', auto_delay_minutes: 3, remote: 'origin' },
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** Deep merge of `over` onto `base`, keeping the base's value types (a wrong type in config.yaml falls back to the default). */
function merge<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return base;
  const out: Obj = { ...base };
  for (const [k, dv] of Object.entries(base)) {
    const v = over[k];
    if (v === undefined || v === null) continue;
    if (isObj(dv)) out[k] = merge(dv, v);
    else if (Array.isArray(dv)) out[k] = Array.isArray(v) ? v.map(String) : dv;
    else if (typeof dv === typeof v) out[k] = v;
  }
  return out as T;
}

let cfgCache: { mtimeMs: number; value: AppConfig } | undefined;

/** config.yaml merged over the defaults (re-read when the file changes). */
export function loadConfig(): AppConfig {
  let mtimeMs = -1;
  try {
    mtimeMs = fs.statSync(PATHS.config).mtimeMs;
  } catch {
    // no config.yaml: defaults
  }
  if (cfgCache && cfgCache.mtimeMs === mtimeMs) return cfgCache.value;
  let raw: unknown = {};
  if (mtimeMs >= 0) {
    try {
      raw = YAML.parse(fs.readFileSync(PATHS.config, 'utf8')) ?? {};
    } catch (e) {
      console.error(`  ⚠️ config.yaml lỗi cú pháp — dùng cấu hình mặc định: ${(e as Error).message}`);
    }
  }
  const value = merge(DEFAULT_CONFIG, raw);
  if (value.sync.auto !== 'idle' && value.sync.auto !== 'off') value.sync.auto = 'idle';
  // CERT_SYNC=0: no git sync at all (smoke runs on a real checkout, sandboxes)
  if (process.env.CERT_SYNC === '0') value.sync = { ...value.sync, enabled: false };
  // CERT_USE_API_KEY=1: cloud deploy has no claude.ai login, let Claude Code use ANTHROPIC_API_KEY
  if (process.env.CERT_USE_API_KEY === '1') value.ai = { ...value.ai, use_api_key: true };
  cfgCache = { mtimeMs, value };
  return value;
}

/** Port: --port N, env CERT_PORT, else config server.port. 0 = any free port (tests). */
export function configuredPort(argv: string[] = process.argv): number {
  const i = argv.indexOf('--port');
  const fromArg = i >= 0 ? Number(argv[i + 1]) : NaN;
  if (Number.isInteger(fromArg) && fromArg >= 0) return fromArg;
  // CERT_PORT, else PORT (set by cloud hosts such as Render)
  for (const env of [process.env.CERT_PORT, process.env.PORT]) {
    if (env !== undefined && env !== '' && Number.isInteger(Number(env))) return Number(env);
  }
  return loadConfig().server.port;
}

// ── exams.yaml ──────────────────────────────────────────────────────────────

export interface ExamsFile {
  version: string;
  exams: ExamDef[];
  byCode: Map<ExamCode, ExamDef>;
}

/** Parses exams.yaml text (exported for tests and scripts). Unknown exam codes are ignored. */
export function parseExams(text: string): ExamsFile {
  const doc = (YAML.parse(text) ?? {}) as Obj;
  const src = isObj(doc.exams) ? doc.exams : {};
  const exams: ExamDef[] = [];
  for (const code of EXAM_CODES) {
    const e = src[code];
    if (!isObj(e)) continue;
    const domains = isObj(e.domains)
      ? Object.entries(e.domains).map(([id, d]) => ({ id, name: String((d as Obj)?.name ?? id), weight: Number((d as Obj)?.weight ?? 0) }))
      : [];
    const def: ExamDef = {
      code,
      name: String(e.name ?? code),
      short: String(e.short ?? e.name ?? code),
      questions: Number(e.questions ?? 60),
      minutes: Number(e.minutes ?? 120),
      pass: Number(e.pass ?? 720),
      domains,
    };
    if (isObj(e.scenarios)) {
      def.scenarios = Object.entries(e.scenarios).map(([id, name]) => ({ id, name: String(isObj(name) ? (name.name ?? id) : name) }));
      def.scenarioPick = Number(e.scenario_pick ?? e.scenarioPick ?? 0) || undefined;
    }
    exams.push(def);
  }
  return { version: String(doc.version ?? ''), exams, byCode: new Map(exams.map((x) => [x.code, x])) };
}

let examsCache: { mtimeMs: number; value: ExamsFile } | undefined;

export function loadExams(file: string = PATHS.exams): ExamsFile {
  const mtimeMs = fs.statSync(file).mtimeMs;
  if (file === PATHS.exams && examsCache && examsCache.mtimeMs === mtimeMs) return examsCache.value;
  const value = parseExams(fs.readFileSync(file, 'utf8'));
  if (file === PATHS.exams) examsCache = { mtimeMs, value };
  return value;
}

export function examDef(code: string): ExamDef | undefined {
  return loadExams().byCode.get(code as ExamCode);
}

export function appVersion(): string {
  try {
    return String((JSON.parse(fs.readFileSync(path.join(APP_DIR, 'package.json'), 'utf8')) as { version?: string }).version ?? '0.0.0');
  } catch {
    return '0.0.0';
  }
}

/** Path of the data root relative to the repo root ("claude-cert"), POSIX separators — for prompts and git pathspecs. */
export function rootRelativeTo(repoDir: string): string {
  const rel = path.relative(repoDir, ROOT).split(path.sep).join('/');
  return rel || '.';
}
