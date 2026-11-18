// ✍️ Tạo bài test: mode (SPEC §3.2), domains, count, feedback (Thi / Luyện), timer → POST /api/tests → runner.
import { useEffect, useState } from 'react';
import { enc } from '../lib/api.ts';
import { useRoute } from '../lib/router.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { PageHead, toast } from '../components/ui.tsx';
import { startTest } from './Dashboard.tsx';
import type { Dashboard, DomainId, Feedback, TestMode } from '../../shared/types.ts';

const MODES: { id: Exclude<TestMode, 'ids'>; icon: string; label: string; desc: string }[] = [
  { id: 'mock', icon: '🏁', label: 'Thi thử full', desc: 'Đủ số câu và thời gian như đề thật, chia theo trọng số domain.' },
  { id: 'domain', icon: '🎯', label: 'Theo domain', desc: 'Chọn một hoặc nhiều domain để luyện tập trung.' },
  { id: 'review', icon: '❌', label: 'Ôn câu sai', desc: 'Câu từng trả lời sai, chưa đúng liên tiếp đủ số lần.' },
  { id: 'new', icon: '🆕', label: 'Câu chưa làm', desc: 'Chỉ những câu bạn chưa trả lời lần nào.' },
  { id: 'random', icon: '🎲', label: 'Ngẫu nhiên', desc: 'Câu bất kỳ của kỳ thi này.' },
];

