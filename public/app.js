const API = "/api";

const state = {
  requests: [],
  visibleRequests: [],
  metrics: null,
  knowledge: [],
  selectedId: null,
  filters: { q: "", status: "", priority: "", category: "" },
  activeView: "dashboard"
};

const elements = {
  apiStatus: document.querySelector("#apiStatus"),
  currentDate: document.querySelector("#currentDate"),
  metricGrid: document.querySelector("#metricGrid"),
  dashboardQueue: document.querySelector("#dashboardQueue"),
  categoryChart: document.querySelector("#categoryChart"),
  navRequestCount: document.querySelector("#navRequestCount"),
  globalSearch: document.querySelector("#globalSearch"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  requestResultCount: document.querySelector("#requestResultCount"),
  requestTableBody: document.querySelector("#requestTableBody"),
  requestEmptyState: document.querySelector("#requestEmptyState"),
  knowledgeGrid: document.querySelector("#knowledgeGrid"),
  detailPanel: document.querySelector("#detailPanel"),
  detailBackdrop: document.querySelector("#detailBackdrop"),
  detailId: document.querySelector("#detailId"),
  detailTitle: document.querySelector("#detailTitle"),
  detailContent: document.querySelector("#detailContent"),
  createDialog: document.querySelector("#createDialog"),
  createRequestForm: document.querySelector("#createRequestForm"),
  formErrorSummary: document.querySelector("#formErrorSummary"),
  sidebar: document.querySelector(".sidebar"),
  mobileMenuButton: document.querySelector("#mobileMenuButton"),
  toastRegion: document.querySelector("#toastRegion")
};

const icons = {
  active: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5h10V6H7v2Zm0 5h10v-2H7v2Zm0 5h6v-2H7v2Z"/></svg>',
  risk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"/></svg>',
  resolved: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.4-3.7-3.7 1.4-1.4 2.3 2.3 4.7-4.7 1.4 1.4-6.1 6.1Z"/></svg>',
  satisfaction: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.4 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5-4.7-4.6 6.5-.9L12 2.4Z"/></svg>'
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(value) {
  return String(value).toLowerCase().replaceAll(" ", "-");
}

function initials(value) {
  return String(value || "Unassigned")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value, options = {}) {
  if (!value) return "Not set";
  const { includeYear = false, ...dateOptions } = options;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: includeYear ? "numeric" : undefined,
    ...dateOptions
  }).format(new Date(value));
}

function formatRelative(value) {
  const difference = Date.now() - Date.parse(value);
  const minutes = Math.max(1, Math.round(difference / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `Request failed with status ${response.status}.`);
    error.details = payload?.error?.details;
    throw error;
  }
  return payload;
}

async function loadWorkspace() {
  setApiStatus("Connecting…", false);
  try {
    const [health, requestResult, metrics, knowledge] = await Promise.all([
      api("/health"),
      api("/requests"),
      api("/metrics"),
      api("/knowledge-articles")
    ]);
    state.requests = requestResult.items;
    state.metrics = metrics;
    state.knowledge = knowledge.items;
    const connectionLabel = window.location.port ? `Connected on port ${window.location.port}` : "Connected to local API";
    setApiStatus(health.status === "ok" ? connectionLabel : "Unexpected response", health.status === "ok");
    applyFilters();
    renderMetrics();
    renderDashboardQueue();
    renderCategoryChart();
    renderKnowledge();
    elements.navRequestCount.textContent = String(metrics.active);
  } catch (error) {
    setApiStatus("API unavailable", false);
    showToast(error.message, true);
    elements.metricGrid.innerHTML = '<article class="metric-card"><strong>Unable to load data</strong><span class="metric-caption">Start the local Node server, then refresh this page.</span></article>';
  }
}

function setApiStatus(text, connected) {
  elements.apiStatus.textContent = text;
  document.querySelector(".live-dot")?.classList.toggle("is-offline", !connected);
}

