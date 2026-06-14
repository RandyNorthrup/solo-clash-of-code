# Changelog

All notable code changes to this project are tracked here. This is the running
record of **what actually changed** — update it in the same commit as the code.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added — Clash of Code reskin, three modes & the transposer

- **Visual reskin to match Clash of Code.** Rewrote `src/theme/ui.ts` and
  `src/index.css` to the CoC neutral-dark palette (near-black `#1a1c1f` shell,
  `#23262b` panels, muted-gray section labels, jester gold `#e9a648` / purple
  `#8f79e7` accents, green submit). New `JesterMark` component + "Clash of Code"
  wordmark replace the old `</>` "Solo Clash" brand; `index.html` title updated.
- **Three authentic clash modes** (`ClashMode = fastest | shortest | reverse` in
  `src/routes.ts`), orthogonal to the kept solo timer (`practice` stopwatch /
  `timed` Beat-the-Clock):
  - **Fastest** — score is completion time (existing `recordTimeMs`).
  - **Shortest** — score is code size; live CODE SIZE meter; new
    `recordSizeChars` / `getBestSizeChars` in `src/scores/store.ts`.
  - **Reverse** — statement hidden until solved; only the examples are shown.
  - `HomePage` lobby gains a clash-mode selector; `SolvePage` branches scoring,
    shows a CoC-style clock-icon `12MN 27SC` countdown (`formatClashClock` +
    `ClashClock`), a contributor hero header, and renders variable **chips**.
- **Transposer — deterministic per-language starter stubs** (`src/judge/stubgen.ts`).
  A puzzle now carries an optional structured `ioFormat` descriptor
  (`src/puzzles/types.ts`); `generateStub(ioFormat, language)` emits idiomatic
  stdin-parsing starter code for every supported language — the single-player
  analogue of CoC's "Auto-generated code …". Pure and deterministic; no API
  calls. `SolvePage` uses it for the editor's initial code (draft → stub →
  template). `SpecText` renders inline `` `tokens` `` as variable chips, derived
  automatically in the generator from the descriptor's variable names.
- **Built-in bank** (`scripts/generate-puzzles.mjs`): added `ioFormat` for all 50
  non-grid puzzles and chip markup on Input/Output/Constraints; regenerated
  `generated.ts`. **AI generator** (`src/openai/puzzleGenerator.ts`): `ioFormat`
  added to the structured-output schema, validated (shape, unique identifiers,
  one-instruction-per-input-line, stub-generates), and attached to generated
  puzzles, so AI puzzles also get per-language stubs.
- **Languages: 14 → 17.** Removed **Zig** (Judge0 CE provides no Zig compiler, so
  it was unreachable config). Added **Java**, **Kotlin**, and **Bash** with
  starter templates and transposer dialects. Fixed a latent **TypeScript** bug:
  Judge0's `tsc` rejected `require` without `@types/node`; stubs/templates now
  `declare` it.
- Tests: `+` code-size store, `formatClashClock`, `SpecText` chips, `stubgen`
  units, `solvePath` clash round-trip, SolvePage Shortest/Reverse, generated-bank
  descriptor guards, and a self-skipping **live** transposer test
  (`stubgen.live.test.ts`) that compiles+runs every language's stub on Judge0.
- Verification: `npm run quality` green (121 tests + build); `npm run
test:coverage` 97.17% / 91.4% / 98.73% / 98.26%; `npm run lighthouse` 99 / 100 /
  100; `npm run verify:judge0` 5/5 Accepted; `npm run test:e2e` solved Echo +
  Circle Area; the live transposer test compiled+ran stubs for all 17 languages;
  screenshots reviewed against the CoC reference.

### Added — Optional AI puzzle generation

- `AccountPage` at `/account`: friendly OpenAI API key setup with masked entry,
  connection test, encrypted browser save, saved-key test, and clear action.
  Saved keys use Web Crypto AES-GCM with a non-extractable IndexedDB key and
  `localStorage` ciphertext; puzzle export/import never includes the key.
- `HomePage`: rebuilt the first screen around a difficulty selector, game mode
  chooser, **Quick play**, **Quick play AI puzzle**, and an AI account shortcut.
  The puzzle list now follows the selected difficulty, and AI quick play opens
  generated puzzles as session-only puzzles instead of saving them immediately.
- `SolvePage`: generated puzzles now expose **Favorite puzzle**, with a naming
  dialog that saves the puzzle permanently to the custom puzzle list.
