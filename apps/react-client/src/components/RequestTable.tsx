import type { ServiceRequest } from "../types";

interface RequestTableProps {
  items: ServiceRequest[];
  selectedId: string | null;
  onSelect: (item: ServiceRequest) => void;
}

function dueLabel(dueAt: string | null) {
  if (!dueAt) return "Not scheduled";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(dueAt));
}

export function RequestTable({ items, selectedId, onSelect }: RequestTableProps) {
  if (!items.length) {
    return <div className="empty-state">No requests match the current filters.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table align-middle portal-table">
        <thead>
          <tr>
            <th scope="col">Request</th>
            <th scope="col">Status</th>
            <th scope="col">Priority</th>
            <th scope="col">Owner</th>
            <th scope="col">Due</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={item.id === selectedId ? "is-selected" : undefined}
              onClick={() => onSelect(item)}
              onKeyDown={(event) => event.key === "Enter" && onSelect(item)}
              tabIndex={0}
            >
              <td>
                <span className="request-id">{item.id}</span>
                <strong>{item.title}</strong>
                <small>{item.category}</small>
              </td>
              <td><span className={`status status-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></td>
              <td><span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span></td>
              <td>{item.assignee ?? <span className="text-secondary">Unassigned</span>}</td>
              <td>{dueLabel(item.dueAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
