// npm run import-txt -- <file.txt> [--overwrite]  — imports a practice-question text export (format below) into
// bank/packs/<file basename>.yaml. The raw file is kept next to it in bank/sources/ so the pack can be rebuilt.
//
// Format (one block per question; blocks start with "===== Câu N (qid) · Set S · K đáp án ====="):
//   # <exam name as in exams.yaml>          ← first line of the file, picks the exam code
//   Domain: <domain name as in exams.yaml>
//   [Tình huống] … [Câu hỏi] … "A. …" option lines … ">>> ĐÁP ÁN ĐÚNG: C" (or "A, C")
//   [Chủ đề] [Mẹo nhớ] [Đề hỏi gì] [Vì sao đúng] [Vì sao sai] [Kiến thức liên quan] [Học lại] <slug#anchor> [Từ khoá]
//
// Re-running keeps local edits: a question whose id already exists in the pack is left as it is unless --overwrite.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { loadExams } from '../server/config.ts';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');

interface Parsed {
  qid: string;
  set: string;
  domain: string;
  scenario: string;
  question: string;
  options: string[];
  answer: string[];
  sections: Map<string, string>;
}

const HEAD_RE = /^===== Câu (\d+) \((\w+)\) · Set (\d+) · (\d+) đáp án =====$/m;
const LABEL_RE = /^\[([^\]]+)\](.*)$/;

function parseBlock(text: string): Parsed {
  const head = text.match(HEAD_RE);
  if (!head) throw new Error(`thiếu dòng tiêu đề câu: ${text.slice(0, 80)}`);
  const lines = text.slice(head.index! + head[0].length).split('\n');
  const sections = new Map<string, string>();
  let domain = '';
  let answer: string[] = [];
  let cur: string | undefined;
  let buf: string[] = [];
  const flush = () => {
    if (cur !== undefined) sections.set(cur, buf.join('\n').trim());
    buf = [];
  };
  for (const line of lines) {
    const d = line.match(/^Domain:\s*(.+)$/);
    if (d && cur === undefined) {
      domain = d[1].trim();
      continue;
    }
    const a = line.match(/^>>> ĐÁP ÁN ĐÚNG:\s*(.+)$/);
    if (a) {
      answer = a[1].split(/[,\s]+/).filter(Boolean).map((x) => x.toUpperCase()).sort();
      flush();
      cur = undefined;
      continue;
    }
    const l = line.match(LABEL_RE);
    if (l) {
      flush();
      cur = l[1].trim();
      if (l[2].trim()) buf.push(l[2].trim());
      continue;
    }
    if (cur !== undefined) buf.push(line);
  }
  flush();
  const qBlock = (sections.get('Câu hỏi') ?? '').split('\n');
  const firstOpt = qBlock.findIndex((x) => /^A\.\s/.test(x));
  if (firstOpt < 0) throw new Error(`${head[2]}: không thấy phương án A.`);
  const options: string[] = [];
  for (const x of qBlock.slice(firstOpt)) {
    const m = x.match(/^([A-F])\.\s+(.*)$/);
    if (m) options.push(m[2].trim());
    else if (x.trim()) options[options.length - 1] += ` ${x.trim()}`;
  }
  return {
    qid: head[2],
    set: head[3],
    domain,
    scenario: sections.get('Tình huống') ?? '',
    question: qBlock.slice(0, firstOpt).join('\n').trim(),
    options,
    answer,
    sections,
  };
}

/** Vietnamese Markdown explanation from the export's sections, text kept as written. */
function explanation(p: Parsed): string {
  const s = (k: string) => p.sections.get(k)?.trim() ?? '';
  const out: string[] = [];
  if (s('Chủ đề')) out.push(`**${s('Chủ đề')}**`);
  if (s('Mẹo nhớ')) out.push(`> 💡 ${s('Mẹo nhớ')}`);
  if (s('Đề hỏi gì')) out.push(`**Đề hỏi gì.** ${s('Đề hỏi gì')}`);
  if (s('Vì sao đúng')) out.push(`**Vì sao đúng (${p.answer.join(', ')}).** ${s('Vì sao đúng')}`);
  if (s('Vì sao sai')) out.push(`**Vì sao sai**\n\n${s('Vì sao sai')}`);
  if (s('Kiến thức liên quan')) out.push(`**Kiến thức liên quan.** ${s('Kiến thức liên quan')}`);
  if (s('Từ khoá')) out.push(`**Từ khoá**\n\n${s('Từ khoá')}`);
  if (s('Học lại')) out.push(`*Học lại (bài của khoá gốc, chưa có trong notes/):* \`${s('Học lại')}\``);
  return out.join('\n\n');
}

