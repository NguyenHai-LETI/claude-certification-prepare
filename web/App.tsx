import { Suspense, lazy, useEffect, useState, type ComponentType } from 'react';
import { api, onUnauthorized } from './lib/api.ts';
import { useRoute, Link } from './lib/router.ts';
import { StoreProvider, useStore } from './lib/store.tsx';
import { ConfirmHost, ErrorBox, Loading, ToastHost } from './components/ui.tsx';
import { SyncButton } from './components/SyncButton.tsx';
import { AccessGate } from './components/AccessGate.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { NewTest } from './pages/NewTest.tsx';
import { Runner } from './pages/Runner.tsx';
import { ResultPage } from './pages/Result.tsx';
import { History } from './pages/History.tsx';
import { Review } from './pages/Review.tsx';
import { EXAM_CODES, type ExamCode } from '../shared/types.ts';

function lazyPage<P extends object>(load: () => Promise<Record<string, unknown>>, name: string) {
  return lazy(async () => ({ default: (await load())[name] as ComponentType<P> }));
}
const Notes = lazyPage<object>(() => import('./pages/Notes.tsx'), 'Notes');
const Bank = lazyPage<object>(() => import('./pages/Bank.tsx'), 'Bank');
const Coach = lazyPage<object>(() => import('./pages/Coach.tsx'), 'Coach');
const SystemPage = lazyPage<object>(() => import('./pages/System.tsx'), 'SystemPage');

const NAV = [
  { path: '/', icon: '🏠', label: 'Tổng quan' },
  { path: '/new', icon: '✍️', label: 'Tạo bài test' },
  { path: '/review', icon: '❌', label: 'Ôn câu sai' },
  { path: '/history', icon: '🕘', label: 'Lịch sử' },
  { path: '/notes', icon: '📖', label: 'Tài liệu' },
  { path: '/bank', icon: '🗂️', label: 'Ngân hàng' },
  { path: '/coach', icon: '🤖', label: 'AI Coach' },
  { path: '/system', icon: '⚙️', label: 'Hệ thống' },
];

type Theme = 'light' | 'dark';
const THEME_KEY = 'cert.theme';

function systemTheme(): Theme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function useTheme(): [Theme, () => void] {
  const [chosen, setChosen] = useState<Theme | undefined>(() => {
    try {
      const v = localStorage.getItem(THEME_KEY);
      return v === 'light' || v === 'dark' ? v : undefined;
    } catch {
      return undefined;
    }
  });
  const [sys, setSys] = useState<Theme>(systemTheme);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const on = () => setSys(mq.matches ? 'dark' : 'light');
    mq?.addEventListener?.('change', on);
    return () => mq?.removeEventListener?.('change', on);
  }, []);
  const theme = chosen ?? sys;
  useEffect(() => {
    if (chosen) document.documentElement.setAttribute('data-theme', chosen);
    else document.documentElement.removeAttribute('data-theme');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#161615' : '#2a78d6');
  }, [chosen, theme]);
  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setChosen(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  };
  return [theme, toggle];
}

/** Access check (GET /api/access), then the app; any 401 later brings the code screen back. */
export function Root() {
  const [access, setAccess] = useState<'checking' | 'ok' | 'need'>('checking');
  useEffect(() => {
    api
      .get<{ required: boolean; granted: boolean }>('/api/access')
      .then((a) => setAccess(a.required && !a.granted ? 'need' : 'ok'))
      .catch(() => setAccess('ok')); // server down: the app shows its own connection errors
    return onUnauthorized(() => setAccess('need'));
  }, []);
  if (access === 'checking') return <Loading text="Đang kết nối…" />;
  if (access === 'need') return <AccessGate onGranted={() => window.location.reload()} />;
  return (
    <StoreProvider enabled>
      <App />
    </StoreProvider>
  );
}

