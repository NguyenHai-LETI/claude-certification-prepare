// 🕘 Lịch sử: results of the selected exam (or all exams), open / delete (in-page confirm).
import { useState } from 'react';
import { api, enc, qs } from '../lib/api.ts';
import { Link } from '../lib/router.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { fmtDateTime, fmtDuration, fmtPct, MODE_LABEL } from '../lib/format.ts';
import { confirmDialog, Empty, ErrorBox, Loading, PageHead, toast } from '../components/ui.tsx';
import { ScoreBadge } from './Dashboard.tsx';
import type { ResultSummary } from '../../shared/types.ts';

export function History() {
  const { exam } = useStore();
  const [all, setAll] = useState(false);
  const { data, error, reload } = useFetch<ResultSummary[]>(`/api/results${qs({ exam: all ? undefined : exam })}`, ['results']);

  const remove = async (r: ResultSummary) => {
    const ok = await confirmDialog({
      title: 'Xoá kết quả?',
      body: (
        <p>
          Xoá <b>{r.title}</b> ({fmtDateTime(r.finishedAt)}, {r.score.correct}/{r.score.total}). Các câu trong bài này sẽ không còn được tính vào
          thống kê và danh sách ôn. Không hoàn tác được.
        </p>
      ),
      ok: 'Xoá',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/results/${enc(r.id)}`);
      toast('Đã xoá kết quả');
      reload();
    } catch (e) {
      toast((e as Error).message, 'bad');
    }
  };

  return (
    <div className="stack">
      <PageHead
        title="🕘 Lịch sử"
        sub={all ? 'Tất cả kỳ thi' : `Kỳ thi ${exam}`}
        actions={
          <label className="row small">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Hiện mọi kỳ thi
          </label>
        }
      />
      <ErrorBox error={error} onRetry={reload} />
      {!data ? (
        !error && <Loading />
      ) : !data.length ? (
        <Empty icon="📝">
          Chưa có bài nào. <Link to="/new">Tạo bài test</Link>
        </Empty>
      ) : (
        <div className="card flush">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bài</th>
                  <th className="hide-mobile">Kiểu</th>
                  <th className="num">Điểm</th>
                  <th className="hide-mobile num">Thời gian</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/result/${enc(r.id)}`} className="strong">
                        {r.title}
                      </Link>
                      <div className="tiny muted">
                        {all && <span className="badge">{r.exam}</span>} {fmtDateTime(r.finishedAt)}
                      </div>
                    </td>
                    <td className="hide-mobile small">{MODE_LABEL[r.mode] ?? r.mode}</td>
                    <td className="num">
                      <div>
                        {r.score.correct}/{r.score.total} · {fmtPct(r.score.pct)}
                      </div>
                      <ScoreBadge s={r.score} />
                    </td>
                    <td className="hide-mobile num small">{fmtDuration(r.durationSec)}</td>
                    <td className="num">
                      <button type="button" className="btn ghost sm danger" onClick={() => void remove(r)} aria-label={`Xoá ${r.title}`}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