function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('usage: npm run import-txt -- <file.txt> [--overwrite]');
    process.exit(2);
  }
  const text = fs.readFileSync(path.resolve(file), 'utf8');
  const base = path.basename(file).replace(/\.txt$/i, '');
  const examName = text.split('\n')[0].replace(/^#\s*/, '').trim();
  const exams = loadExams();
  const exam = exams.exams.find((e) => e.name === examName);
  if (!exam) throw new Error(`kỳ thi "${examName}" chưa có trong exams.yaml`);
  const domainId = new Map(exam.domains.map((d) => [d.name, d.id]));

  const blocks = text.split(/(?=^===== Câu )/m).filter((b) => HEAD_RE.test(b));
  const parsed = blocks.map(parseBlock);

  // Keep the raw export so the pack can be rebuilt (or re-imported after the source fixes a question).
  const srcDir = path.join(root, 'bank', 'sources');
  fs.mkdirSync(srcDir, { recursive: true });
  const srcRel = `bank/sources/${base}.txt`;
  if (path.resolve(file) !== path.join(root, srcRel)) fs.copyFileSync(path.resolve(file), path.join(root, srcRel));

  const out = path.join(root, 'bank', 'packs', `${base}.yaml`);
  const doc = fs.existsSync(out)
    ? YAML.parseDocument(fs.readFileSync(out, 'utf8'))
    : new YAML.Document({
        id: base,
        title: `${exam.code} · bộ luyện ${base} (${parsed.length} câu)`,
        origin: 'imported',
        source: srcRel,
        license: 'Tài liệu ôn tập do người học cung cấp, không thuộc và không được Anthropic xác nhận.',
        imported: '',
        description: `Câu tiếng Anh theo tình huống như đề thật, giải thích tiếng Việt. Nhập từ ${srcRel} bằng \`npm run import-txt\`.`,
        questions: [],
      });
  if (doc.errors.length) throw new Error(`${out}: ${doc.errors[0].message}`);
  const seq = doc.get('questions') as YAML.YAMLSeq<YAML.YAMLMap>;
  const byId = new Map<string, number>();
  seq.items.forEach((item, i) => byId.set(String(item.get('id')), i));
  let added = 0;
  let replaced = 0;
  let kept = 0;
  for (const p of parsed) {
    const id = `${base}.${p.qid}`;
    const dom = domainId.get(p.domain);
    if (!dom) throw new Error(`${id}: domain "${p.domain}" không có trong ${exam.code} (exams.yaml)`);
    if (p.options.length < 2 || !p.answer.length) throw new Error(`${id}: thiếu phương án hoặc đáp án`);
    const at = byId.get(id);
    if (at !== undefined && !overwrite) {
      kept++;
      continue;
    }
    const node = doc.createNode({
      id,
      exams: { [exam.code]: dom },
      stem: p.scenario ? `${p.scenario}\n\n${p.question}` : p.question,
      options: p.options,
      answer: p.answer,
      explanation: explanation(p),
      tags: [`set-${p.set}`],
    }) as YAML.YAMLMap;
    if (at !== undefined) {
      seq.items[at] = node;
      replaced++;
    } else {
      seq.items.push(node);
      added++;
    }
  }
  doc.set('imported', new Date().toISOString().slice(0, 10));
  fs.writeFileSync(out, doc.toString({ lineWidth: 0 }));
  console.log(`bank/packs/${base}.yaml: ${seq.items.length} câu (${added} mới, ${replaced} ghi đè, ${kept} giữ nguyên)`);
}

main();
