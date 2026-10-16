import { useRef, useState, type FormEvent } from "react";
import { categories, priorities, type CreateRequestInput, type RequestCategory, type RequestPriority } from "../types";

interface NewRequestDialogProps {
  onCreate: (input: CreateRequestInput) => Promise<void>;
}

export function NewRequestDialog({ onCreate }: NewRequestDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await onCreate({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        category: String(form.get("category")) as RequestCategory,
        priority: String(form.get("priority")) as RequestPriority,
        requester: {
          name: String(form.get("requesterName") ?? ""),
          email: String(form.get("requesterEmail") ?? "")
        },
        tags: String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean)
      });
      event.currentTarget.reset();
      dialogRef.current?.close();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The request could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={() => dialogRef.current?.showModal()}>New request</button>
      <dialog className="request-dialog" ref={dialogRef} aria-labelledby="reactCreateDialogTitle">
        <form onSubmit={submit}>
          <div className="dialog-heading">
            <div><span className="eyebrow">Intake</span><h2 id="reactCreateDialogTitle">Create service request</h2></div>
            <button type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <label><span>Title</span><input name="title" minLength={6} maxLength={120} required /></label>
          <label><span>Description</span><textarea name="description" minLength={20} maxLength={1200} rows={4} required /></label>
          <div className="form-grid">
            <label><span>Category</span><select name="category">{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Priority</span><select name="priority">{priorities.map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <div className="form-grid">
            <label><span>Requester name</span><input name="requesterName" minLength={2} required /></label>
            <label><span>Requester email</span><input name="requesterEmail" type="email" required /></label>
          </div>
          <label><span>Tags</span><input name="tags" placeholder="billing, export" /></label>
          <div className="dialog-actions">
            <button className="btn btn-light" type="button" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button className="btn btn-primary" disabled={saving}>{saving ? "Creating…" : "Create request"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
