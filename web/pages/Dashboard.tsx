// 🏠 Tổng quan: per-domain progress, estimated score vs 720, review / new counts, last mock, recent results, unfinished tests.
import { useState } from 'react';
import { api, enc } from '../lib/api.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { Link, navigate } from '../lib/router.ts';
import { fmtDuration, fmtPct, fmtRelative, MODE_LABEL } from '../lib/format.ts';
import { confirmDialog, Empty, ErrorBox, Loading, Meter, PageHead, toast } from '../components/ui.tsx';
import type { ActiveTest, ActiveTestSummary, BuildTestRequest, Dashboard as DashboardData, ResultSummary } from '../../shared/types.ts';

export async function startTest(req: BuildTestRequest) {
  const t = await api.post<ActiveTest>('/api/tests', req);
  navigate(`/test/${enc(t.id)}`);
}

export function ScoreBadge({ s }: { s: ResultSummary['score'] }) {
  return (
    <span className={`badge ${s.pass ? 'good' : 'bad'}`} title="Điểm quy đổi ước tính (thang 100–1000, đạt 720)">
      {s.scaled} · {s.pass ? 'Đạt' : 'Chưa đạt'}
    </span>
  );
}

export function ResultRow({ r }: { r: ResultSummary }) {
  return (
    <Link to={`/result/${enc(r.id)}`} className="list-row">
      <div className="grow">
        <div className="title">{r.title}</div>
        <div className="tiny muted">
          {MODE_LABEL[r.mode] ?? r.mode} · {fmtRelative(r.finishedAt)} · {fmtDuration(r.durationSec)}
        </div>
      </div>
      <div className="right">
        <div className="num strong">
          {r.score.correct}/{r.score.total} · {fmtPct(r.score.pct)}
        </div>
        <ScoreBadge s={r.score} />
      </div>
    </Link>
  );
}

