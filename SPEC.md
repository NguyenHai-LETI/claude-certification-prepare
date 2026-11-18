# claude-cert: design spec (developer-facing)

A local practice app for the four Claude certification exams (CCAR-F, CCDV-F, CCAO-F, CCAR-P), modelled on `../trainer/` (the AWS
SAA-C03 app) but deliberately small: build tests, take them, history, review wrong answers, read notes, local Claude Code AI,
git sync, remote access through ngrok. UI text is Vietnamese; question stems/options are English (like the real exam);
explanations Vietnamese. Code comments English.

`shared/types.ts` is the API contract. Change it only together with both sides.

## 1. Layout

```
claude-certification-prepare/   (repo root = app root; the app also works as a subfolder of a bigger repo)
  exams.yaml            exam definitions (domains + weights, CCAR-F scenarios) — Exam Guide v1.0
  config.yaml           server/public/scoring/practice/ai/sync settings
  bank/packs/*.yaml     question packs (§2.1)
  bank/issues.md        reported problems (§2.4)
  bank/reviews/*.md     quality-review reports (cert-review skill)
  notes/**              study notes: *.md and *.html fragments (§2.3)
  results/YYYY-MM/*.json  one file per submitted test (§2.2) — synced
  coach/plans/*.md      AI coach plans — synced
  coach/runs/           raw AI logs (git-ignored)
  .local/               per-machine, git-ignored: access-code, active/<testId>.json, sync.json, public.json, server.pid
  server/               Node 22 HTTP server, native TS (no build step), no framework
  web/                  React 19 + Vite 8 UI (built to dist/ and served by the server)
  shared/               types (+ pure helpers usable by both sides)
  scripts/              run.ts (supervisor), public.ts (app + ngrok watchdog), validate.ts, import-ccx.ts, sync.ts
  tests/                node:test unit/API tests; tests/ui/smoke.mjs (Playwright)
```

Runtime: `node server/index.ts` (port from config, default 3004). `npm run build` builds the UI into `dist/`; the server serves
`dist/` and falls back to index.html for client routes. `--dev` serves through Vite middleware (like trainer).

## 2. File formats

### 2.1 Packs — `bank/packs/<pack-id>.yaml`

```yaml
id: ccx
title: …
origin: imported | official | ai | manual
source: https://…            # optional
description: …               # optional
questions:
  - id: A01                  # unique across all packs
    exams: { CCDV-F: D2, CCAR-F: D4 }   # ≥1 exam; domain must exist in exams.yaml
    scenario: S6             # optional, CCAR-F only (exams.yaml scenarios)
    stem: "…"                # Markdown; multi-answer stems say "Which TWO…" / "(Choose two.)"
    options: ["…", "…", "…", "…"]       # 4 (2–6 allowed); letters by index
    answer: [B]              # letters; >1 = multiple answer
    explanation: "…"         # Vietnamese Markdown: why the key is right + why each distractor is wrong
    ref: lessons/01-api-tich-hop.html#batch   # optional note link
    status: active           # default active; draft = not served in tests; retired = hidden
    difficulty: medium       # optional
    tags: [batch, cost]      # optional
    created: 2026-11-18      # optional
    reviewed: 2026-11-18     # optional, set by cert-review
```

Id conventions: `ccx` keeps the artifact's ids (A01, PA12, DV03 …); official samples `OF-<EXAM>-NN`; AI-generated `AI-<EXAM>-NNN`
(e.g. AI-CCARP-001); manual `M-NNN`. The loader validates (§6) and reports problems instead of crashing: a broken question is
skipped and listed in `/api/system` `bank.problems`.

### 2.2 Results — `results/<YYYY-MM>/<id>.json`

`Result` from shared/types.ts, pretty-printed. id = `YYYYMMDD-HHMMSS-<4 hex>` (local time). Results are append-only (delete only
from the History page). Filenames never collide across machines → git sync never conflicts on results.

### 2.3 Notes — `notes/`