- `src/puzzles/store.ts`: added session-only generated-puzzle storage plus
  promotion to the existing permanent user-puzzle store.
- `src/openai/puzzleGenerator.ts`: new Responses API client using `gpt-5.5`,
  low reasoning effort / low verbosity, strict structured outputs (`text.format`
  JSON schema), local generated-puzzle validation, and explicit errors instead
  of fallback model behavior. The validator now also applies production-grade
  instruction QA: ASCII-only
  statement/specs/constraints, no ambiguous wording, no language-specific
  requirements, concrete `Line 1` I/O specs, concrete numeric bounds,
  cross-language integer safety, selected-difficulty fit, and explicit float
  tolerance wording. Reference solutions are executed in Python 3 through
  Judge0, expected outputs are canonicalized from verified stdout, compile/
  runtime/timeout/empty/oversized outputs are rejected, failed candidates retry
  with QA feedback, and stalled OpenAI requests time out explicitly.
- `src/openai/keyStorage.ts`: local key format validation, encrypted save/load,
  stored-key detection, and clear.
- `vite.config.ts`: dev proxy `/openai` → `https://api.openai.com` for local
  account testing without adding an app backend.
- `public/favicon.svg`: replaced with the provided jester SVG asset.
- `scripts/screenshots.mjs`: visual harness now captures Account Setup at
  desktop and mobile widths.
- `scripts/walkthrough.mjs`: live walkthrough now uses clipboard paste for
  Monaco edits and a longer Judge0 wait window to avoid typing-related e2e
  flakes.
- Tests: added focused coverage for the start screen, account key flow, AI
  puzzle request/validation behavior, temporary generated-puzzle storage, and
  favorite-to-save flow.

### Changed — Puzzle QA pass: all tiers

- Beginner tier: clarified `count-chars` so spaces explicitly count, changed its
  visible sample to `hi there`, corrected the constraint to non-empty input, and
  clarified `celsius-to-fahrenheit` requires real-number division and accepts any
  numeric answer within tolerance.
- Easy tier: added integer value ranges to list tasks, clarified `factorial`
  needs a type large enough for `20!`, made the vowel sample visibly
  case-insensitive, clarified palindrome case sensitivity, and added a negative
  hidden validator for `sort-numbers`.
- Medium tier: clarified `nth-fibonacci` needs a type large enough for `F(50)`,
  corrected `word-count` to non-empty printable ASCII input, added value ranges
  for `average`, clarified case-sensitive matching in `count-occurrences`, added
  a no-match hidden validator, and tightened `circle-area` tolerance wording.
- Hard tier: strengthened validators and difficulty fit for `to-binary`,
  `is-prime`, `anagram-check`, `two-sum-exists`, and rebuilt
  `number-to-words` from a trivial 1–19 lookup into a 1–999 word conversion
  challenge.
- Expert tier: strengthened `nth-prime` to validate the `n = 10000` limit,
  corrected balanced-bracket constraints to non-empty input, clarified base
  conversion value bounds, added base-36 coverage, clarified matrix trace
  accumulator size, constrained run-length decode symbols to non-digits, added a
  large composite factorization validator, and added a `k > n` rotate-array
  validator.
- `src/puzzles/generated.test.ts`: added bank-wide quality checks that every
  puzzle has at least two visible sample cases, at least one hidden validator,
  and no duplicate inputs within a puzzle.
- Verification: focused puzzle/grader/SolvePage tests passed (27 tests);
  structural audit reported 51 puzzles, 164 test cases, 102 visible samples, and
  62 hidden validators with no duplicate inputs or empty fields; `npm run
quality`, `npm run test:coverage`, `npm run quality:ci`, `npm run
verify:judge0`, `npm run test:e2e`, and `npm run screenshots` passed.

### Changed — Audit and Lighthouse tooling cleanup

- `package.json` / `package-lock.json`: added an npm `overrides` pin for
  `dompurify@3.4.9`, replacing Monaco's transitive `dompurify@3.2.7` and
  clearing the previous Monaco/DOMPurify audit advisories.
- Replaced `@lhci/cli` with direct `lighthouse@13.4.0` and
  `chrome-launcher@1.2.1` dev dependencies. Full `npm audit` now reports
  **0 vulnerabilities**.
