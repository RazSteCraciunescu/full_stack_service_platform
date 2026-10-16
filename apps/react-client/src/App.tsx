import { useMemo, useState } from "react";
import { MetricCard } from "./components/MetricCard";
import { NewRequestDialog } from "./components/NewRequestDialog";
import { RequestDetails } from "./components/RequestDetails";
import { RequestTable } from "./components/RequestTable";
import { usePortalData } from "./hooks/usePortalData";
import { priorities, statuses, type RequestFilters, type ServiceRequest } from "./types";

export default function App() {
  const [filters, setFilters] = useState<RequestFilters>({ q: "", status: "", priority: "" });
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const stableFilters = useMemo(() => filters, [filters.priority, filters.q, filters.status]);
  const { requests, metrics, loading, error, reload, createRequest, updateRequest } = usePortalData(stableFilters);

  async function create(input: Parameters<typeof createRequest>[0]) {
    const item = await createRequest(input);
    setSelected(item);
  }

  async function update(id: string, input: Parameters<typeof updateRequest>[1]) {
    const item = await updateRequest(id, input);
    setSelected(item);
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <a className="brand" href="/" aria-label="Northstar Services home">
          <span>NS</span><strong>Northstar<br />Services</strong>
        </a>
        <nav aria-label="Primary navigation">
          <a className="active" href="#workspace">Workspace</a>
          <a href="#requests">Requests</a>
          <a href="#knowledge">Knowledge</a>
          <a href="/api-docs.html">API contract</a>
        </nav>
        <div className="sidebar-note">
          <span>Environment</span>
          <strong><i /> Local demo</strong>
          <small>Node API · in-memory data</small>
        </div>
      </aside>

      <main className="portal-main" id="workspace">
        <header className="page-header">
          <div>
            <span className="eyebrow">Operations workspace</span>
            <h1>Service request overview</h1>
            <p>Review incoming work, monitor service levels and keep ownership visible.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-light" type="button" onClick={() => void reload()}>Refresh</button>
            <NewRequestDialog onCreate={create} />
          </div>
        </header>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <section className="metrics-grid" aria-label="Service metrics">
          <MetricCard label="Active requests" value={metrics?.active ?? "—"} note="Open or in progress" />
          <MetricCard label="At risk" value={metrics?.atRisk ?? "—"} note="Past or near due date" />
          <MetricCard label="Unassigned" value={metrics?.unassigned ?? "—"} note="Needs an owner" />
          <MetricCard label="Resolution rate" value={metrics ? `${metrics.resolutionRate}%` : "—"} note="Resolved or closed" />
        </section>

        <section className="workspace-card" id="requests">
          <div className="workspace-toolbar">
            <div>
              <span className="eyebrow">Live queue</span>
              <h2>Requests</h2>
            </div>
            <div className="filters">
              <label className="search-field"><span className="visually-hidden">Search requests</span><input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Search title, ID or requester" /></label>
              <label><span className="visually-hidden">Status</span><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as RequestFilters["status"] })}><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label><span className="visually-hidden">Priority</span><select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value as RequestFilters["priority"] })}><option value="">All priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
            </div>
          </div>

          <div className="request-workspace">
            <section className="queue-panel" aria-busy={loading}>
              {loading ? <div className="loading-state">Loading requests…</div> : <RequestTable items={requests} selectedId={selected?.id ?? null} onSelect={setSelected} />}
            </section>
            <RequestDetails item={selected} onUpdate={update} onClose={() => setSelected(null)} />
          </div>
        </section>
      </main>
    </div>
  );
}
