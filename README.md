<img src="assets/icon.svg" width="64" height="64" alt="">

# Data Pipeline Monitor

A read-only portal for teams to monitor authorized data pipelines, job runs, and failures without direct access to the underlying platforms.

## Project status

**Interactive frontend prototype available.** The React UI uses sample data; no backend, SSO, authorization enforcement, or live platform connections are implemented yet.

The first integration will target Databricks. Azure Data Factory (ADF), Snowflake, and other data workflow platforms are planned for future phases.

## Why this project?

Teams need to know whether their ETL/ELT workflows ran successfully, what is still running, and where failures occurred. Giving every viewer direct access to the underlying platform can complicate access management.

Data Pipeline Monitor will provide a shared monitoring portal. Users will sign in with corporate SSO and see only the pipelines and environments assigned to their team. Authorized collectors will retrieve monitoring data from configured platforms, so viewers will not need workspace accounts or platform credentials.

## Planned capabilities

- Browse and search assigned pipelines and jobs across authorized environments.
- View latest execution status, active runs, duration, and success or failure metrics.
- Inspect available run history within a rolling 30-day window.
- Explore task dependencies and task-level execution status.
- Read approved failure summaries and diagnostics, subject to access and redaction policies.
- See when data was last synchronized, including stale or unavailable data indicators.
- Manage workspace connections, team access, and job ownership through restricted administration.

## Monitoring scope

The portal is read-only for pipeline operations. Starting, restarting, canceling, editing, or deleting jobs is outside the initial scope. Viewers can request a refresh of authorized monitoring data.

The Databricks MVP will cover configured development, staging, and production workspaces. Future integrations will adapt each platform's execution metadata to the shared monitoring experience; platform-specific capabilities may differ.

## How it will work

1. Platform administrators configure connections and map jobs to authorized teams.
2. Workspace collectors use scoped service identities to synchronize permitted metadata and diagnostics into PostgreSQL.
3. A portal API enforces user and team access before returning stored monitoring data.
4. A web interface displays jobs, runs, tasks, and synchronization freshness.

Platform credentials will remain within the collector runtime. Diagnostic collection and display will follow explicit policies, with redaction applied before storage or delivery.

## Proposed technology

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, React Flow, and TanStack Table.
- **Backend:** Python and FastAPI, with platform-specific integration adapters.
- **Storage:** PostgreSQL with Alembic migrations.
- **Identity:** Corporate SSO with server-side authorization.
- **Initial integration:** Databricks SDK for Python.

## Roadmap

1. Validate Databricks permissions, API coverage, workload, and diagnostic policies.
2. Build a two-team prototype and verify access isolation.
3. Deliver the Databricks MVP with SSO, background collection, run drill-down, and administration.
4. Complete security, reliability, and operational readiness checks.
5. Extend the integration model to Azure Data Factory, Snowflake, and other platforms.

## Development plan

See the [Databricks MVP plan](docs/plan.md) for detailed scope, architecture, security requirements, acceptance criteria, and open decisions.

## Run the frontend locally

Requires Node.js 22.12 or newer and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

```bash
npm run build      # Type-check and build production assets into dist/
npm run preview    # Serve the production build locally
npm test           # Check sample-data consistency
npm run format     # Format frontend source
```

The prototype includes an overview with metrics and activity charts, searchable pipeline listings, platform/application/status filters, three sample environments, date ranges, pagination, run history, task dependencies, sample diagnostics, and simulated connection summaries. Refresh updates the demo synchronization timestamp; it does not contact a platform or advance running jobs.

### Frontend structure

- `src/App.tsx`: dashboard, navigation, filtering, run detail drawer, and task diagnostics.
- `src/data.ts`: typed sample pipelines and generated 30-day run histories, anchored to page-load time.
- `src/styles.css`: responsive layouts and visual styling.

Metrics derive from the same sample runs used in the history views. Task graphs and diagnostic text are illustrative. View state resets on reload; bookmarkable run URLs, real authentication, platform permissions, and backend integration remain future work. Google Fonts is optional; system sans-serif fonts are used when it is unavailable.