- `scripts/lighthouse.mjs` (new): serves the production preview, launches
  headless Chrome, runs Lighthouse programmatically, writes
  `.lighthouseci/lhr.json`, and asserts Performance ≥ 0.85, Accessibility ≥
  0.90, Best-Practices ≥ 0.90. Removed stale `lighthouserc.json`.
- `.github/workflows/ci.yml`: CI still runs `npm run lighthouse`; comments now
  describe the direct Lighthouse runner instead of LHCI.
- Verification: `npm audit`, `npm run quality`, `npm run test:coverage`,
  `npm run lighthouse`, `npm run verify:judge0`, and `npm run test:e2e` all
  passed. Lighthouse recorded Performance 99 · Accessibility 94 ·
  Best-Practices 100.

### Changed — Clash cockpit UI polish

- `HomePage` now opens with a private solo lobby setup panel: real mode cards
  for Fastest practice vs. Beat the Clock, compact puzzle/tier/timer stats, and
  import/export controls grouped with the setup surface.
- `SolvePage` now uses a Clash-style cockpit layout: goal/statement left, code
  editor right, and a bottom rail for console output, test cases, and actions.
  The action rail shows the real solo runner status, selected language, code
  character count, sample-case count, and hidden-case count.
- `src/theme/ui.ts` gained the named layout/style tokens for the lobby,
  solve-workbench, bottom rail, action metrics, and player status. The remaining
  inline `className="hidden"` file-input style moved to `ui.fileInput`.
- `src/config/constants.ts`: raised `EDITOR_MIN_HEIGHT_PX` from 320 to 420 so
  the code pane reads like a primary IDE surface.
- `scripts/screenshots.mjs`: increased the render-settle delay from 1.2 s to
  2.5 s so Monaco is more likely to be visible in captured mobile screenshots.
- Verification: `npm run quality` passed; `npm run verify:judge0` passed 5/5
  live languages; `npm run test:e2e` solved Echo and Circle Area through Judge0;
  `VITE_JUDGE0_URL=http://localhost:2358 npm run screenshots` captured and
  visually verified Home/Solve desktop and mobile.

### Added — Milestone 10: deployment

- `src/vite-env.d.ts` (new): declares `ImportMetaEnv.VITE_JUDGE0_URL?: string`
  and `ImportMeta.env` so TypeScript has a typed view of the Vite env vars.
- `src/config/constants.ts`: renamed `JUDGE0_BASE_URL` → `JUDGE0_PROXY_PATH` to
  clarify it is only the Vite dev-proxy path, not a production URL.
- `src/judge/judge0.ts`: module-level `judgeBaseUrl` now branches on
  `import.meta.env.PROD`. In production builds `VITE_JUDGE0_URL` (trailing
  slashes stripped) is inlined at build time by Vite; in development the proxy
  path (`/judge0`) is always used so browser CORS is not triggered. The
  connectivity error message is context-aware: dev shows the `judge0:up` hint;
  prod shows CORS/URL guidance.
- `README.md`: new **Deployment** section covering `npm run build`, static
  hosting, Judge0 CORS requirement, `VITE_JUDGE0_URL` build-time injection, SPA
  fallback, and a deployment checklist. Updated features count (51 puzzles),
  scripts table (added `test:coverage`), project structure, and env-vars table.
- `.env.example`: annotated with development vs. production semantics for
  `VITE_JUDGE0_URL`.

### Added — Milestone 9: CI coverage gate

- `vitest.config.ts` now declares a `coverage` block: `provider: 'v8'`, `include`
  scoped to 9 pure-logic source files (`time.ts`, `grade.ts`, `availability.ts`,
  `history.ts`, `scores/store.ts`, `drafts/store.ts`, `puzzles/store.ts`,
  `io.ts`, `local.ts`), and `thresholds: { statements: 90, branches: 80,
functions: 90, lines: 90 }`. Measured aggregate: Stmts 98.17% · Branches
  90.98% · Functions 100% · Lines 99.5%.
- `.github/workflows/ci.yml` updated: adds `npm run test:coverage` step between
  `npm run quality` and `npm run lighthouse`, enforcing the coverage threshold on
  every push and PR.
- `coverage/` added to `.prettierignore` and ESLint `globalIgnores` so the
  generated HTML/JS coverage report does not trigger lint or format failures.

### Added — Milestone 8: content scale & sharing

