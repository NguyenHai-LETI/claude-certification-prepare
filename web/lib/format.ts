// Small formatting helpers (Vietnamese UI).
import type { TestMode } from '../../shared/types.ts';

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return h ? `${h}:${mm}:${String(ss).padStart(2, '0')}` : `${mm}:${String(ss).padStart(2, '0')}`;
}

export function fmtDuration(sec: number | undefined): string {
  if (sec === undefined || !Number.isFinite(sec)) return '—';
  const s = Math.round(sec);
  if (s < 60) return `${s} giây`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút${s % 60 && m < 10 ? ` ${s % 60} giây` : ''}`;
  return `${Math.floor(m / 60)} giờ ${m % 60} phút`;
}

export function fmtDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fmtRelative(iso: string | undefined): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 0) {
    const f = -s;
    if (f < 60) return `sau ${f} giây`;
    if (f < 3600) return `sau ${Math.round(f / 60)} phút`;
    return `sau ${Math.round(f / 3600)} giờ`;
  }
  if (s < 45) return 'vừa xong';
  if (s < 3600) return `${Math.round(s / 60)} phút trước`;
  if (s < 86400) return `${Math.round(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)} ngày trước`;
  return fmtDateTime(iso);
}

export function fmtPct(p: number | null | undefined, digits = 0): string {
  if (p === null || p === undefined || !Number.isFinite(p)) return '—';
  return `${p.toFixed(digits)}%`;
}

export const MODE_LABEL: Record<TestMode, string> = {
  mock: 'Thi thử',
  domain: 'Theo domain',
  review: 'Ôn câu sai',
  new: 'Câu chưa làm',
  random: 'Ngẫu nhiên',
  ids: 'Câu chọn sẵn',
};

export function letter(i: number): string {
  return String.fromCharCode(65 + i);
}

const NUM_WORDS = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
export function chooseLabel(n: number): string {
  return NUM_WORDS[n] ?? String(n);
}
