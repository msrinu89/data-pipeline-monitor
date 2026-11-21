import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ChevronDown,
  Snowflake,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Database,
  Filter,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  Layers3,
  LoaderCircle,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import {
  duration,
  getPipelines,
  getRuns,
  referenceTime,
  type Environment,
  type Pipeline,
  type Run,
  type Status,
} from "./data";
const platformNames = ["Databricks", "Azure Data Factory", "Snowflake"];
function StatusBadge({ status }: { status: Status }) {
  const Icon =
    status === "Successful"
      ? CheckCircle2
      : status === "Failed"
        ? XCircle
        : status === "Running"
          ? LoaderCircle
          : Clock3;
  return (
    <span className={`status ${status.toLowerCase()}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}
function PlatformIcon({ platform }: { platform: string }) {
  return (
    <span
      className={`platform-icon ${platform === "Databricks" ? "bricks" : platform === "Snowflake" ? "snow" : "azure"}`}
    >
      {platform === "Databricks" ? (
        <Layers3 size={18} />
      ) : platform === "Snowflake" ? (
        <Snowflake size={18} />
      ) : (
        <Workflow size={18} />
      )}
    </span>
  );
}
function time(value: string) {
  return (
    new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }) + " UTC"
  );
}
export default function App() {
  const [view, setView] = useState("Overview");
  const [environment, setEnvironment] = useState<Environment>("Production");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("All platforms");
  const [status, setStatus] = useState("All statuses");
  const [application, setApplication] = useState("All applications");
  const [days, setDays] = useState(7);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"name" | "status">("name");
  const [detail, setDetail] = useState<{ pipeline: Pipeline; run: Run } | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [synced, setSynced] = useState(new Date());
  const [mobile, setMobile] = useState(false);
  const [help, setHelp] = useState(false);
  const allPipelines = useMemo(() => getPipelines(environment), [environment]);
  const allRuns = useMemo(() => getRuns(allPipelines), [allPipelines]);
  const scoped = allPipelines.filter(
    (p) =>
      (platform === "All platforms" || p.platform === platform) &&
      (application === "All applications" || p.application === application),
  );
  const runs = allRuns.filter(
    (r) =>
      scoped.some((p) => p.id === r.pipelineId) &&
      new Date(r.startedAt).getTime() >
        referenceTime.getTime() - days * 86400000,
  );
  const succeeded = runs.filter((r) => r.status === "Successful").length,
    failed = runs.filter((r) => r.status === "Failed").length,
    running = scoped.filter((p) => p.status === "Running").length;
  const filtered = scoped
    .filter(
      (p) =>
        (status === "All statuses" || p.status === status) &&
        `${p.name} ${p.description} ${p.application}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => a[sort].localeCompare(b[sort]));
  const visibleRuns = runs
    .filter(
      (r) =>
        (status === "All statuses" || r.status === status) &&
        `${r.id} ${allPipelines.find((p) => p.id === r.pipelineId)?.name}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const count = view === "Run history" ? visibleRuns.length : filtered.length;
  const pageCount = Math.max(1, Math.ceil(count / 8));
  useEffect(
    () => setPage(1),
    [query, platform, status, application, environment, view, days],
  );
  function navigate(next: string) {
    setView(next);
    setPage(1);
    setStatus("All statuses");
    setQuery("");
    setMobile(false);
  }
  function changeEnvironment(value: Environment) {
    setEnvironment(value);
    setQuery("");
    setPlatform("All platforms");
    setStatus("All statuses");
    setApplication("All applications");
    setDetail(null);
  }
  function open(p: Pipeline, r?: Run) {
    setDetail({
      pipeline: p,
      run: r ?? allRuns.find((item) => item.pipelineId === p.id)!,
    });
  }
  function refresh() {
    setRefreshing(true);
    window.setTimeout(() => {
      setSynced(new Date());
      setRefreshing(false);
    }, 700);
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Overview");
          }}
        >
          <span className="brand-symbol">
            <Workflow size={23} />
          </span>
          <span>
            pipeline<span className="brand-light">monitor</span>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">AC</span>
          <div>
            Acme Corporation<small>Enterprise workspace</small>
          </div>
          <ChevronDown className="workspace-chevrons" size={14} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {[
            { name: "Overview", icon: LayoutDashboard },
            { name: "Pipelines", icon: GitBranch },
            { name: "Run history", icon: Clock3 },
            { name: "Connections", icon: Database },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={view === name ? "nav-item active" : "nav-item"}
              onClick={() => navigate(name)}
            >
              <Icon size={19} />
              {name}
              {name === "Pipelines" && (
                <span className="nav-count">{allPipelines.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="read-only">
            <ShieldCheck size={20} />
            <div>
              Visibility without access
              <small>Your pipelines. Safely in view.</small>
            </div>
          </div>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <HelpCircle size={18} />
            Help & documentation
          </button>
          <div className="profile">
            <span className="avatar">JD</span>
            <div>
              Jamie Davis<small>Client viewer</small>
            </div>
            <span className="profile-tag">ACME</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-toggle icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{view}</strong>
          </div>
          <div className="header-actions">
            <span className="demo-label">DEMO WORKSPACE</span>
            <span className={`env-dot ${environment.toLowerCase()}`} />
            <select
              aria-label="Environment"
              value={environment}
              onChange={(e) => changeEnvironment(e.target.value as Environment)}
            >
              {["Production", "Staging", "Development"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <span className="header-divider" />
            <span className="avatar small">JD</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div className="eyebrow">YOUR DATA OPERATIONS, AT A GLANCE</div>
            <div className="heading-row">
              <div>
                <h1>{view === "Overview" ? "Pipeline overview" : view}</h1>
                <p>
                  {view === "Connections"
                    ? "A clear view of the platforms powering your data."
                    : view === "Run history"
                      ? "Every execution, with the context you need."
                      : "Keep your data moving. Know exactly where things stand."}
                </p>
              </div>
              <button
                className="button"
                onClick={refresh}
                disabled={refreshing}
              >
                <RefreshCw size={15} className={refreshing ? "spin" : ""} />
                {refreshing ? "Refreshing…" : "Refresh data"}
              </button>
            </div>
          </div>
          <div className="scope-bar">
            <div className="scope-filters">
              <select
                aria-label="Platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option>All platforms</option>
                {platformNames.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <span className="filter-divider" />
              <select
                aria-label="Application"
                value={application}
                onChange={(e) => setApplication(e.target.value)}
              >
                <option>All applications</option>
                {[...new Set(allPipelines.map((p) => p.application))].map(
                  (x) => (
                    <option key={x}>{x}</option>
                  ),
                )}
              </select>
            </div>
            <div className="scope-right">
              <span className="sync-text">
                <span className="live-dot" />
                {refreshing
                  ? "Synchronizing sample data…"
                  : `Synced at ${synced.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
              </span>
              <select
                aria-label="Date range"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
              >
                <option value={1}>Last 24 hours</option>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </div>
          </div>
          {view === "Overview" && (
            <>
              <section className="stats-grid" aria-label="Monitoring metrics">
                {[
                  {
                    label: "Total pipelines",
                    value: scoped.length,
                    icon: GitBranch,
                    caption: `Across ${new Set(scoped.map((p) => p.platform)).size} platforms`,
                    tone: "blue",
                  },
                  {
                    label: "Successful runs",
                    value: succeeded,
                    icon: CheckCircle2,
                    caption: "Completed in selected period",
                    tone: "green",
                  },
                  {
                    label: "Failed runs",
                    value: failed,
                    icon: XCircle,
                    caption: "In selected period",
                    tone: "red",
                  },
                  {
                    label: "Currently running",
                    value: running,
                    icon: Activity,
                    caption: "Active executions right now",
                    tone: "purple",
                  },
                ].map(({ label, value, icon: Icon, caption, tone }) => (
                  <article className="stat-card" key={label}>
                    <div className="stat-label">
                      {label}
                      <span className={`metric-icon ${tone}`}>
                        <Icon size={18} />
                      </span>
                    </div>
                    <strong>{value}</strong>
                    <span className="stat-caption">
                      {label === "Failed runs" && failed > 0 ? (
                        <span className="red-text">Requires attention</span>
                      ) : (
                        caption
                      )}
                      {label === "Failed runs" && failed > 0 && (
                        <span> · {days} days</span>
                      )}
                    </span>
                  </article>
                ))}
              </section>
              <div className="insights-grid">
                <section className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Run activity</h2>
                      <p>
                        Execution outcomes over the last {days}{" "}
                        {days === 1 ? "day" : "days"}
                      </p>
                    </div>
                    <span className="legend">
                      <span className="key green-key" />
                      Successful
                      <span className="key red-key" />
                      Failed
                    </span>
                  </div>
                  <ActivityChart runs={runs} days={days} />
                </section>
                <section className="panel health-panel">
                  <div className="panel-heading">
                    <h2>Pipeline health</h2>
                    <Activity size={17} />
                  </div>
                  <div className="health-content">
                    <div
                      className="health-ring"
                      style={
                        {
                          "--rate": `${succeeded + failed ? (succeeded / (succeeded + failed)) * 100 : 0}%`,
                        } as React.CSSProperties
                      }
                    >
                      <div>
                        <strong>
                          {succeeded + failed
                            ? (
                                (100 * succeeded) /
                                (succeeded + failed)
                              ).toFixed(1)
                            : "0"}
                          <span>%</span>
                        </strong>
                        <small>Success rate</small>
                      </div>
                    </div>
                    <div className="health-legend">
                      <div>
                        <span className="key green-key" />
                        Successful<strong>{succeeded}</strong>
                      </div>
                      <div>
                        <span className="key red-key" />
                        Failed<strong>{failed}</strong>
                      </div>
                      <div>
                        <span className="key blue-key" />
                        Running now<strong>{running}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="health-note">
                    <ShieldCheck size={15} />
                    Success rate includes completed runs only
                  </div>
                </section>
              </div>
              {scoped.some((p) => p.status === "Failed") && (
                <div className="attention-banner">
                  <span className="alert-icon">
                    <XCircle size={19} />
                  </span>
                  <div>
                    <strong>
                      {scoped.filter((p) => p.status === "Failed").length}{" "}
                      pipelines need a closer look
                    </strong>
                    <span>
                      A recent execution failed. Review task details to
                      understand what happened.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setStatus("Failed");
                      document
                        .getElementById("pipeline-table")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                  >
                    Review failures
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "Connections" ? (
            <section className="connections-grid">
              {platformNames
                .filter((p) => platform === "All platforms" || platform === p)
                .map((name) => (
                  <article className="panel connection" key={name}>
                    <PlatformIcon platform={name} />
                    <span className="sample-tag">Simulated connection</span>
                    <h2>{name}</h2>
                    <p>
                      {name === "Databricks"
                        ? "Lakeflow jobs & task execution"
                        : name === "Snowflake"
                          ? "Tasks & warehouse workflows"
                          : "Pipelines & activity runs"}
                    </p>
                    <dl>
                      <div>
                        <dt>Environment</dt>
                        <dd>{environment}</dd>
                      </div>
                      <div>
                        <dt>Mapped pipelines</dt>
                        <dd>
                          {scoped.filter((p) => p.platform === name).length}
                        </dd>
                      </div>
                      <div>
                        <dt>Access mode</dt>
                        <dd>Read-only</dd>
                      </div>
                    </dl>
                    <button
                      className="button"
                      onClick={() => {
                        setPlatform(name);
                        navigate("Pipelines");
                      }}
                    >
                      View pipelines
                      <ChevronRight size={15} />
                    </button>
                  </article>
                ))}
            </section>
          ) : (
            <section className="panel table-panel" id="pipeline-table">
              <div className="table-title">
                <h2>
                  {view === "Run history" ? "Run history" : "Pipelines"}
                  <span className="count-chip">{count}</span>
                </h2>
                <span className="table-subtitle">
                  {environment} ·{" "}
                  {view === "Run history"
                    ? `Last ${days} days`
                    : "Assigned to your team"}
                </span>
              </div>
              <div className="table-toolbar">
                <div className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search pipelines or runs"
                    placeholder={
                      view === "Run history"
                        ? "Search pipeline or run ID…"
                        : "Search pipelines…"
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      className="icon-button"
                      aria-label="Clear search"
                      onClick={() => setQuery("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="table-filters">
                  <Filter size={15} />
                  <select
                    aria-label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {[
                      "All statuses",
                      "Successful",
                      "Failed",
                      "Running",
                      "Pending",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  <span className="filter-divider" />
                  <SlidersHorizontal size={15} />
                  <select
                    aria-label="Sort pipelines"
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as "name" | "status")
                    }
                    disabled={view === "Run history"}
                  >
                    <option value="name">Name A–Z</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>
                        {view === "Run history"
                          ? "Pipeline / Run ID"
                          : "Pipeline name"}
                        <ArrowDown size={12} />
                      </th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>
                        {view === "Run history"
                          ? "Started (UTC)"
                          : "Last run (UTC)"}
                      </th>
                      <th>Duration</th>
                      <th>
                        {view === "Run history"
                          ? "Trigger"
                          : `Last ${days} runs`}
                      </th>
                      <th>
                        <span className="sr-only">Details</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {view === "Run history"
                      ? visibleRuns.slice((page - 1) * 8, page * 8).map((r) => {
                          const p = allPipelines.find(
                            (p) => p.id === r.pipelineId,
                          )!;
                          return (
                            <tr key={r.id}>
                              <td>
                                <button
                                  className="pipeline-name"
                                  onClick={() => open(p, r)}
                                >
                                  {p.name}
                                </button>
                                <span className="cell-secondary">
                                  Run #{r.id}
                                </span>
                              </td>
                              <td>
                                <span className="platform-cell">
                                  <PlatformIcon platform={p.platform} />
                                  {p.platform === "Azure Data Factory"
                                    ? "Azure Data Factory"
                                    : p.platform}
                                </span>
                              </td>
                              <td>
                                <StatusBadge status={r.status} />
                              </td>
                              <td className="muted nowrap">
                                {time(r.startedAt)}
                              </td>
                              <td className="mono">{duration(r.duration)}</td>
                              <td className="muted">Scheduled</td>
                              <td>
                                <button
                                  className="icon-button"
                                  aria-label={`Open run ${r.id}`}
                                  onClick={() => open(p, r)}
                                >
                                  <ChevronRight size={17} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      : filtered.slice((page - 1) * 8, page * 8).map((p) => {
                          const history = allRuns
                            .filter((r) => r.pipelineId === p.id)
                            .slice(0, days);
                          return (
                            <tr key={p.id}>
                              <td>
                                <button
                                  className="pipeline-name"
                                  onClick={() => open(p)}
                                >
                                  {p.name}
                                </button>
                                <span className="cell-secondary">
                                  {p.application}
                                </span>
                              </td>
                              <td>
                                <span className="platform-cell">
                                  <PlatformIcon platform={p.platform} />
                                  {p.platform}
                                </span>
                              </td>
                              <td>
                                <StatusBadge status={p.status} />
                              </td>
                              <td className="muted nowrap">
                                {time(history[0].startedAt)}
                              </td>
                              <td className="mono">{duration(p.duration)}</td>
                              <td>
                                <div
                                  className="mini-history"
                                  aria-label={`${history.length} recent runs`}
                                >
                                  {history
                                    .slice()
                                    .reverse()
                                    .map((r) => (
                                      <button
                                        key={r.id}
                                        className={r.status.toLowerCase()}
                                        title={`${r.status} · ${time(r.startedAt)}`}
                                        aria-label={`View ${p.name} run ${r.id}, ${r.status}`}
                                        onClick={() => open(p, r)}
                                      />
                                    ))}
                                </div>
                              </td>
                              <td>
                                <button
                                  className="icon-button"
                                  aria-label={`View ${p.name}`}
                                  onClick={() => open(p)}
                                >
                                  <ChevronRight size={17} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                {count === 0 && (
                  <div className="empty">
                    <Search size={28} />
                    <h3>
                      No matching{" "}
                      {view === "Run history" ? "runs" : "pipelines"}
                    </h3>
                    <p>Try a different search or clear your filters.</p>
                    <button
                      className="button"
                      onClick={() => {
                        setQuery("");
                        setStatus("All statuses");
                        setPlatform("All platforms");
                        setApplication("All applications");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
              <div className="pagination">
                <span>
                  {count
                    ? `Showing ${(page - 1) * 8 + 1}–${Math.min(page * 8, count)} of ${count}`
                    : "0 results"}{" "}
                  {view === "Run history" ? "runs" : "pipelines"}
                </span>
                <div>
                  <button
                    className="icon-button"
                    aria-label="Previous page"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span>
                    Page {page} of {pageCount}
                  </span>
                  <button
                    className="icon-button"
                    aria-label="Next page"
                    disabled={page >= pageCount}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          )}
          <footer>
            <span>
              <ShieldCheck size={14} />
              Read-only monitoring · Team-scoped visibility
            </span>
            <span>Sample data · No live platform connections</span>
          </footer>
        </main>
      </div>
      {detail && (
        <RunDetail
          pipeline={detail.pipeline}
          run={detail.run}
          runs={allRuns.filter((r) => r.pipelineId === detail.pipeline.id)}
          environment={environment}
          onSelect={(run) => setDetail({ ...detail, run })}
          onClose={() => setDetail(null)}
        />
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-label="About this demo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button close-help"
              onClick={() => setHelp(false)}
              aria-label="Close help"
            >
              <X />
            </button>
            <ShieldCheck size={28} />
            <h2>Your pipelines, safely in view.</h2>
            <p>
              This frontend demo uses generated sample records. No platform
              credentials, backend, or sign-in service is connected.
            </p>
            <p>
              Use the environment and platform filters to explore pipelines.
              Select a pipeline or a history bar to inspect its run and task
              diagnostics.
            </p>
            <p>
              Databricks is the planned first integration. Azure Data Factory
              and Snowflake illustrate future support. Access enforcement will
              be implemented in the backend.
            </p>
            <button
              className="button primary"
              autoFocus
              onClick={() => setHelp(false)}
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function ActivityChart({ runs, days }: { runs: Run[]; days: number }) {
  const buckets = Array.from({ length: days === 1 ? 12 : days }, (_, i) => {
    const span = days === 1 ? 7200000 : 86400000;
    const end =
      referenceTime.getTime() - (days === 1 ? 11 - i : days - 1 - i) * span;
    const list = runs.filter(
      (r) =>
        new Date(r.startedAt).getTime() > end - span &&
        new Date(r.startedAt).getTime() <= end,
    );
    return {
      label:
        days === 1
          ? new Date(end).toLocaleTimeString("en-US", {
              hour: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
          : new Date(end).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
      good: list.filter((r) => r.status === "Successful").length,
      bad: list.filter((r) => r.status === "Failed").length,
    };
  });
  const max = Math.max(4, ...buckets.map((b) => b.good + b.bad));
  return (
    <div className="chart">
      <div className="chart-axis">
        <span>{max}</span>
        <span>{Math.round(max / 2)}</span>
        <span>0</span>
      </div>
      <div className="chart-plot">
        <div className="grid-lines">
          <i />
          <i />
          <i />
        </div>
        <div className="chart-bars">
          {buckets.map((b, i) => (
            <div
              className="chart-column"
              key={i}
              title={`${b.label}: ${b.good} successful, ${b.bad} failed`}
            >
              <div
                className="bar-stack"
                style={{ height: `${((b.good + b.bad) / max) * 100}%` }}
              >
                <span className="bar-bad" style={{ flex: b.bad }} />
                <span className="bar-good" style={{ flex: b.good }} />
              </div>
              <span className="chart-label">
                {days <= 7 || i % 5 === 0 ? b.label : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function RunDetail({
  pipeline,
  run,
  runs,
  environment,
  onSelect,
  onClose,
}: {
  pipeline: Pipeline;
  run: Run;
  runs: Run[];
  environment: Environment;
  onSelect: (run: Run) => void;
  onClose: () => void;
}) {
  const [task, setTask] = useState(run.status === "Failed" ? 2 : 0);
  const [tab, setTab] = useState("Overview");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTask(run.status === "Failed" ? 2 : 0);
  }, [run.id, run.status]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = ref.current?.querySelectorAll<HTMLElement>(
          'button,select,[tabindex="0"]',
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handle);
      prev?.focus();
    };
  }, []);
  const taskNames = [
    "Extract source",
    "Validate records",
    "Transform data",
    "Publish dataset",
  ];
  const statuses: Status[] =
    run.status === "Failed"
      ? ["Successful", "Successful", "Failed", "Pending"]
      : run.status === "Running"
        ? ["Successful", "Successful", "Running", "Pending"]
        : run.status === "Pending"
          ? ["Pending", "Pending", "Pending", "Pending"]
          : ["Successful", "Successful", "Successful", "Successful"];
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        ref={ref}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-top">
          <span>
            <GitBranch size={17} />
            Pipeline details
          </span>
          <button
            className="icon-button"
            aria-label="Close pipeline details"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <div className="drawer-body">
          <div className="detail-platform">
            <PlatformIcon platform={pipeline.platform} />
            {pipeline.platform}
            <span className="count-chip">{environment}</span>
          </div>
          <h2 id="detail-title">{pipeline.name}</h2>
          <p className="muted">{pipeline.description}</p>
          <div className="detail-status">
            <StatusBadge status={run.status} />
            <span>Run #{run.id}</span>
          </div>
          <div className="detail-facts">
            <div>
              <small>Started (UTC)</small>
              <strong>{time(run.startedAt)}</strong>
            </div>
            <div>
              <small>Duration</small>
              <strong>{duration(run.duration)}</strong>
            </div>
            <div>
              <small>Application</small>
              <strong>{pipeline.application}</strong>
            </div>
            <div>
              <small>Schedule</small>
              <strong>{pipeline.schedule}</strong>
            </div>
          </div>
          <label className="run-select">
            Inspect execution
            <select
              value={run.id}
              onChange={(e) =>
                onSelect(runs.find((r) => r.id === e.target.value)!)
              }
            >
              {runs.map((r) => (
                <option value={r.id} key={r.id}>
                  #{r.id} · {time(r.startedAt)} · {r.status}
                </option>
              ))}
            </select>
          </label>
          <div className="detail-tabs">
            {["Overview", "Run history"].map((t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "Run history" ? (
            <div className="drawer-history">
              {runs.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onSelect(r);
                    setTab("Overview");
                  }}
                >
                  <span>
                    <strong>#{r.id}</strong>
                    <small>{time(r.startedAt)}</small>
                  </span>
                  <StatusBadge status={r.status} />
                  <span>{duration(r.duration)}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="task-heading">
                <h3>Task execution</h3>
                <span>4 tasks · Sample dependency graph</span>
              </div>
              <div className="task-graph">
                {taskNames.map((name, i) => (
                  <div className="task-node-wrap" key={name}>
                    <button
                      className={`task-node ${task === i ? "selected" : ""} ${statuses[i].toLowerCase()}`}
                      onClick={() => setTask(i)}
                    >
                      <span className="task-number">
                        {statuses[i] === "Successful" ? (
                          <Check size={14} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <strong>{name}</strong>
                      <small>{statuses[i]}</small>
                    </button>
                    {i < 3 && <span className="connector" />}
                  </div>
                ))}
              </div>
              <TaskDiagnostics
                name={taskNames[task]}
                status={statuses[task]}
                task={task}
              />
            </>
          )}
          <div className="detail-note">
            <ShieldCheck size={16} />
            Illustrative task metadata and sanitized diagnostics. No live data.
          </div>
        </div>
      </div>
    </div>
  );
}
function TaskDiagnostics({
  name,
  status,
  task,
}: {
  name: string;
  status: Status;
  task: number;
}) {
  const [tab, setTab] = useState("Summary");
  return (
    <section className="diagnostics">
      <div className="diagnostic-heading">
        <h3>{name}</h3>
        <StatusBadge status={status} />
      </div>
      <div className="diagnostic-tabs">
        {["Summary", "Logs", "Output"].map((t) => (
          <button
            className={t === tab ? "selected" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Summary" ? (
        <div className="diagnostic-body">
          {status === "Failed" ? (
            <>
              <div className="error-label">
                <XCircle size={16} />
                Schema validation failed
              </div>
              <p>
                The incoming dataset is missing the required{" "}
                <code>customer_id</code> column. Downstream publishing has not
                started.
              </p>
              <div className="error-code">
                SCHEMA_MISMATCH · transform_data
                <br />
                Expected: customer_id, event_time, amount
                <br />
                Received: event_time, amount
              </div>
            </>
          ) : (
            <>
              <strong>
                {status === "Successful"
                  ? "Task completed successfully"
                  : status === "Running"
                    ? "Task is currently executing"
                    : "Waiting for execution"}
              </strong>
              <p>
                {status === "Successful"
                  ? "All validation checks passed. The next task can proceed."
                  : status === "Running"
                    ? "Processing the sample dataset. This demo does not execute real jobs."
                    : "This task has not started. No diagnostic output is available."}
              </p>
            </>
          )}
        </div>
      ) : (
        <pre>
          {status === "Pending"
            ? "No output available. Task has not started."
            : tab === "Logs"
              ? `[INFO] Starting task: ${name}\n[INFO] Sample execution metadata loaded\n${status === "Failed" ? "[ERROR] Required field customer_id is missing\n[ERROR] Task terminated: SCHEMA_MISMATCH" : status === "Running" ? "[INFO] Processing partition 18 of 32…" : "[INFO] Validation passed\n[INFO] Task completed successfully"}`
              : status === "Successful"
                ? JSON.stringify(
                    {
                      status: "ok",
                      sample: true,
                      rows_processed: 12480 + task * 243,
                    },
                    null,
                    2,
                  )
                : "No final output available for this execution."}
        </pre>
      )}
    </section>
  );
}
