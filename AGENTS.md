# Agent & Contributor Standards

Canonical working rules for this repo. Other instruction files
(`CLAUDE.md`, `.github/copilot-instructions.md`, `.cursor/rules/`) point here.
See [PLAN.md](PLAN.md) for milestones/certification and [README.md](README.md)
for setup.

## Communication

- Use `/caveman` style for status updates: short, direct, no filler.
- Do not reduce technical accuracy, code comments, documentation, plans, or
  architectural rationale for the sake of brevity.

## Code standards

- No unexplained magic numbers/strings/timeouts. Use named constants. All
  numeric/config literals live in `src/config/constants.ts`. Direct-condition
  `0`/`1`/`-1`/`''`/`[]`/booleans are fine.
- No inline/raw style strings in components — every class string is a named
  token in `src/theme/ui.ts`.
- Strictest TypeScript (`tsconfig.app.json`) and ESLint
  (`strictTypeChecked` + `no-magic-numbers` + `no-explicit-any` +
  `no-non-null-assertion`). No suppressions without an inline justification
  tracked in docs.
- No dead code, commented-out legacy, unused files/exports/deps, or stale
  config. `npm run deadcode` (knip) must pass.
- No silent fallbacks, fake implementations, placeholder production code, or
  mock data outside test/dev boundaries. Failures must surface explicitly.
- Prefer derived state over `setState` in effects.

## Quality gates (must pass; never bypass to claim done)

- `npm run quality` — typecheck + lint + format:check + deadcode +
  security:audit + tests + build.
- `npm run quality:ci` — `quality` + Lighthouse (Performance/Accessibility/
  Best-Practices; **SEO excluded**).
- Live execution: `npm run verify:judge0`, `npm run test:e2e` (require Judge0 on
  a cgroup-v1 host).
- Visual: `npm run screenshots` (review for UI changes).

## Testing

- Unit/component/integration: Vitest + Testing Library (`npm run test`).
- Puzzle bank is generated and integrity-tested for drift — never hand-edit
  `src/puzzles/generated.ts`; edit `scripts/generate-puzzles.mjs`.
- A milestone is done only when its certification checklist in PLAN.md (C1–C8)
  is satisfied with recorded evidence.

## Documentation discipline

- Update `CHANGELOG.md` after meaningful changes (real history; no planned work
  marked complete).
- Keep `PLAN.md` status accurate; mark deferred items as deferred, not done.
- README must contain no false/stale claims or commands.

## Security

- `.env` is never committed; document vars in `.env.example`.
- `npm run security:audit` gates at `--audit-level=high`. Lower-severity,
  not-shipped advisories are accepted only when justified in PLAN.md.

## Environment note

- Judge0 1.13.1 needs **cgroup v1**. On cgroup-v2 hosts every submission returns
  Internal Error — see README troubleshooting.
