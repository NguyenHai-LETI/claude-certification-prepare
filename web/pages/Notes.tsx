// 📖 Tài liệu (/notes/<path>#anchor): tree grouped by NoteEntry.group (filtered by the selected exam, "hiện tất cả"),
// search (notes + questions), content (Markdown → marked → DOMPurify, or lesson HTML → DOMPurify) inside
// <article class="lesson">, table of contents from `headings`, hash anchors scrolled into view after render.
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { enc, qs } from '../lib/api.ts';
import { navigate, noteHref, useRoute, Link } from '../lib/router.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { findAnchor, renderMarkdown, sanitizeLesson } from '../lib/markdown.tsx';
import { Empty, ErrorBox, Loading } from '../components/ui.tsx';
import { QuestionModal } from '../components/QuestionDetail.tsx';
import type { NoteEntry, NoteFile, SearchHit } from '../../shared/types.ts';

const GROUP_ORDER = ['Tổng quan', 'Kỳ thi', 'Bài học'];

export function Notes() {
  const route = useRoute();
  const { exam } = useStore();
  const path = route.parts.slice(1).join('/');
  const { data: entries, error: listError } = useFetch<NoteEntry[]>('/api/notes', ['notes']);
  const [showAll, setShowAll] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);

  useEffect(() => setTreeOpen(false), [path]);

  const groups = useMemo(() => {
    const list = (entries ?? []).filter((e) => showAll || !e.exams?.length || e.exams.includes(exam) || e.path === path);
    const m = new Map<string, NoteEntry[]>();
    for (const e of list) m.set(e.group, [...(m.get(e.group) ?? []), e]);
    return [...m.entries()].sort(
      (a, b) => (GROUP_ORDER.indexOf(a[0]) + 1 || 99) - (GROUP_ORDER.indexOf(b[0]) + 1 || 99) || a[0].localeCompare(b[0]),
    );
  }, [entries, showAll, exam, path]);
  const hidden = (entries?.length ?? 0) - groups.reduce((s, [, xs]) => s + xs.length, 0);

  return (
    <div className="notes-layout">
      <aside className="notes-side">
        <SearchBox />
        <button type="button" className="btn sm tree-toggle" aria-expanded={treeOpen} onClick={() => setTreeOpen((o) => !o)}>
          📚 Danh sách tài liệu {treeOpen ? '▴' : '▾'}
        </button>
        <nav className={`notes-tree card ${treeOpen ? 'open' : ''}`} aria-label="Tài liệu">
          <ErrorBox error={listError} />
          {!entries && !listError && <Loading />}
          {groups.map(([g, xs]) => (
            <div key={g} className="tree-group">
              <div className="tree-head">{g}</div>
              {xs.map((e) => (
                <Link key={e.path} to={noteHref(e.path)} className={`tree-link ${e.path === path ? 'active' : ''}`} aria-current={e.path === path ? 'page' : undefined}>
                  {e.title}
                </Link>
              ))}
            </div>
          ))}
          <label className="row tiny muted" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Hiện tất cả {hidden > 0 && !showAll ? `(+${hidden} của kỳ thi khác)` : ''}
          </label>
        </nav>
      </aside>
      <div className="notes-main">{path ? <NoteView path={path} /> : <NotesIndex groups={groups} />}</div>
    </div>
  );
}

