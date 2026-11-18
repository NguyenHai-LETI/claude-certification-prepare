#!/usr/bin/env node
// Fake Claude Code CLI for tests: prints stream-json lines like `claude -p … --output-format stream-json --verbose`.
// FAKE_CLAUDE_MODE: ok (default) | slow (starts a grandchild, waits ~30 s) | error (result is_error)
// FAKE_CLAUDE_ARGS: file to write the received argv (JSON) to · FAKE_CLAUDE_CHILD_PID: file for the grandchild pid.
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
if (args[0] === '--version') {
  console.log('9.9.9 (Claude Code)');
  process.exit(0);
}
if (process.env.FAKE_CLAUDE_ARGS) fs.writeFileSync(process.env.FAKE_CLAUDE_ARGS, JSON.stringify({ args, cwd: process.cwd() }));
const mode = process.env.FAKE_CLAUDE_MODE || 'ok';
const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
out({ type: 'system', subtype: 'init', model: 'fake-model', session_id: 's1', permissionMode: 'acceptEdits' });
out({ type: 'assistant', message: { content: [{ type: 'text', text: 'Đang tra tài liệu…' }, { type: 'tool_use', name: 'Read', input: { file_path: `${process.cwd()}/claude-cert/notes/lessons/01-api.html` } }] } });
out({ type: 'user', message: { content: [{ type: 'tool_result', content: 'ok' }] } });
if (mode === 'slow') {
  const child = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { stdio: 'ignore' });
  if (process.env.FAKE_CLAUDE_CHILD_PID) fs.writeFileSync(process.env.FAKE_CLAUDE_CHILD_PID, String(child.pid));
  out({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'WebFetch', input: { url: 'https://docs.claude.com/x' } }] } });
  setTimeout(() => process.exit(0), 30_000);
} else {
  out({ type: 'assistant', message: { content: [{ type: 'text', text: 'Câu trả lời **cuối**.' }] } });
  out({ type: 'result', subtype: 'success', is_error: mode === 'error', result: mode === 'error' ? 'API Error: overloaded' : 'Câu trả lời **cuối**. Nguồn: https://docs.claude.com', num_turns: 2, total_cost_usd: 0.0123 });
  process.exitCode = mode === 'error' ? 1 : 0;
}
