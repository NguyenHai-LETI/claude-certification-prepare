// Test runner (/test/:id): navigator grid, Markdown stem/options, keyboard (1–6 / A–F choose, ←/→ J/K move, F flag,
// Enter check / next), timer (countdown or elapsed), autosave (PUT debounced + periodic + on page hide), per-question time,
// practice "Kiểm tra" with explanation, in-page submit confirm, auto-submit when time is up.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, enc, putKeepalive } from '../lib/api.ts';
import { navigate, noteHref, Link } from '../lib/router.ts';
import { scenarioName, useStore } from '../lib/store.tsx';
import { Markdown } from '../lib/markdown.tsx';
import { fmtClock, MODE_LABEL } from '../lib/format.ts';
import { anyModalOpen, confirmDialog, ErrorBox, Loading, toast } from '../components/ui.tsx';
import { ChooseHint, displayLetters, OptionList, Stem } from '../components/QuestionView.tsx';
import { AskDialog } from '../components/AskDialog.tsx';
import { IssueDialog } from '../components/IssueDialog.tsx';
import type { ActiveTest, CheckResponse, SaveTestRequest, TestAnswer } from '../../shared/types.ts';

const SAVE_DEBOUNCE_MS = 800;
const SAVE_PERIODIC_MS = 20_000;

export function Runner({ id }: { id: string }) {
  const [test, setTest] = useState<ActiveTest>();
  const [loadError, setLoadError] = useState<string>();
  useEffect(() => {
    api
      .get<ActiveTest>(`/api/tests/${enc(id)}`)
      .then(setTest)
      .catch((e: Error) => setLoadError(e.message));
  }, [id]);
  if (loadError)
    return (
      <div className="stack">
        <ErrorBox error={loadError} />
        <p className="dim">
          Bài này có thể đã được nộp hoặc bỏ (kể cả trên thiết bị khác). <Link to="/history">Xem lịch sử</Link> · <Link to="/">Về Tổng quan</Link>
        </p>
      </div>
    );
  if (!test) return <Loading text="Đang mở bài test…" />;
  return <RunnerInner test={test} />;
}