function renderMetrics() {
  const m = state.metrics;
  if (!m) return;
  const cards = [
    { label: "Active requests", value: m.active, caption: `${m.unassigned} currently unassigned`, icon: icons.active, color: "#6b5ce7", tint: "#eeeafd" },
    { label: "SLA at risk", value: m.atRisk, caption: m.atRisk === 1 ? "1 request needs attention" : `${m.atRisk} requests need attention`, icon: icons.risk, color: "#c98216", tint: "#fff3d9" },
    { label: "Resolved", value: m.resolved, caption: `${m.resolutionRate}% of the sample queue`, icon: icons.resolved, color: "#1ca58c", tint: "#e2f5ef" },
    { label: "Satisfaction", value: m.averageSatisfaction ? `${m.averageSatisfaction}/5` : "—", caption: "Average of completed ratings", icon: icons.satisfaction, color: "#3478c8", tint: "#e8f2fc" }
  ];
  elements.metricGrid.innerHTML = cards.map((card) => `
    <article class="metric-card" style="--metric-color:${card.color};--metric-tint:${card.tint}">
      <span class="metric-label">${escapeHtml(card.label)}<span class="metric-icon">${card.icon}</span></span>
      <strong class="metric-value">${escapeHtml(card.value)}</strong>
      <span class="metric-caption">${escapeHtml(card.caption)}</span>
    </article>
  `).join("");
}

function renderDashboardQueue() {
  const items = state.requests.slice(0, 6);
  elements.dashboardQueue.innerHTML = items.map((item) => `
    <button class="queue-item" type="button" data-open-request="${item.id}">
      <span>
        <span class="queue-title-row"><span class="queue-id">${item.id}</span><span class="queue-title">${escapeHtml(item.title)}</span></span>
        <span class="queue-meta"><span>${escapeHtml(item.category)}</span><span class="status-badge status-${slug(item.status)}">${escapeHtml(item.status)}</span></span>
      </span>
      <span class="queue-owner"><span class="mini-avatar">${initials(item.assignee)}</span>${escapeHtml(item.assignee || "Unassigned")}</span>
    </button>
  `).join("");
}

function renderCategoryChart() {
  const rows = state.metrics?.byCategory ?? [];
  const highest = Math.max(1, ...rows.map((row) => row.count));
  elements.categoryChart.innerHTML = rows.slice(0, 6).map((row) => `
    <div class="bar-row">
      <span class="bar-label" title="${escapeHtml(row.category)}">${escapeHtml(row.category)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.round((row.count / highest) * 100)}%"></span></span>
      <strong class="bar-value">${row.count}</strong>
    </div>
  `).join("");
  const top = rows[0];
  if (top) {
    document.querySelector("#workloadNoteTitle").textContent = `${top.category} leads the sample`;
    document.querySelector("#workloadNoteText").textContent = `${top.count} request${top.count === 1 ? "" : "s"} currently use this category.`;
  }
}

function applyFilters() {
  const query = state.filters.q.trim().toLowerCase();
  state.visibleRequests = state.requests.filter((item) => {
    const searchable = [item.id, item.title, item.description, item.requester.name, item.requester.email, item.assignee || "", ...item.tags].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) &&
      (!state.filters.status || item.status === state.filters.status) &&
      (!state.filters.priority || item.priority === state.filters.priority) &&
      (!state.filters.category || item.category === state.filters.category);
  });
  renderRequestTable();
}

function renderRequestTable() {
  elements.requestResultCount.textContent = `${state.visibleRequests.length} request${state.visibleRequests.length === 1 ? "" : "s"}`;
  elements.requestEmptyState.hidden = state.visibleRequests.length > 0;
  elements.requestTableBody.innerHTML = state.visibleRequests.map((item) => `
    <tr>
      <td>
        <div class="request-cell">
          <button class="request-title-button" type="button" data-open-request="${item.id}">${escapeHtml(item.title)}</button>
          <span>${item.id} · ${escapeHtml(item.category)} · ${escapeHtml(item.requester.name)}</span>
        </div>
      </td>
      <td><span class="status-badge status-${slug(item.status)}">${escapeHtml(item.status)}</span></td>
      <td><span class="priority-badge priority-${slug(item.priority)}">${escapeHtml(item.priority)}</span></td>
      <td><span class="assignee-cell"><span class="mini-avatar">${initials(item.assignee)}</span>${escapeHtml(item.assignee || "Unassigned")}</span></td>
      <td><time datetime="${item.updatedAt}" title="${formatDate(item.updatedAt, { includeYear: true })}">${formatRelative(item.updatedAt)}</time></td>
      <td><button class="open-row-button" type="button" data-open-request="${item.id}" aria-label="Open ${item.id}">›</button></td>
    </tr>
  `).join("");
}

