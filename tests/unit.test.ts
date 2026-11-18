// Pure helpers: scoring, selection quotas, review rule, validation, notes text helpers, issues parsing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { parseExams } from '../server/config.ts';
import { parseIssues } from '../server/lib/issues.ts';
import { fold, htmlHeadings, htmlText, mdHeadings, slugger, slugify, splitFrontmatter, wordIndex } from '../server/lib/notes.ts';
import { inReview, largestRemainder, makeScore, sameKeys, scaledScore } from '../server/lib/score.ts';
import { normalizeAnswer, parseBank, statesCount } from '../server/lib/validate.ts';
import { FIXTURE } from './helpers.ts';

const exams = parseExams(fs.readFileSync(path.join(FIXTURE, 'exams.yaml'), 'utf8'));

test('exams.yaml parses into ExamDef[] in contract order', () => {
  assert.deepEqual(
    exams.exams.map((e) => e.code),
    ['CCAR-F', 'CCDV-F', 'CCAO-F', 'CCAR-P'],
  );
  const f = exams.byCode.get('CCAR-F')!;
  assert.equal(f.questions, 60);
  assert.equal(f.scenarioPick, 4);
  assert.equal(f.scenarios?.length, 6);
  assert.deepEqual(f.domains[0], { id: 'D1', name: 'Agentic Architecture & Orchestration', weight: 27 });
  assert.equal(exams.byCode.get('CCDV-F')!.domains.length, 8);
});

test('scaled score: 0 → 100, pass_pct → 720, 100 → 1000, rounded to 10', () => {
  assert.equal(scaledScore(0, 72), 100);
  assert.equal(scaledScore(72, 72), 720);
  assert.equal(scaledScore(100, 72), 1000);
  assert.equal(scaledScore(36, 72), 410);
  assert.equal(scaledScore(86, 72), 860);
  const s = makeScore(43, 60, { pass: 720 }, 72);
  assert.equal(s.pct, 71.7);
  assert.equal(s.scaled, 720); // 71.67% → 717.3 → 720
  assert.equal(s.pass, true);
  assert.equal(makeScore(42, 60, { pass: 720 }, 72).pass, false);
});

test('largest remainder: CCAR-F 60 questions → 16/11/12/12/9', () => {
  const q = largestRemainder(60, exams.byCode.get('CCAR-F')!.domains);
  assert.deepEqual(Object.fromEntries(q), { D1: 16, D2: 11, D3: 12, D4: 12, D5: 9 });
  for (const e of exams.exams) {
    const m = largestRemainder(e.questions, e.domains);
    assert.equal([...m.values()].reduce((a, b) => a + b, 0), e.questions, e.code);
  }
});

test('review rule (SPEC §3.3)', () => {
  const ev = (...c: boolean[]) => c.map((correct, i) => ({ at: String(i), correct }));
  assert.equal(inReview(ev(), 2), false);
  assert.equal(inReview(ev(true, true), 2), false);
  assert.equal(inReview(ev(false), 2), true);
  assert.equal(inReview(ev(false, true), 2), true);
  assert.equal(inReview(ev(false, true, true), 2), false);
  assert.equal(inReview(ev(false, true, true, false, true), 2), true);
  assert.equal(sameKeys(['C', 'A'], ['A', 'C']), true);
  assert.equal(sameKeys(['A'], ['A', 'C']), false);
});

test('answers and multi-answer stems', () => {
  assert.deepEqual(normalizeAnswer('B'), ['B']);
  assert.deepEqual(normalizeAnswer(['d', 'b']), ['B', 'D']);
  assert.deepEqual(normalizeAnswer('A, C'), ['A', 'C']);
  assert.equal(statesCount('Which TWO actions should you take?'), true);
  assert.equal(statesCount('What should you do? (Choose two.)'), true);
  assert.equal(statesCount('Select 3 answers'), true);
  assert.equal(statesCount('What should you do?'), false);
});

