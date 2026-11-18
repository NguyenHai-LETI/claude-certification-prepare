#!/bin/bash
# macOS: double-click to start the Claude certification practice app (local only) and open the browser.
# First time: if macOS blocks it, right-click → Open (or chmod +x start.command). Same as `npm start`.
cd "$(dirname "$0")" || exit 1

pause_exit() { read -r -p "Nhấn Enter để đóng cửa sổ…" _; exit 1; }

# Finder launches get a minimal PATH: add the usual Node locations (Homebrew, Volta, nvm, fnm, asdf).
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.local/bin:$HOME/.asdf/shims:$PATH"
if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1; fi
if ! command -v node >/dev/null 2>&1 && command -v fnm >/dev/null 2>&1; then eval "$(fnm env)"; fi
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Chưa cài Node.js (cần ≥ 22.18). Tải bản LTS tại https://nodejs.org rồi chạy lại."
  pause_exit
fi
if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=18)?0:1)'; then
  echo "✗ Node $(node -v) quá cũ — cần ≥ 22.18. Cập nhật tại https://nodejs.org"
  pause_exit
fi
# npm install when node_modules is missing or package-lock.json changed since the last install
STAMP="node_modules/.cert-lock.json"
if [ ! -d node_modules ] || ! cmp -s package-lock.json "$STAMP"; then
  echo "→ Cài thư viện (npm install)…"
  if ! PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund; then
    echo "✗ npm install thất bại — kiểm tra mạng rồi chạy lại."
    pause_exit
  fi
  cp package-lock.json "$STAMP" 2>/dev/null
fi
echo "→ Đang khởi động… (Ctrl+C hoặc đóng cửa sổ này để dừng)"
node scripts/run.ts --open || pause_exit
