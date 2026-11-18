// "🐞 Báo lỗi": report a problem with a question → POST /api/issues (bank/issues.md; the AI coach fixes it later).
import { useState } from 'react';
import { api } from '../lib/api.ts';
import { Modal, toast } from './ui.tsx';
import type { Issue } from '../../shared/types.ts';

const PRESETS = ['Đáp án đúng có vẻ sai', 'Có hơn một đáp án đúng', 'Giải thích chưa rõ / sai', 'Câu hỏi mơ hồ', 'Kiến thức đã lỗi thời'];

export function IssueDialog({ qid, onClose, onDone }: { qid: string; onClose: () => void; onDone?: (i: Issue) => void }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const submit = async () => {
    if (!message.trim()) return;
    setBusy(true);
    setError(undefined);
    try {
      const issue = await api.post<Issue>('/api/issues', { qid, message: message.trim() });
      toast(`🐞 Đã ghi báo lỗi ${issue.id} cho câu ${qid}`, 'good');
      onDone?.(issue);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`🐞 Báo lỗi câu ${qid}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn ghost" onClick={onClose}>
            Huỷ
          </button>
          <button type="button" className="btn primary" disabled={busy || !message.trim()} onClick={() => void submit()}>
            {busy ? 'Đang gửi…' : 'Gửi báo lỗi'}
          </button>
        </>
      }
    >
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        {PRESETS.map((p) => (
          <button key={p} type="button" className="chip" onClick={() => setMessage((m) => (m ? `${m}\n${p}` : p))}>
            {p}
          </button>
        ))}
      </div>
      <label className="field">
        Mô tả vấn đề
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Vd: đáp án B mới đúng vì …" autoFocus />
      </label>
      <p className="tiny muted">AI Coach (🛠️ Sửa câu bị báo lỗi) sẽ đọc và sửa câu này.</p>
      {error && <div className="alert bad small">⚠️ {error}</div>}
    </Modal>
  );
}
