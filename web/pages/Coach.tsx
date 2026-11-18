// 🤖 AI Coach: Claude CLI status, task cards (plan / generate / review / fix-issues) → POST /api/coach/run, running job panel
// (live log, text, cancel), recent jobs, plans (GET /api/coach/plans/:file rendered as Markdown).
import { useEffect, useState } from 'react';
import { api, enc } from '../lib/api.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { JOB_STATUS_LABEL, useAiJob } from '../lib/jobs.ts';
import { Markdown } from '../lib/markdown.tsx';
import { fmtClock, fmtDateTime, fmtRelative } from '../lib/format.ts';
import { Empty, ErrorBox, Loading, Modal, PageHead, toast } from '../components/ui.tsx';
import type { AiJob, CoachRunRequest, CoachTask, DomainId } from '../../shared/types.ts';

const TASKS: { id: CoachTask; icon: string; label: string; desc: string; domains?: boolean; count?: boolean }[] = [
  { id: 'plan', icon: '📋', label: 'Phân tích & lập kế hoạch', desc: 'Đọc kết quả đã làm, chỉ ra domain yếu và viết kế hoạch ôn theo trọng số đề.' },
  { id: 'generate', icon: '✨', label: 'Sinh câu', desc: 'Viết câu mới chuẩn đề thật cho các domain đã chọn, dựa trên tài liệu chính thức.', domains: true, count: true },
  { id: 'review', icon: '🔍', label: 'Kiểm định chất lượng câu', desc: 'Soát đáp án, phương án nhiễu, giải thích của câu mới / vừa sửa.', domains: true },
  { id: 'fix-issues', icon: '🛠️', label: 'Sửa câu bị báo lỗi', desc: 'Xử lý các báo lỗi đang mở trong bank/issues.md.' },
];

