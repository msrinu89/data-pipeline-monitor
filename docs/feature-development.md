# Adding a feature

## Establish scope

Read [project-context.md](project-context.md), inspect the affected source, and identify whether the request changes the demo UI, domain behavior, or future backend integration. Keep product scope read-only unless the user explicitly changes it. Preserve unrelated working-tree changes.

Decide what a viewer should be able to do and how success, empty data, and unavailable data should appear. Follow existing behavior unless the feature intentionally changes it; document that change.

## Choose the implementation boundary

- A display-only change usually belongs in a component and its CSS.
- A new filter or metric should use typed selectors over a shared scoped dataset. Avoid independent hard-coded totals in cards and tables.
- A new sample field belongs in the types and fixtures in `src/data.ts`, then in its consuming UI.
- Repeated UI or complex feature logic should move into cohesive modules when useful. Suggested future locations include `src/components/`, `src/features/`, and `src/lib/`; create them when needed rather than scaffolding empty architecture.
- An asynchronous data feature should introduce an explicit data-access boundary with loading/error states. Keep demo fixtures available through a separate implementation of that boundary; do not mix provider API calls into components.

## Common extension paths

### Add a pipeline field or filter

1. Update the relevant TypeScript model and representative sample records.
2. Define whether the filter changes shared dashboard scope or only the table.
3. Apply it to the correct dataset before pagination and ensure page resets.
4. Check its interaction with environment changes, empty results, and detail selection.
5. Add a regression test when introducing nontrivial filtering or aggregation logic.

### Add a status

Update the status union, fixtures, badge/icon treatment, CSS, filters, charts, task handling, and denominator logic together. Preserve provider-native states in a future API model. Do not silently count canceled, skipped, or unknown runs as successes or failures.

### Add a platform

For a demo, update platform types, representative fixtures, display metadata/icons, filter options, and connection summaries. Platform names currently occur in both `src/data.ts` and `src/App.tsx`; consolidate metadata if the duplication grows.

For a real integration, first define the provider's job/run/task contract and adapter boundary. Configuration cards alone do not establish a connection. Keep credentials and provider calls on the collector/backend side. Validate platform-specific permissions and diagnostic capabilities rather than assuming parity with Databricks.

### Connect a backend

Use [plan.md](plan.md) as the target design. Define API contracts and stable resource keys before replacing fixtures. Preserve loading, empty, stale, partial, error, and unsupported-capability distinctions. Recheck access on every resource chain and ensure aggregates do not disclose unauthorized records. Frontend filters are presentation state, not authorization.

## Verify the change

For code changes, run `npm run build`, `npm test`, and `git diff --check`. Existing tests cover sample-history uniqueness, time bounds, latest-run consistency, ordering, and duration formatting. They do not prove browser interaction or security correctness.

Run `npm run test:e2e` after building for changes affecting the browser flows or CI. Install Chromium once with `npx playwright install chromium`. The smoke suite starts its own production preview server on port 4173; do not run another server on that port. CI installs Chromium and its Linux dependencies automatically. The browser suite covers the main diagnostics flow and basic mobile navigation/search; extend it for meaningful new user behavior.

For affected UI flows, check:

- Search, combined filters, reset behavior, and empty states.
- Pagination after narrowing results or changing environments.
- Card/chart/table consistency under platform, application, and date scope.
- Selecting latest and historical runs, selecting tasks, and diagnostic tabs.
- Drawer close, Escape, keyboard focus, and icon-only labels.
- Desktop and narrow mobile layouts, including table scrolling without page overflow.
- Continued demo labeling and honest simulated refresh behavior.

Keep checks proportional to the change. Add automated tests for meaningful new behavior, not screenshots of implementation details. If browser verification is unavailable, say so instead of claiming it passed.

## Keep the handoff accurate

Update README setup commands when they change. Update [project-context.md](project-context.md) when a feature changes architecture, model semantics, limitations, or implementation status. Update [plan.md](plan.md) only when the target requirements or milestones change; retain the distinction between target design and current code.

Summarize what changed, why, validation performed, and remaining limitations. When asked to create or update a PR, describe the final user-visible behavior and validation, and keep generated artifacts and local configuration out of the commit.
