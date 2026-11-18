// npm run sync — the same git sync as the ⇅ button (SPEC §8): commit sync.data_paths → pull --rebase → push.
// Exit code 1 when it failed. Safe to run while the app is open (the app picks up pulled files through its watchers).
import { loadConfig } from '../server/config.ts';
import { runSync, syncState } from '../server/lib/sync.ts';

const cfg = loadConfig();
if (!cfg.sync.enabled) {
  console.log('Đồng bộ đang tắt (config.yaml → sync.enabled: false).');
  process.exit(0);
}
console.log(`⇅ Đồng bộ dữ liệu (${cfg.sync.data_paths.join(', ')})…`);
const o = await runSync({ source: 'cli' });
for (const s of o.steps) {
  console.log(`  ${s.ok ? '✓' : '✗'} ${s.cmd}`);
  if (!s.ok && s.output) console.log(s.output.replace(/^/gm, '      '));
}
console.log(`${o.ok ? '✓' : '✗'} ${o.message}`);
if (o.hint) console.log(`  💡 ${o.hint}`);
const st = await syncState();
if (st.repo) console.log(`  Nhánh ${st.branch ?? '?'} → ${st.remote ?? '(chưa có upstream)'} · chưa commit: ${st.dirty} · chưa đẩy: ${st.ahead} · chưa kéo: ${st.behind}`);
process.exit(o.ok ? 0 : 1);
