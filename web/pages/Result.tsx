// Result (/result/:id): score, estimated scaled score vs pass, time, per-domain table, CCAR-F scenarios, every question with
// filter (Tất cả / Sai / Đánh dấu) — your choice vs key, explanation, ref, Hỏi AI, Báo lỗi. "Làm lại các câu sai".
import { useMemo, useState } from 'react';
import { enc } from '../lib/api.ts';
import { Link, noteHref } from '../lib/router.ts';
import { scenarioName, useFetch, useStore } from '../lib/store.tsx';
import { Markdown } from '../lib/markdown.tsx';
import { fmtDateTime, fmtDuration, fmtPct, MODE_LABEL, letter } from '../lib/format.ts';
import { ErrorBox, Loading, Meter, PageHead, toast } from '../components/ui.tsx';
import { ChooseHint, OptionList, Stem } from '../components/QuestionView.tsx';
import { AskDialog } from '../components/AskDialog.tsx';
import { IssueDialog } from '../components/IssueDialog.tsx';
import { startTest } from './Dashboard.tsx';
import type { Question, ResultDetail, ResultItem } from '../../shared/types.ts';

type Filter = 'all' | 'wrong' | 'flagged';

export function ResultPage({ id }: { id: string }) {
  const { examOf } = useStore();
  const { data: r, error, reload } = useFetch<ResultDetail>(`/api/results/${enc(id)}`, ['results']);
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ kind: 'ask' | 'issue'; qid: string; stem?: string }>();
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => {
    if (!r) return [];
    return r.items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => (filter === 'wrong' ? !it.correct : filter === 'flagged' ? it.flagged : true));
  }, [r, filter]);

  if (!r) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading text="Đang tải kết quả…" />;
  const def = examOf(r.exam);
  const wrong = r.items.filter((x) => !x.correct);
  const flagged = r.items.filter((x) => x.flagged).length;
  const pass = def?.pass ?? 720;

  const retryWrong = async () => {
    setBusy(true);
    try {
      await startTest({ exam: r.exam, mode: 'ids', ids: wrong.map((x) => x.qid), feedback: 'practice', minutes: null, title: `Làm lại câu sai · ${r.title}` });
    } catch (e) {
      toast((e as Error).message, 'bad');
      setBusy(false);
    }
  };

  const toggle = (qid: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(qid)) n.delete(qid);
      else n.add(qid);
      return n;
    });

  return (
    <div className="stack">
      <PageHead
        title={r.title}
        sub={`${r.exam} · ${MODE_LABEL[r.mode] ?? r.mode} · ${r.feedback === 'exam' ? '📝 Thi' : '🎓 Luyện'} · nộp lúc ${fmtDateTime(r.finishedAt)}`}
        actions={
          <>
            <button type="button" className="btn primary" disabled={!wrong.length || busy} onClick={() => void retryWrong()}>
              {busy ? 'Đang tạo…' : `🔁 Làm lại các câu sai (${wrong.length})`}
            </button>
            <Link to="/" className="btn">
              Về Tổng quan
            </Link>
          </>
        }
      />

      <div className="grid c3">
        <div className="kpi">
          <div className="label">Kết quả</div>
          <div className="value">
            {r.score.correct}/{r.score.total} <span className="small dim">· {fmtPct(r.score.pct, 1)}</span>
          </div>
          <Meter pct={r.score.pct} target={72} tone={r.score.pass ? 'ok' : 'bad'} />
        </div>
        <div className="kpi">
          <div className="label">Điểm quy đổi (ước tính)</div>
          <div className={`value ${r.score.pass ? 'good' : 'bad'}`}>
            {r.score.scaled} <span className="small">{r.score.pass ? '✅ Đạt' : '❌ Chưa đạt'}</span>
          </div>
          <div className="sub">Thang 100–1000, đạt ≥ {pass}. Anthropic không công bố cách quy đổi — chỉ để tham khảo.</div>
        </div>
        <div className="kpi">
          <div className="label">Thời gian</div>
          <div className="value">{fmtDuration(r.durationSec)}</div>
          <div className="sub">
            {r.minutes ? `Giới hạn ${r.minutes} phút` : 'Không hẹn giờ'} · TB {fmtDuration(r.items.length ? r.durationSec / r.items.length : 0)}/câu
          </div>
        </div>
      </div>

      <section className="card">
        <h2>Theo domain</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Domain</th>
                <th className="num">Đúng</th>
                <th className="num">%</th>
                <th className="hide-mobile">Tỉ lệ</th>
              </tr>
            </thead>
            <tbody>
              {r.byDomain.map((d) => {
                const pct = d.total ? (d.correct / d.total) * 100 : null;
                return (
                  <tr key={d.domain}>
                    <td>
                      <b>{d.domain}</b> <span className="dim small">{def?.domains.find((x) => x.id === d.domain)?.name}</span>
                    </td>
                    <td className="num">
                      {d.correct}/{d.total}
                    </td>
                    <td className={`num ${pct === null ? '' : pct >= 72 ? 'good' : 'bad'}`}>{fmtPct(pct)}</td>
                    <td className="hide-mobile" style={{ width: '30%' }}>
                      <Meter pct={pct} target={72} tone={pct === null ? undefined : pct >= 72 ? 'ok' : 'bad'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {r.scenarios && r.scenarios.length > 0 && (
          <div className="small" style={{ marginTop: 12 }}>
            📌 Tình huống được bốc:{' '}
            {r.scenarios.map((s) => (
              <span key={s} className="badge" style={{ marginRight: 6 }}>
                {s} · {scenarioName(def, s)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Các câu hỏi</h2>
          <div className="seg" role="group" aria-label="Lọc câu">
            {(
              [
                ['all', `Tất cả (${r.items.length})`],
                ['wrong', `Sai (${wrong.length})`],
                ['flagged', `Đánh dấu (${flagged})`],
              ] as [Filter, string][]
            ).map(([f, label]) => (
              <button key={f} type="button" className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="row" style={{ marginBottom: 8 }}>
          <button type="button" className="btn ghost sm" onClick={() => setOpen(new Set(items.map(({ it }) => it.qid)))}>
            Mở tất cả
          </button>
          <button type="button" className="btn ghost sm" onClick={() => setOpen(new Set())}>
            Thu gọn
          </button>
        </div>
        {!items.length && <div className="empty small">Không có câu nào trong mục này.</div>}
        <div className="stack sm">
          {items.map(({ it, i }) => (
            <ResultQuestion
              key={it.qid}
              index={i}
              item={it}
              q={r.questions[it.qid]}
              open={open.has(it.qid)}
              onToggle={() => toggle(it.qid)}
              onAsk={() => setDialog({ kind: 'ask', qid: it.qid, stem: r.questions[it.qid]?.stem })}
              onIssue={() => setDialog({ kind: 'issue', qid: it.qid })}
              scenario={scenarioName(def, r.questions[it.qid]?.scenario)}
            />
          ))}
        </div>
      </section>
      {dialog?.kind === 'ask' && <AskDialog qid={dialog.qid} stem={dialog.stem} onClose={() => setDialog(undefined)} />}
      {dialog?.kind === 'issue' && <IssueDialog qid={dialog.qid} onClose={() => setDialog(undefined)} />}
    </div>
  );
}

function ResultQuestion({
  index,
  item,
  q,
  open,
  onToggle,
  onAsk,
  onIssue,
  scenario,
}: {
  index: number;
  item: ResultItem;
  q?: Question;
  open: boolean;
  onToggle: () => void;
  onAsk: () => void;
  onIssue: () => void;
  scenario?: string;
}) {
  const options = q ? q.options.map((text, i) => ({ key: letter(i), text })) : [];
  const status = !item.chosen.length ? '⏭' : item.correct ? '✅' : '❌';
  const plain = (q?.stem ?? '').replace(/[`*_#>]/g, '').replace(/\s+/g, ' ').slice(0, 160);
  return (
    <div className={`rq ${item.correct ? 'ok' : 'bad'} ${open ? 'open' : ''}`}>
      <button type="button" className="rq-head" onClick={onToggle} aria-expanded={open}>
        <span className="rq-status" aria-label={item.correct ? 'Đúng' : 'Sai'}>
          {status}
        </span>
        <span className="num strong">{index + 1}.</span>
        <span className="rq-stem">{q ? plain : <i className="muted">Câu {item.qid} không còn trong ngân hàng</i>}</span>
        <span className="rq-meta tiny muted nowrap">
          {item.flagged && '🚩 '}
          {item.domain} · {item.chosen.join(',') || '—'} / {item.answer.join(',')}
        </span>
      </button>
      {open && (
        <div className="rq-body">
          {scenario && <div className="scenario">📌 Tình huống: <b>{scenario}</b></div>}
          <div className="tiny muted mono" style={{ marginBottom: 6 }}>
            {item.qid}
            {item.timeSec ? ` · ${fmtDuration(item.timeSec)}` : ''}
          </div>
          {q ? (
            <>
              <Stem text={q.stem} />
              <ChooseHint n={item.answer.length} />
              <OptionList name={`r-${item.qid}`} options={options} chosen={item.chosen} choose={item.answer.length} answer={item.answer} />
              <div className={`explain ${item.correct ? 'good' : 'bad'}`}>
                <h4>
                  {!item.chosen.length ? '⏭ Bỏ trống' : item.correct ? '✅ Chính xác' : '❌ Chưa đúng'} — đáp án: {item.answer.join(', ')}
                </h4>
                {q.explanation ? <Markdown text={q.explanation} /> : <span className="muted">Chưa có giải thích.</span>}
                {q.ref && (
                  <div className="small" style={{ marginTop: 8 }}>
                    <Link to={noteHref(q.ref)}>📖 Xem tài liệu</Link> <span className="tiny muted mono">{q.ref}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="small dim">
              Bạn chọn: {item.chosen.join(', ') || '—'} · Đáp án: {item.answer.join(', ')}
            </div>
          )}
          <div className="row" style={{ marginTop: 10 }}>
            {q && (
              <button type="button" className="btn sm" onClick={onAsk}>
                🤖 Hỏi AI
              </button>
            )}
            <button type="button" className="btn ghost sm" onClick={onIssue}>
              🐞 Báo lỗi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

