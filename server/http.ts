// HTTP plumbing: route registry, JSON helpers, errors, SSE broadcast. Route modules register with `route()`.
import type http from 'node:http';
import zlib from 'node:zlib';
import type { ServerEvent } from '../shared/types.ts';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Peer address on this machine (127.0.0.0/8, ::1, IPv4-mapped loopback). Never derived from headers. */
export function isLoopback(addr: string | undefined): boolean {
  if (!addr) return false;
  const a = addr.startsWith('::ffff:') ? addr.slice(7) : addr;
  return a === '::1' || /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(a);
}

const GZIP_MIN = 8_192;

/** Accept-Encoding allows gzip: listed (or `*`) without `q=0`. */
export function acceptsGzip(header: string | string[] | undefined): boolean {
  let star = false;
  for (const part of String(header ?? '').split(',')) {
    const [name, ...params] = part.split(';').map((x) => x.trim().toLowerCase());
    const q = params.find((x) => x.startsWith('q='));
    const ok = !q || Number(q.slice(2)) > 0;
    if (name === 'gzip') return ok;
    if (name === '*') star = ok;
  }
  return star;
}

export function wantsGzip(res: http.ServerResponse, size: number): boolean {
  return size > GZIP_MIN && acceptsGzip(res.req?.headers['accept-encoding']);
}

export function json(res: http.ServerResponse, status: number, body: unknown, extra: http.OutgoingHttpHeaders = {}) {
  const text = JSON.stringify(body);
  const headers: http.OutgoingHttpHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Vary: 'Accept-Encoding', 'X-Content-Type-Options': 'nosniff', ...extra };
  if (wantsGzip(res, text.length)) {
    const gz = zlib.gzipSync(text, { level: 3 });
    res.writeHead(status, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': gz.length });
    res.end(gz);
    return;
  }
  res.writeHead(status, { ...headers, 'Content-Length': Buffer.byteLength(text) });
  res.end(text);
}

/** A non-JSON route result. Return it from a handler instead of a plain object. */
export class RawResponse {
  body: string | Buffer;
  type: string;
  headers: Record<string, string>;
  status: number;
  constructor(body: string | Buffer, type: string, headers: Record<string, string> = {}, status = 200) {
    this.body = body;
    this.type = type;
    this.headers = headers;
    this.status = status;
  }
}

export function sendRaw(res: http.ServerResponse, out: RawResponse) {
  const body = typeof out.body === 'string' ? Buffer.from(out.body, 'utf8') : out.body;
  const headers: http.OutgoingHttpHeaders = { 'Content-Type': out.type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Accept-Encoding', ...out.headers };
  if (wantsGzip(res, body.length)) {
    const gz = zlib.gzipSync(body, { level: 3 });
    res.writeHead(out.status, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': gz.length });
    res.end(gz);
    return;
  }
  res.writeHead(out.status, { ...headers, 'Content-Length': body.length });
  res.end(body);
}

export async function readBody<T>(req: http.IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > 2_000_000) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn');
    chunks.push(c as Buffer);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, 'Dữ liệu gửi lên không phải JSON hợp lệ');
  }
}

/** decodeURIComponent for route params → HttpError 400 instead of a 500 on a malformed %-escape. */
export function decodeParam(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    throw new HttpError(400, 'Đường dẫn không hợp lệ');
  }
}

export interface Ctx {
  req: http.IncomingMessage;
  url: URL;
  params: string[]; // decoded route params
  local: boolean; // SPEC §5 local request
  body<T>(): Promise<T>;
}

export type Handler = (ctx: Ctx) => Promise<unknown> | unknown;
export const routes: { method: string; pattern: string; re: RegExp; fn: Handler }[] = [];

/** Register an API route. Pattern params like `/api/results/:id` arrive decoded in `ctx.params`. */
export function route(method: string, pattern: string, fn: Handler): void {
  routes.push({ method, pattern, re: new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$'), fn });
}

// ── Server-Sent Events ──────────────────────────────────────────────────────
// Every event is an unnamed message (`data: {"type":…}`): the client reads them all with `EventSource.onmessage` and
// switches on the ServerEvent `type`. No named `event:` lines are used.
export const sseClients = new Set<http.ServerResponse>();

export function broadcast(ev: ServerEvent): void {
  const msg = `data: ${JSON.stringify(ev)}\n\n`;
  for (const c of sseClients) {
    try {
      c.write(msg);
    } catch {
      sseClients.delete(c);
    }
  }
}