function RunnerInner({ test }: { test: ActiveTest }) {
  const { examOf } = useStore();
  const examDef = examOf(test.exam);
  const n = test.questions.length;
  const practice = test.feedback === 'practice';
  const [answers, setAnswers] = useState<Record<string, TestAnswer>>(() => ({ ...test.answers }));
  const [current, setCurrent] = useState(() => Math.min(Math.max(0, test.current || 0), n - 1));
  const [elapsed, setElapsed] = useState(test.elapsedSec || 0);
  const [checks, setChecks] = useState<Record<string, CheckResponse>>({});
  const [checking, setChecking] = useState(false);
  const [limitMsg, setLimitMsg] = useState<string>();
  const [dialog, setDialog] = useState<'ask' | 'issue'>();
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showNav, setShowNav] = useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const currentRef = useRef(current);
  currentRef.current = current;
  const elapsedRef = useRef(elapsed);
  const qTime = useRef<Record<string, number>>(Object.fromEntries(Object.entries(test.answers).map(([k, a]) => [k, a.timeSec ?? 0])));
  const doneRef = useRef(false);
  const lastSavedElapsed = useRef(elapsed);

  const q = test.questions[current];
  const ans = answers[q.id];
  const chosen = ans?.chosen ?? [];
  const check = checks[q.id];
  const locked = practice && !!ans?.checked;
  const limit = test.minutes ? test.minutes * 60 : null;
  const remaining = limit !== null ? limit - elapsed : null;

  // ── saving ─────────────────────────────────────────────────────────────────
  const payload = useCallback((): SaveTestRequest => {
    const merged: Record<string, TestAnswer> = {};
    const ids = new Set([...Object.keys(answersRef.current), ...Object.keys(qTime.current)]);
    for (const qid of ids) {
      const a = answersRef.current[qid] ?? { chosen: [] };
      const t = qTime.current[qid];
      merged[qid] = t ? { ...a, timeSec: Math.round(t) } : a;
    }
    return { answers: merged, elapsedSec: Math.round(elapsedRef.current), current: currentRef.current };
  }, []);

  const save = useCallback(async () => {
    if (doneRef.current) return;
    setSaveState('saving');
    try {
      const p = payload();
      await api.put(`/api/tests/${enc(test.id)}`, p);
      lastSavedElapsed.current = p.elapsedSec;
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [payload, test.id]);

  // debounced save on every answer / navigation change
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [answers, current, save]);

  // periodic save (time) + on page hide + on leaving the runner
  useEffect(() => {
    const iv = setInterval(() => {
      if (Math.abs(elapsedRef.current - lastSavedElapsed.current) >= 10) void save();
    }, SAVE_PERIODIC_MS);
    const hide = () => {
      if (!doneRef.current) putKeepalive(`/api/tests/${enc(test.id)}`, payload());
    };
    const onVis = () => document.visibilityState === 'hidden' && hide();
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      window.removeEventListener('pagehide', hide);
      document.removeEventListener('visibilitychange', onVis);
      if (!doneRef.current) putKeepalive(`/api/tests/${enc(test.id)}`, payload());
    };
  }, [save, payload, test.id]);

  // ── submit ─────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    if (doneRef.current) return;
    setSubmitting(true);
    try {
      const p = payload();
      doneRef.current = true;
      const r = await api.post<{ resultId: string }>(`/api/tests/${enc(test.id)}/submit`, p);
      navigate(`/result/${enc(r.resultId)}`, { replace: true });
    } catch (e) {
      doneRef.current = false;
      setSubmitting(false);
      toast(`Nộp bài không thành công: ${(e as Error).message}`, 'bad');
    }
  }, [payload, test.id]);

  const askSubmit = async () => {
    const all = test.questions.map((x) => answersRef.current[x.id]);
    const unanswered = all.filter((a) => !a?.chosen?.length).length;
    const flagged = all.filter((a) => a?.flagged).length;
    const ok = await confirmDialog({
      title: 'Nộp bài?',
      body: (
        <div className="stack sm">
          <p style={{ margin: 0 }}>
            Đã trả lời <b>{n - unanswered}</b>/{n} câu.
          </p>
          {unanswered > 0 && <div className="alert warn small">⚠️ Còn {unanswered} câu chưa trả lời (tính là sai).</div>}
          {flagged > 0 && <div className="alert info small">🚩 {flagged} câu đang đánh dấu xem lại.</div>}
          {!unanswered && !flagged && <div className="small dim">Mọi câu đều đã có đáp án.</div>}
        </div>
      ),
      ok: 'Nộp bài',
      cancel: 'Làm tiếp',
    });
    if (ok) void doSubmit();
  };

  // ── timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      if (doneRef.current) return;
      elapsedRef.current += 1;
      if (document.visibilityState === 'visible') {
        const qid = test.questions[currentRef.current]?.id;
        if (qid) qTime.current[qid] = (qTime.current[qid] ?? 0) + 1;
      }
      setElapsed(elapsedRef.current);
    }, 1000);
    return () => clearInterval(iv);
  }, [test.questions]);

  const timeUp = remaining !== null && remaining <= 0;
  useEffect(() => {
    if (timeUp && !doneRef.current) {
      toast('⏰ Hết giờ — bài được nộp tự động.');
      void doSubmit();
    }
  }, [timeUp, doSubmit]);

  // ── answering ──────────────────────────────────────────────────────────────
  const pick = useCallback(
    (key: string) => {
      const qq = test.questions[currentRef.current];
      const a = answersRef.current[qq.id];
      if (practice && a?.checked) return;
      const cur = a?.chosen ?? [];
      let next: string[];
      if (qq.choose <= 1) next = [key];
      else if (cur.includes(key)) next = cur.filter((k) => k !== key);
      else if (cur.length >= qq.choose) {
        setLimitMsg(`Đã chọn đủ ${qq.choose} đáp án — bỏ một đáp án trước khi chọn đáp án khác.`);
        return;
      } else next = [...cur, key];
      setLimitMsg(undefined);
      setAnswers((as) => ({ ...as, [qq.id]: { ...as[qq.id], chosen: next } }));
    },
    [practice, test.questions],
  );

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(n - 1, i));
      setCurrent(next);
      setLimitMsg(undefined);
      setShowNav(false);
      window.scrollTo({ top: 0 });
    },
    [n],
  );

  const toggleFlag = useCallback(() => {
    const qq = test.questions[currentRef.current];
    setAnswers((as) => ({ ...as, [qq.id]: { ...(as[qq.id] ?? { chosen: [] }), flagged: !as[qq.id]?.flagged } }));
  }, [test.questions]);

  const doCheck = useCallback(async () => {
    const qq = test.questions[currentRef.current];
    const a = answersRef.current[qq.id];
    if (!practice || !a?.chosen?.length || a.checked || checking) return;
    setChecking(true);
    try {
      const r = await api.post<CheckResponse>(`/api/tests/${enc(test.id)}/check`, { qid: qq.id, chosen: a.chosen });
      setChecks((c) => ({ ...c, [qq.id]: r }));
      setAnswers((as) => ({ ...as, [qq.id]: { ...(as[qq.id] ?? { chosen: [] }), checked: true } }));
    } catch (e) {
      toast((e as Error).message, 'bad');
    } finally {
      setChecking(false);
    }
  }, [practice, checking, test.id, test.questions]);

  // a question checked earlier (reload / other device): fetch its verdict again when shown
  useEffect(() => {
    if (!practice || !ans?.checked || checks[q.id] || !ans.chosen.length) return;
    let stop = false;
    api
      .post<CheckResponse>(`/api/tests/${enc(test.id)}/check`, { qid: q.id, chosen: ans.chosen })
      .then((r) => !stop && setChecks((c) => ({ ...c, [q.id]: r })))
      .catch(() => undefined);
    return () => {
      stop = true;
    };
  }, [practice, ans?.checked, ans?.chosen, checks, q.id, test.id]);

  // ── keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (anyModalOpen() || e.metaKey || e.ctrlKey || e.altKey || doneRef.current) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const isChoiceInput = tag === 'INPUT' && ['radio', 'checkbox'].includes((t as HTMLInputElement).type);
      if ((tag === 'INPUT' && !isChoiceInput) || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;
      const qq = test.questions[currentRef.current];
      const k = e.key;
      const lower = k.toLowerCase();
      if (k === 'ArrowRight' || lower === 'j') {
        e.preventDefault();
        go(currentRef.current + 1);
      } else if (k === 'ArrowLeft' || lower === 'k') {
        e.preventDefault();
        go(currentRef.current - 1);
      } else if (lower === 'f' && (e.shiftKey || qq.options.length < 6)) {
        e.preventDefault();
        toggleFlag();
      } else if (/^[1-6]$/.test(k) || /^[a-f]$/.test(lower)) {
        const i = /^[1-6]$/.test(k) ? Number(k) - 1 : lower.charCodeAt(0) - 97;
        const opt = qq.options[i];
        if (opt) {
          e.preventDefault();
          pick(opt.key);
        }
      } else if (k === 'Enter') {
        if (tag === 'BUTTON' || tag === 'A') return;
        e.preventDefault();
        const a = answersRef.current[qq.id];
        if (practice && a?.chosen?.length && !a.checked) void doCheck();
        else if (currentRef.current < n - 1) go(currentRef.current + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, pick, toggleFlag, doCheck, practice, n, test.questions]);

  // ── view ───────────────────────────────────────────────────────────────────
  const answeredCount = useMemo(() => test.questions.filter((x) => answers[x.id]?.chosen?.length).length, [answers, test.questions]);
  const flaggedCount = useMemo(() => test.questions.filter((x) => answers[x.id]?.flagged).length, [answers, test.questions]);
  const scen = scenarioName(examDef, q.scenario);
  const domainLabel = examDef?.domains.find((d) => d.id === q.domain)?.name;
  const timerCls = remaining !== null ? (remaining <= 60 ? 'danger' : remaining <= 300 ? 'warn' : '') : '';
  const canAsk = practice ? !!ans?.checked : false;

  return (
    <div className="runner">
      <div className="runner-bar">
        <div className="runner-head">
          <div className="runner-title" title={test.title}>
            {test.title}
          </div>
          <div className="tiny muted">
            {test.exam} · {MODE_LABEL[test.mode] ?? test.mode} · {practice ? '🎓 Luyện' : '📝 Thi'} · {answeredCount}/{n} đã trả lời
            <span className={`save-state ${saveState}`}>
              {saveState === 'saving' ? ' · đang lưu…' : saveState === 'error' ? ' · ⚠️ chưa lưu được' : ' · đã lưu'}
            </span>
          </div>
        </div>
        <div className={`timer ${timerCls}`} role="timer" aria-label={remaining !== null ? 'Thời gian còn lại' : 'Thời gian đã làm'}>
          {remaining !== null ? '⏳ ' : '⏱ '}
          {fmtClock(remaining !== null ? Math.max(0, remaining) : elapsed)}
        </div>
        <button type="button" className="btn primary" onClick={() => void askSubmit()} disabled={submitting}>
          {submitting ? 'Đang nộp…' : 'Nộp bài'}
        </button>
      </div>
      <div className="progress-line" aria-hidden="true">
        <span style={{ width: `${(answeredCount / n) * 100}%` }} />
      </div>

      <div className="runner-grid">
        <div className="card q-card">
          {test.scenarios && test.scenarios.length > 0 && current === 0 && (
            <div className="tiny muted" style={{ marginBottom: 6 }}>
              Tình huống của đề: {test.scenarios.map((s) => scenarioName(examDef, s)).join(' · ')}
            </div>
          )}
          {scen && (
            <div className="scenario" title={`Tình huống ${q.scenario}`}>
              📌 Tình huống: <b>{scen}</b>
            </div>
          )}
          <div className="row between q-meta">
            <div className="row" style={{ gap: 8 }}>
              <span className="badge accent num">
                Câu {current + 1} / {n}
              </span>
              <span className="badge" title={domainLabel}>
                {q.domain}
                {domainLabel ? ` · ${domainLabel}` : ''}
              </span>
              <span className="tiny muted mono">{q.id}</span>
            </div>
            <button type="button" className={`btn sm ${ans?.flagged ? 'flag-on' : 'ghost'}`} onClick={toggleFlag} aria-pressed={!!ans?.flagged}>
              🚩 {ans?.flagged ? 'Đã đánh dấu' : 'Đánh dấu'}
            </button>
          </div>
          <Stem text={q.stem} />
          <ChooseHint n={q.choose} chosen={chosen.length} />
          <OptionList
            name={`q-${q.id}`}
            options={q.options}
            chosen={chosen}
            choose={q.choose}
            onPick={locked || submitting ? undefined : pick}
            answer={check?.answer}
          />
          {limitMsg && (
            <div className="alert warn small" role="status" style={{ marginTop: 10 }}>
              {limitMsg}
            </div>
          )}
          <div aria-live="polite">
            {check && (
              <div className={`explain ${check.correct ? 'good' : 'bad'}`}>
                <h4>
                  {check.correct ? '✅ Chính xác' : '❌ Chưa đúng'} — đáp án: {displayLetters(q.options, check.answer)}
                </h4>
                {check.explanation ? <Markdown text={check.explanation} /> : <span className="muted">Chưa có giải thích.</span>}
                {check.ref && (
                  <div className="small" style={{ marginTop: 8 }}>
                    <Link to={noteHref(check.ref)}>📖 Xem tài liệu</Link> <span className="tiny muted mono">{check.ref}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="row q-actions">
            {practice && !ans?.checked && (
              <button type="button" className="btn primary" disabled={!chosen.length || checking} onClick={() => void doCheck()}>
                {checking ? 'Đang kiểm tra…' : 'Kiểm tra'} <span className="kbd">Enter</span>
              </button>
            )}
            {canAsk && (
              <button type="button" className="btn" onClick={() => setDialog('ask')}>
                🤖 Hỏi AI
              </button>
            )}
            <button type="button" className="btn ghost" onClick={() => setDialog('issue')}>
              🐞 Báo lỗi
            </button>
            <span className="spacer" />
            <button type="button" className="btn hide-mobile" onClick={() => go(current - 1)} disabled={current === 0}>
              ← Trước
            </button>
            <button type="button" className="btn hide-mobile" onClick={() => go(current + 1)} disabled={current === n - 1}>
              Sau →
            </button>
          </div>
          {!practice && <div className="tiny muted" style={{ marginTop: 10 }}>📝 Chế độ thi: đáp án và giải thích hiện sau khi nộp bài.</div>}
        </div>

        <aside className={`runner-side card ${showNav ? 'open' : ''}`} aria-label="Danh sách câu">
          <div className="card-head">
            <h2>Câu hỏi</h2>
            <span className="tiny muted">
              {answeredCount}/{n} · 🚩 {flaggedCount}
            </span>
          </div>
          <div className="qnav">
            {test.questions.map((x, i) => {
              const a = answers[x.id];
              const c = checks[x.id];
              const cls = [
                a?.chosen?.length ? 'answered' : '',
                c ? (c.correct ? 'correct' : 'wrong') : '',
                i === current ? 'current' : '',
              ].join(' ');
              return (
                <button
                  key={x.id}
                  type="button"
                  className={cls}
                  onClick={() => go(i)}
                  aria-label={`Câu ${i + 1}${a?.chosen?.length ? ', đã trả lời' : ''}${a?.flagged ? ', đã đánh dấu' : ''}`}
                  aria-current={i === current ? 'step' : undefined}
                >
                  {i + 1}
                  {a?.flagged && (
                    <span className="flag" aria-hidden="true">
                      🚩
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="legend tiny muted">
            <span>
              <i className="sw answered" /> đã trả lời
            </span>
            <span>🚩 đánh dấu</span>
            <span>
              <i className="sw current" /> đang xem
            </span>
          </div>
          <div className="runner-keys tiny muted hide-mobile">
            <span className="kbd">1</span>–<span className="kbd">6</span> / <span className="kbd">A</span>–<span className="kbd">F</span> chọn ·{' '}
            <span className="kbd">←</span>
            <span className="kbd">→</span> hoặc <span className="kbd">K</span>
            <span className="kbd">J</span> chuyển câu · <span className="kbd">F</span> đánh dấu (câu 6 phương án: <span className="kbd">Shift+F</span>)
            {practice && (
              <>
                {' '}
                · <span className="kbd">Enter</span> kiểm tra / câu sau
              </>
            )}
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link to="/" className="btn ghost sm">
              ⏸ Lưu & thoát
            </Link>
          </div>
        </aside>
      </div>

      <div className="thumb-bar" role="toolbar" aria-label="Điều hướng câu">
        <button type="button" className="btn" onClick={() => go(current - 1)} disabled={current === 0} aria-label="Câu trước">
          ←
        </button>
        <button type="button" className="btn" onClick={() => setShowNav((s) => !s)} aria-expanded={showNav}>
          {current + 1}/{n}
        </button>
        {practice && !ans?.checked ? (
          <button type="button" className="btn primary grow" disabled={!chosen.length || checking} onClick={() => void doCheck()}>
            Kiểm tra
          </button>
        ) : (
          <button type="button" className={`btn grow ${ans?.flagged ? 'flag-on' : ''}`} onClick={toggleFlag} aria-pressed={!!ans?.flagged}>
            🚩
          </button>
        )}
        <button type="button" className="btn" onClick={() => go(current + 1)} disabled={current === n - 1} aria-label="Câu sau">
          →
        </button>
      </div>

      {dialog === 'ask' && <AskDialog qid={q.id} testId={test.id} stem={q.stem} onClose={() => setDialog(undefined)} />}
      {dialog === 'issue' && <IssueDialog qid={q.id} onClose={() => setDialog(undefined)} />}
    </div>
  );
}
