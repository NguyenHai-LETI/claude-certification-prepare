// App-wide state: Meta, the selected exam (localStorage cert.exam), Claude CLI availability (CoachState, fetched once and
// on job events), git sync state, and the SSE stream (/api/events) that bumps data versions so pages refetch.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { api } from './api.ts';
import type { CoachState, ExamCode, ExamDef, Meta, ServerEvent, SyncState } from '../../shared/types.ts';

export type DataKind = 'bank' | 'results' | 'notes' | 'coach';
type Versions = Record<DataKind, number>;

interface Store {
  meta?: Meta;
  metaError?: string;
  exam: ExamCode;
  examDef?: ExamDef;
  setExam: (e: ExamCode) => void;
  examOf: (code: string) => ExamDef | undefined;
  coach?: CoachState;
  refreshCoach: () => void;
  sync?: SyncState;
  setSync: (s: SyncState) => void;
  versions: Versions;
  bump: (k: DataKind) => void;
  connected: boolean;
}

const Ctx = createContext<Store | null>(null);

const EXAM_KEY = 'cert.exam';
function storedExam(): ExamCode {
  try {
    const v = localStorage.getItem(EXAM_KEY);
    if (v === 'CCAR-F' || v === 'CCDV-F' || v === 'CCAO-F' || v === 'CCAR-P') return v;
  } catch {
    // storage unavailable
  }
  return 'CCAR-F';
}

// ── server events pub/sub ────────────────────────────────────────────────────
type EvHandler = (ev: ServerEvent) => void;
const evHandlers = new Set<EvHandler>();
export function useServerEvent(type: ServerEvent['type'], fn: (ev: ServerEvent) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const h: EvHandler = (ev) => {
      if (ev.type === type) ref.current(ev);
    };
    evHandlers.add(h);
    return () => {
      evHandlers.delete(h);
    };
  }, [type]);
}

const EVENT_TYPES: ServerEvent['type'][] = ['hello', 'bank', 'results', 'job', 'sync', 'notes'];

export function StoreProvider({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [meta, setMeta] = useState<Meta>();
  const [metaError, setMetaError] = useState<string>();
  const [exam, setExamState] = useState<ExamCode>(storedExam);
  const [coach, setCoach] = useState<CoachState>();
  const [sync, setSync] = useState<SyncState>();
  const [versions, setVersions] = useState<Versions>({ bank: 0, results: 0, notes: 0, coach: 0 });
  const [connected, setConnected] = useState(false);

  const bump = useCallback((k: DataKind) => setVersions((v) => ({ ...v, [k]: v[k] + 1 })), []);

  useEffect(() => {
    let stop = false;
    const load = (attempt: number) => {
      api
        .get<Meta>('/api/meta')
        .then((m) => {
          if (stop) return;
          setMeta(m);
          setMetaError(undefined);
        })
        .catch((e: Error) => {
          if (stop) return;
          setMetaError(e.message);
          setTimeout(() => load(attempt + 1), Math.min(10_000, 1000 * (attempt + 1)));
        });
    };
    load(0);
    return () => {
      stop = true;
    };
  }, []);

  const refreshCoach = useCallback(() => {
    api
      .get<CoachState>('/api/coach')
      .then(setCoach)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshCoach();
    api
      .get<SyncState>('/api/sync')
      .then(setSync)
      .catch(() => undefined);
  }, [enabled, refreshCoach]);

  // SSE with manual reconnect (EventSource gives up after a non-200 answer, e.g. a restart in progress).
  useEffect(() => {
    if (!enabled || typeof EventSource === 'undefined') return;
    let es: EventSource | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    let hellos = 0;
    const dispatch = (ev: ServerEvent) => {
      if (ev.type === 'hello') {
        setConnected(true);
        if (hellos++ > 0) {
          // reconnected: events may have been missed → refetch everything
          setVersions((v) => ({ bank: v.bank + 1, results: v.results + 1, notes: v.notes + 1, coach: v.coach + 1 }));
          refreshCoach();
          api.get<SyncState>('/api/sync').then(setSync).catch(() => undefined);
        }
      } else if (ev.type === 'bank') bump('bank');
      else if (ev.type === 'results') bump('results');
      else if (ev.type === 'notes') bump('notes');
      else if (ev.type === 'sync') setSync(ev.state);
      else if (ev.type === 'job') {
        if (ev.job.kind !== 'ask') {
          bump('coach');
          if (ev.job.status !== 'running') refreshCoach();
        }
      }
      for (const h of evHandlers) h(ev);
    };
    const parse = (raw: string, name?: string) => {
      try {
        const data = JSON.parse(raw) as ServerEvent;
        if (data && typeof data === 'object' && 'type' in data) dispatch(data);
        else if (name) dispatch({ ...(data as object), type: name } as ServerEvent);
      } catch {
        if (name === 'bank' || name === 'results' || name === 'notes') dispatch({ type: name });
      }
    };
    const open = () => {
      if (closed) return;
      es = new EventSource('/api/events');
      es.onmessage = (m) => parse(m.data);
      for (const t of EVENT_TYPES) es.addEventListener(t, (m) => parse((m as MessageEvent).data, t));
      es.onerror = () => {
        setConnected(false);
        if (es?.readyState === EventSource.CLOSED) {
          es.close();
          timer = setTimeout(open, 5000);
        }
      };
    };
    open();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      es?.close();
    };
  }, [enabled, bump, refreshCoach]);

  const setExam = useCallback((e: ExamCode) => {
    setExamState(e);
    try {
      localStorage.setItem(EXAM_KEY, e);
    } catch {
      // ignore
    }
  }, []);

  const examOf = useCallback((code: string) => meta?.exams.find((x) => x.code === code), [meta]);
  const examDef = examOf(exam);

  return (
    <Ctx.Provider value={{ meta, metaError, exam, examDef, setExam, examOf, coach, refreshCoach, sync, setSync, versions, bump, connected }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
}

/**
 * GET `url` (null = skip) and refetch when one of `kinds` changes on the server (SSE). Keeps the previous data while
 * reloading so lists don't flash.
 */
export function useFetch<T>(url: string | null, kinds: DataKind[] = []) {
  const { versions } = useStore();
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const vkey = kinds.map((k) => versions[k]).join(',');
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url) {
      setData(undefined);
      return;
    }
    const ctrl = new AbortController();
    if (lastUrl.current !== url) {
      setData(undefined);
      lastUrl.current = url;
    }
    setLoading(true);
    api
      .get<T>(url, { signal: ctrl.signal })
      .then((d) => {
        setData(d);
        setError(undefined);
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [url, vkey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

export function domainName(def: ExamDef | undefined, id: string): string {
  return def?.domains.find((d) => d.id === id)?.name ?? id;
}

export function scenarioName(def: ExamDef | undefined, id: string | undefined): string | undefined {
  if (!id) return undefined;
  return def?.scenarios?.find((s) => s.id === id)?.name ?? id;
}
