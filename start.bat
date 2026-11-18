@echo off
rem Windows: double-click to start the Claude certification practice app (local only) and open the browser. Same as npm start.
setlocal
cd /d "%~dp0"
chcp 65001 >nul

where node >nul 2>nul
if errorlevel 1 (
  echo [x] Chua cai Node.js ^(can ban 22.18 tro len^). Tai ban LTS tai https://nodejs.org roi chay lai.
  goto fail
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=18)?0:1)"
if errorlevel 1 (
  echo [x] Node.js qua cu - can ban 22.18 tro len. Cap nhat tai https://nodejs.org
  goto fail
)
rem npm install when node_modules is missing or package-lock.json changed since the last install
if not exist "node_modules\" goto install
fc /b package-lock.json node_modules\.cert-lock.json >nul 2>nul
if errorlevel 1 goto install
goto run
:install
echo Dang cai thu vien (npm install)...
set "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1"
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [x] npm install that bai - kiem tra mang roi chay lai.
  goto fail
)
copy /y package-lock.json node_modules\.cert-lock.json >nul
:run
echo Dang khoi dong... (Ctrl+C hoac dong cua so nay de dung)
rem node directly (not npm): closing this window stops node and everything it started
node scripts\run.ts --open
if errorlevel 1 goto fail
exit /b 0
:fail
pause
exit /b 1
