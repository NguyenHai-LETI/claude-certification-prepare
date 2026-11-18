// bank/issues.md (SPEC §2.4): append-only Markdown, one `## ISS-… · <qid> · <status>` section per report.
import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '../config.ts';
import { HttpError } from '../http.ts';
import type { Issue } from '../../shared/types.ts';

const HEADER = [
  '# Báo lỗi câu hỏi',
  '',
  '> File tự sinh bởi app claude-cert (nút 🐞 Báo lỗi). Mỗi mục `## ISS-… · <id câu> · open` là một lời báo của người học.',
  '> AI Coach (tác vụ fix-issues) sửa câu rồi đổi `open` → `fixed` / `wontfix` và thêm dòng `Xử lý: …`. Chỉ thêm mục mới, không xoá mục cũ.',
  '',
].join('\n');

const HEAD_RE = /^##\s+(ISS-[\w-]+)\s+·\s+(\S+)\s+·\s+(open|fixed|wontfix)\b.*$/gm;

/** ISS-YYYYMMDD-HHMMSS → ISO (local time) for entries without a `Thời gian:` line. */
function atFromId(id: string): string {
  const m = id.match(/^ISS-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6])).toISOString();
}

export function parseIssues(text: string): Issue[] {
  const src = text.replace(/\r\n?/g, '\n');
  const heads = [...src.matchAll(HEAD_RE)];
  return heads.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < heads.length ? (heads[i + 1].index ?? src.length) : src.length;
    // a later level-1/2 heading that is not an issue ends the section too
    let body = src.slice(start, end);
    const stop = body.search(/^#{1,2}\s/m);
    if (stop >= 0) body = body.slice(0, stop);
    let at = '';
    const msg: string[] = [];
    let resolution: string[] | undefined;
    for (const line of body.split('\n')) {
      const t = line.trim();
      const time = t.match(/^[-*]\s*Thời gian:\s*(.+)$/i);
      if (time && !resolution) {
        at = time[1].trim();
        continue;
      }
      if (/^[-*]\s*(Thiết bị|Kỳ thi):/i.test(t) && !resolution) continue;
      const res = t.match(/^[-*]?\s*(?:\*\*)?Xử lý:(?:\*\*)?\s*(.*)$/i);
      if (res) {
        resolution = [res[1]];
        continue;
      }
      if (resolution) resolution.push(line);
      else msg.push(line);
    }
    const issue: Issue = {
      id: m[1],
      qid: m[2].replace(/^`|`$/g, ''),
      at: at || atFromId(m[1]),
      message: msg
        .join('\n')
        .trim()
        .replace(/^>\s?/gm, ''),
      status: m[3] as Issue['status'],
    };
    const r = resolution?.join('\n').trim();
    if (r) issue.resolution = r;
    return issue;
  });
}

export function loadIssues(): Issue[] {
  try {
    return parseIssues(fs.readFileSync(PATHS.issues, 'utf8'));
  } catch {
    return [];
  }
}

export function issueId(now = new Date(), taken: Set<string> = new Set()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  const base = `ISS-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
}

export function addIssue(qid: string, message: string, device: 'local' | 'remote', now = new Date()): Issue {
  const text = message.replace(/\r\n?/g, '\n').trim();
  if (text.length < 3) throw new HttpError(400, 'Hãy mô tả lỗi (ít nhất vài chữ)');
  if (text.length > 4000) throw new HttpError(400, 'Mô tả quá dài (tối đa 4000 ký tự)');
  const existing = loadIssues();
  const id = issueId(now, new Set(existing.map((i) => i.id)));
  const at = now.toISOString();
  // a line of the message must not look like a section heading of this file
  const safe = text.replace(/^(#{1,6})\s/gm, '\\$1 ');
  const block = ['', `## ${id} · ${qid} · open`, `- Thời gian: ${at}`, `- Thiết bị: ${device}`, '', safe, ''].join('\n');
  fs.mkdirSync(path.dirname(PATHS.issues), { recursive: true });
  let prev = '';
  try {
    prev = fs.readFileSync(PATHS.issues, 'utf8');
  } catch {
    // first issue
  }
  if (!prev) fs.writeFileSync(PATHS.issues, HEADER + block);
  else fs.appendFileSync(PATHS.issues, (prev.endsWith('\n') ? '' : '\n') + block);
  return { id, qid, at, message: text, status: 'open' };
}