function App() {
  const route = useRoute();
  const { meta, metaError, exam, setExam, coach, connected } = useStore();
  const [theme, toggleTheme] = useTheme();
  const [menu, setMenu] = useState(false);
  const top = `/${route.parts[0] ?? ''}`;
  const inTest = top === '/test';

  useEffect(() => setMenu(false), [route.path]);

  let page: React.ReactNode;
  if (!meta) page = metaError ? <ErrorBox error={`Không kết nối được máy chủ: ${metaError}`} /> : <Loading text="Đang nạp dữ liệu…" />;
  else if (top === '/') page = <Dashboard />;
  else if (top === '/new') page = <NewTest />;
  else if (top === '/test') page = <Runner key={route.parts[1]} id={route.parts[1] ?? ''} />;
  else if (top === '/result') page = <ResultPage key={route.parts[1]} id={route.parts[1] ?? ''} />;
  else if (top === '/history') page = <History />;
  else if (top === '/review') page = <Review />;
  else if (top === '/notes') page = <Notes />;
  else if (top === '/bank') page = <Bank />;
  else if (top === '/coach') page = <Coach />;
  else if (top === '/system') page = <SystemPage />;
  else
    page = (
      <div className="empty">
        <div className="big">🧭</div>
        Không tìm thấy trang. <Link to="/">Về Tổng quan</Link>
      </div>
    );

  const ai = coach?.claude;
  const aiTitle = !coach ? 'Đang kiểm tra Claude Code CLI…' : ai?.available ? `Claude Code CLI sẵn sàng${ai.version ? ` (${ai.version})` : ''}` : `Chưa có Claude Code CLI${ai?.error ? `: ${ai.error}` : ''}`;

  return (
    <div className={`app ${inTest ? 'in-test' : ''}`}>
      <header className="topbar">
        <div className="topbar-row">
          <Link to="/" className="brand" aria-label="Claude Cert — Tổng quan">
            <span className="logo" aria-hidden="true">
              🎓
            </span>
            <span className="brand-text">Claude Cert</span>
          </Link>
          {!inTest && (
            <label className="exam-select">
              <span className="sr-only">Kỳ thi</span>
              <select value={exam} onChange={(e) => setExam(e.target.value as ExamCode)} title={meta?.exams.find((x) => x.code === exam)?.name}>
                {(meta?.exams.map((x) => x.code) ?? EXAM_CODES).map((c) => {
                  const d = meta?.exams.find((x) => x.code === c);
                  return (
                    <option key={c} value={c}>
                      {c}
                      {d ? ` · ${d.short}` : ''}
                    </option>
                  );
                })}
              </select>
            </label>
          )}
          <span className="spacer" />
          <SyncButton />
          <span
            className={`ai-dot ${!coach ? '' : ai?.available ? 'ok' : 'bad'}`}
            title={aiTitle}
            role="img"
            aria-label={aiTitle}
          />
          {!connected && meta && <span className="live-off" title="Mất kết nối cập nhật trực tiếp (SSE) — đang thử lại" aria-label="Mất kết nối trực tiếp">⚡︎</span>}
          <button type="button" className="btn ghost sm icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'} title={theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button type="button" className="btn ghost sm icon-btn menu-btn" aria-expanded={menu} aria-controls="main-nav" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            ☰
          </button>
        </div>
        <nav id="main-nav" className={`nav ${menu ? 'open' : ''}`} aria-label="Điều hướng chính">
          {NAV.map((n) => {
            const active = n.path === '/' ? top === '/' : top === n.path;
            return (
              <Link key={n.path} to={n.path} className={`nav-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
                <span className="ico" aria-hidden="true">
                  {n.icon}
                </span>
                {n.label}
                {n.path === '/coach' && coach?.openIssues ? <span className="count">{coach.openIssues}</span> : null}
                {n.path === '/coach' && coach?.running ? <span className="spinner tiny-spin" aria-label="đang chạy" /> : null}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className={inTest ? 'main wide' : 'main'}>
        <Suspense fallback={<Loading text="Đang tải trang…" />}>{page}</Suspense>
      </main>
      <ToastHost />
      <ConfirmHost />
    </div>
  );
}
