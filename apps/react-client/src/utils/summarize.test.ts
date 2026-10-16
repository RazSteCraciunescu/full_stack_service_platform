import { describe, expect, it } from "vitest";
import { countActive, groupByStatus } from "./summarize";
import type { ServiceRequest } from "../types";

const base = {
  id: "SR-1", title: "Example", description: "Example description", category: "Account",
  priority: "Medium", requester: { name: "Test User", email: "test@example.test" },
  assignee: null, channel: "Portal", createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z", dueAt: null, tags: [], satisfaction: null, comments: []
} satisfies Omit<ServiceRequest, "status">;

const items: ServiceRequest[] = [
  { ...base, id: "SR-1", status: "Open" },
  { ...base, id: "SR-2", status: "Resolved" },
  { ...base, id: "SR-3", status: "Open" }
];

describe("request summaries", () => {
  it("counts unresolved items", () => expect(countActive(items)).toBe(2));
  it("groups requests by status", () => expect(groupByStatus(items)).toEqual({ Open: 2, Resolved: 1 }));
});