function renderKnowledge() {
  elements.knowledgeGrid.innerHTML = state.knowledge.map((article) => `
    <article class="knowledge-card">
      <div class="knowledge-meta"><span>${escapeHtml(article.category)}</span><span>${article.readingMinutes} min read</span></div>
      <h2>${escapeHtml(article.title)}</h2>
      <p>${escapeHtml(article.summary)}</p>
      <a href="#${article.id}" data-knowledge-id="${article.id}">Read article <span aria-hidden="true">→</span></a>
    </article>
  `).join("");
}

function showView(name) {
  state.activeView = name;
  document.querySelectorAll(".view").forEach((view) => { view.hidden = view.id !== `${name}View`; });
  document.querySelectorAll(".nav-item").forEach((button) => {
    const active = button.dataset.viewTarget === name;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  elements.sidebar.classList.remove("is-open");
  elements.mobileMenuButton.setAttribute("aria-expanded", "false");
  document.querySelector(`#${name}View h1`)?.focus?.({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openDetails(id) {
  const item = state.requests.find((request) => request.id === id);
  if (!item) return;
  state.selectedId = id;
  elements.detailId.textContent = `${item.id} · ${item.category}`;
  elements.detailTitle.textContent = item.title;
  const comments = item.comments.length ? item.comments.map((comment) => `
    <article class="comment">
      <div class="comment-head"><strong>${escapeHtml(comment.author)}</strong><time datetime="${comment.createdAt}">${formatDate(comment.createdAt, { hour: "2-digit", minute: "2-digit" })}</time></div>
      <p>${escapeHtml(comment.body)}</p>
    </article>
  `).join("") : '<p class="detail-summary">No comments yet.</p>';

  elements.detailContent.innerHTML = `
    <p class="detail-summary">${escapeHtml(item.description)}</p>
    <div class="detail-badges">
      <span class="status-badge status-${slug(item.status)}">${escapeHtml(item.status)}</span>
      <span class="priority-badge priority-${slug(item.priority)}">${escapeHtml(item.priority)} priority</span>
      ${item.tags.map((tag) => `<span class="status-badge status-backlog">#${escapeHtml(tag)}</span>`).join("")}
    </div>
    <section class="detail-section">
      <h3>Request information</h3>
      <div class="detail-grid">
        <div class="detail-field"><span>Requester</span><strong>${escapeHtml(item.requester.name)}</strong></div>
        <div class="detail-field"><span>Email</span><strong>${escapeHtml(item.requester.email)}</strong></div>
        <div class="detail-field"><span>Channel</span><strong>${escapeHtml(item.channel)}</strong></div>
        <div class="detail-field"><span>Due date</span><strong>${formatDate(item.dueAt, { includeYear: true })}</strong></div>
        <div class="detail-field"><span>Created</span><strong>${formatDate(item.createdAt, { includeYear: true })}</strong></div>
        <div class="detail-field"><span>Updated</span><strong>${formatDate(item.updatedAt, { includeYear: true })}</strong></div>
      </div>
    </section>
    <section class="detail-section">
      <h3>Workflow</h3>
      <form id="workflowForm" class="inline-form">
        <div class="inline-form-row">
          <label class="field"><span>Status</span><select name="status">${["Backlog","Open","In Progress","Waiting","Resolved","Closed"].map((status) => `<option${status === item.status ? " selected" : ""}>${status}</option>`).join("")}</select></label>
          <label class="field"><span>Priority</span><select name="priority">${["Low","Medium","High","Urgent"].map((priority) => `<option${priority === item.priority ? " selected" : ""}>${priority}</option>`).join("")}</select></label>
        </div>
        <label class="field"><span>Assignee</span><input name="assignee" value="${escapeHtml(item.assignee || "")}" placeholder="Leave blank to unassign" /></label>
        <button class="secondary-button" type="submit">Save workflow changes</button>
      </form>
    </section>
    <section class="detail-section">
      <h3>Conversation (${item.comments.length})</h3>
      <div>${comments}</div>
      <form id="commentForm" class="inline-form">
        <label class="field"><span>Add a comment</span><textarea name="body" rows="3" required placeholder="Share an update"></textarea></label>
        <input type="hidden" name="author" value="Demo User" />
        <button class="secondary-button" type="submit">Post comment</button>
      </form>
    </section>
  `;
  elements.detailPanel.classList.add("is-open");
  elements.detailPanel.setAttribute("aria-hidden", "false");
  elements.detailBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#workflowForm")?.addEventListener("submit", saveWorkflow);
  document.querySelector("#commentForm")?.addEventListener("submit", addComment);
  document.querySelector("#closeDetailButton")?.focus();
}

function closeDetails() {
  elements.detailPanel.classList.remove("is-open");
  elements.detailPanel.setAttribute("aria-hidden", "true");
  elements.detailBackdrop.hidden = true;
  document.body.style.overflow = "";
  state.selectedId = null;
}

async function saveWorkflow(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const updated = await api(`/requests/${state.selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: form.get("status"), priority: form.get("priority"), assignee: form.get("assignee") || null })
    });
    replaceRequest(updated);
    showToast(`${updated.id} updated.`);
    openDetails(updated.id);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function addComment(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await api(`/requests/${state.selectedId}/comments`, {
      method: "POST",
      body: JSON.stringify({ author: form.get("author"), body: form.get("body") })
    });
    const updated = await api(`/requests/${state.selectedId}`);
    replaceRequest(updated);
    showToast("Comment added.");
    openDetails(updated.id);
  } catch (error) {
    showToast(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function replaceRequest(updated) {
  const index = state.requests.findIndex((item) => item.id === updated.id);
  if (index >= 0) state.requests[index] = updated;
  applyFilters();
  renderDashboardQueue();
  refreshMetrics();
}

async function refreshMetrics() {
  state.metrics = await api("/metrics");
  renderMetrics();
  renderCategoryChart();
  elements.navRequestCount.textContent = String(state.metrics.active);
}

function openCreateDialog() {
  elements.formErrorSummary.hidden = true;
  elements.createDialog.showModal();
  elements.createRequestForm.elements.title.focus();
}

function closeCreateDialog() {
  elements.createDialog.close();
  elements.createRequestForm.reset();
  elements.createRequestForm.elements.requesterName.value = "Demo User";
  elements.createRequestForm.elements.requesterEmail.value = "demo.user@example.test";
}

async function createRequest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  clearFormErrors(form);
  const payload = {
    title: data.get("title"),
    description: data.get("description"),
    category: data.get("category"),
    priority: data.get("priority"),
    requester: { name: data.get("requesterName"), email: data.get("requesterEmail") },
    channel: "Portal",
    tags: String(data.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean)
  };
  try {
    const created = await api("/requests", { method: "POST", body: JSON.stringify(payload) });
    state.requests.unshift(created);
    applyFilters();
    renderDashboardQueue();
    await refreshMetrics();
    closeCreateDialog();
    showToast(`${created.id} created.`);
    showView("requests");
    openDetails(created.id);
  } catch (error) {
    showFormErrors(form, error.details || { form: error.message });
  } finally {
    submit.disabled = false;
  }
}

function clearFormErrors(form) {
  form.querySelectorAll("[aria-invalid=true]").forEach((input) => input.removeAttribute("aria-invalid"));
  elements.formErrorSummary.hidden = true;
  elements.formErrorSummary.innerHTML = "";
}

function showFormErrors(form, errors) {
  const fieldMap = { title: "title", description: "description", category: "category", priority: "priority", "requester.name": "requesterName", "requester.email": "requesterEmail", tags: "tags" };
  const messages = [];
  for (const [field, message] of Object.entries(errors)) {
    messages.push(message);
    const input = form.elements[fieldMap[field] || field];
    if (input) input.setAttribute("aria-invalid", "true");
  }
  elements.formErrorSummary.innerHTML = `<strong>Please review the form:</strong><ul>${messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>`;
  elements.formErrorSummary.hidden = false;
  form.querySelector("[aria-invalid=true]")?.focus();
}

async function resetDemo() {
  if (!window.confirm("Restore the original sample requests? Any changes made during this run will be removed.")) return;
  try {
    const result = await api("/demo/reset", { method: "POST", body: "{}" });
    state.requests = result.items;
    applyFilters();
    renderDashboardQueue();
    await refreshMetrics();
    closeDetails();
    showToast(result.message);
  } catch (error) {
    showToast(error.message, true);
  }
}

function exportCsv() {
  if (!state.visibleRequests.length) {
    showToast("There are no visible requests to export.", true);
    return;
  }
  const headers = ["ID", "Title", "Category", "Priority", "Status", "Requester", "Assignee", "Updated"];
  const rows = state.visibleRequests.map((item) => [item.id, item.title, item.category, item.priority, item.status, item.requester.name, item.assignee || "", item.updatedAt]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "service-requests.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`${state.visibleRequests.length} requests exported.`);
}

function showToast(message, error = false) {
  const toast = document.createElement("div");
  toast.className = `toast${error ? " is-error" : ""}`;
  toast.textContent = message;
  elements.toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view-target]");
    if (viewButton) showView(viewButton.dataset.viewTarget);
    const requestButton = event.target.closest("[data-open-request]");
    if (requestButton) openDetails(requestButton.dataset.openRequest);
    const knowledgeLink = event.target.closest("[data-knowledge-id]");
    if (knowledgeLink) {
      event.preventDefault();
      showToast(`${knowledgeLink.dataset.knowledgeId} is a display-only article in this sample.`);
    }
  });
  elements.globalSearch.addEventListener("input", (event) => {
    state.filters.q = event.target.value;
    applyFilters();
    if (state.filters.q.trim()) showView("requests");
  });
  elements.statusFilter.addEventListener("change", (event) => { state.filters.status = event.target.value; applyFilters(); });
  elements.priorityFilter.addEventListener("change", (event) => { state.filters.priority = event.target.value; applyFilters(); });
  elements.categoryFilter.addEventListener("change", (event) => { state.filters.category = event.target.value; applyFilters(); });
  elements.clearFiltersButton.addEventListener("click", () => {
    state.filters = { q: "", status: "", priority: "", category: "" };
    elements.globalSearch.value = "";
    elements.statusFilter.value = "";
    elements.priorityFilter.value = "";
    elements.categoryFilter.value = "";
    applyFilters();
  });
  document.querySelector("#openCreateButton").addEventListener("click", openCreateDialog);
  document.querySelector("#closeCreateButton").addEventListener("click", closeCreateDialog);
  document.querySelector("#cancelCreateButton").addEventListener("click", closeCreateDialog);
  elements.createRequestForm.addEventListener("submit", createRequest);
  document.querySelector("#resetButton").addEventListener("click", resetDemo);
  document.querySelector("#exportButton").addEventListener("click", exportCsv);
  document.querySelector("#closeDetailButton").addEventListener("click", closeDetails);
  elements.detailBackdrop.addEventListener("click", closeDetails);
  elements.mobileMenuButton.addEventListener("click", () => {
    const open = elements.sidebar.classList.toggle("is-open");
    elements.mobileMenuButton.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDetails();
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
      event.preventDefault();
      elements.globalSearch.focus();
    }
  });
}

elements.currentDate.textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
bindEvents();
loadWorkspace();
