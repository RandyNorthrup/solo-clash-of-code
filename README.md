# Solo Clash of Code

A single-player take on [Clash of Code](https://www.codingame.com/multiplayer/clashofcode):
instead of racing other people, you race **yourself**. Solve short programming
puzzles, beat your own best time, or play **Beat the Clock** mode against a
countdown. Write solutions in any of 15 languages, run them live, and see your
output graded against test cases — all in the browser.

> Purpose: sharpen problem-solving speed, practice interview-style questions,
> and learn by iterating quickly.

---

## Features

- **Two play modes**
  - **Practice** — a stopwatch counts up; finishing records your best time per
    puzzle ("beat your best").
  - **Beat the Clock** — a countdown (5 / 10 / 15 / 30 min) you try to solve
    within.
- **15 supported languages**, executed in a real sandbox via
  [Judge0](https://judge0.com): Python 3, JavaScript, TypeScript, C++, C#, Go,
  Rust, Ruby, Swift, Scala, PHP, Perl, Lua, OCaml, Zig. The list is detected from
  the running Judge0 instance, so you only see languages that actually work —
  Judge0 CE provides 14 of these (Zig needs the extra-languages image).
- **5 difficulty tiers** — Beginner → Easy → Medium → Hard → Expert — with a
  bank of 51 built-in puzzles whose expected outputs are generated from
  reference solutions (so they're provably consistent).
- **Monaco editor** (the VS Code editor) with per-language starter templates and
  syntax highlighting.
- **Run vs Submit** — _Run_ checks the visible sample cases; _Submit_ runs all
  cases including hidden ones and records your time on a full pass.
- **Puzzle editor** — author your own puzzles (statement + stdin/stdout test
  cases) saved in your browser, listed alongside the built-ins.
- **Local persistence** — best times, custom puzzles, and code drafts are kept
  in `localStorage`.

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Build / dev    | Vite 8                                             |
| UI             | React 19 + React Router 7                          |
| Language       | TypeScript (strictest settings)                    |
| Styling        | Tailwind CSS v4 (via `@tailwindcss/vite`)          |
| Editor         | Monaco (`@monaco-editor/react`)                    |
| Code execution | Judge0 CE (self-hosted via Docker), Vite dev-proxy |
| Quality gates  | ESLint (type-checked, strict) + Prettier           |

There is **no custom backend** for development: the Vite dev server proxies
`/judge0` straight to the Judge0 container.

---

## Prerequisites

- **Node** 20+ (developed on Node 26)
- **Docker** + Docker Compose (for the Judge0 execution sandbox)

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the Judge0 execution sandbox (Docker)
npm run judge0:up        # docker compose up -d
#    First run pulls images and can take a few minutes.
#    Verify it's up:  curl http://localhost:2358/languages

# 3. Start the app
npm run dev              # http://localhost:5173
```

Open the app, pick a mode, pick a puzzle, and start coding. Press **Run** to
check the sample cases or **Submit** to run everything and lock in a time.

To stop the sandbox: `npm run judge0:down`.

> The app still loads without Judge0 running, but you won't be able to execute
> code until it's reachable — you'll see a "No languages available" message.

---

## npm scripts

| Script                        | What it does                                      |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | Start the Vite dev server                         |
| `npm run build`               | Type-check and build for production               |
| `npm run preview`             | Preview the production build                      |
| `npm run typecheck`           | `tsc` with no emit                                |
| `npm run lint`                | ESLint (strict, type-aware)                       |
| `npm run lint:fix`            | ESLint with autofix                               |
| `npm run format`              | Prettier write                                    |
| `npm run format:check`        | Prettier check                                    |
| `npm run check`               | typecheck + lint + format check + tests           |
| `npm run quality`             | check + deadcode + security:audit + build         |
| `npm run quality:ci`          | quality + Lighthouse (the full CI gate)           |
| `npm run test` / `test:run`   | Vitest (watch / once)                             |
| `npm run test:coverage`       | Coverage with thresholds (pure-logic modules)     |
| `npm run test:e2e`            | Live solve walkthrough (needs Judge0)             |
| `npm run deadcode`            | knip — unused files/exports/deps                  |
| `npm run security:audit`      | `npm audit` gated at high severity                |
| `npm run lighthouse`          | Build + Lighthouse assertions                     |
| `npm run screenshots`         | Capture UI screenshots (visual review)            |
| `npm run verify:judge0`       | Live per-language execution check (needs Judge0)  |
| `npm run puzzles:generate`    | Regenerate the puzzle bank from reference solvers |
| `npm run judge0:up` / `:down` | Start / stop the Judge0 Docker stack              |

---

## How puzzles & grading work

Every puzzle follows the Clash of Code I/O model: the program reads from
**stdin** and writes to **stdout**. A test case is `{ input, expectedOutput }`.
On run, your source is sent to Judge0 with the case's `input` as stdin; the
resulting stdout is compared to `expectedOutput` after normalizing line endings
and trailing whitespace.

The built-in bank lives in [`src/puzzles/generated.ts`](src/puzzles/generated.ts),
which is **generated** — do not edit it by hand. Edit the specs (and their
reference `solve` functions) in
[`scripts/generate-puzzles.mjs`](scripts/generate-puzzles.mjs) and run
`npm run puzzles:generate`.

---

## Project structure

```
src/
  config/constants.ts     All named constants (no magic numbers elsewhere)
  theme/ui.ts             All styled class constants (no inline styles in components)
  routes.ts               Route paths + query-param helpers
  vite-env.d.ts           ImportMetaEnv declarations (VITE_JUDGE0_URL)
  judge/                  Judge0 client, language defs, availability, grading
  puzzles/                Types, generated bank, store, io.ts (import/export/share)
  scores/ drafts/         localStorage stores for best times and code drafts
  hooks/                  useStopwatch
  utils/time.ts           Stopwatch / countdown formatting
  components/             Layout, Panel, CodeEditor, Clock, badges, test list
  pages/                  HomePage, SolvePage, NewPuzzlePage, StatsPage, SharePage
scripts/generate-puzzles.mjs   Puzzle generator (reference-solution verified)
docker-compose.yml             Judge0 stack
```

---

## Quality standards

This project is intentionally strict (see [CHANGELOG](CHANGELOG.md) and
[PLAN](PLAN.md)):

- **TypeScript**: `strict` plus `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitReturns`, and more.
- **ESLint**: `strictTypeChecked` + `stylisticTypeChecked`, `no-explicit-any`,
  `no-non-null-assertion`, and **`no-magic-numbers`** — raw numbers are only
  defined (and named) in `src/config/constants.ts`.
- **Styling**: components never inline raw class strings; every style is a named
  constant in `src/theme/ui.ts`.
- **Prettier** enforces formatting.

Run `npm run quality` before committing (`npm run quality:ci` adds Lighthouse).

---

## Environment variables

No secrets are required. See [`.env.example`](.env.example).

| Variable          | Required | Default                 | Purpose                                                       |
| ----------------- | -------- | ----------------------- | ------------------------------------------------------------- |
| `VITE_JUDGE0_URL` | No\*     | `http://localhost:2358` | Dev: Vite proxy target. Prod: browser-facing Judge0 base URL. |
| `JUDGE0_URL`      | No       | `http://localhost:2358` | Judge0 base URL for `scripts/verify-judge0.mjs`.              |

\* Required in production if code execution must work (see Deployment below).

---

## Deployment

`npm run build` produces a fully static site in `dist/` — no server required.
Serve it from any static host (Netlify, Vercel, GitHub Pages, nginx, etc.).
Configure a SPA fallback so all routes return `index.html`.

### Judge0 requirement

In development, the Vite dev server proxies `/judge0` → `VITE_JUDGE0_URL` to
avoid CORS. In production the browser calls Judge0 directly, so you must:

1. **Self-host Judge0 CE** (or use a managed instance) and expose it over HTTPS.
2. **Enable CORS**: pass `CORS_ALLOWED_ORIGINS=https://your-app.example.com` (or
   `*`) to the Judge0 container — see `docker-compose.yml` for where to add it.
3. **Set `VITE_JUDGE0_URL` at build time** — Vite inlines it into the bundle:
   ```bash
   VITE_JUDGE0_URL=https://judge0.example.com npm run build
   ```
   Without it the app loads but shows an "execution offline" state (language
   picker shows no languages; Run/Submit are disabled).

### Deployment checklist

- [ ] Judge0 reachable over HTTPS from the browser
- [ ] CORS configured on Judge0 to allow your app's origin
- [ ] `VITE_JUDGE0_URL` set at `npm run build` time
- [ ] `dist/` served; all routes fall back to `index.html` (SPA routing)

---

## Security notes

- No app backend, no auth, no secrets in the repo; `.env` is git-ignored.
- `npm run security:audit` gates at **high** severity — currently 0 high/critical.
- Two _moderate_ `monaco-editor → dompurify` advisories are **accepted**:
  `monaco-editor` is not in the production bundle (Monaco loads from CDN), and
  the app renders only the user's own code, so the XSS vectors aren't reachable.
  Tracked in [PLAN.md](PLAN.md).
- `VITE_JUDGE0_URL` is validated in `vite.config.ts` (dev) and inlined at build time for production.
- CI (`.github/workflows/ci.yml`) runs `quality` + Lighthouse on push/PR.

---

## Troubleshooting

- **"No languages available"** — Judge0 isn't reachable. Run `npm run judge0:up`
  and confirm `curl http://localhost:2358/languages` returns JSON.
- **Every submission returns "Internal Error" (`Failed to create control group`)**
  — Judge0 1.13.1's `isolate` sandbox requires **cgroup v1**, but modern Docker
  Desktop defaults to **cgroup v2**. Fix: enable cgroup v1 and restart the
  daemon.
  - Quit Docker Desktop, then in
    `~/Library/Group Containers/group.com.docker/settings-store.json` set
    `"deprecatedCgroupv1": true`, relaunch Docker Desktop.
  - Confirm with `docker info | grep Cgroup` → `Cgroup Version: 1`, then
    `npm run judge0:up` and `npm run verify:judge0` (expect all Accepted).
  - On Linux/CI, run on a cgroup-v1 host. To revert, set the flag back to
    `false` and restart.
- **A language is missing from the dropdown** — your Judge0 image may not ship
  it (e.g. Zig/Swift live in newer images). The app only lists what Judge0
  reports.