- **Puzzle bank expanded to 51** (was 27). Added 24 new puzzles across all
  five difficulty tiers (10 beginner, 10 easy, 11 medium, 10 hard, 10 expert).
  New reference helpers added to `generate-puzzles.mjs`: `runLengthDecode`,
  `numWords`, `primeFactors`, `luhnCheck`. All expected outputs computed by
  reference solvers; drift test still passes.
  New puzzle IDs: `is-even`, `absolute-value`, `min-two`, `count-chars`,
  `celsius-to-fahrenheit`, `palindrome-check`, `repeat-string`, `min-in-list`,
  `sum-squares`, `sum-digits`, `lcm`, `average`, `count-occurrences`,
  `missing-number`, `is-prime`, `anagram-check`, `triangle-type`,
  `number-to-words`, `two-sum-exists`, `matrix-trace`, `run-length-decode`,
  `prime-factors`, `luhn-check`, `rotate-array`.
- `src/puzzles/io.ts`: pure import/export utilities. `exportPuzzlesJson`
  serialises puzzles to `{ version: 1, puzzles: [...] }` JSON. `importPuzzlesJson`
  validates the schema with type guards (`isPuzzleShape`, `isTestCase`,
  `isDifficulty`), throws with a descriptive message on any mismatch, and
  forces `source: 'user'` on all imported puzzles. `encodePuzzleForUrl` /
  `decodePuzzleFromUrl` encode/decode a single puzzle as a URL-safe base64url
  string for share links.
- `src/pages/SharePage.tsx` at `/share?p=<b64url>`: decodes the puzzle on
  mount using a `useState` lazy initialiser (avoids `setState` inside effects),
  saves it via `saveUserPuzzle`, and redirects with `replace: true` to
  `/solve/:id`. Shows an explicit error banner rather than a silent fallback
  when the link is malformed.
- `HomePage`: three new toolbar actions — **Export JSON** (downloads
  `my-puzzles.json` of all user puzzles), **Import JSON** (file input that
  validates and batch-saves puzzles, shows a success/error banner), **Share**
  button on each custom puzzle card (copies the `/share?p=...` URL to
  clipboard, flips to "Copied!" for 2 s using `COPY_FEEDBACK_DURATION_MS`).
- New constants: `PUZZLE_EXPORT_SCHEMA_VERSION`, `COPY_FEEDBACK_DURATION_MS`,
  `JSON_INDENT_SPACES`.
- New route constant `ROUTES.share` and query-param constant
  `PUZZLE_SHARE_PARAM` in `routes.ts`.

### Tests

- +11 tests (79 total): `src/puzzles/io.test.ts` — export/import round-trip,
  forced `'user'` source, order preservation, invalid JSON, wrong top-level
  shape, wrong version, malformed puzzle entry, URL encode/decode round-trip,
  URL-safe output, invalid base64, decoded shape validation.

### Added — Milestone 7: stats, history & streaks

- `src/scores/history.ts`: append-only solve log persisted in `localStorage`
  (`STORAGE_KEY_SOLVE_HISTORY`). Public API: `appendSolve`, `getSolveHistory`,
  `getRecentTimesForPuzzle`, `computeTierStats`, `computeLanguageUsage`,
  `computeStreakDays`. Streak uses UTC date keys (`YYYY-M-D`) for
  timezone-safe consecutive-day calculation.
- `src/components/Sparkline.tsx`: SVG polyline showing the last
  `SPARKLINE_MAX_POINTS` solve times for a puzzle. Green stroke when the trend
  is improving (last < first), blue otherwise. Returns `null` when fewer than
  `SPARKLINE_MIN_POINTS` data points are available. Rendered below the puzzle
  constraints on `SolvePage`.
- `src/pages/StatsPage.tsx`: `/stats` route with a "By difficulty" tier grid
  (solve count, best time, median time per tier) and a "Languages" horizontal
  bar chart. Empty-state message with a link to the puzzle browser when no
  history exists. Streak and total solve count shown in the toolbar.
- `SolvePage`: calls `appendSolve` on each successful solve (all cases pass)
  and refreshes the sparkline via `getRecentTimesForPuzzle`.
- `src/routes.ts`: `stats: '/stats'` added.
- `src/App.tsx`: `StatsPage` route added.
- `src/components/Layout.tsx`: "Stats" nav link added.
- New constants in `constants.ts`: `STORAGE_KEY_SOLVE_HISTORY`,
  `SPARKLINE_MAX_POINTS`, `SPARKLINE_MIN_POINTS`, `SPARKLINE_SVG_WIDTH`,
  `SPARKLINE_SVG_HEIGHT`, `HALF_DIVISOR`, `PERCENT_FACTOR`.
