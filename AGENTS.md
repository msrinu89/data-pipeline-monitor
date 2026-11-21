# Repository guidance

## Start here

- Read [docs/project-context.md](docs/project-context.md) for current architecture, behavior, and limitations.
- Read [docs/feature-development.md](docs/feature-development.md) when adding or changing a feature.
- Consult [docs/plan.md](docs/plan.md) for the intended Databricks MVP and security requirements. It is a target design, not a description of implemented capabilities.
- Check `git status` and the relevant source before editing. Preserve unrelated user changes.

## Product boundaries

Data Pipeline Monitor is a platform-neutral, read-only monitoring portal. Databricks is the first planned live integration; ADF and Snowflake currently appear only as sample data.

The repository currently contains a frontend prototype. Do not imply that its sample identity, environment filters, or connection cards provide authentication, authorization, or real platform connectivity.

Keep job execution, restart, cancellation, editing, and deletion outside monitoring features unless the user explicitly changes scope. Never put platform tokens or credentials in browser code, fixtures, logs, or committed files. Future collectors own platform credentials; the API must enforce access.

## Implementation conventions

- Use the existing React, TypeScript, Vite, plain CSS, and Lucide setup. Read `package.json` before assuming a library is installed.
- Use npm and preserve `package-lock.json`. Keep TypeScript strict checking enabled.
- Preserve platform-neutral naming in shared UI and domain code.
- Derive metrics from the same scoped records as their corresponding views; distinguish pipeline counts from run counts.
- Keep demo data and simulated actions clearly labeled. Do not add production-looking success messages for unimplemented actions.
- For larger features, extract cohesive components, data selectors, or feature modules from `src/App.tsx` as needed. Avoid unrelated rewrites.
- Follow existing formatting with Prettier. Write UTF-8 files; Windows PowerShell's default encoding can corrupt punctuation and symbols.
- Keep controls keyboard usable, label icon-only buttons, and use text/icons alongside status colors. Check responsive layout and modal focus behavior when affected.
- Update the context documentation when architecture, commands, data contracts, or implementation status changes.

## Commands and validation

Requires Node.js 22.12+ and npm. `npm ci` installs from the lockfile; `npm run dev` starts the local UI.

- `npm run build`: TypeScript checking and production build.
- `npm test`: sample-data consistency tests using Node's test runner.
- `npm run test:e2e`: Playwright smoke tests against the production build. Run `npm run build` first and install Chromium with `npx playwright install chromium` once.
- `npm run typecheck`: TypeScript checking only.
- `npm run format`: formats frontend files and tests; inspect for unrelated formatting changes.
- `git diff --check`: whitespace check.

Run build and relevant tests for code changes. For UI changes, verify the affected interactions and desktop/mobile layouts in a browser when available. Add tests for meaningful new logic; the existing tests do not cover UI behavior. Documentation-only changes need link/content checks, not an application rebuild. Report any verification you could not perform.

Do not commit dependencies, build output, secrets, or machine-specific files. `.github/workflows/ci.yml` runs unit tests, a production build, and browser smoke tests on pull requests and pushes to main. No lint script, backend, or deployment pipeline currently exists; do not claim those checks ran.