export function ActiveTests({ tests, onChange }: { tests: ActiveTestSummary[]; onChange: () => void }) {
  if (!tests.length) return null;
  const discard = async (t: ActiveTestSummary) => {
    const ok = await confirmDialog({
      title: 'Bỏ bài đang làm?',
      body: (
        <p>
          Bỏ <b>{t.title}</b> ({t.answered}/{t.total} câu đã trả lời). Bài này sẽ không được lưu vào lịch sử.
        </p>
      ),
      ok: 'Bỏ bài',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/tests/${enc(t.id)}`);
      toast('Đã bỏ bài đang làm');
      onChange();
    } catch (e) {
      toast((e as Error).message, 'bad');
    }
  };
  return (
    <section className="card resume-card">
      <h2>⏯️ Bài đang làm dở</h2>
      <div className="stack sm">
        {tests.map((t) => (
          <div key={t.id} className="list-row static">
            <div className="grow">
              <div className="title">
                {t.title} <span className="badge">{t.exam}</span>
              </div>
              <div className="tiny muted">
                {MODE_LABEL[t.mode] ?? t.mode} · bắt đầu {fmtRelative(t.createdAt)} · {t.answered}/{t.total} câu
              </div>
            </div>
            <div className="row">
              <Link to={`/test/${enc(t.id)}`} className="btn primary sm">
                Làm tiếp
              </Link>
              <button type="button" className="btn ghost sm danger" onClick={() => void discard(t)}>
                Bỏ
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Dashboard() {
  const { exam, examDef, meta } = useStore();
  const { data, error, loading, reload } = useFetch<DashboardData>(`/api/dashboard?exam=${enc(exam)}`, ['results', 'bank']);
  const [busy, setBusy] = useState<string>();
  const passPct = 72;

  const start = async (key: string, req: BuildTestRequest) => {
    setBusy(key);
    try {
      await startTest(req);
    } catch (e) {
      toast((e as Error).message, 'bad');
      setBusy(undefined);
    }
  };

  if (!data) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading />;
  const est = data.estimate;
  const count = meta?.defaults.count ?? 20;

  return (
    <div className="stack">
      <PageHead
        title={`${exam} · ${examDef?.short ?? ''}`}
        sub={examDef ? `${examDef.name} — đề thật ${examDef.questions} câu / ${examDef.minutes} phút, đạt ${examDef.pass}/1000` : undefined}
        actions={
          <>
            {loading && <span className="spinner" aria-label="Đang cập nhật" />}
            <Link to="/new" className="btn primary">
              ✍️ Tạo bài test
            </Link>
          </>
        }
      />
      <ErrorBox error={error} />
      <ActiveTests tests={data.activeTests} onChange={reload} />

      <div className="grid c3">
        <div className="kpi">
          <div className="label">Điểm ước tính</div>
          <div className={`value ${est.pass === null ? '' : est.pass ? 'good' : 'bad'}`}>{est.scaled ?? '—'}</div>
          <div className="sub">
            {est.pct !== null ? `${fmtPct(est.pct)} đúng (3 lần gần nhất mỗi câu)` : 'Chưa làm câu nào'} · <b>ước tính</b>, đạt ≥ {examDef?.pass ?? 720}
          </div>
          {est.scaled !== null && <Meter pct={((est.scaled - 100) / 900) * 100} target={((720 - 100) / 900) * 100} tone={est.pass ? 'ok' : 'bad'} />}
        </div>
        <div className="kpi">
          <div className="label">❌ Câu cần ôn lại</div>
          <div className="value">{data.reviewCount}</div>
          <div className="sub">Câu từng sai, chưa đúng liên tiếp đủ số lần</div>
          <div className="row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn sm primary"
              disabled={!data.reviewCount || !!busy}
              onClick={() => void start('review', { exam, mode: 'review', count: Math.min(count, data.reviewCount) })}
            >
              {busy === 'review' ? 'Đang tạo…' : `Ôn ${Math.min(count, data.reviewCount)} câu`}
            </button>
            <Link to="/review" className="btn sm ghost">
              Xem danh sách
            </Link>
          </div>
        </div>
        <div className="kpi">
          <div className="label">🆕 Câu chưa làm</div>
          <div className="value">
            {data.newCount}
            <span className="small muted"> / {data.totalQuestions}</span>
          </div>
          <div className="sub">Câu của {exam} chưa trả lời lần nào</div>
          <div className="row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn sm primary"
              disabled={!data.newCount || !!busy}
              onClick={() => void start('new', { exam, mode: 'new', count: Math.min(count, data.newCount) })}
            >
              {busy === 'new' ? 'Đang tạo…' : `Làm ${Math.min(count, data.newCount)} câu mới`}
            </button>
          </div>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Tiến độ theo domain</h2>
          <span className="tiny muted">% đúng · đã làm / số câu · trọng số đề</span>
        </div>
        <div className="domain-bars">
          {data.domains.map((d) => (
            <Link key={d.domain} to={`/bank?domain=${enc(d.domain)}`} className="domain-bar">
              <div className="dlabel">
                <b>{d.domain}</b> <span className="dim">{d.name}</span>
              </div>
              <Meter pct={d.pct} target={passPct} tone={d.pct === null ? undefined : d.pct >= passPct ? 'ok' : d.pct >= 50 ? 'warn' : 'bad'} />
              <div className="dstats num small">
                <b>{fmtPct(d.pct)}</b> · {d.seen}/{d.questions} · {d.weight}%
              </div>
            </Link>
          ))}
        </div>
        <div className="tiny muted" style={{ marginTop: 8 }}>
          Vạch dọc = {passPct}% (mức tương ứng 720 điểm, ước tính). Bấm một domain để xem câu hỏi.
        </div>
      </section>

      <div className="grid c2">
        <section className="card">
          <div className="card-head">
            <h2>🏁 Thi thử gần nhất</h2>
            <button
              type="button"
              className="btn sm"
              disabled={!!busy}
              onClick={() => void start('mock', { exam, mode: 'mock' })}
            >
              {busy === 'mock' ? 'Đang tạo…' : `Thi thử ${examDef?.questions ?? ''} câu`}
            </button>
          </div>
          {data.lastMock ? (
            <ResultRow r={data.lastMock} />
          ) : (
            <Empty icon="🏁">Chưa có bài thi thử nào cho {exam}.</Empty>
          )}
        </section>
        <section className="card">
          <div className="card-head">
            <h2>🕘 Kết quả gần đây</h2>
            <Link to="/history" className="btn ghost sm">
              Tất cả
            </Link>
          </div>
          {data.recent.length ? (
            <div className="stack sm">
              {data.recent.map((r) => (
                <ResultRow key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <Empty icon="📝">Chưa có kết quả nào. Bắt đầu bằng ✍️ Tạo bài test.</Empty>
          )}
        </section>
      </div>
    </div>
  );
}
