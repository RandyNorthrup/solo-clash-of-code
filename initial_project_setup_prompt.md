# AI Project Setup Initial Prompt

You are setting up this project from scratch. Treat this as a production-grade codebase from the first commit.

Use `/caveman` https://github.com/JuliusBrussee/caveman/tree/main communication style for chat/status updates: short, direct, no filler. Do not reduce technical accuracy, documentation quality, code comments, plans, or architectural rationale for the sake of brevity.

## Primary Objective

Create a clean, secure, maintainable, production-ready project foundation using the most current stable stack versions that are verified compatible with each other.

Do not guess compatibility. Verify package/runtime/framework compatibility using official documentation, release notes, package peer dependencies, or compatibility matrices before installation.

## Before Implementation

Ask clarification questions before making irreversible or stack-defining decisions, including:

- Application type
- Framework/runtime
- Language
- Package manager
- Target deployment environment
- Database/storage needs
- Authentication needs
- UI/design system needs
- Testing expectations
- Browser/platform support
- CI/CD provider
- Hosting provider
- Required integrations

If the answer is already present in project files or prior instructions, use it and do not ask again.

If a reasonable default is needed, document the assumption in `PLAN.md` before proceeding.

## Setup Requirements

Set up the strictest practical project standards for the chosen stack:

- Formatting
- Linting
- Type checking
- Unit testing
- Integration testing where applicable
- End-to-end testing where applicable
- Security scanning
- Dependency auditing
- Dead-code detection where available
- Bundle/performance analysis where applicable
- Accessibility testing where applicable
- Production build validation
- CI-ready quality gates

All quality gates must be runnable from package scripts or documented commands.

No feature or milestone is complete unless all required gates pass.

## Code Standards

Follow these rules throughout the project:

- No unexplained magic numbers, strings, booleans, or timeout values.
- Use named constants, typed constants, enums, literal unions, config objects, or schema-validated configuration.
- Common language/framework idioms are allowed only when clarity is not reduced, such as `0`, `1`, `-1`, empty arrays, empty strings, and boolean literals in direct conditions.
- No dead code.
- No commented-out legacy code.
- No unused files, unused exports, unused dependencies, or stale configuration.
- No silent fallbacks.
- No fake implementations.
- No placeholder production code.
- No mock data outside test/dev/demo boundaries.
- No broad `any`, unchecked casts, suppressed lint rules, or ignored type errors unless justified inline and tracked in documentation.
- No global installs unless explicitly required and documented.
- No dependency added without purpose, compatibility check, and security consideration.

## Security Requirements

Set up security from the beginning:

- Dependency vulnerability scanning.
- Secret scanning where practical.
- Environment variable validation.
- Safe default configuration.
- Secure headers where applicable.
- Input validation where applicable.
- Output encoding/sanitization where applicable.
- Authentication/authorization hardening where applicable.
- Least-privilege configuration.
- No secrets committed to the repository.
- `.env.example` must document required environment variables without real secrets.

Document security assumptions and remaining risks in `PLAN.md`.

## Performance and Optimization Requirements

Set up performance controls where applicable:

- Production build validation.
- Bundle size awareness.
- Lighthouse performance/accessibility/best-practices checks for visual/web milestones.
- Avoid unnecessary dependencies.
- Avoid avoidable client-side work.
- Prefer static/server-side work when appropriate for the stack.
- Use measurable performance targets where possible.

Lighthouse SEO is excluded unless I explicitly request SEO gates.

## Required Project Documents

Create and maintain these files:

### `README.md`

Must include:

- Project overview
- Stack
- Requirements
- Installation
- Development commands
- Build commands
- Test commands
- Quality gate commands
- Environment variables
- Project structure
- Deployment notes, if known
- Security notes
- Troubleshooting

README must never contain false claims, unverified claims, stale commands, or features that do not exist.

### `CHANGELOG.md`

Use this as the actual implementation history.

Rules:

- Update it after meaningful code/config/documentation changes.
- Track real changes only.
- Do not list planned work as completed.
- Keep historical entries even if later superseded.

### `PLAN.md`

Create a full project execution plan.

The plan must include:

- Project assumptions
- Resolved decisions
- Open questions
- Architecture notes
- Research notes
- Dependency/version verification notes
- Milestones
- Tasks per milestone
- Test requirements per milestone
- Certification gates per milestone
- Visual verification gates when UI exists
- Lighthouse gates when UI is visually testable
- Security gates
- Performance gates
- Documentation update requirements
- Definition of done

Each milestone must include:

- Goal
- Scope
- Files/areas likely affected
- Implementation steps
- Acceptance criteria
- Required tests
- Required quality gates
- Required documentation updates
- Required security checks
- Required performance checks
- Certification checklist

A milestone is not complete until its certification checklist is satisfied.

## Agent / IDE Instruction Files

Create project-local instruction files needed by the active IDE or coding agent, such as:

- `AGENTS.md`
- `.cursor/rules/*`
- `CLAUDE.md`
- `.github/copilot-instructions.md`
- Other project-local instruction files supported by the selected tooling

Do not create or modify global user memory, global IDE settings, or machine-wide agent instructions unless I explicitly approve it.

These instruction files must reinforce:

- Code standards
- Quality gates
- Documentation rules
- Testing rules
- Security rules
- Changelog discipline
- Planning discipline
- `/caveman` communication style for status updates

## Installation Rules

Install only what is needed.

Before adding dependencies:

1. Identify the purpose.
2. Verify current stable version.
3. Verify compatibility with the stack.
4. Prefer official, maintained, widely adopted packages.
5. Avoid abandoned, deprecated, or unnecessary packages.
6. Document major dependency decisions in `PLAN.md`.

After installing:

1. Lock dependencies.
2. Run install verification.
3. Run lint/type/build/test gates where available.
4. Update documentation.

## Quality Gates

Set up scripts for the selected stack equivalent to:

- `format`
- `format:check`
- `lint`
- `typecheck`
- `test`
- `test:unit`
- `test:integration`
- `test:e2e`
- `build`
- `security:audit`
- `quality`
- `quality:ci`

The aggregate quality command must fail on any blocking issue.

Do not bypass gates to claim completion.

## Visual Verification Gates

Once the project has a UI that can be run locally or previewed:

- Add visual verification to milestone certification.
- Include instructions for local preview.
- Include screenshot or manual verification requirements where appropriate.
- Run Lighthouse for each milestone certification where applicable.
- Lighthouse categories required: Performance, Accessibility, Best Practices.
- Lighthouse SEO is excluded unless explicitly requested.
- Record Lighthouse results or notes in the milestone certification section.

## Documentation Accuracy Rule

Keep documentation synchronized with the code.

Before marking any task or milestone complete:

- Verify README commands still work.
- Verify changelog reflects actual changes.
- Verify PLAN status is accurate.
- Remove stale claims.
- Remove obsolete instructions.
- Mark deferred items clearly as deferred, not complete.

## Progress Rules

During implementation:

- Work milestone by milestone.
- Do not skip certification gates.
- Do not create fallback, legacy, temporary, or dead code to force progress.
- Ask clarification questions when blocked by product decisions.
- Make reasonable documented assumptions only when they do not create product risk.
- Report progress using short `/caveman` style updates.
- Include changed files, gates run, failures, fixes, and remaining blockers.

## Completion Rule

At the end of setup, provide:

- Summary of created files
- Installed dependencies
- Configured quality gates
- Commands to run
- Known assumptions
- Open questions
- First milestone status
- Any failed or deferred gates
- Next recommended action

Do not claim the project is production-ready unless all documented production-readiness gates pass.