function NotesIndex({ groups }: { groups: [string, NoteEntry[]][] }) {
  const { exam } = useStore();
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>📖 Tài liệu</h1>
          <p>Ghi chú ôn thi theo kỳ thi {exam} — chọn một mục ở danh sách hoặc tìm kiếm.</p>
        </div>
      </div>
      {groups.map(([g, xs]) => (
        <section key={g} className="card">
          <h2>{g}</h2>
          <div className="note-cards">
            {xs.map((e) => (
              <Link key={e.path} to={noteHref(e.path)} className="note-card">
                <span className="strong">{e.title}</span>
                <span className="tiny muted mono">{e.path}</span>
                {e.exams && e.exams.length > 0 && (
                  <span className="row" style={{ gap: 4 }}>
                    {e.exams.map((x) => (
                      <span key={x} className="badge">
                        {x}
                      </span>
                    ))}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function NoteView({ path }: { path: string }) {
  const route = useRoute();
  const { data: file, error, reload } = useFetch<NoteFile>(`/api/notes/file?path=${enc(path)}`, ['notes']);
  const ref = useRef<HTMLElement>(null);
  const html = useMemo(() => {
    if (!file) return '';
    return file.format === 'md' ? renderMarkdown(file.content, { base: file.path, headings: file.headings, addIds: true }) : sanitizeLesson(file.content, file.path);
  }, [file]);

  // scroll to the hash anchor once the content is in the DOM (and on every hash navigation)
  useEffect(() => {
    if (!html || !ref.current) return;
    if (!route.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = findAnchor(ref.current, route.hash);
    if (el) {
      // open collapsed <details> that contain the target
      for (let p: HTMLElement | null = el; p; p = p.parentElement) if (p.tagName === 'DETAILS') (p as HTMLDetailsElement).open = true;
      requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
      el.classList.add('anchor-hit');
      const t = setTimeout(() => el.classList.remove('anchor-hit'), 1600);
      return () => clearTimeout(t);
    }
  }, [html, route.hash, route.key]);

  useEffect(() => {
    if (file) document.title = `${file.title} · Claude Cert`;
    return () => {
      document.title = 'Claude Cert Trainer';
    };
  }, [file]);

  const onClick = (e: MouseEvent<HTMLElement>) => {
    const a = (e.target as Element).closest('a');
    const href = a?.getAttribute('href');
    if (!href || !href.startsWith('#') || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(`${noteHref(path)}${href}`);
  };

  if (!file) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading text="Đang mở tài liệu…" />;
  // lesson fragments carry their own "Mục lục" (<details class="toc">): no second one
  const ownToc = file.format === 'html' && /class="[^"]*\btoc\b/.test(file.content);
  const toc = ownToc ? [] : file.headings.filter((h) => h.level >= 2 && h.level <= 3);
  return (
    <div className="stack">
      <div className="row between note-head">
        <div className="tiny muted mono">{file.path}</div>
        <div className="row" style={{ gap: 4 }}>
          {file.exams?.map((x) => (
            <span key={x} className="badge">
              {x}
            </span>
          ))}
        </div>
      </div>
      {toc.length > 2 && (
        <details className="card note-toc">
          <summary>Mục lục ({toc.length})</summary>
          <ol>
            {toc.map((h) => (
              <li key={h.id} className={h.level === 3 ? 'sub' : ''}>
                <Link to={`${noteHref(path)}#${encodeURIComponent(h.id)}`}>{h.text}</Link>
              </li>
            ))}
          </ol>
        </details>
      )}
      <div className="card note-card-body">
        <article
          ref={ref}
          className={`lesson ${file.format === 'md' ? 'md lesson-md' : 'lesson-html'}`}
          onClick={onClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

function SearchBox() {
  const { exam } = useStore();
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [qid, setQid] = useState<string>();
  useEffect(() => {
    const t = setTimeout(() => setTerm(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);
  const { data: hits, loading, error } = useFetch<SearchHit[]>(term.length >= 2 ? `/api/search${qs({ q: term, exam })}` : null);
  return (
    <div className="note-search">
      <label className="sr-only" htmlFor="note-search">
        Tìm trong tài liệu và câu hỏi
      </label>
      <input id="note-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Tìm tài liệu, câu hỏi…" />
      {term.length >= 2 && (
        <div className="search-hits card" role="region" aria-label="Kết quả tìm kiếm" aria-live="polite">
          {loading && !hits && <Loading text="Đang tìm…" />}
          {error && <div className="small bad">{error}</div>}
          {hits && !hits.length && <Empty icon="🔍">Không thấy «{term}».</Empty>}
          {hits?.map((h, i) =>
            h.kind === 'note' && h.path ? (
              <Link key={i} to={noteHref(h.path)} className="hit" onClick={() => setQ('')}>
                <span className="small strong">📖 {h.title}</span>
                <Snippet text={h.snippet} />
              </Link>
            ) : (
              <button key={i} type="button" className="hit" onClick={() => h.qid && setQid(h.qid)}>
                <span className="small strong">❓ {h.title}</span>
                <Snippet text={h.snippet} />
              </button>
            ),
          )}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost sm" onClick={() => setQ('')}>
              Đóng
            </button>
          </div>
        </div>
      )}
      {qid && <QuestionModal qid={qid} onClose={() => setQid(undefined)} />}
    </div>
  );
}

/** Plain-text snippet with the match inside «…» → <mark>. */
function Snippet({ text }: { text: string }) {
  const parts = text.split(/«|»/);
  return (
    <span className="tiny dim snippet">
      {parts.map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}
    </span>
  );
}
