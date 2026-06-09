# Copilot Instructions

Follow the canonical standards in [../AGENTS.md](../AGENTS.md) and the plan in
[../PLAN.md](../PLAN.md).

Essentials:

- No magic numbers (`src/config/constants.ts`); no raw style strings in
  components (`src/theme/ui.ts`).
- Strict TypeScript/ESLint; no `any`, dead code, silent fallbacks, or
  placeholder/fake code.
- Gates must pass: `npm run quality` (+ `npm run quality:ci` for Lighthouse).
- Keep CHANGELOG.md and PLAN.md accurate; never mark planned work as done.
