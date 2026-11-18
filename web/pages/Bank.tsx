// 🗂️ Ngân hàng: filters in the query string (domain, pack, status, q, review, seen, lesson, id = open question), paginated
// list, detail panel, "Làm các câu đang lọc" (mode ids, ≤ 60).
import { useEffect, useMemo, useState } from 'react';
import { qs } from '../lib/api.ts';
import { setQuery, useRoute } from '../lib/router.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { Empty, ErrorBox, Loading, PageHead, toast } from '../components/ui.tsx';
import { QuestionDetail } from '../components/QuestionDetail.tsx';
import { startTest } from './Dashboard.tsx';
import type { NoteEntry, Pack, QuestionSummary } from '../../shared/types.ts';

const PAGE = 50;
const MAX_IDS = 60;

export function Bank() {
  const route = useRoute();
  const { exam, examDef } = useStore();
  const f = route.query;
  const domain = f.get('domain') ?? '';
  const pack = f.get('pack') ?? '';
  const status = f.get('status') ?? '';
  const q = f.get('q') ?? '';
  const review = f.get('review') === '1';
  const seen = f.get('seen') ?? '';
  const lesson = f.get('lesson') ?? '';
  const open = f.get('id') ?? '';
  const page = Math.max(1, Number(f.get('page')) || 1);

  const url = `/api/bank${qs({ exam, domain, pack, status, q, review: review ? 1 : undefined, seen, lesson })}`;
  const { data, error, loading, reload } = useFetch<{ questions: QuestionSummary[]; packs: Pack[] }>(url, ['bank', 'results']);
  const { data: notes } = useFetch<NoteEntry[]>(lesson ? '/api/notes' : null, ['notes']);
  const [search, setSearch] = useState(q);
  const [busy, setBusy] = useState(false);

  useEffect(() => setSearch(q), [q]);
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setQuery({ q: search.trim() || undefined, page: undefined }), 300);
    return () => clearTimeout(t);
  }, [search, q]);

  const list = data?.questions ?? [];
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = useMemo(() => list.slice((page - 1) * PAGE, page * PAGE), [list, page]);
  const lessonTitle = useMemo(() => {
    if (!lesson) return '';
    const nn = lesson.padStart(2, '0');
    const e = notes?.find((n) => n.path.startsWith(`lessons/${nn}-`) || n.path.startsWith(`lessons/${lesson}-`));
    return e ? `Bài ${nn}: ${e.title}` : `Bài ${nn}`;
  }, [lesson, notes]);

  const set = (patch: Record<string, string | undefined>) => setQuery({ ...patch, page: undefined });

  const practice = async () => {
    const ids = list.filter((x) => x.status === 'active').slice(0, MAX_IDS).map((x) => x.id);
    if (!ids.length) return;
    setBusy(true);
    try {
      await startTest({ exam, mode: 'ids', ids, feedback: 'practice', minutes: null, title: `Ngân hàng · ${ids.length} câu đang lọc` });
    } catch (e) {
      toast((e as Error).message, 'bad');
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      <PageHead
        title="🗂️ Ngân hàng câu hỏi"
        sub={data ? `${exam}: ${list.length} câu khớp bộ lọc` : exam}
        actions={
          <button type="button" className="btn primary" disabled={busy || !list.length} onClick={() => void practice()}>
            {busy ? 'Đang tạo…' : `▶ Làm các câu đang lọc (${Math.min(MAX_IDS, list.filter((x) => x.status === 'active').length)})`}
          </button>
        }
      />
      <section className="card filters">
        <label className="field grow">
          Tìm
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Từ khoá trong câu hỏi, id…" />
        </label>
        <label className="field">
          Domain
          <select value={domain} onChange={(e) => set({ domain: e.target.value || undefined })}>
            <option value="">Tất cả</option>
            {examDef?.domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} · {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Pack
          <select value={pack} onChange={(e) => set({ pack: e.target.value || undefined })}>
            <option value="">Tất cả</option>
            {data?.packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.length > 40 ? `${p.id} (${p.count})` : `${p.title} (${p.count})`}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Trạng thái
          <select value={status} onChange={(e) => set({ status: e.target.value || undefined })}>
            <option value="">Mặc định</option>
            <option value="active">Đang dùng</option>
            <option value="draft">Nháp</option>
            <option value="retired">Đã loại</option>
          </select>
        </label>
        <div className="field">
          <span>Lọc nhanh</span>
          <div className="row" style={{ gap: 6 }}>
            <button type="button" className={`chip ${review ? 'on' : ''}`} aria-pressed={review} onClick={() => set({ review: review ? undefined : '1' })}>
              ❌ Chỉ câu sai
            </button>
            <button type="button" className={`chip ${seen === '0' ? 'on' : ''}`} aria-pressed={seen === '0'} onClick={() => set({ seen: seen === '0' ? undefined : '0' })}>
              🆕 Chưa làm
            </button>
          </div>
        </div>
        {lesson && (
          <div className="field">
            <span>Bài học</span>
            <button type="button" className="chip on" onClick={() => set({ lesson: undefined })} aria-label={`Bỏ lọc ${lessonTitle}`}>
              📖 {lessonTitle} ✕
            </button>
          </div>
        )}
      </section>
      <ErrorBox error={error} onRetry={reload} />
      <div className={`bank-split ${open ? 'has-detail' : ''}`}>
        <section className="card flush">
          {!data ? (
            !error && <Loading />
          ) : !list.length ? (
            <Empty icon="🔍">Không có câu nào khớp bộ lọc.</Empty>
          ) : (
            <>
              <div className="qlist" aria-busy={loading}>
                {shown.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className={`qrow ${open === x.id ? 'on' : ''}`}
                    onClick={() => setQuery({ id: open === x.id ? undefined : x.id })}
                    aria-pressed={open === x.id}
                  >
                    <span className="mono tiny muted qid">{x.id}</span>
                    <span className="badge">{x.exams[exam] ?? '—'}</span>
                    {x.multi && <span className="badge accent" title="Nhiều đáp án">☑</span>}
                    {x.status !== 'active' && <span className="badge warn">{x.status}</span>}
                    <span className="grow qstem">{x.stem}</span>
                    <span className={`tiny nowrap ${x.stats.inReview ? 'bad' : x.stats.attempts ? 'good' : 'muted'}`}>
                      {x.stats.attempts ? `${x.stats.correct}/${x.stats.attempts}` : 'mới'}
                    </span>
                  </button>
                ))}
              </div>
              {pages > 1 && (
                <div className="pager row">
                  <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setQuery({ page: String(page - 1) })}>
                    ← Trước
                  </button>
                  <span className="small num">
                    Trang {page}/{pages}
                  </span>
                  <button type="button" className="btn sm" disabled={page >= pages} onClick={() => setQuery({ page: String(page + 1) })}>
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        {open && (
          <aside className="card bank-detail" aria-label={`Chi tiết câu ${open}`}>
            <div className="row between bank-detail-head">
              <span className="small dim">Chi tiết</span>
              <button type="button" className="btn ghost sm" onClick={() => setQuery({ id: undefined })} aria-label="Đóng chi tiết">
                ✕
              </button>
            </div>
            <QuestionDetail key={open} qid={open} />
          </aside>
        )}
      </div>
    </div>
  );
}

