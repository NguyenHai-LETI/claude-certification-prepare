// ❌ Ôn câu sai: the review list (SPEC §3.3) of the selected exam, domain filter, start a review test.
import { useMemo, useState } from 'react';
import { enc } from '../lib/api.ts';
import { Link } from '../lib/router.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { fmtRelative } from '../lib/format.ts';
import { Empty, ErrorBox, Loading, PageHead, toast } from '../components/ui.tsx';
import { QuestionModal } from '../components/QuestionDetail.tsx';
import { startTest } from './Dashboard.tsx';
import type { DomainId, Pack, QuestionSummary } from '../../shared/types.ts';

export function Review() {
  const { exam, examDef, meta } = useStore();
  const { data, error, reload } = useFetch<{ questions: QuestionSummary[]; packs: Pack[] }>(`/api/bank?exam=${enc(exam)}&review=1`, ['bank', 'results']);
  const [domains, setDomains] = useState<DomainId[]>([]);
  const [count, setCount] = useState(meta?.defaults.count ?? 20);
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState<string>();

  const list = useMemo(
    () => (data?.questions ?? []).filter((q) => !domains.length || domains.includes(q.exams[exam] ?? '')),
    [data, domains, exam],
  );
  const byDomain = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of data?.questions ?? []) m.set(q.exams[exam] ?? '?', (m.get(q.exams[exam] ?? '?') ?? 0) + 1);
    return m;
  }, [data, exam]);

  const start = async () => {
    setBusy(true);
    try {
      await startTest({ exam, mode: 'review', domains: domains.length ? domains : undefined, count: Math.min(count, list.length) });
    } catch (e) {
      toast((e as Error).message, 'bad');
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <PageHead title="❌ Ôn câu sai" sub={`${exam}: câu từng trả lời sai và chưa đúng liên tiếp đủ số lần`} />
      <ErrorBox error={error} onRetry={reload} />
      {!data ? (
        !error && <Loading />
      ) : !data.questions.length ? (
        <Empty icon="🎉">
          Không có câu nào cần ôn cho {exam}. <Link to="/new">Làm bài mới</Link>
        </Empty>
      ) : (
        <>
          <section className="card">
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className={`chip ${!domains.length ? 'on' : ''}`} onClick={() => setDomains([])}>
                Tất cả <span className="n">{data.questions.length}</span>
              </button>
              {examDef?.domains
                .filter((d) => byDomain.get(d.id))
                .map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`chip ${domains.includes(d.id) ? 'on' : ''}`}
                    aria-pressed={domains.includes(d.id)}
                    title={d.name}
                    onClick={() => setDomains((ds) => (ds.includes(d.id) ? ds.filter((x) => x !== d.id) : [...ds, d.id]))}
                  >
                    {d.id} <span className="n">{byDomain.get(d.id)}</span>
                  </button>
                ))}
            </div>
            <div className="row" style={{ marginTop: 14 }}>
              <label className="row small">
                Số câu
                <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} style={{ width: 80 }} />
              </label>
              <button type="button" className="btn primary" disabled={busy || !list.length} onClick={() => void start()}>
                {busy ? 'Đang tạo…' : `▶ Ôn ${Math.min(count, list.length)} câu`}
              </button>
              <span className="tiny muted">Câu sai lâu nhất được ôn trước.</span>
            </div>
          </section>
          <section className="card flush">
            <div className="qlist">
              {list.map((q) => (
                <button key={q.id} type="button" className="qrow" onClick={() => setDetail(q.id)}>
                  <span className="mono tiny muted qid">{q.id}</span>
                  <span className="badge">{q.exams[exam]}</span>
                  <span className="grow qstem">{q.stem}</span>
                  <span className="tiny muted nowrap">
                    {q.stats.correct}/{q.stats.attempts} đúng{q.stats.lastAt ? ` · ${fmtRelative(q.stats.lastAt)}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      {detail && <QuestionModal qid={detail} onClose={() => setDetail(undefined)} />}
    </div>
  );
}
