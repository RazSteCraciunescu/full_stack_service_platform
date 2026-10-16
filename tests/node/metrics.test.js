import test from "node:test";
import assert from "node:assert/strict";
import { calculateMetrics } from "../../dist/server/src/metrics.js";

const common = {
  title: "Example request",
  description: "A description long enough for a realistic request.",
  category: "Account",
  requester: { name: "Test User", email: "test@example.test" },
  channel: "Portal",
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-01T00:00:00Z",
  tags: [],
  comments: []
};

test("metrics calculate active, overdue and satisfaction values", () => {
  const result = calculateMetrics(
    [
      { ...common, id: "SR-1", priority: "Urgent", status: "Open", assignee: null, dueAt: "2026-08-20T00:00:00Z", satisfaction: null },
      { ...common, id: "SR-2", priority: "Low", status: "Resolved", assignee: "Sam", dueAt: null, satisfaction: 5 },
      { ...common, id: "SR-3", priority: "Medium", status: "Closed", assignee: "Jo", dueAt: null, satisfaction: 4 }
    ],
    new Date("2026-08-30T00:00:00Z")
  );

  assert.equal(result.total, 3);
  assert.equal(result.active, 1);
  assert.equal(result.resolved, 2);
  assert.equal(result.unassigned, 1);
  assert.equal(result.atRisk, 1);
  assert.equal(result.resolutionRate, 66.7);
  assert.equal(result.averageSatisfaction, 4.5);
  assert.equal(result.byPriority.Urgent, 1);
});

test("metrics handle an empty collection", () => {
  const result = calculateMetrics([]);
  assert.equal(result.total, 0);
  assert.equal(result.resolutionRate, 0);
  assert.equal(result.averageSatisfaction, null);
});