- `notes/00-tong-quan.md` — overview of the four exams (format, rules, scoring, registration, official links).
- `notes/exams/<CODE>.md` — per exam: domains with weights and the official task statements (paraphrased), what to study, links
  to lessons. Frontmatter `exams: [CCAR-F]`.
- `notes/lessons/NN-*.html` — the study artifact's 26 lessons as cleaned HTML fragments (headings keep their `id` so question
  `ref` anchors work; inline SVG diagrams kept; scripts removed). Styling: `web/styles-lesson.css` scoped under `.lesson`.
- `notes/lessons/index.yaml` — lesson list: `{file, title, exams: [...]}`.
- Markdown files may start with YAML frontmatter (`title`, `exams`). Title fallback: first `# heading`, else `<h1>`, else filename.

### 2.4 Issues — `bank/issues.md`

Append-only Markdown, one `## ISS-… · <qid> · open` section per report with the learner's message; the AI coach `fix-issues` task
edits the question and changes the heading status to `fixed` / `wontfix` with a `Xử lý:` line. The server parses it into `Issue[]`.

## 3. Core rules

### 3.1 Questions of an exam
A question belongs to exam X when `exams[X]` is set; its domain in X is `exams[X]`. Tests only serve `status: active`.

### 3.2 Building a test (`POST /api/tests`)
- **mock**: `exam.questions` questions, `exam.minutes`, feedback `exam`. Per-domain counts by weight (largest-remainder).
  Within a domain prefer: never answered → in review → others (random within each tier); fill from other domains if a domain
  runs short. CCAR-F: draw `scenarioPick` scenarios at random; prefer questions whose `scenario` is drawn, then questions without
  a scenario; never questions of an undrawn scenario unless needed to reach the count. Store drawn ids in `scenarios`.
