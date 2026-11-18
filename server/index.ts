// Entry point: `node server/index.ts [--dev] [--port N]`. Exit code 75 = "restart me" (scripts/run.ts starts it again).
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, configuredPort } from './config.ts';
import { startServer, type RunningServer } from './app.ts';
import { runtime } from './routes.ts';
import './routes.ts';

export const RESTART_EXIT_CODE = 75;
const PID_FILE = path.join(PATHS.local, 'server.pid');

async function main() {
  const port = configuredPort();
  let running: RunningServer | undefined;
  let stopping = false;
  const shutdown = (code = 0) => {
    if (stopping) process.exit(code);
    stopping = true;
    setTimeout(() => process.exit(code), 12_000).unref(); // never hang on close
    void (running?.close() ?? Promise.resolve())
      .catch(() => undefined)
      .finally(() => {
        try {
          if (fs.readFileSync(PID_FILE, 'utf8').trim() === String(process.pid)) fs.rmSync(PID_FILE, { force: true });
        } catch {
          // no pid file
        }
        process.exit(code);
      });
  };
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGBREAK', 'SIGHUP'] as const) process.on(sig, () => shutdown(0));
  runtime.restart = () => shutdown(RESTART_EXIT_CODE);
  try {
    running = await startServer({ port, dev: process.argv.includes('--dev'), startupSync: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  ✗ Cổng ${port} đang được dùng — app có thể đã chạy sẵn: mở http://localhost:${port}`);
      console.error(`    (đổi cổng: node server/index.ts --port 4004, hoặc sửa config.yaml → server.port)\n`);
      process.exit(1);
    }
    throw e;
  }
  try {
    fs.mkdirSync(PATHS.local, { recursive: true });
    fs.writeFileSync(PID_FILE, String(process.pid));
  } catch {
    // not critical
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
