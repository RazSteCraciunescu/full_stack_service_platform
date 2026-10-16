export const requestStatuses = ["Backlog", "Open", "In Progress", "Waiting", "Resolved", "Closed"] as const;
export const requestPriorities = ["Low", "Medium", "High", "Urgent"] as const;
export const requestChannels = ["Portal", "Email", "API"] as const;
export const requestCategories = [
  "Account",
  "Attachments",
  "Billing",
  "Data Export",
  "Documentation",
  "Feature Request",
  "Notifications",
  "Usability"
] as const;

export type RequestStatus = (typeof requestStatuses)[number];
export type RequestPriority = (typeof requestPriorities)[number];
export type RequestChannel = (typeof requestChannels)[number];
export type RequestCategory = (typeof requestCategories)[number];

export interface Requester {
  name: string;
  email: string;
}

export interface RequestComment {
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
  channel: RequestChannel;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  tags: string[];
  satisfaction: number | null;
  comments: RequestComment[];
}

export interface RequestFilters {
  q?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
  category?: RequestCategory;
  assignee?: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  requester: Requester;
  channel?: RequestChannel;
  tags?: string[];
}

export interface UpdateRequestInput {
  status?: RequestStatus;
  priority?: RequestPriority;
  assignee?: string | null;
  dueAt?: string | null;
  tags?: string[];
}

export interface CreateCommentInput {
  author: string;
  body: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: Record<string, string>;
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
