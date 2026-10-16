import { useEffect, useState, type FormEvent } from "react";
import { priorities, statuses, type RequestPriority, type RequestStatus, type ServiceRequest } from "../types";

interface RequestDetailsProps {
  item: ServiceRequest | null;
  onUpdate: (id: string, input: { status: RequestStatus; priority: RequestPriority; assignee: string | null }) => Promise<void>;
  onClose: () => void;
}

export function RequestDetails({ item, onUpdate, onClose }: RequestDetailsProps) {
  const [status, setStatus] = useState<RequestStatus>("Open");
  const [priority, setPriority] = useState<RequestPriority>("Medium");
  const [assignee, setAssignee] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setStatus(item.status);
    setPriority(item.priority);
    setAssignee(item.assignee ?? "");
  }, [item]);

  if (!item) {
    return (
      <aside className="details-panel details-empty" aria-label="Request details">
        <div>
          <span className="eyebrow">Request details</span>
          <h2>Select a request</h2>
          <p>Choose a row to review its description, history and workflow fields.</p>
        </div>
      </aside>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onUpdate(item!.id, { status, priority, assignee: assignee.trim() || null });
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="details-panel" aria-label={`Details for ${item.id}`}>
      <button className="details-close" type="button" aria-label="Close details" onClick={onClose}>×</button>
      <span className="eyebrow">{item.id} · {item.channel}</span>
      <h2>{item.title}</h2>
      <p className="details-description">{item.description}</p>

      <dl className="request-meta">
        <div><dt>Requester</dt><dd>{item.requester.name}<small>{item.requester.email}</small></dd></div>
        <div><dt>Category</dt><dd>{item.category}</dd></div>
        <div><dt>Tags</dt><dd>{item.tags.length ? item.tags.join(", ") : "None"}</dd></div>
      </dl>

      <form className="workflow-form" onSubmit={submit}>
        <label>
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as RequestStatus)}>
            {statuses.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value as RequestPriority)}>
            {priorities.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          <span>Assignee</span>
          <input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Unassigned" />
        </label>
        <button className="btn btn-dark" disabled={saving}>{saving ? "Saving…" : "Save workflow"}</button>
      </form>

      <section className="activity-list">
        <h3>Activity</h3>
        {item.comments.length ? item.comments.map((comment) => (
          <article key={comment.id}>
            <strong>{comment.author}</strong>
            <time>{new Date(comment.createdAt).toLocaleString()}</time>
            <p>{comment.body}</p>
          </article>
        )) : <p className="text-secondary">No comments yet.</p>}
      </section>
    </aside>
  );
}
