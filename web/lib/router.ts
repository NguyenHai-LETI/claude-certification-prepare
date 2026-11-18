// Tiny History API router: useRoute() + navigate() + <Link>. Same-origin <a href="/…"> clicks anywhere in the page
// (including rendered Markdown / lesson HTML) are intercepted and handled client-side.
import { createElement, useSyncExternalStore, type AnchorHTMLAttributes } from 'react';

export interface Route {
  path: string; // pathname, decoded segments joined back
  parts: string[]; // decoded path segments
  query: URLSearchParams;
  hash: string; // without '#', decoded
  key: number; // changes on every navigation (also same-URL hash re-clicks)
}

let seq = 0;
let current: Route = read();
const listeners = new Set<() => void>();

function read(): Route {
  const { pathname, search, hash } = window.location;
  let h = hash.replace(/^#/, '');
  try {
    h = decodeURIComponent(h);
  } catch {
    // keep raw
  }
  const parts = pathname
    .split('/')
    .filter(Boolean)
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    });
  return { path: pathname, parts, query: new URLSearchParams(search), hash: h, key: ++seq };
}

function emit() {
  current = read();
  for (const l of listeners) l();
}

window.addEventListener('popstate', emit);

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) {
    window.location.href = to;
    return;
  }
  const next = url.pathname + url.search + url.hash;
  const same = next === window.location.pathname + window.location.search + window.location.hash;
  const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
  if (opts.replace || same) window.history.replaceState(null, '', next);
  else window.history.pushState(null, '', next);
  emit();
  if (!samePage && !url.hash) window.scrollTo(0, 0);
}

/** Change the query string without a new history entry (filters). */
export function setQuery(params: Record<string, string | undefined | null>) {
  const q = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') q.delete(k);
    else q.set(k, v);
  }
  const s = q.toString();
  navigate(window.location.pathname + (s ? `?${s}` : ''), { replace: true });
}

export function useRoute(): Route {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

/** Global interception of in-app links (left click without modifiers, same origin, not /api, not download/_blank). */
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.('a');
  if (!a || !a.getAttribute('href')) return;
  if (a.target && a.target !== '_self') return;
  if (a.hasAttribute('download')) return;
  const raw = a.getAttribute('href')!;
  if (raw.startsWith('#')) return; // in-page anchors are handled by their container
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
  e.preventDefault();
  navigate(url.pathname + url.search + url.hash);
});

export function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { to, ...rest } = props;
  return createElement('a', { ...rest, href: to });
}

/** Note path ("lessons/05.html#x") → app URL ("/notes/lessons/05.html#x"). */
export function noteHref(ref: string): string {
  const [p, a] = ref.split('#');
  const path = p
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join('/');
  return `/notes/${path}${a ? `#${encodeURIComponent(a)}` : ''}`;
}
