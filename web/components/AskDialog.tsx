// "🤖 Hỏi AI": chat about one question with the local Claude Code CLI (read-only tools). The client keeps the conversation
// (per question, survives closing the dialog) and sends it whole with every turn; the answer streams in via job polling.
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.ts';
import { useAiJob } from '../lib/jobs.ts';
import { useStore } from '../lib/store.tsx';
import { Markdown } from '../lib/markdown.tsx';
import { fmtClock } from '../lib/format.ts';
import { Modal } from './ui.tsx';
import type { AiJob, AskRequest } from '../../shared/types.ts';

type Msg = AskRequest['messages'][number];
interface Conv {
  messages: Msg[];
  jobId?: string;
  job?: AiJob;
}
const conversations = new Map<string, Conv>();

const PRESETS = ['Vì sao đáp án đúng là đáp án này?', 'Vì sao lựa chọn của tôi sai?', 'Giải thích khái niệm chính, kèm link tài liệu Anthropic.'];

export function AskDialog({ qid, testId, stem, onClose }: { qid: string; testId?: string; stem?: string; onClose: () => void }) {
  const { coach } = useStore();
  const key = `${testId ?? ''}:${qid}`;
  const [conv, setConv] = useState<Conv>(() => conversations.get(key) ?? { messages: [] });
  const [text, setText] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const { job, cancel } = useAiJob(conv.jobId, conv.job);
  const [now, setNow] = useState(Date.now());
  const chatRef = useRef<HTMLDivElement>(null);
  const available = coach ? coach.claude.available : true;

  useEffect(() => {
    conversations.set(key, conv);
  }, [key, conv]);

  // a finished job → its answer becomes the assistant's turn
  useEffect(() => {
    if (!job || job.id !== conv.jobId || job.status === 'running') return;
    if (job.status === 'error') setError(job.error || 'AI gặp lỗi.');
    if (job.status === 'cancelled') setError('Đã huỷ câu hỏi.');
    const reply = job.status === 'done' ? job.text.trim() : '';
    setConv((c) =>
      c.jobId !== job.id
        ? c
        : { messages: reply ? [...c.messages, { role: 'assistant', content: reply }] : c.messages, jobId: undefined, job: undefined },
    );
  }, [job, conv.jobId]);

  const running = !!conv.jobId && (!job || job.status === 'running');
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [conv.messages.length, job?.text]);

  const send = async (q: string) => {
    const content = q.trim();
    if (!content || running || sending) return;
    setError(undefined);
    setSending(true);
    const messages: Msg[] = [...conv.messages, { role: 'user', content }];
    try {
      const j = await api.post<AiJob>('/api/ai/ask', { qid, testId, messages } satisfies AskRequest);
      setConv({ messages, jobId: j.id, job: j });
      setText('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const started = job ? Date.parse(job.startedAt) : now;
  return (
    <Modal title={`🤖 Hỏi AI · ${qid}`} onClose={onClose} wide>
      {stem && <div className="small dim clamp2">{stem}</div>}
      {!available && (
        <div className="alert warn small" style={{ marginTop: 10 }}>
          ⚠️ Không dùng được Hỏi AI: {coach?.claude.error || 'chưa tìm thấy Claude Code CLI trên máy chạy app.'}
        </div>
      )}
      <div className="chat" ref={chatRef} aria-live="polite">
        {conv.messages.length === 0 && !running && (
          <div className="muted small">Hỏi bất cứ điều gì về câu này. Claude trả lời bằng tiếng Việt, dựa trên tài liệu chính thức của Anthropic.</div>
        )}
        {conv.messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <span className="avatar" aria-hidden="true">
              {m.role === 'user' ? '🙋' : '🤖'}
            </span>
            <div className="bubble">{m.role === 'assistant' ? <Markdown text={m.content} /> : m.content}</div>
          </div>
        ))}
        {running && (
          <div className="msg assistant">
            <span className="avatar" aria-hidden="true">
              🤖
            </span>
            <div className="bubble">
              {job?.text ? <Markdown text={job.text} /> : null}
              <div className="row small muted" style={{ gap: 8, marginTop: job?.text ? 8 : 0 }}>
                <span className="spinner" /> Claude đang trả lời… <b className="num">{fmtClock((now - started) / 1000)}</b>
                <button type="button" className="btn ghost sm" onClick={() => void cancel()}>
                  ■ Huỷ
                </button>
              </div>
              {job && job.log.length > 0 && <div className="joblog tiny">{job.log.slice(-4).join('\n')}</div>}
            </div>
          </div>
        )}
      </div>
      {error && <div className="alert bad small">⚠️ {error}</div>}
      <div className="row" style={{ gap: 6, margin: '8px 0' }}>
        {PRESETS.map((p) => (
          <button key={p} type="button" className="chip" onClick={() => void send(p)} disabled={running || sending || !available}>
            {p}
          </button>
        ))}
      </div>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <label className="sr-only" htmlFor="ask-input">
          Câu hỏi cho AI
        </label>
        <textarea
          id="ask-input"
          rows={2}
          value={text}
          placeholder={conv.messages.length ? 'Hỏi tiếp…' : 'Bạn muốn hỏi gì về câu này?'}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send(text);
            }
          }}
          disabled={!available}
        />
        <div className="row between">
          <span className="tiny muted">Enter gửi · Shift+Enter xuống dòng</span>
          <div className="row">
            {conv.messages.length > 0 && !running && (
              <button type="button" className="btn ghost sm" onClick={() => setConv({ messages: [] })}>
                Cuộc hỏi mới
              </button>
            )}
            <button type="submit" className="btn primary" disabled={running || sending || !text.trim() || !available}>
              Gửi
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
