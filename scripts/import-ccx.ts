// npm run import-ccx -- <dir>  — imports the practice questions of the public study artifact
// https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf into bank/packs/ccx.yaml.
// <dir> holds the artifact's assets/data.js and assets/questions-*.js (download them with Claude Code's Artifact tool).
// The files are parsed statically with the TypeScript parser — nothing from them is executed.
// Re-running keeps local edits: a question whose id already exists in ccx.yaml is left as it is unless --overwrite.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import YAML from 'yaml';

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(here, '..');
const out = path.join(root, 'bank', 'packs', 'ccx.yaml');
const SOURCE = 'https://claude.ai/artifact/3NhHr42CxTHGEs33N1ntFf';

type Lit = string | number | boolean | null | Lit[] | { [k: string]: Lit };

function val(n: ts.Node): Lit {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isNumericLiteral(n)) return Number(n.text);
  if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (n.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.MinusToken) return -(val(n.operand) as number);
  if (ts.isParenthesizedExpression(n)) return val(n.expression);
  if (ts.isArrayLiteralExpression(n)) return n.elements.map(val);
  if (ts.isObjectLiteralExpression(n)) {
    const o: Record<string, Lit> = {};
    for (const p of n.properties) {
      if (!ts.isPropertyAssignment(p)) throw new Error(`unsupported property: ${p.getText().slice(0, 60)}`);
      const name = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : p.name.getText();
      o[name] = val(p.initializer);
    }
    return o;
  }
  throw new Error(`unsupported syntax ${ts.SyntaxKind[n.kind]}: ${n.getText().slice(0, 60)}`);
}

interface CcxQuestion {
  id: string;
  l: string;
  d: Record<string, string>;
  s?: string;
  sc?: string;
  q: string;
  o: string[];
  a: number[];
  w: string;
}
interface CcxData {
  lessons: Record<string, { t: string; f: string; k?: string }>;
}

function parseDir(dir: string): { data: CcxData; questions: CcxQuestion[] } {
  let data: CcxData | undefined;
  const questions: CcxQuestion[] = [];
  const files = fs.readdirSync(dir).filter((f) => /^(data|questions-[\w-]+)\.js$/.test(f)).sort();
  for (const f of files) {
    const sf = ts.createSourceFile(f, fs.readFileSync(path.join(dir, f), 'utf8'), ts.ScriptTarget.ES2022, true);
    for (const st of sf.statements) {
      if (!ts.isExpressionStatement(st)) throw new Error(`${f}: unexpected statement ${st.getText().slice(0, 60)}`);
      const e = st.expression;
      if (ts.isBinaryExpression(e) && e.left.getText() === 'window.CCX') data = val(e.right) as unknown as CcxData;
      else if (ts.isCallExpression(e) && e.expression.getText() === 'CCX.questions.push')
        questions.push(...(e.arguments.map(val) as unknown as CcxQuestion[]));
      else throw new Error(`${f}: unexpected statement ${st.getText().slice(0, 60)}`);
    }
  }
  if (!data) throw new Error(`${dir}: data.js (window.CCX = …) not found`);
  return { data, questions };
}

const LETTERS = 'ABCDEFGH';

function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes('--overwrite');
  const dir = args.find((a) => !a.startsWith('--'));
  if (!dir) {
    console.error('usage: npm run import-ccx -- <dir with data.js and questions-*.js> [--overwrite]');
    process.exit(2);
  }
  const { data, questions } = parseDir(path.resolve(dir));
  const existing = new Map<string, unknown>();
  if (fs.existsSync(out)) {
    const doc = YAML.parse(fs.readFileSync(out, 'utf8')) as { questions?: { id: string }[] };
    for (const q of doc.questions ?? []) existing.set(q.id, q);
  }
  const seen = new Set<string>();
  let added = 0;
  let kept = 0;
  const list = questions.map((q) => {
    if (seen.has(q.id)) throw new Error(`duplicate id ${q.id}`);
    seen.add(q.id);
    if (!overwrite && existing.has(q.id)) {
      kept++;
      return existing.get(q.id);
    }
    added++;
    const lesson = data.lessons[q.l];
    const ref = lesson ? `lessons/${lesson.f}${q.s ?? ''}` : undefined;
    return {
      id: q.id,
      exams: q.d,
      ...(q.sc ? { scenario: q.sc } : {}),
      stem: q.q,
      options: q.o,
      answer: q.a.map((i) => LETTERS[i]).sort(),
      explanation: q.w,
      ...(ref ? { ref } : {}),
    };
  });
  const pack = {
    id: 'ccx',
    title: 'Bộ câu tự soạn từ tài liệu ôn tập công khai (artifact 3NhHr42…)',
    origin: 'imported',
    source: SOURCE,
    license: 'Không ghi giấy phép. Tài liệu ôn tập cá nhân, không thuộc và không được Anthropic xác nhận.',
    imported: new Date().toISOString().slice(0, 10),
    description:
      'Câu tiếng Anh như đề thật, giải thích tiếng Việt. Tác giả ghi: câu tự soạn theo task statement của Exam Guide v1.0, không lấy từ đề thật.',
    questions: list,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, YAML.stringify(pack, { lineWidth: 0 }));
  console.log(`bank/packs/ccx.yaml: ${list.length} câu (${added} mới/ghi đè, ${kept} giữ nguyên)`);
}

main();
