# Project context

## Purpose and intended users

Data Pipeline Monitor gives teams visibility into their assigned ETL/ELT pipelines without direct access to the underlying platforms. The long-term product spans multiple platforms; the first live integration is Databricks, followed by possible Azure Data Factory and Snowflake integrations.

The intended client viewer can inspect authorized jobs, runs, task dependencies, and approved diagnostics. Platform administrators will manage connections, ownership mappings, and access grants. The current Jamie Davis / Acme identity is static demo content, not an authenticated session.

## Documentation map

- [../AGENTS.md](../AGENTS.md): concise instructions for repository work.
- [../README.md](../README.md): product overview and local setup.
- [feature-development.md](feature-development.md): workflow for extending the application.
- [plan.md](plan.md): detailed Databricks MVP requirements and unresolved production decisions.

Use source code and `package.json` to verify implementation details. Keep this document aligned with changes; do not treat planned features as shipped.

## What exists today

A client-rendered React application with TypeScript and Vite. Styling uses plain CSS, Google Fonts with fallbacks, and Lucide icons. React Flow, TanStack Table, Tailwind, and shadcn/ui are mentioned in the target plan but are not installed or used in the current UI.

The four navigation views are Overview, Pipelines, Run history, and Connections. The UI supports environment/platform/application filters, table search and status filters, name/status sorting for pipelines, date ranges, eight-row pagination, run selection, and a task-detail drawer. The task graph is a simple CSS-rendered sequence, not a general dependency graph engine.

There is no router, backend, persistence, SSO, real access control, or platform API integration. Navigation and filter state live in React and reset on reload. No server authorization should be inferred from frontend filtering.

GitHub Actions runs locked dependency installation, unit tests, TypeScript/production build, and Playwright Chromium smoke tests for pull requests and pushes to main. The smoke tests serve `dist/` through Vite preview on port 4173, inspect failed-run diagnostics and mobile navigation, and check initial rendering and runtime errors in the main flow. These are smoke tests, not exhaustive end-to-end coverage or a security audit. CI uploads the validated static build and browser reports; it does not deploy. Making the `Build and smoke test` check mandatory requires a GitHub branch rule or ruleset.

## Source map

| Location | Responsibility |
| --- | --- |
| `src/main.tsx` | Mounts `App` under React StrictMode and imports CSS. |
| `src/App.tsx` | Application state, navigation, filtering, metrics, tables, and view composition. |
| `StatusBadge`, `PlatformIcon`, `time` in `App.tsx` | Shared display helpers. |
| `ActivityChart` in `App.tsx` | Outcome counts grouped into rolling time buckets. |
| `RunDetail` in `App.tsx` | Run selector, history, task sequence, drawer focus and Escape handling. |
| `TaskDiagnostics` in `App.tsx` | Illustrative summary, logs, and output tabs. |
| `src/data.ts` | Domain types, pipeline fixtures, environment variants, run generator, duration formatter. |
| `src/styles.css` | Layout, color/status treatment, responsive breakpoints, and reduced-motion handling. |
| `tests/data.test.mjs` | Node tests for generated history and duration formatting. |
| `tests/e2e/smoke.spec.ts`, `playwright.config.ts` | Production-build browser smoke tests and isolated preview server configuration. |
| `.github/workflows/ci.yml` | PR/main CI checks and build/report artifacts. |
| `vite.config.ts`, `tsconfig.json` | Build setup and strict frontend TypeScript configuration. |

`App.tsx` is currently large. Extract cohesive modules when a feature benefits from separation; no `features/`, API client, or global state layer exists yet.

## Data contracts and sample behavior

`Pipeline` contains string `id`, `name`, `description`, `platform`, `application`, latest `status`, duration in seconds, and a human-readable `schedule`. `Run` contains string `id`, `pipelineId`, `status`, ISO timestamp `startedAt`, and duration in seconds.

Current status values are `Successful`, `Failed`, `Running`, and `Pending`. Platforms are `Databricks`, `Azure Data Factory`, and `Snowflake`. Environments are `Production`, `Staging`, and `Development`.

