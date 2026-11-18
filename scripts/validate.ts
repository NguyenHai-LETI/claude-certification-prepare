// npm run validate [-- --all] — checks every bank/packs/*.yaml (SPEC §6) with the same module the server uses at load.
// Prints a Vietnamese summary; exit code 1 when there are errors (warnings alone pass). --all lists every warning.
import { PATHS, ROOT, loadExams } from '../server/config.ts';
import { parseBank } from '../server/lib/validate.ts';
import type { BankProblem } from '../shared/types.ts';

const showAll = process.argv.includes('--all');
const exams = loadExams();
const bank = parseBank(PATHS.packs, ROOT, exams);
const errors = bank.problems.filter((p) => p.level === 'error');
const warnings = bank.problems.filter((p) => p.level === 'warning');

const line = (p: BankProblem) => `  ${p.level === 'error' ? '✗' : '⚠'} ${p.file}${p.qid ? ` · ${p.qid}` : ''}: ${p.message}`;

console.log(`Ngân hàng câu hỏi (${PATHS.packs})`);
for (const p of bank.packs) console.log(`  • ${p.file} — ${p.id}: ${p.count} câu (${p.activeCount} active) · ${p.origin}`);
console.log(`Tổng: ${bank.questions.length} câu hợp lệ, ${bank.questions.filter((q) => q.status === 'active').length} active, ${bank.questions.filter((q) => q.answer.length > 1).length} câu nhiều đáp án.`);
for (const e of exams.exams) {
  const qs = bank.questions.filter((q) => q.status === 'active' && q.exams[e.code]);
  const per = e.domains.map((d) => `${d.id} ${qs.filter((q) => q.exams[e.code] === d.id).length}`).join(' · ');
  const scen = e.scenarios?.length ? ` · scenario: ${e.scenarios.map((s) => `${s.id} ${qs.filter((q) => q.scenario === s.id).length}`).join(' ')}` : '';
  console.log(`  ${e.code}: ${qs.length} câu (${per})${scen}`);
}

if (errors.length) {
  console.log(`\n✗ ${errors.length} lỗi (câu lỗi bị bỏ qua khi app nạp ngân hàng):`);
  for (const p of errors) console.log(line(p));
}
if (warnings.length) {
  const groups = new Map<string, BankProblem[]>();
  for (const w of warnings) {
    const key = w.message.replace(/\d+/g, 'N').replace(/"[^"]*"/g, '"…"');
    groups.set(key, [...(groups.get(key) ?? []), w]);
  }
  console.log(`\n⚠ ${warnings.length} cảnh báo:`);
  for (const [, list] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  — ${list.length} × ${list[0].message.replace(/\(\d+ ký tự\)|\(\d+ so với ≤ \d+ ký tự\)/, '').replace(/\s+/g, ' ').trim()}`);
    for (const p of showAll ? list : list.slice(0, 5)) console.log(`  ${line(p)}`);
    if (!showAll && list.length > 5) console.log(`      … và ${list.length - 5} câu khác (npm run validate -- --all)`);
  }
}
console.log(errors.length ? `\nKết quả: KHÔNG ĐẠT — ${errors.length} lỗi, ${warnings.length} cảnh báo.` : `\nKết quả: ĐẠT — 0 lỗi, ${warnings.length} cảnh báo.`);
process.exit(errors.length ? 1 : 0);
