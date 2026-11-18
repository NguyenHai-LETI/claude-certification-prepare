// Full question (GET /api/questions/:id): answer, explanation, ref, history, issues, Hỏi AI / Báo lỗi. Used by the bank's detail
// panel, the review list and search hits.
import { useState } from 'react';
import { enc } from '../lib/api.ts';
import { Link, noteHref } from '../lib/router.ts';
import { scenarioName, useFetch, useStore } from '../lib/store.tsx';
import { Markdown } from '../lib/markdown.tsx';
import { fmtDateTime, letter } from '../lib/format.ts';
import { ErrorBox, Loading, Modal } from './ui.tsx';
import { ChooseHint, OptionList, Stem } from './QuestionView.tsx';
import { AskDialog } from './AskDialog.tsx';
import { IssueDialog } from './IssueDialog.tsx';
import type { ExamCode, QuestionDetail as QD } from '../../shared/types.ts';

const STATUS_LABEL = { active: 'đang dùng', draft: 'nháp', retired: 'đã loại' } as const;
const ISSUE_LABEL = { open: 'đang mở', fixed: 'đã sửa', wontfix: 'không sửa' } as const;

export function QuestionDetail({ qid }: { qid: string }) {
  const { examOf } = useStore();
  const { data: q, error, reload } = useFetch<QD>(`/api/questions/${enc(qid)}`, ['bank', 'results']);
  const [reveal, setReveal] = useState(true);
  const [dialog, setDialog] = useState<'ask' | 'issue'>();
  if (!q) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading />;
  const options = q.options.map((text, i) => ({ key: letter(i), text }));
  const scen = scenarioName(examOf('CCAR-F'), q.scenario);
  return (
    <div className="qdetail stack sm">
      <div className="row" style={{ gap: 6 }}>
        <span className="mono strong">{q.id}</span>
        {(Object.entries(q.exams) as [ExamCode, string][]).map(([ex, d]) => (
          <span key={ex} className="badge" title={examOf(ex)?.domains.find((x) => x.id === d)?.name}>
            {ex} · {d}
          </span>
        ))}
        {q.status !== 'active' && <span className="badge warn">{STATUS_LABEL[q.status]}</span>}
        {q.difficulty && <span className="badge">{q.difficulty}</span>}
        <span className="badge" title={q.file}>
          📦 {q.pack}
        </span>
      </div>
      {scen && <div className="scenario">📌 Tình huống: <b>{scen}</b></div>}
      <Stem text={q.stem} />
      <ChooseHint n={q.answer.length} />
      <OptionList name={`d-${q.id}`} options={options} chosen={[]} choose={q.answer.length} answer={reveal ? q.answer : undefined} />
      <div className="row">
        <button type="button" className="btn sm ghost" onClick={() => setReveal((r) => !r)}>
          {reveal ? '🙈 Ẩn đáp án' : '👁 Xem đáp án'}
        </button>
        <button type="button" className="btn sm" onClick={() => setDialog('ask')}>
          🤖 Hỏi AI
        </button>
        <button type="button" className="btn sm ghost" onClick={() => setDialog('issue')}>
          🐞 Báo lỗi
        </button>
      </div>
      {reveal && (
        <div className="explain">
          <h4>Đáp án: {q.answer.join(', ')}</h4>
          {q.explanation ? <Markdown text={q.explanation} /> : <span className="muted">Chưa có giải thích.</span>}
          {q.ref && (
            <div className="small" style={{ marginTop: 8 }}>
              <Link to={noteHref(q.ref)}>📖 Xem tài liệu</Link> <span className="tiny muted mono">{q.ref}</span>
            </div>
          )}
        </div>
      )}
      {q.tags && q.tags.length > 0 && (
        <div className="row tiny" style={{ gap: 4 }}>
          {q.tags.map((t) => (
            <span key={t} className="badge">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div>
        <h3 className="h3">
          Lịch sử ({q.stats.correct}/{q.stats.attempts} đúng){q.stats.inReview && <span className="badge bad"> cần ôn</span>}
        </h3>
        {q.history.length ? (
          <ul className="plain-list small">
            {q.history
              .slice()
              .reverse()
              .map((h) => (
                <li key={`${h.resultId}-${h.at}`}>
                  {h.correct ? '✅' : '❌'} {fmtDateTime(h.at)} · chọn {h.chosen.join(', ') || '—'} ·{' '}
                  <Link to={`/result/${enc(h.resultId)}`}>xem bài</Link>
                </li>
              ))}
          </ul>
        ) : (
          <div className="small muted">Chưa làm lần nào.</div>
        )}
      </div>
      {q.issues.length > 0 && (
        <div>
          <h3 className="h3">Báo lỗi ({q.issues.length})</h3>
          <ul className="plain-list small">
            {q.issues.map((i) => (
              <li key={i.id}>
                <span className={`badge ${i.status === 'open' ? 'warn' : i.status === 'fixed' ? 'good' : ''}`}>{ISSUE_LABEL[i.status]}</span>{' '}
                {fmtDateTime(i.at)} — {i.message}
                {i.resolution && <div className="tiny dim">Xử lý: {i.resolution}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="tiny muted mono">
        {q.file}
        {q.created ? ` · tạo ${q.created}` : ''}
        {q.reviewed ? ` · soát ${q.reviewed}` : ''}
      </div>
      {dialog === 'ask' && <AskDialog qid={q.id} stem={q.stem} onClose={() => setDialog(undefined)} />}
      {dialog === 'issue' && <IssueDialog qid={q.id} onClose={() => setDialog(undefined)} onDone={reload} />}
    </div>
  );
}

export function QuestionModal({ qid, onClose }: { qid: string; onClose: () => void }) {
  return (
    <Modal title={`Câu ${qid}`} onClose={onClose} wide>
      <QuestionDetail qid={qid} />
    </Modal>
  );
}
