// Shared UI bits: Modal, in-page confirm (never window.confirm), toasts, loading / error boxes.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ── modal ────────────────────────────────────────────────────────────────────
let openModals = 0;
export function anyModalOpen() {
  return openModals > 0;
}

export function Modal({
  title,
  onClose,
  children,
  wide,
  footer,
  labelledBy,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    openModals++;
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('[autofocus], textarea, input, button.primary, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      openModals--;
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, []);
  const id = labelledBy ?? 'modal-title';
  return createPortal(
    <div
      className="modal-back"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref}>
        <div className="modal-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="btn ghost sm" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

// ── confirm ──────────────────────────────────────────────────────────────────
interface ConfirmReq {
  title: string;
  body?: ReactNode;
  ok?: string;
  cancel?: string;
  danger?: boolean;
  resolve: (v: boolean) => void;
}
let pushConfirm: ((r: ConfirmReq) => void) | undefined;

/** In-page confirm dialog; resolves true when confirmed. */
export function confirmDialog(opts: Omit<ConfirmReq, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    if (!pushConfirm) return resolve(false);
    pushConfirm({ ...opts, resolve });
  });
}

export function ConfirmHost() {
  const [req, setReq] = useState<ConfirmReq>();
  useEffect(() => {
    pushConfirm = (r) => setReq(r);
    return () => {
      pushConfirm = undefined;
    };
  }, []);
  if (!req) return null;
  const done = (v: boolean) => {
    req.resolve(v);
    setReq(undefined);
  };
  return (
    <Modal
      title={req.title}
      onClose={() => done(false)}
      labelledBy="confirm-title"
      footer={
        <>
          <button type="button" className="btn ghost" onClick={() => done(false)}>
            {req.cancel ?? 'Huỷ'}
          </button>
          <button type="button" className={`btn ${req.danger ? 'danger-fill' : 'primary'}`} onClick={() => done(true)} autoFocus>
            {req.ok ?? 'Đồng ý'}
          </button>
        </>
      }
    >
      {req.body}
    </Modal>
  );
}

// ── toasts ───────────────────────────────────────────────────────────────────
interface ToastItem {
  id: number;
  text: string;
  kind: 'info' | 'bad' | 'good';
}
let pushToast: ((t: ToastItem) => void) | undefined;
let toastSeq = 0;
export function toast(text: string, kind: ToastItem['kind'] = 'info') {
  pushToast?.({ id: ++toastSeq, text, kind });
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      setItems((xs) => [...xs.slice(-3), t]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== t.id)), t.kind === 'bad' ? 7000 : 4000);
    };
    return () => {
      pushToast = undefined;
    };
  }, []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ── misc ─────────────────────────────────────────────────────────────────────
export function Loading({ text = 'Đang tải…' }: { text?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" /> {text}
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error?: string; onRetry?: () => void }) {
  if (!error) return null;
  return (
    <div className="alert bad row between" role="alert">
      <span>⚠️ {error}</span>
      {onRetry && (
        <button type="button" className="btn sm" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}

export function Empty({ icon = '🗒️', children }: { icon?: string; children: ReactNode }) {
  return (
    <div className="empty">
      <div className="big" aria-hidden="true">
        {icon}
      </div>
      {children}
    </div>
  );
}

export function PageHead({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function Meter({ pct, target, tone }: { pct: number | null; target?: number; tone?: 'ok' | 'bad' | 'warn' }) {
  return (
    <div className={`meter ${tone ?? ''}`} role="presentation">
      <span style={{ width: `${Math.max(0, Math.min(100, pct ?? 0))}%` }} />
      {target !== undefined && <i className="target" style={{ left: `${target}%` }} />}
    </div>
  );
}