- Production has 12 sample pipelines; staging takes the first 8, development the first 5, with status overrides.
- `referenceTime` is captured when `src/data.ts` loads. `getRuns` generates 30 daily runs per pipeline relative to this timestamp.
- The latest generated run matches the pipeline's status and duration. Historical IDs use the pattern `<pipelineId>-<index>`.
- Pipeline schedule text is illustrative. Generated history does not simulate each schedule's actual frequency.
- IDs are only demo identifiers. The same fixture IDs occur in different environment variants; they are not sufficient production resource keys.
- Tasks and diagnostic text are generated inside the detail components, not persisted task records. All platforms use the same four illustrative tasks.
- Refresh waits briefly and updates the displayed synchronization time. It does not fetch data, advance run state, or change the history reference time.

## Filtering and metric semantics

Environment selects the fixture set. Platform and application filters define the shared scope for cards, activity chart, health chart, and tables.

The selected 1/7/30-day rolling window filters runs by start time. Successful and failed cards count executions in that window. Total pipelines counts the scoped inventory. Currently running counts scoped pipelines whose latest status is Running, independently of the historical date range. A real backend must count active executions separately because one pipeline may have multiple concurrent runs.

Success rate is `successful / (successful + failed)`. Running and pending are excluded. The prototype displays 0% when there are no completed runs; the target plan calls for an unavailable state, so address that distinction when refining metric states.

Search and status filters apply to tables, not the dashboard summary cards. Pipeline status filtering uses the latest status; run-history status filtering uses each execution's status. Pipeline search covers name, description, and application; history search covers pipeline name and run ID. Run history sorts newest first; pipeline sorting supports name or status alphabetically.

Changing environment clears filters and closes details. Filter/navigation changes reset pagination. Main run timestamps are explicitly UTC; the demo synchronization timestamp uses browser-local time. Preserve explicit timezone labeling when extending date displays.

## Design direction

Use a dark navigation sidebar, light content canvas, restrained blue primary controls, and semantic status colors. Keep operational information scannable: metrics, activity/health summaries, failure callout, then pipeline inventory. Retain the platform-neutral product identity and visible demo labeling until real integration exists.

Support keyboard navigation, meaningful control labels, readable text, and non-color status cues. Tables scroll horizontally on small screens; the document itself should not overflow. The detail drawer traps focus, restores focus on close, and supports Escape. The help dialog currently has simpler focus handling and needs attention in a full accessibility pass. No formal WCAG audit has been completed.

## Backend direction: planned, not implemented

The target architecture is platform collectors -> PostgreSQL -> FastAPI -> web UI, with corporate SSO for users. Only collectors hold platform credentials and call platform APIs. Refresh requests will be authorized and queued; stored data remains visible with freshness metadata while collection runs.

The Databricks MVP uses trusted team/client grants and ownership mappings, with `(workspace_id, job_id)` as the job key. A future cross-platform model needs provider, connection/workspace, and resource identifiers; do not extend the demo IDs into a global authorization model.

Server enforcement must cover lists, totals, filters, runs, tasks, diagnostics, refreshes, and direct links. Unmapped/conflicting jobs stay hidden. Diagnostics require explicit policy, redaction before persistence/delivery, safe text rendering, and no sensitive payloads in audit logs. Never expose collector credentials through frontend environment variables.

Consult [plan.md](plan.md) before backend work. SSO provider, deployment target, ownership semantics, workload, diagnostic policy, and retention remain open decisions. These require real integration inputs, not invented production defaults.

## Known gaps and next feature areas

- Extract reusable UI components and typed data selectors as complexity grows.
- Add bookmarkable routes, browser history behavior, and durable filter state.
- Add loading, stale, partial, unavailable, and network-error states when introducing asynchronous data.
- Replace illustrative tasks with typed task/run-attempt records and real dependency edges.
- Add canceled/skipped/unknown outcomes without losing original provider states.
- Add behavior tests for filters, pagination resets, metric denominators, and detail selection as those functions evolve.
- Implement SSO, server authorization, ingestion, persistence, and diagnostics policies before real data is exposed.

These are candidate improvements, not a mandate to implement them during unrelated tasks.
