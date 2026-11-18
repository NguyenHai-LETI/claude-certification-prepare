// Local vs remote requests and the access code (SPEC §5).
// Local = loopback peer AND Host localhost / 127.0.0.1 / [::1] (any port) AND no X-Forwarded-For / Forwarded header.
// Everything else (LAN, ngrok — which forwards to localhost but keeps the public Host and adds X-Forwarded-For) is remote
// and needs the access code once: POST /api/access → cookie cert_access = HMAC(code, secret), 180 days.
import crypto from 'node:crypto';
import fs from 'node:fs';
import type http from 'node:http';
import path from 'node:path';
import { PATHS } from '../config.ts';
import { isLoopback } from '../http.ts';

export const COOKIE = 'cert_access';
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no I, L, O, 0, 1
const CODE_LEN = 8;
const COOKIE_DAYS = 180;
export const MAX_FAILS = 10;
export const FAIL_WINDOW_MS = 15 * 60_000;

function hostName(hostHeader: string | undefined): string {
  const h = String(hostHeader ?? '')
    .trim()
    .toLowerCase();
  if (h.startsWith('[')) return h.slice(0, h.indexOf(']') + 1);
  const i = h.lastIndexOf(':');
  return i >= 0 ? h.slice(0, i) : h;
}

export function isLocalRequest(req: http.IncomingMessage): boolean {
  if (!isLoopback(req.socket.remoteAddress)) return false;
  if (req.headers['x-forwarded-for'] !== undefined || req.headers.forwarded !== undefined) return false;
  const host = hostName(req.headers.host);
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/** Client IP for rate limiting: X-Forwarded-For first hop, else the TCP peer. */
export function clientIp(req: http.IncomingMessage): string {
  const xff = req.headers['x-forwarded-for'];
  const first = String(Array.isArray(xff) ? xff[0] : (xff ?? ''))
    .split(',')[0]
    .trim();
  return first || (req.socket.remoteAddress ?? '').replace(/^::ffff:/, '');
}

// ── code & secret ───────────────────────────────────────────────────────────

export function newCode(): string {
  let out = '';
  while (out.length < CODE_LEN) {
    for (const b of crypto.randomBytes(16)) {
      if (b >= 256 - (256 % ALPHABET.length)) continue; // no modulo bias
      out += ALPHABET[b % ALPHABET.length];
      if (out.length === CODE_LEN) break;
    }
  }
  return out;
}

/** Typed codes: case, spaces and dashes ignored. */
export function normalizeCode(s: string): string {
  return String(s ?? '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '');
}

function writePrivate(file: string, value: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, value + '\n', { mode: 0o600 });
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    // Windows: ACL-based permissions
  }
}

let codeMemo: { mtimeMs: number; value: string } | undefined;

/** The access code: env CERT_ACCESS_CODE, else .local/access-code (created on first use). */
export function accessCode(): string {
  const env = normalizeCode(process.env.CERT_ACCESS_CODE ?? '');
  if (env) return env;
  const file = path.join(PATHS.local, 'access-code');
  try {
    const st = fs.statSync(file);
    if (codeMemo?.mtimeMs === st.mtimeMs) return codeMemo.value;
    const v = normalizeCode(fs.readFileSync(file, 'utf8'));
    if (v.length >= 6) {
      codeMemo = { mtimeMs: st.mtimeMs, value: v };
      return v;
    }
  } catch {
    // none yet
  }
  const v = newCode();
  writePrivate(file, v);
  codeMemo = { mtimeMs: fs.statSync(file).mtimeMs, value: v };
  return v;
}

let secretMemo: string | undefined;
function secret(): string {
  if (secretMemo) return secretMemo;
  const file = path.join(PATHS.local, 'cookie-secret');
  try {
    const v = fs.readFileSync(file, 'utf8').trim();
    if (v.length >= 32) return (secretMemo = v);
  } catch {
    // none yet
  }
  const v = crypto.randomBytes(32).toString('hex');
  writePrivate(file, v);
  return (secretMemo = v);
}

/** Cookie value for a code: HMAC(code, secret) — a new code invalidates every cookie. */
export function cookieValue(code: string = accessCode()): string {
  return crypto.createHmac('sha256', secret()).update(`cert-access:${code}`).digest('base64url');
}

/** Constant-time comparison of two strings of any length. */
export function sameSecret(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function readCookie(req: http.IncomingMessage): string | undefined {
  for (const part of String(req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
  }
  return undefined;
}

export function hasValidCookie(req: http.IncomingMessage): boolean {
  const c = readCookie(req);
  return !!c && sameSecret(c, cookieValue());
}

export function granted(req: http.IncomingMessage, local = isLocalRequest(req)): boolean {
  return local || hasValidCookie(req);
}

export function setCookieHeader(req: http.IncomingMessage): string {
  const https = String(req.headers['x-forwarded-proto'] ?? '')
    .split(',')[0]
    .trim()
    .toLowerCase() === 'https';
  return `${COOKIE}=${cookieValue()}; Path=/; Max-Age=${COOKIE_DAYS * 86_400}; HttpOnly; SameSite=Lax${https ? '; Secure' : ''}`;
}

// ── attempt limiting ────────────────────────────────────────────────────────

const fails = new Map<string, number[]>();

export function tooManyAttempts(ip: string, now = Date.now()): boolean {
  const list = (fails.get(ip) ?? []).filter((t) => now - t < FAIL_WINDOW_MS);
  if (list.length) fails.set(ip, list);
  else fails.delete(ip);
  return list.length >= MAX_FAILS;
}

export function noteFailure(ip: string, now = Date.now()): void {
  const list = fails.get(ip) ?? [];
  list.push(now);
  fails.set(ip, list);
  if (fails.size > 10_000) fails.delete(fails.keys().next().value as string); // bounded memory
}

export function clearFailures(ip: string): void {
  fails.delete(ip);
}

/** POST /api/access: 429 when rate limited, else verify. */
export function tryCode(ip: string, code: unknown): 'ok' | 'wrong' | 'limited' {
  if (tooManyAttempts(ip)) return 'limited';
  const typed = normalizeCode(String(code ?? ''));
  if (typed && sameSecret(typed, accessCode())) {
    clearFailures(ip);
    return 'ok';
  }
  noteFailure(ip);
  return 'wrong';
}
