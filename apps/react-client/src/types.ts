export const statuses = ["Backlog", "Open", "In Progress", "Waiting", "Resolved", "Closed"] as const;
export const priorities = ["Low", "Medium", "High", "Urgent"] as const;
export const categories = [
  "Account",
  "Attachments",
  "Billing",
  "Data Export",
  "Documentation",
  "Feature Request",
  "Notifications",
  "Usability"
] as const;

export type RequestStatus = (typeof statuses)[number];
export type RequestPriority = (typeof priorities)[number];
export type RequestCategory = (typeof categories)[number];

export interface Requester {
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  requester: Requester;
  assignee: string | null;
  channel: "Portal" | "Email" | "API";
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  tags: string[];
  satisfaction: number | null;
  comments: Comment[];
}

export interface ServiceMetrics {
  total: number;
  active: number;
  unassigned: number;
  resolved: number;
  atRisk: number;
  resolutionRate: number;
  averageSatisfaction: number | null;
  byStatus: Record<RequestStatus, number>;
  byPriority: Record<RequestPriority, number>;
  byCategory: Array<{ category: string; count: number }>;
}

export interface RequestFilters {
  q?: string;
  status?: RequestStatus | "";
  priority?: RequestPriority | "";
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  requester: Requester;
  tags: string[];
}