export function NewTest() {
  const route = useRoute();
  const { exam, examDef, meta } = useStore();
  const { data: dash } = useFetch<Dashboard>(`/api/dashboard?exam=${enc(exam)}`, ['results', 'bank']);
  const initialMode = (MODES.find((m) => m.id === route.query.get('mode'))?.id ?? 'domain') as Exclude<TestMode, 'ids'>;
  const [mode, setMode] = useState<Exclude<TestMode, 'ids'>>(initialMode);
  const [domains, setDomains] = useState<DomainId[]>(() => (route.query.get('domain') ? [route.query.get('domain')!] : []));
  const [count, setCount] = useState<number>(meta?.defaults.count ?? 20);
  const [feedback, setFeedback] = useState<Feedback>(initialMode === 'mock' ? 'exam' : 'practice');
  const [timed, setTimed] = useState(initialMode === 'mock');
  const [minutes, setMinutes] = useState<number>(examDef?.minutes ?? 120);
  const [busy, setBusy] = useState(false);

  // sensible defaults when the mode changes
  useEffect(() => {
    if (mode === 'mock') {
      setFeedback('exam');
      setTimed(true);
      setMinutes(examDef?.minutes ?? 120);
    } else {
      setFeedback('practice');
      setTimed(false);
      setMinutes(Math.max(5, Math.round(count * (examDef ? examDef.minutes / examDef.questions : 2))));
    }
  }, [mode, examDef?.code]);

  // the exam switched → drop domains that don't exist there
  useEffect(() => {
    setDomains((ds) => ds.filter((d) => examDef?.domains.some((x) => x.id === d)));
  }, [examDef]);

  const toggleDomain = (id: DomainId) => setDomains((ds) => (ds.includes(id) ? ds.filter((d) => d !== id) : [...ds, id]));
  const dq = (id: DomainId) => dash?.domains.find((d) => d.domain === id)?.questions;

  const available =
    mode === 'mock'
      ? dash?.totalQuestions
      : mode === 'review'
        ? dash?.reviewCount
        : mode === 'new'
          ? dash?.newCount
          : domains.length
            ? domains.reduce((s, d) => s + (dq(d) ?? 0), 0)
            : dash?.totalQuestions;

  const canStart = !busy && (mode !== 'domain' || domains.length > 0) && count > 0;

  const submit = async () => {
    setBusy(true);
    try {
      await startTest({
        exam,
        mode,
        domains: mode === 'mock' || !domains.length ? undefined : domains,
        count: mode === 'mock' ? undefined : count,
        feedback,
        minutes: timed ? minutes : null,
      });
    } catch (e) {
      toast((e as Error).message, 'bad');
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <PageHead title="✍️ Tạo bài test" sub={`${exam} · ${examDef?.name ?? ''}`} />
      <section className="card">
        <h2>Kiểu bài</h2>
        <div className="mode-grid" role="radiogroup" aria-label="Kiểu bài">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              className={`mode-card ${mode === m.id ? 'on' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className="mode-ico" aria-hidden="true">
                {m.icon}
              </span>
              <span className="mode-label">{m.label}</span>
              <span className="tiny dim">
                {m.id === 'mock' && examDef ? `${examDef.questions} câu / ${examDef.minutes} phút. ` : ''}
                {m.desc}
              </span>
              {m.id === 'review' && dash && <span className="badge">{dash.reviewCount} câu</span>}
              {m.id === 'new' && dash && <span className="badge">{dash.newCount} câu</span>}
            </button>
          ))}
        </div>
      </section>

      {mode !== 'mock' && examDef && (
        <section className="card">
          <div className="card-head">
            <h2>{mode === 'domain' ? 'Chọn domain' : 'Lọc theo domain (tuỳ chọn)'}</h2>
            <div className="row">
              <button type="button" className="btn ghost sm" onClick={() => setDomains(examDef.domains.map((d) => d.id))}>
                Chọn hết
              </button>
              <button type="button" className="btn ghost sm" onClick={() => setDomains([])}>
                Bỏ chọn
              </button>
            </div>
          </div>
          <div className="check-list">
            {examDef.domains.map((d) => (
              <label key={d.id} className={`check-row ${domains.includes(d.id) ? 'on' : ''}`}>
                <input type="checkbox" checked={domains.includes(d.id)} onChange={() => toggleDomain(d.id)} />
                <span className="grow">
                  <b>{d.id}</b> {d.name}
                </span>
                <span className="tiny muted nowrap">
                  {dq(d.id) ?? '…'} câu · {d.weight}%
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <h2>Thiết lập</h2>
        <div className="settings-grid">
          {mode === 'mock' ? (
            <div className="field">
              <span>Số câu</span>
              <div className="strong">
                {examDef?.questions} câu (như đề thật){examDef?.scenarioPick ? ` · bốc ${examDef.scenarioPick} tình huống ngẫu nhiên` : ''}
              </div>
            </div>
          ) : (
            <label className="field">
              Số câu
              <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))} />
              {available !== undefined && <span className="tiny muted">Có sẵn: {available} câu</span>}
            </label>
          )}
          <div className="field">
            <span id="fb-label">Chế độ</span>
            <div className="seg" role="group" aria-labelledby="fb-label">
              <button type="button" className={feedback === 'exam' ? 'on' : ''} aria-pressed={feedback === 'exam'} onClick={() => setFeedback('exam')}>
                📝 Thi
              </button>
              <button type="button" className={feedback === 'practice' ? 'on' : ''} aria-pressed={feedback === 'practice'} onClick={() => setFeedback('practice')}>
                🎓 Luyện
              </button>
            </div>
            <span className="tiny muted">{feedback === 'exam' ? 'Xem đáp án khi nộp bài.' : 'Kiểm tra đáp án từng câu, có giải thích ngay.'}</span>
          </div>
          <div className="field">
            <span id="timer-label">Hẹn giờ</span>
            <div className="row">
              <div className="seg" role="group" aria-labelledby="timer-label">
                <button type="button" className={!timed ? 'on' : ''} aria-pressed={!timed} onClick={() => setTimed(false)}>
                  Không
                </button>
                <button type="button" className={timed ? 'on' : ''} aria-pressed={timed} onClick={() => setTimed(true)}>
                  Có
                </button>
              </div>
              {timed && (
                <label className="row small" style={{ gap: 6 }}>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(1, Math.min(600, Number(e.target.value) || 1)))}
                    style={{ width: 80 }}
                    aria-label="Số phút"
                  />
                  phút
                </label>
              )}
            </div>
            <span className="tiny muted">{timed ? 'Hết giờ sẽ tự nộp bài.' : 'Chỉ đếm thời gian đã làm.'}</span>
          </div>
        </div>
      </section>

      <div className="row between sticky-actions">
        <span className="small dim">
          {mode === 'domain' && !domains.length ? 'Chọn ít nhất một domain.' : ''}
          {available === 0 ? ' Không có câu nào phù hợp.' : ''}
        </span>
        <button type="button" className="btn primary lg" disabled={!canStart} onClick={() => void submit()}>
          {busy ? 'Đang tạo…' : '▶ Bắt đầu'}
        </button>
      </div>
    </div>
  );
}
