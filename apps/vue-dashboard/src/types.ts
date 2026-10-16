export interface RequestRow {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Backlog" | "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  assignee: string | null;
  updatedAt: string;
}

export interface Metrics {
  total: number;
  active: number;
  unassigned: number;
  resolved: number;
  atRisk: number;
  resolutionRate: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Array<{ category: string; count: number }>;
}
