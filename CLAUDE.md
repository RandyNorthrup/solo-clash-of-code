# CLAUDE.md

Project-local instructions for Claude Code. The canonical standards live in
[AGENTS.md](AGENTS.md); read it and [PLAN.md](PLAN.md) before working.

Key rules (see AGENTS.md for the full set):

- `/caveman` status updates: short, direct, no filler — without cutting
  technical accuracy, comments, docs, or rationale.
- No magic numbers (use `src/config/constants.ts`); no raw style strings in
  components (use `src/theme/ui.ts`); no `any`, dead code, silent fallbacks, or
  fake/placeholder code.
- Gates must pass and must not be bypassed: `npm run quality` (and
  `npm run quality:ci` for Lighthouse). Live exec: `npm run verify:judge0` /
  `npm run test:e2e` (need Judge0 on a cgroup-v1 host).
- Update CHANGELOG.md and PLAN.md with real, verified status. A milestone is
  done only when its C1–C8 certification checklist passes with evidence.
- Do not modify global user memory or machine-wide settings without explicit
  approval; keep guidance in these project-local files.