test('validation: broken questions skipped and reported, warnings kept', () => {
  const bank = parseBank(path.join(FIXTURE, 'bank', 'packs'), FIXTURE, exams);
  assert.deepEqual(
    bank.questions.map((q) => q.id),
    ['F01', 'F02', 'F03', 'F04', 'F05'],
  );
  const errs = bank.problems.filter((p) => p.level === 'error');
  assert.ok(errs.some((p) => p.qid === 'F06' && /domain không tồn tại/.test(p.message)));
  assert.ok(errs.some((p) => p.qid === 'F01' && /trùng id/.test(p.message)));
  assert.ok(errs.some((p) => p.qid === 'F07' && /ngoài các phương án/.test(p.message)));
  const f02 = bank.questions.find((q) => q.id === 'F02')!;
  assert.deepEqual(f02.answer, ['A', 'C']);
  assert.equal(bank.questions.find((q) => q.id === 'F01')!.file, 'bank/packs/fixture.yaml');
  assert.deepEqual(bank.packs[0], { id: 'fixture', title: 'Bộ câu kiểm thử', origin: 'manual', file: 'bank/packs/fixture.yaml', count: 5, activeCount: 3, description: 'Câu nhỏ cho test.' });
  // a broken YAML file does not crash the loader
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-unit-'));
  try {
    fs.writeFileSync(path.join(tmp, 'bad.yaml'), 'id: x\nquestions: [\n  - {');
    const b = parseBank(tmp, tmp, exams);
    assert.equal(b.questions.length, 0);
    assert.match(b.problems[0].message, /YAML lỗi/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('validation checks: scenario rules, giveaway length, multi stem, short explanation', () => {
  const problems: { level: string; qid?: string; message: string }[] = [];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cert-unit-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'p.yaml'),
      `id: p
title: P
questions:
  - id: S1Q
    exams: { CCDV-F: D2 }
    scenario: S1
    stem: s
    options: [a, b]
    answer: [A]
  - id: S9Q
    exams: { CCAR-F: D1 }
    scenario: S9
    stem: s
    options: [a, b]
    answer: [A]
  - id: LONGKEY
    exams: { CCAR-F: D1 }
    stem: Pick one.
    options: ["This is a very long and detailed correct option text", "short", "tiny", "small"]
    answer: [A]
    explanation: "Giải thích đủ dài: phương án đúng vì lý do kiểm thử, các phương án khác đều sai rõ ràng."
    ref: lessons/x.html
  - id: MULTI
    exams: { CCAR-F: D1 }
    stem: What should you do?
    options: [aaa, bbb, ccc]
    answer: [A, B]
    explanation: ngắn
`,
    );
    const b = parseBank(dir, dir, exams);
    problems.push(...b.problems);
    assert.deepEqual(
      b.questions.map((q) => q.id),
      ['LONGKEY', 'MULTI'],
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  const has = (qid: string, level: string, re: RegExp) => problems.some((p) => p.qid === qid && p.level === level && re.test(p.message));
  assert.ok(has('S1Q', 'error', /không thuộc CCAR-F/));
  assert.ok(has('S9Q', 'error', /scenario không tồn tại/));
  assert.ok(has('LONGKEY', 'warning', /dễ đoán/));
  assert.ok(has('MULTI', 'warning', /không nói chọn mấy/));
  assert.ok(has('MULTI', 'warning', /giải thích quá ngắn/));
  assert.ok(has('MULTI', 'warning', /thiếu ref/));
});

test('slugs follow github-slugger (Vietnamese letters kept, duplicates numbered)', () => {
  assert.equal(slugify('Định dạng đề thi'), 'định-dạng-đề-thi');
  assert.equal(slugify('2. stop_reason & retry!'), '2-stop_reason--retry');
  const s = slugger();
  assert.deepEqual([s('Mục A'), s('Mục A'), s('Mục A'), s('Mục A-1')], ['mục-a', 'mục-a-1', 'mục-a-2', 'mục-a-1-1']);
});

test('headings, frontmatter and text helpers', () => {
  const { data, body } = splitFrontmatter('---\ntitle: T\nexams: [CCAR-F]\n---\n# H1\n\n## `code` **b**\n```\n# no\n```\n### Ba\n');
  assert.equal(data.title, 'T');
  assert.deepEqual(
    mdHeadings(body).map((h) => [h.id, h.text, h.level]),
    [
      ['h1', 'H1', 1],
      ['code-b', 'code b', 2],
      ['ba', 'Ba', 3],
    ],
  );
  assert.deepEqual(
    htmlHeadings('<h2 id="a">A <code>x</code></h2><h2>no id</h2><h3 class="c" id=\'b\'>B &amp; C</h3>').map((h) => [h.id, h.text, h.level]),
    [
      ['a', 'A x', 2],
      ['b', 'B & C', 3],
    ],
  );
  assert.equal(htmlText('<p>a &lt;b&gt;</p><script>x()</script><p>c</p>'), 'a <b> c');
  assert.equal(fold('Bộ nhớ ĐỆM'), 'bo nho dem');
  assert.equal(wordIndex('academy dem', 'dem'), 8);
});

test('issues.md parsing', () => {
  const text = `# Báo lỗi câu hỏi

> intro

## ISS-20261118-101500 · A01 · open
- Thời gian: 2026-11-18T03:15:00.000Z
- Thiết bị: local

Đáp án B có vẻ sai.
Dòng hai.

## ISS-20261118-111500 · \`PA12\` · fixed
[coach enrich] nghi sai
Xử lý: 2026-11-19 — đã sửa đáp án. Nguồn: https://docs.claude.com
`;
  const list = parseIssues(text);
  assert.equal(list.length, 2);
  assert.deepEqual(list[0], { id: 'ISS-20261118-101500', qid: 'A01', at: '2026-11-18T03:15:00.000Z', message: 'Đáp án B có vẻ sai.\nDòng hai.', status: 'open' });
  assert.equal(list[1].qid, 'PA12');
  assert.equal(list[1].status, 'fixed');
  assert.equal(list[1].message, '[coach enrich] nghi sai');
  assert.match(list[1].resolution!, /^2026-11-19 — đã sửa/);
  assert.ok(list[1].at); // derived from the id
});