- **domain**: `count` (default config practice.default_count) from the chosen domains, same preference order.
- **review**: the review list (§3.3) of the exam, filtered by domains, oldest-wrong first, up to `count`.
- **new**: never-answered questions, random.
- **random**: any active questions of the exam, random.
- **ids**: exactly these ids (any exam membership; domain = their domain in `exam`, else their first exam's domain).
- Question order: random (ids: given order). Options shuffled when config `practice.shuffle_options`; keys stay canonical.
- 0 questions → 400 with a Vietnamese message.

### 3.3 Review list ("Ôn câu sai")
Per question, take every answer from all results (any exam) in time order. The question is in review when it has at least one
wrong answer and the number of consecutive correct answers after its last wrong answer is < `scoring.review_streak` (2).

### 3.4 Score
`pct = correct/total*100`. Estimated scaled score is piecewise linear: 0% → 100, `scoring.pass_pct` (72) → 720, 100% → 1000;
rounded to the nearest 10 (the real scale is unpublished — UI labels it "ước tính"). `pass = scaled >= exam.pass`. Multi-answer
items are all-or-nothing (as on the real exam).

### 3.5 Dashboard
Per domain of the selected exam: over each question's **last 3 answers** (any results), count answered/correct → pct. Estimate =
domain pcts weighted by domain weight (domains with no answers excluded and weights renormalised; null if nothing answered).

## 4. HTTP API

JSON everywhere; errors `{error: "<Vietnamese message>"}` with 4xx/5xx. Every non-GET request must carry header `X-Cert: 1`
(CSRF guard; the web client always sends it). Remote requests without a valid access cookie get 401 on `/api/*` except
`GET /api/meta`, `GET/POST /api/access`.

| Method & path | Body / query | Returns |
|---|---|---|
| GET /api/meta | | `Meta` |
| GET /api/access | | `{required, granted}` |
| POST /api/access | `{code}` | `{granted:true}` + Set-Cookie, or 401/429 |
| GET /api/system | | `SystemInfo` (accessCode only when local) |
| POST /api/system/restart | | `{ok}` then exit(75) (only when supervised, else 409) |
| GET /api/bank | `exam, domain, pack, status, q, review=1, seen=0|1` | `{questions: QuestionSummary[], packs: Pack[]}` |
| GET /api/questions/:id | | `QuestionDetail` |
| POST /api/tests | `BuildTestRequest` | `ActiveTest` |
| GET /api/tests | | `ActiveTestSummary[]` |
| GET /api/tests/:id | | `ActiveTest` |
| PUT /api/tests/:id | `SaveTestRequest` | `{ok}` |
| POST /api/tests/:id/check | `CheckRequest` | `CheckResponse` (403 for feedback exam) |
| POST /api/tests/:id/submit | `SaveTestRequest` | `{resultId}` |
| DELETE /api/tests/:id | | `{ok}` |
| GET /api/results | `exam` | `ResultSummary[]` newest first |
| GET /api/results/:id | | `ResultDetail` |
| DELETE /api/results/:id | | `{ok}` |
| GET /api/dashboard | `exam` | `Dashboard` |
| GET /api/notes | | `NoteEntry[]` |
| GET /api/notes/file | `path` | `NoteFile` (path must stay inside notes/) |
| GET /api/search | `q, exam` | `SearchHit[]` (≤ 40) |
| GET /api/issues | `qid, status` | `Issue[]` |
| POST /api/issues | `{qid, message}` | `Issue` |
| POST /api/ai/ask | `AskRequest` | `AiJob` |
| GET /api/ai/jobs/:id | `since` | `AiJob` (log from `since`) |
| POST /api/ai/jobs/:id/cancel | | `{ok}` |
| GET /api/coach | | `CoachState` |
| POST /api/coach/run | `CoachRunRequest` | `AiJob` (409 if a coach job runs) |
| GET /api/coach/plans/:file | | `{file, content}` |
| GET /api/sync | | `SyncState` |
| POST /api/sync | | `SyncState` after the run |
| GET /api/events | | SSE stream of `ServerEvent` |

## 5. Access, security

- **Local** = TCP peer is loopback **and** the Host header is `localhost|127.0.0.1|[::1]` (any port) **and** no
  `X-Forwarded-For` / `Forwarded` header. Everything else (LAN, ngrok — ngrok forwards to localhost but adds
  `X-Forwarded-For` and keeps the public Host) is **remote**.
- Remote needs the access code: random 8 chars from an unambiguous alphabet, stored in `.local/access-code` (created on first
  start; env `CERT_ACCESS_CODE` overrides). `POST /api/access` compares in constant time; success sets cookie
  `cert_access=<HMAC(code, secret)>` (HttpOnly, SameSite=Lax, Secure when `X-Forwarded-Proto: https`, 180 days). Changing the
  code invalidates cookies. 10 failed attempts per IP (X-Forwarded-For first hop, else peer) per 15 min → 429.
- A granted remote client has **every** permission a local one has (user decision), except reading the access code itself.
- Bind: `127.0.0.1` when `server.lan: false`, `0.0.0.0` when true. ngrok targets `http://localhost:<port>`.
- Static UI and `/api/meta`, `/api/access` are reachable without the code; the UI shows a code prompt when `/api/access` says
  `required && !granted`.
- Paths from requests (notes path, plan file, ids) are validated: no `..`, must resolve inside their directory.

## 6. Validation (`npm run validate`, also run at server start → bank.problems)

Errors: duplicate id; missing stem/options/answer; answer letter outside options; <2 options; unknown exam or domain; scenario on a
non-CCAR-F question or unknown scenario; multi-answer stem that does not state how many to choose (warning). Warnings: options
of very unequal length where the key is the longest by > 1.6× (giveaway), explanation shorter than 60 chars, missing ref.

## 7. AI (local Claude Code CLI)

- Find `claude`: config `ai.claude_path`, else PATH (`which`/`where`), else `~/.claude/local/claude`. Show status on the AI page.
- Run from the **repo root** (so the root `.claude/skills/cert-*` skills load) with
  `claude -p <prompt> --output-format stream-json --verbose --permission-mode acceptEdits --allowedTools <list>` (+ `--model`).
  Parse stream-json lines: assistant text → `job.text`, tool_use → a short `log` line ("Read notes/…", "Edit bank/packs/…"),
  result → done. Kill the process tree on cancel. One coach job at a time; ask jobs may run alongside (max 2).
- **Ask** (`Hỏi AI`, also the tutor): read-only tools `Read,Grep,Glob,WebFetch,WebSearch`. Prompt = the question (stem, options,
  key, explanation, the learner's choice if any) + the conversation so far + instruction: answer in Vietnamese, ground in
  official Anthropic docs, cite URLs, keep it short. Refused (403) while the question is in an unsubmitted exam-feedback test.
- **Coach tasks** (tools `Read,Grep,Glob,Edit,Write,WebFetch,WebSearch,Bash(node <app>/scripts/validate.ts*)`): the prompt
  tells Claude to follow skill `cert-coach` (plan, fix-issues), `cert-generate` (generate) or `cert-review` (review) with the
  request's exam/domains/count/note. Before the run: sync if `ai.sync_before`; after a successful run: reload bank, sync if
  `ai.sync_after`. Raw stream saved to `coach/runs/<jobId>.jsonl`.

## 8. Sync (git)

Port the essentials of `trainer/server/lib/sync.ts`: `git pull --rebase --autostash` → `git add <data_paths>` →
commit `cert: sync từ <hostname> <YYYY-MM-DD HH:mm>` (only if staged changes) → `git push`. Only paths in `sync.data_paths` are
ever staged. Serialised (one run at a time). Auto mode `idle`: schedule a sync `auto_delay_minutes` after each submit / issue /
AI run; pull once at startup. Conflicts → abort rebase, report error, never force-push. After a pull that touched bank/results →
reload + SSE events. `npm run sync` runs the same from the CLI.

## 9. Launchers

- `scripts/run.ts` — supervisor: runs `server/index.ts` (builds `dist/` first if missing/stale), restarts it on exit code 75
  (restart button) or crash (back-off), env `CERT_SUPERVISED=1`.
- `scripts/public.ts` — run.ts + ngrok: `ngrok http <port> --url=https://<public.ngrok_domain>`; every `check_seconds` GET
  `https://<domain>/api/meta` (header `ngrok-skip-browser-warning: 1`); not 200 → restart ngrok (and the app if the local check
  fails). Writes `.local/public.json {url, ok, checkedAt, error}`. Detects "endpoint already online" (another machine/app holds
  the domain) and reports it clearly. Cross-platform (macOS, Windows): spawn with `shell: false`, kill process trees properly.
- Double-click wrappers: `start.command` / `start.bat` (local only), `public.command` / `public.bat` (with ngrok).

## 10. UI (Vietnamese)

Top bar: exam selector (persisted in localStorage, default CCAR-F) · nav · ⇅ sync button with state · AI availability dot.
Pages: 🏠 Tổng quan · ✍️ Tạo bài test · (runner) · (result) · 🕘 Lịch sử · ❌ Ôn câu sai (list + start) · 📖 Tài liệu ·
🗂️ Ngân hàng · 🤖 AI Coach · ⚙️ Hệ thống. Light/dark themes, phone width ≥ 360 px (used through ngrok on a phone).

## 11. Out of scope (deliberately cut from trainer)

Anki, Listen, micro/voice, confusable pairs, external scores, claude.ai artifact build, FSRS (+optimizer, today planner,
leeches, sprint), sealed forms, detailed stats pages (forecast, workload, go/no-go, checklist, countdown), bank quality tooling
UI (lint UI, Ollama duplicates, distractor analysis, tiers, relations/twins/anti-rote, verify, giải mù), AI notebook,
👍/👎 ratings, onboarding, PWA, HTTPS mkcert/tailscale, SQLite cache, scheduled coach, MCP quiz server, practice-exams import.
