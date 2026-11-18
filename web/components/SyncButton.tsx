// "⇅" git sync button in the top bar: state from GET /api/sync + SSE `sync`; click = POST /api/sync (pull --rebase, commit
// data paths, push). Pills: ↑ commits to push, ↓ to pull, ● changed data files; red ! = last sync failed.
import { useState } from 'react';
import { api } from '../lib/api.ts';
import { useStore } from '../lib/store.tsx';
import { fmtRelative } from '../lib/format.ts';
import { toast } from './ui.tsx';
import type { SyncState } from '../../shared/types.ts';

export function syncSummary(s: SyncState | undefined): string {
  if (!s) return 'Đang đọc trạng thái đồng bộ…';
  if (!s.enabled) return 'Đồng bộ git đang tắt (config.yaml sync.enabled).';
  if (!s.repo) return 'Thư mục này không nằm trong git repo — không đồng bộ được.';
  const parts = [
    `Nhánh ${s.branch ?? '?'}${s.remote ? ` → ${s.remote}` : ''}`,
    `${s.ahead} commit chưa đẩy, ${s.behind} commit chưa kéo, ${s.dirty} file dữ liệu đã đổi`,
    s.lastSync ? `Lần cuối: ${fmtRelative(s.lastSync)}${s.lastResult === 'error' ? ' (LỖI)' : s.lastResult === 'nothing' ? ' (không có gì mới)' : ''}` : 'Chưa đồng bộ lần nào',
  ];
  if (s.lastResult === 'error' && s.lastMessage) parts.push(`Lỗi: ${s.lastMessage}`);
  if (s.autoAt) parts.push(`Tự đồng bộ ${fmtRelative(s.autoAt)}`);
  return parts.join('\n');
}

export function SyncButton() {
  const { sync, setSync, bump } = useStore();
  const [busy, setBusy] = useState(false);
  const running = busy || !!sync?.running;
  const disabled = !sync || !sync.enabled || !sync.repo;
  const run = async () => {
    setBusy(true);
    try {
      const s = await api.post<SyncState>('/api/sync', {});
      setSync(s);
      bump('results');
      bump('bank');
      if (s.lastResult === 'error') toast(`⇅ Đồng bộ lỗi: ${s.lastMessage ?? ''}`, 'bad');
      else toast(s.lastResult === 'nothing' ? '⇅ Đã đồng bộ — không có gì mới' : `⇅ Đã đồng bộ${s.lastMessage ? `: ${s.lastMessage}` : ''}`, 'good');
    } catch (e) {
      toast(`⇅ ${(e as Error).message}`, 'bad');
    } finally {
      setBusy(false);
    }
  };
  const err = sync?.lastResult === 'error';
  return (
    <button
      type="button"
      className={`btn sm sync-btn ${err ? 'err' : ''}`}
      onClick={() => void run()}
      disabled={running || disabled}
      title={syncSummary(sync)}
      aria-label={`Đồng bộ git. ${syncSummary(sync)}`}
    >
      {running ? <span className="spinner" /> : <span aria-hidden="true">⇅</span>}
      <span className="sync-label">Sync</span>
      {sync && sync.ahead > 0 && <span className="pill">↑{sync.ahead}</span>}
      {sync && sync.behind > 0 && <span className="pill">↓{sync.behind}</span>}
      {sync && sync.dirty > 0 && <span className="pill">●{sync.dirty}</span>}
      {err && <span className="pill bad">!</span>}
    </button>
  );
}
