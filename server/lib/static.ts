// Serves the built UI (dist/) with an SPA fallback to index.html for client routes. Hashed assets are cached for a year,
// index.html never; text files are gzip-compressed once and kept in memory.
import fs from 'node:fs';
import type http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { PATHS } from '../config.ts';
import { acceptsGzip } from '../http.ts';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};
const COMPRESSIBLE = /\.(html|js|mjs|css|json|svg|txt|map|webmanifest)$/;

const gzCache = new Map<string, { mtimeMs: number; gz: Buffer }>();

function send(req: http.IncomingMessage, res: http.ServerResponse, file: string, st: fs.Stats, cache: string) {
  const ext = path.extname(file).toLowerCase();
  const headers: http.OutgoingHttpHeaders = {
    'Content-Type': TYPES[ext] ?? 'application/octet-stream',
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    Vary: 'Accept-Encoding',
  };
  if (ext === '.html') headers['X-Frame-Options'] = 'SAMEORIGIN';
  const head = req.method === 'HEAD';
  if (COMPRESSIBLE.test(ext) && st.size > 1024 && acceptsGzip(req.headers['accept-encoding'])) {
    let c = gzCache.get(file);
    if (!c || c.mtimeMs !== st.mtimeMs) {
      c = { mtimeMs: st.mtimeMs, gz: zlib.gzipSync(fs.readFileSync(file), { level: 6 }) };
      gzCache.set(file, c);
    }
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': c.gz.length });
    res.end(head ? undefined : c.gz);
    return;
  }
  res.writeHead(200, { ...headers, 'Content-Length': st.size });
  if (head) res.end();
  else fs.createReadStream(file).pipe(res);
}

/** Paths that can only be build files (never client routes): a miss there is a 404, not the SPA page. */
export function isAssetPath(rel: string): boolean {
  return rel.startsWith('/assets/') || /^\/[^/]+\.(js|mjs|css|map|ico|png|svg|webmanifest|txt|woff2?)$/i.test(rel);
}

/** true when answered (a file, or index.html for a client route); false when dist/ has no build. */
export function serveDist(req: http.IncomingMessage, res: http.ServerResponse, url: URL): boolean {
  const index = path.join(PATHS.dist, 'index.html');
  if (!fs.existsSync(index)) return false;
  let rel: string;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    rel = '/';
  }
  const abs = path.resolve(PATHS.dist, '.' + rel);
  if (abs.startsWith(path.resolve(PATHS.dist) + path.sep) && !rel.split('/').some((s) => s.startsWith('.') && s.length > 0)) {
    try {
      const st = fs.statSync(abs);
      if (st.isFile()) {
        const immutable = rel.startsWith('/assets/');
        send(req, res, abs, st, immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
        return true;
      }
    } catch {
      // not a file → SPA fallback (or 404 for a missing asset)
    }
  }
  // a missing build asset is a real 404; every other path is a client route (e.g. /notes/exams/CCAR-F.md) → index.html
  if (isAssetPath(rel)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('Không tìm thấy');
    return true;
  }
  send(req, res, index, fs.statSync(index), 'no-cache');
  return true;
}

export function noBuildPage(res: http.ServerResponse) {
  res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '10' });
  res.end(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>claude-cert</title>' +
      '<body style="font-family:system-ui;max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.5">' +
      '<h1>Chưa có giao diện</h1><p>Chưa build giao diện (<code>dist/</code>). Chạy <code>npm run build</code> trong thư mục app, ' +
      'hoặc khởi động bằng <code>npm start</code> (tự build), hoặc <code>npm run dev</code>.</p></body>',
  );
}
