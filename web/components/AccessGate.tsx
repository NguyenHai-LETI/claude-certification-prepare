// Access-code screen for remote devices (LAN / ngrok): POST /api/access {code} sets the access cookie.
import { useState } from 'react';
import { api } from '../lib/api.ts';

export function AccessGate({ onGranted }: { onGranted: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await api.post('/api/access', { code: code.trim() });
      onGranted();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="gate">
      <form
        className="card gate-card"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="gate-logo" aria-hidden="true">
          🔒
        </div>
        <h1>Nhập mã truy cập</h1>
        <p className="dim">
          Bạn đang mở app từ thiết bị khác (mạng LAN / ngrok). Mã nằm ở trang <b>⚙️ Hệ thống</b> trên máy chạy app. Nhập đúng một lần là
          dùng được đầy đủ trên thiết bị này.
        </p>
        <label className="field">
          Mã truy cập
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            autoFocus
            className="gate-input mono"
            maxLength={32}
          />
        </label>
        {error && (
          <div className="alert bad small" role="alert">
            ⚠️ {error}
          </div>
        )}
        <button type="submit" className="btn primary lg" disabled={busy || code.trim().length < 4}>
          {busy ? 'Đang kiểm tra…' : 'Vào app'}
        </button>
      </form>
    </div>
  );
}
