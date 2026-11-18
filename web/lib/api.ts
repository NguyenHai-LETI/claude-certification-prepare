// fetch wrapper: JSON in/out, `X-Cert: 1` on every non-GET (server CSRF guard), `{error}` → thrown ApiError with the
// server's Vietnamese message, 401 → the access-code screen (App listens through onUnauthorized).

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Listener = () => void;
const unauthorized = new Set<Listener>();
export function onUnauthorized(fn: Listener): () => void {
  unauthorized.add(fn);
  return () => unauthorized.delete(fn);
}

async function request<T>(method: string, url: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (method !== 'GET') headers['X-Cert'] = '1';
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      ...init,
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Không kết nối được máy chủ — kiểm tra app còn chạy.', 0);
  }
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    if (res.status === 401 && !url.startsWith('/api/access')) for (const l of unauthorized) l();
    const msg =
      (data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : '') || `Lỗi máy chủ (HTTP ${res.status})`;
    throw new ApiError(msg, res.status);
  }
  if (data === undefined && text) throw new ApiError('Máy chủ trả về dữ liệu không đọc được.', res.status);
  return data as T;
}

export const api = {
  get: <T>(url: string, init?: RequestInit) => request<T>('GET', url, undefined, init),
  post: <T>(url: string, body: unknown = {}) => request<T>('POST', url, body),
  put: <T>(url: string, body: unknown) => request<T>('PUT', url, body),
  del: <T>(url: string) => request<T>('DELETE', url),
};

/** Fire-and-forget PUT that survives page unload (autosave on pagehide). */
export function putKeepalive(url: string, body: unknown) {
  try {
    void fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Cert': '1' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => undefined);
  } catch {
    // ignore
  }
}

/** Build a query string, skipping empty values. */
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    q.set(k, v === true ? '1' : String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const enc = encodeURIComponent;
