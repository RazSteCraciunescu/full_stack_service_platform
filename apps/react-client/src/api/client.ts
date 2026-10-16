import type {
  CreateRequestInput,
  RequestFilters,
  RequestPriority,
  RequestStatus,
  ServiceMetrics,
  ServiceRequest,
  Comment
} from "../types";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "/api";

interface ProblemEnvelope {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, string>;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as ProblemEnvelope;
    const fieldMessage = problem.error?.details ? Object.values(problem.error.details)[0] : undefined;
    throw new Error(fieldMessage ?? problem.error?.message ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  async listRequests(filters: RequestFilters = {}): Promise<ServiceRequest[]> {
    const params = new URLSearchParams();
    if (filters.q?.trim()) params.set("q", filters.q.trim());
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    const suffix = params.size ? `?${params.toString()}` : "";
    const result = await request<{ items: ServiceRequest[] }>(`/requests${suffix}`);
    return result.items;
  },

  getRequest(id: string): Promise<ServiceRequest> {
    return request<ServiceRequest>(`/requests/${encodeURIComponent(id)}`);
  },

  getMetrics(): Promise<ServiceMetrics> {
    return request<ServiceMetrics>("/metrics");
  },

  createRequest(input: CreateRequestInput): Promise<ServiceRequest> {
    return request<ServiceRequest>("/requests", { method: "POST", body: JSON.stringify(input) });
  },

  updateRequest(
    id: string,
    input: { status?: RequestStatus; priority?: RequestPriority; assignee?: string | null }
  ): Promise<ServiceRequest> {
    return request<ServiceRequest>(`/requests/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    });
  },

  addComment(id: string, input: { author: string; body: string }): Promise<Comment> {
    return request<Comment>(`/requests/${encodeURIComponent(id)}/comments`, {
      method: "POST",
      body: JSON.stringify(input)
    });
  }
};