- New styled tokens in `ui.ts`: `statsSection`, `statsGrid`, `statsCard`,
  `statNumber`, `statLabel`, `statBest`, `statMedian`, `statsBars`,
  `statBarRow`, `statBarLabel`, `statBarBg`, `statBarFill`, `statBarCount`,
  `sparklineWrap`, `sparklineLabel`.

### Tests

- +18 tests (68 total): `src/scores/history.test.ts` (16 tests — all
  aggregation functions, UTC streak edge cases, SPARKLINE_MAX_POINTS cap);
  `src/pages/StatsPage.test.tsx` (2 tests — empty state + populated render).

### Added — Milestone 6: parallel & resilient execution

- `runBatch` in `src/judge/judge0.ts`: submits all cases in one
  `POST /submissions/batch` call and polls `GET /submissions/batch` until every
  token is terminal. Results returned in original request order (matched by
  token). `runSubmission` removed (dead code after `gradeAll` switched to batch).
- `JUDGE0_BATCH_SIZE = 20` in `constants.ts`: concurrency cap; `gradeAll`
  processes test cases in chunks of at most this size.
- Retry-once on transient `INTERNAL_ERROR`: cases that return this status are
  re-submitted as a sub-batch; the retried result replaces the first.
- `AbortController` wired from `SolveWorkspace` through `gradeAll` into
  `runBatch` fetch calls and inter-poll `sleep`. Fires on workspace unmount
  (navigation away), propagated as `DOMException('AbortError')` and swallowed
  without an error banner. Sleep is abort-aware: cancels the `setTimeout`
  immediately rather than waiting for the next poll cycle.

### Tests

- +3 tests (50 total): retry-once logic (`runBatch` called twice, retried result
  wins); AbortError propagation from `gradeAll`; abort silences the error banner
  in `SolvePage`.

### Added — Milestone 5: grading fidelity & UX polish

- Per-case output checkers: `TestCase.match` = `exact` | `trimmed` (default) |
  `tokens` | `float`; `compareOutputs` in `src/judge/grade.ts` with a
  `FLOAT_MATCH_EPSILON` tolerance. Two new puzzles use them: `sort-numbers`
  (tokens) and `circle-area` (float) — bank now 27.
- Distinct failure categories: `ErrorKind`
  (compile/runtime/timeout/internal) mapped from Judge0 status and surfaced in
  `TestCaseList` (timeout in amber via new `testStatusTimeout` token).
- `components/Console.tsx`: failing-visible-case panel on `SolvePage` (expected
  vs got, or error kind + detail).
- "Reset" button (restore template) and `Ctrl/Cmd+Enter` to run sample cases.
- Accessibility: associated form labels were added earlier; this milestone keeps
  Lighthouse at 100 / 94 / 100.

### Tests

- +11 tests (47 total): `compareOutputs` for all four modes, `errorKind`
  mapping, and a `Console` component test. `npm run test:e2e` now also solves the
  float-checked `circle-area` with a typed Python solution (live float check).

### Added — Quality, security & CI hardening (setup-spec alignment)

- Dead-code detection: **knip** (`npm run deadcode`, `knip.json`); removed real
  dead code it found — unused constants (`MINUTES_PER_HOUR`,
  `MILLIS_DISPLAY_DIGITS`, `DEFAULT_LANGUAGE_KEY`) and unused type exports
  (`CaseOutcome`, `Judge0Status`, `PuzzleSource` un-exported).
- Security: `npm run security:audit` (`npm audit --omit=dev --audit-level=high`,
  0 high/critical). Accepted+documented the moderate monaco→dompurify advisory
  (not bundled; CDN-loaded). `.env.example` added; `VITE_JUDGE0_URL` validated in
  `vite.config.ts`.
- Aggregate gates: `npm run quality` (typecheck + lint + format + deadcode +
  audit + tests + build) and `npm run quality:ci` (+ Lighthouse). Replaced the
  ad-hoc `gate` script. Added `test:unit` / `test:e2e` aliases.
- CI: `.github/workflows/ci.yml` (GitHub Actions, Node 22) running `quality` +
  Lighthouse. Live Judge0 gates excluded from CI (cgroup-v1 requirement).
- Agent instruction files: `AGENTS.md` (canonical), `CLAUDE.md`,
  `.github/copilot-instructions.md`, `.cursor/rules/standards.mdc`.
