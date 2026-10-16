import test from "node:test";
import assert from "node:assert/strict";
import {
  validateComment,
  validateCreateRequest,
  validateUpdateRequest
} from "../../dist/server/src/validation.js";

test("create request validation normalizes a valid payload", () => {
  const result = validateCreateRequest({
    title: "  Export report is missing owner column  ",
    description: "The monthly export omits the owner column for resolved requests.",
    category: "Data Export",
    priority: "Medium",
    requester: {
      name: " Alex Morgan ",
      email: "ALEX.MORGAN@EXAMPLE.TEST"
    },
    tags: ["csv", "csv", " reporting "]
  });

  assert.equal(result.ok, true);
  assert.equal(result.value?.title, "Export report is missing owner column");
  assert.equal(result.value?.requester.email, "alex.morgan@example.test");
  assert.deepEqual(result.value?.tags, ["csv", "reporting"]);
});

test("create request validation reports independent field errors", () => {
  const result = validateCreateRequest({
    title: "short",
    description: "too short",
    category: "Unknown",
    priority: "Critical",
    requester: { name: "", email: "invalid" }
  });

  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    "category",
    "description",
    "priority",
    "requester.email",
    "requester.name",
    "title"
  ]);
});

test("update validation accepts nullable workflow fields", () => {
  const result = validateUpdateRequest({
    status: "Waiting",
    assignee: null,
    dueAt: null,
    tags: ["customer-reply"]
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    status: "Waiting",
    assignee: null,
    dueAt: null,
    tags: ["customer-reply"]
  });
});

test("comment validation rejects empty comments", () => {
  const result = validateComment({ author: "A", body: "" });
  assert.equal(result.ok, false);
  assert.match(result.errors.author, /between 2 and 80/);
  assert.match(result.errors.body, /between 2 and 1000/);
});