export function Coach() {
  const { exam, examDef, coach, refreshCoach, versions } = useStore();
  const [task, setTask] = useState<CoachTask>('plan');
  const [domains, setDomains] = useState<DomainId[]>([]);
  const [count, setCount] = useState(10);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [jobId, setJobId] = useState<string>();
  const [plan, setPlan] = useState<string>();

  useEffect(() => refreshCoach(), [refreshCoach, versions.coach]);
  useEffect(() => {
    if (coach?.running && !jobId) setJobId(coach.running.id);
  }, [coach?.running, jobId]);
  useEffect(() => setDomains([]), [exam]);

  const def = TASKS.find((t) => t.id === task)!;
  const available = !!coach?.claude.available;
  const running = !!coach?.running;

  const run = async () => {
    setBusy(true);
    try {
      const req: CoachRunRequest = {
        task,
        exam,
        domains: def.domains && domains.length ? domains : undefined,
        count: def.count ? count : undefined,
        note: note.trim() || undefined,
      };
      const j = await api.post<AiJob>('/api/coach/run', req);
      setJobId(j.id);
      refreshCoach();
      toast(`🤖 Đã bắt đầu: ${j.title}`);
    } catch (e) {
      toast((e as Error).message, 'bad');
    } finally {
      setBusy(false);
    }
  };

  if (!coach) return <Loading text="Đang kiểm tra Claude Code CLI…" />;
  return (
    <div className="stack">
      <PageHead title="🤖 AI Coach" sub="Chạy Claude Code trên máy này để phân tích, sinh câu, kiểm định và sửa ngân hàng câu hỏi." />
      <div className={`alert ${available ? 'good' : 'warn'} small`}>
        {available ? (
          <>
            ✅ Claude Code CLI sẵn sàng{coach.claude.version ? ` · ${coach.claude.version}` : ''} <span className="mono tiny dim">{coach.claude.path}</span>
          </>
        ) : (
          <>
            ⚠️{' '}
            {coach.claude.error || (
              <>
                Chưa tìm thấy Claude Code CLI. Cài Claude Code và đăng nhập, hoặc đặt <code>ai.claude_path</code> trong config.yaml, rồi khởi động lại app.
              </>
            )}
          </>
        )}
      </div>

      <section className="card">
        <h2>Tác vụ</h2>
        <div className="mode-grid" role="radiogroup" aria-label="Tác vụ">
          {TASKS.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={task === t.id} className={`mode-card ${task === t.id ? 'on' : ''}`} onClick={() => setTask(t.id)}>
              <span className="mode-ico" aria-hidden="true">
                {t.icon}
              </span>
              <span className="mode-label">{t.label}</span>
              <span className="tiny dim">{t.desc}</span>
              {t.id === 'fix-issues' && <span className={`badge ${coach.openIssues ? 'warn' : ''}`}>{coach.openIssues} báo lỗi đang mở</span>}
            </button>
          ))}
        </div>
        <div className="stack sm" style={{ marginTop: 14 }}>
          <div className="small dim">
            Kỳ thi: <b>{exam}</b> (đổi ở thanh trên cùng)
          </div>
          {def.domains && examDef && (
            <div className="row" style={{ gap: 6 }}>
              <span className="small dim">Domain:</span>
              <button type="button" className={`chip ${!domains.length ? 'on' : ''}`} onClick={() => setDomains([])}>
                Tất cả
              </button>
              {examDef.domains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.name}
                  className={`chip ${domains.includes(d.id) ? 'on' : ''}`}
                  aria-pressed={domains.includes(d.id)}
                  onClick={() => setDomains((ds) => (ds.includes(d.id) ? ds.filter((x) => x !== d.id) : [...ds, d.id]))}
                >
                  {d.id}
                </button>
              ))}
            </div>
          )}
          {def.count && (
            <label className="row small">
              Số câu
              <input type="number" min={1} max={50} value={count} onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} style={{ width: 80 }} />
            </label>
          )}
          <label className="field">
            Ghi chú thêm cho AI (tuỳ chọn)
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Vd: tập trung vào MCP transport, câu khó…" />
          </label>
          <div className="row">
            <button type="button" className="btn primary" disabled={!available || running || busy || (task === 'fix-issues' && !coach.openIssues)} onClick={() => void run()}>
              {busy ? 'Đang bắt đầu…' : `▶ Chạy ${def.label.toLowerCase()}`}
            </button>
            {running && <span className="small dim">Đang có một tác vụ chạy — chờ xong hoặc huỷ.</span>}
          </div>
        </div>
      </section>

      {jobId && <JobPanel jobId={jobId} onClose={() => setJobId(undefined)} />}

      <div className="grid c2">
        <section className="card">
          <h2>Kế hoạch ôn</h2>
          {coach.plans.length ? (
            <div className="stack sm">
              {coach.plans.map((p) => (
                <button key={p.file} type="button" className="list-row" onClick={() => setPlan(p.file)}>
                  <span className="grow">
                    <span className="title">{p.title}</span>
                    <span className="tiny muted mono"> {p.file}</span>
                  </span>
                  <span className="tiny muted">{p.date}</span>
                </button>
              ))}
            </div>
          ) : (
            <Empty icon="📋">Chưa có kế hoạch. Chạy 📋 Phân tích & lập kế hoạch.</Empty>
          )}
        </section>
        <section className="card">
          <h2>Tác vụ gần đây</h2>
          {coach.jobs.length ? (
            <div className="stack sm">
              {coach.jobs.map((j) => (
                <button key={j.id} type="button" className="list-row" onClick={() => setJobId(j.id)}>
                  <span className="grow">
                    <span className="title">{j.title}</span>
                    <span className="tiny muted"> · {fmtRelative(j.startedAt)}</span>
                  </span>
                  <span className={`badge ${j.status === 'done' ? 'good' : j.status === 'error' ? 'bad' : j.status === 'running' ? 'accent' : ''}`}>
                    {JOB_STATUS_LABEL[j.status]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <Empty icon="🤖">Chưa chạy tác vụ nào.</Empty>
          )}
        </section>
      </div>
      {plan && <PlanModal file={plan} onClose={() => setPlan(undefined)} />}
    </div>
  );
}

function JobPanel({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { job, error, cancel } = useAiJob(jobId);
  const [now, setNow] = useState(Date.now());
  const running = job?.status === 'running';
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  if (!job) return error ? <ErrorBox error={error} /> : <Loading text="Đang tải tác vụ…" />;
  const end = job.finishedAt ? Date.parse(job.finishedAt) : now;
  return (
    <section className="card job-panel" aria-live="polite">
      <div className="card-head">
        <h2>
          {running && <span className="spinner" />} {job.title}
        </h2>
        <div className="row">
          <span className={`badge ${job.status === 'done' ? 'good' : job.status === 'error' ? 'bad' : 'accent'}`}>{JOB_STATUS_LABEL[job.status]}</span>
          <span className="num small">{fmtClock((end - Date.parse(job.startedAt)) / 1000)}</span>
          {running ? (
            <button
              type="button"
              className="btn sm danger"
              onClick={() =>
                void cancel().catch((e: Error) => {
                  toast(e.message, 'bad');
                })
              }
            >
              ■ Huỷ
            </button>
          ) : (
            <button type="button" className="btn ghost sm" onClick={onClose} aria-label="Đóng">
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="tiny muted">Bắt đầu {fmtDateTime(job.startedAt)}</div>
      {job.error && <div className="alert bad small">⚠️ {job.error}</div>}
      {job.log.length > 0 && (
        <details open={running} className="job-log-wrap">
          <summary className="small">Nhật ký ({job.logTotal || job.log.length} dòng)</summary>
          <pre className="joblog">{job.log.slice(-200).join('\n')}</pre>
        </details>
      )}
      {job.text && <Markdown text={job.text} className="job-text" />}
    </section>
  );
}

function PlanModal({ file, onClose }: { file: string; onClose: () => void }) {
  const { data, error } = useFetch<{ file: string; content: string }>(`/api/coach/plans/${enc(file)}`);
  return (
    <Modal title={`📋 ${file}`} onClose={onClose} wide>
      {data ? <Markdown text={data.content} /> : error ? <ErrorBox error={error} /> : <Loading />}
    </Modal>
  );
}