- PLAN.md expanded with assumptions, open questions, dependency-verification,
  security gates, performance gates, and definition of done.
- Removed the earlier global user-memory file (relocated to project-local
  `AGENTS.md`/`CLAUDE.md`) to honor the "no global memory without approval" rule.

### Added — Test & scan harness (Milestone T)

- Vitest + jsdom + React Testing Library; `test`, `test:run`, `test:coverage`
  scripts; tests folded into `npm run check`.
- `src/test/setup.ts`: jest-dom matchers, in-memory `localStorage` polyfill,
  per-test cleanup.
- **36 tests** across 9 files: `utils/time`, `judge/grade` (mocked Judge0),
  `judge/availability` (all 15 language patterns), `scores`/`drafts`/`puzzles`
  stores, generator **no-drift + well-formed** integrity, and component tests for
  `SolvePage` (submit→best-time / failure) and `NewPuzzlePage` (validation/save).
- `scripts/verify-judge0.mjs` (`npm run verify:judge0`) — live execution
  smoke test against a running Judge0 (the live arm of certification C2).
- **Lighthouse CI** (`@lhci/cli`, `lighthouserc.json`, `npm run lighthouse`):
  asserts Performance ≥ 0.85, Accessibility ≥ 0.90, Best-Practices ≥ 0.90;
  **SEO excluded**. Recorded scores: Perf 100 · A11y 94 · Best-Practices 100.
- `npm run gate` = `check` + `lighthouse` (the full certification gate).

### Added — Visual harness (C8)

- `scripts/screenshots.mjs` (`npm run screenshots`): Playwright via system Chrome
  captures Home, Solve, and New Puzzle at desktop (1440) and mobile (390) widths
  to `screenshots/` for visual review and regression diffing.

### Changed — UX (from visual review)

- Left-aligned puzzle-card titles (were center-aligned by the button default) and
  added a hover color so they read as clickable.
- Solve page: merged the two redundant offline error banners into one clear
  message, with the raw Judge0 error shown parenthetically.

### Added — Accessibility

- Associated `<label>`s (`htmlFor`/`id`) for all puzzle-editor fields and
  `aria-label`s for dynamic test-case inputs.

### Changed — Tooling

- `tsconfig.app.json` includes `node` types (test files use `node:` modules);
  added a test-file ESLint override (literal fixtures, mocks, vitest mock idiom).

### Added — Live walkthrough (C1/C2)

- `scripts/walkthrough.mjs` (`npm run walkthrough`): drives a real solve through
  the dev server → Judge0 (Echo, default Python template), asserts the success
  banner, and saves `screenshots/solve-solved.png`.

### Certification

- **All milestones to date are certified.** With Judge0 running on cgroup v1:
  `npm run verify:judge0` → 5/5 Accepted (Python, JS, Ruby, C++, Go);
  `npm run walkthrough` solved Echo end-to-end (3/3 cases passed, best time
  recorded). 14/15 languages resolve live (Zig absent in CE, correctly
  excluded). M1, M3, M4 moved from built → **certified**; M0, M2 already
  certified. See [PLAN.md](PLAN.md) ledger.

### Environment

- Judge0 1.13.1 requires **cgroup v1**. On this Docker Desktop (cgroup v2)
  every submission returned `Internal Error`; fixed by setting
  `deprecatedCgroupv1: true` in Docker Desktop settings and restarting the
  daemon. Documented in README troubleshooting.

### Process

- Added **C8 — Visual verification** to the certification standard: UI-affecting
  milestones must have their screens rendered and visually reviewed (screenshots
  via a planned Playwright `npm run screenshots` harness, with optional
  regression diffing). Non-UI milestones (M2) are exempt. M3/M4 certification now
  also lists the pending visual check.
- Introduced a **Milestone Certification Standard** in [PLAN.md](PLAN.md): every
  milestone must be tested after completion and pass C1–C6 (functional, tested &
  verified, quality gate green, production-grade, no fallbacks/legacy/dead code,
  documented) before it is "done". Reclassified M1–M4 from done to **built —
  not yet certified**; added **Milestone T** (test harness) as the immediate
  next step so they can be certified.

### Changed

- Renamed `MONACO_FALLBACK` → `MONACO_DEFAULT_GRAMMAR` in `SolvePage` to reflect
  that it is an intentional default (plaintext highlighting for languages with
  no Monaco grammar), not an error-masking fallback.

