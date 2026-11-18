// ⚙️ Hệ thống: access code (local only) with copy, public URL + status, LAN URLs, git sync state, bank packs and problems
// (errors first), Node / platform, restart (when supervised).
import { useState } from 'react';
import { api } from '../lib/api.ts';
import { useFetch, useStore } from '../lib/store.tsx';
import { fmtRelative } from '../lib/format.ts';
import { confirmDialog, ErrorBox, Loading, PageHead, toast } from '../components/ui.tsx';
import { SyncButton, syncSummary } from '../components/SyncButton.tsx';
import type { Meta, SystemInfo } from '../../shared/types.ts';

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast('Đã chép', 'good');
  } catch {
    toast('Không chép được — hãy chọn và chép bằng tay', 'bad');
  }
}

export function SystemPage() {
  const { meta, sync } = useStore();
  const { data: sys, error, reload } = useFetch<SystemInfo>('/api/system', ['bank']);
  const [restarting, setRestarting] = useState(false);
  const [showWarn, setShowWarn] = useState(false);

  const restart = async () => {
    const ok = await confirmDialog({
      title: 'Khởi động lại app?',
      body: <p>Máy chủ sẽ tắt và chạy lại (vài giây). Bài đang làm được giữ nguyên.</p>,
      ok: '↻ Khởi động lại',
    });
    if (!ok) return;
    setRestarting(true);
    try {
      await api.post('/api/system/restart', {});
    } catch (e) {
      setRestarting(false);
      toast((e as Error).message, 'bad');
      return;
    }
    toast('↻ Đang khởi động lại… trang sẽ tự tải lại.');
    const until = Date.now() + 120_000;
    const poll = async () => {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        await api.get<Meta>('/api/meta');
        window.location.reload();
      } catch {
        if (Date.now() < until) void poll();
        else {
          setRestarting(false);
          toast('App chưa chạy lại — xem cửa sổ Terminal.', 'bad');
        }
      }
    };
    void poll();
  };

  if (!sys) return error ? <ErrorBox error={error} onRetry={reload} /> : <Loading />;
  const problems = [...sys.bank.problems].sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
  const errors = problems.filter((p) => p.level === 'error');
  const warnings = problems.filter((p) => p.level === 'warning');
  const visible = showWarn ? problems : errors;

  return (
    <div className="stack">
      <PageHead
        title="⚙️ Hệ thống"
        sub={`Phiên bản ${meta?.version ?? '?'} · đề cương ${meta?.examVersion ?? '?'} · ${meta?.access.local ? 'đang mở trên máy chạy app' : 'đang mở từ thiết bị khác'}`}
        actions={
          meta?.supervised && (
            <button type="button" className="btn" onClick={() => void restart()} disabled={restarting}>
              {restarting ? (
                <>
                  <span className="spinner" /> Đang khởi động lại…
                </>
              ) : (
                '↻ Khởi động lại app'
              )}
            </button>
          )
        }
      />

      {sys.accessCode && (
        <section className="card">
          <h2>🔑 Mã truy cập</h2>
          <div className="row">
            <code className="access-code">{sys.accessCode}</code>
            <button type="button" className="btn sm" onClick={() => void copy(sys.accessCode!)}>
              📋 Chép
            </button>
          </div>
          <p className="small dim">
            Thiết bị ngoài (điện thoại, máy khác) mở app qua ngrok hoặc mạng LAN sẽ được hỏi mã này. Nhập đúng một lần là thiết bị đó có toàn quyền như
            máy này (làm bài, AI, đồng bộ) trong 180 ngày. Đổi mã: sửa file <code>.local/access-code</code> rồi khởi động lại — mọi thiết bị phải nhập
            lại.
          </p>
        </section>
      )}

      <div className="grid c2">
        <section className="card">
          <h2>🌐 Truy cập</h2>
          <dl className="kv">
            <dt>URL công khai</dt>
            <dd>
              {sys.publicUrl ? (
                <>
                  <a href={sys.publicUrl} target="_blank" rel="noreferrer">
                    {sys.publicUrl}
                  </a>{' '}
                  <span className={`badge ${sys.publicOk === true ? 'good' : sys.publicOk === false ? 'bad' : ''}`}>
                    {sys.publicOk === true ? 'đang hoạt động' : sys.publicOk === false ? 'không truy cập được' : 'chưa kiểm tra'}
                  </span>
                  <button type="button" className="btn ghost sm" onClick={() => void copy(sys.publicUrl!)} aria-label="Chép URL công khai">
                    📋
                  </button>
                </>
              ) : (
                <span className="muted">Chưa bật (chạy npm run public)</span>
              )}
            </dd>
            <dt>Mạng LAN</dt>
            <dd>
              {sys.lanUrls.length ? (
                sys.lanUrls.map((u) => (
                  <div key={u}>
                    <a href={u} target="_blank" rel="noreferrer" className="mono small">
                      {u}
                    </a>
                  </div>
                ))
              ) : (
                <span className="muted">Tắt (config.yaml server.lan: false)</span>
              )}
            </dd>
            <dt>Máy</dt>
            <dd className="small">
              Node {sys.node} · {sys.platform}
              <div className="tiny muted mono">{sys.root}</div>
            </dd>
          </dl>
        </section>
        <section className="card">
          <div className="card-head">
            <h2>⇅ Đồng bộ git</h2>
            <SyncButton />
          </div>
          <pre className="sync-state small">{syncSummary(sync)}</pre>
          {sync?.lastSync && <div className="tiny muted">Lần cuối {fmtRelative(sync.lastSync)}</div>}
        </section>
      </div>

      <section className="card">
        <h2>
          🗂️ Ngân hàng: {sys.bank.active}/{sys.bank.questions} câu đang dùng · {sys.bank.packs.length} pack
        </h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pack</th>
                <th className="hide-mobile">Nguồn</th>
                <th className="num">Câu</th>
                <th className="num">Đang dùng</th>
              </tr>
            </thead>
            <tbody>
              {sys.bank.packs.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.id}</b> <span className="small dim">{p.title}</span>
                    <div className="tiny muted mono">{p.file}</div>
                  </td>
                  <td className="hide-mobile small">{p.origin}</td>
                  <td className="num">{p.count}</td>
                  <td className="num">{p.activeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>
            Vấn đề trong ngân hàng: <span className={errors.length ? 'bad' : 'good'}>{errors.length} lỗi</span> ·{' '}
            <span className={warnings.length ? 'warn' : ''}>{warnings.length} cảnh báo</span>
          </h2>
          {warnings.length > 0 && (
            <button type="button" className="btn ghost sm" onClick={() => setShowWarn((s) => !s)}>
              {showWarn ? 'Chỉ hiện lỗi' : 'Hiện cả cảnh báo'}
            </button>
          )}
        </div>
        {!visible.length ? (
          <div className="small good">{errors.length || warnings.length ? 'Không có lỗi.' : '✅ Không có vấn đề nào.'}</div>
        ) : (
          <ul className="plain-list small problems">
            {visible.slice(0, 300).map((p, i) => (
              <li key={i}>
                <span className={`badge ${p.level === 'error' ? 'bad' : 'warn'}`}>{p.level === 'error' ? 'lỗi' : 'cảnh báo'}</span>{' '}
                <span className="mono tiny">
                  {p.file}
                  {p.qid ? ` · ${p.qid}` : ''}
                </span>{' '}
                — {p.message}
              </li>
            ))}
            {visible.length > 300 && <li className="muted">… và {visible.length - 300} mục nữa</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