### Planned

- See [PLAN.md](PLAN.md) for upcoming milestones (test harness, custom output
  checkers, stats dashboard, parallel grading, deployment).

---

## [0.1.0] — 2026-06-08

Initial working build: a single-player Clash of Code with live multi-language
execution, two play modes, a 25-puzzle bank across 5 difficulty tiers, and a
puzzle editor. Strict TypeScript/ESLint/Prettier from day one.

### Added — Tooling & project setup

- Scaffolded Vite 8 + React 19 + TypeScript project.
- Tailwind CSS v4 via `@tailwindcss/vite`; dark IDE-style global theme.
- Vite dev proxy `/judge0 → http://localhost:2358` (configurable with
  `VITE_JUDGE0_URL`).
- `docker-compose.yml` + `judge0.conf` for a self-hosted Judge0 CE sandbox
  (server, workers, Postgres, Redis).
- npm scripts: `typecheck`, `lint`, `lint:fix`, `format`, `format:check`,
  `check`, `puzzles:generate`, `judge0:up`, `judge0:down`.

### Added — Quality gates

- Strictest TypeScript options (`strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noImplicitReturns`, `noImplicitOverride`,
  `noPropertyAccessFromIndexSignature`, …) in `tsconfig.app.json` /
  `tsconfig.node.json`.
- ESLint flat config with `strictTypeChecked` + `stylisticTypeChecked`,
  `no-explicit-any`, `no-non-null-assertion`, `consistent-type-imports`, and
  `no-magic-numbers` (exempted only in `src/config/constants.ts`).
- Prettier config + ignore; `eslint-config-prettier` to avoid rule conflicts.

### Added — Architecture & conventions

- `src/config/constants.ts` — every named constant (timing, limits, storage
  keys, editor defaults); the only place raw numbers live.
- `src/theme/ui.ts` — every styled class string as a named constant; components
  never inline raw classes. Difficulty-keyed badge colors.
- `src/routes.ts` — centralized route paths and query-param helpers.

### Added — Execution & grading (Judge0)

- `src/judge/languages.ts` — 15 supported languages with Monaco grammar ids,
  Judge0 name-match patterns, and per-language stdin/stdout starter templates.
- `src/judge/judge0.ts` — Judge0 REST client (create-then-poll submissions,
  status enum, resource limits, friendly connectivity errors).
- `src/judge/availability.ts` + `useLanguages.ts` — resolve supported languages
  against the live Judge0 instance and cache the result.
- `src/judge/grade.ts` — run a solution against test cases, normalize output,
  classify each case as pass / fail / error, incremental progress callback.

### Added — Puzzles

- `src/puzzles/types.ts` — `Puzzle` / `TestCase` types, 5 `Difficulty` tiers
  (beginner → expert) with labels.
- `scripts/generate-puzzles.mjs` — generator that computes expected outputs from
  reference solutions, producing `src/puzzles/generated.ts` (25 puzzles).
- `src/puzzles/store.ts` — built-in bank merged with user-authored puzzles.
- `src/scores/store.ts` — per-puzzle best-time tracking.
- `src/drafts/store.ts` — per-puzzle, per-language code drafts.

### Added — UI

- `useStopwatch` hook (performance.now()-based, with synchronous read).
- `utils/time.ts` — stopwatch (`m:ss.t`) and countdown (`mm:ss`) formatting.
- Components: `Layout`, `Panel`, `CodeEditor` (Monaco), `Clock`,
  `DifficultyBadge`, `TestCaseList`.
- `HomePage` — puzzle browser grouped by difficulty, Practice / Beat-the-Clock
  mode selector, best-time display, delete for custom puzzles.
- `SolvePage` — statement panel, language picker, Monaco editor, Run/Submit,
  live per-case results, stopwatch/countdown, best-time recording. Built with a
  keyed workspace child + derived state to avoid setState-in-effect.
- `NewPuzzlePage` — authoring form for custom puzzles with dynamic test cases.
- `App.tsx` — React Router setup with a not-found redirect.

### Added — Docs

- `README.md`, `CHANGELOG.md`, `PLAN.md`.

### Verified

- `npm run check` (typecheck + lint + format) passes clean.
- `npm run build` succeeds; `npm run dev` serves HTTP 200.

[Unreleased]: https://example.com/compare/v0.1.0...HEAD
[0.1.0]: https://example.com/releases/tag/v0.1.0
