import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createAppServer } from "../../dist/server/src/server.js";

async function withServer(run) {
  const server = createAppServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test("health route includes security and tracing headers", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.match(response.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
  });
});

test("request lifecycle works through the HTTP contract", async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Knowledge article link opens the wrong page",
        description: "The billing article card opens an account article after the latest navigation change.",
        category: "Documentation",
        priority: "Low",
        requester: { name: "Dana Ionescu", email: "dana.ionescu@example.test" },
        tags: ["knowledge"]
      })
    });
    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.match(created.id, /^SR-\d+$/);
    assert.equal(createResponse.headers.get("location"), `/api/requests/${created.id}`);

    const updateResponse = await fetch(`${baseUrl}/api/requests/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "In Progress", assignee: "Jordan Lee" })
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json()).assignee, "Jordan Lee");

    const commentResponse = await fetch(`${baseUrl}/api/requests/${created.id}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ author: "Jordan Lee", body: "Reproduced and added to triage." })
    });
    assert.equal(commentResponse.status, 201);
    assert.equal((await commentResponse.json()).author, "Jordan Lee");

    const getResponse = await fetch(`${baseUrl}/api/requests/${created.id}`);
    const item = await getResponse.json();
    assert.equal(item.status, "In Progress");
    assert.equal(item.comments.length, 1);
  });
});

test("filters validate enum values instead of silently ignoring mistakes", async () => {
  await withServer(async (baseUrl) => {
    const valid = await fetch(`${baseUrl}/api/requests?priority=High`);
    const validBody = await valid.json();
    assert.equal(valid.status, 200);
    assert.ok(validBody.items.length > 0);
    assert.ok(validBody.items.every((item) => item.priority === "High"));

    const invalid = await fetch(`${baseUrl}/api/requests?priority=Critical`);
    const invalidBody = await invalid.json();
    assert.equal(invalid.status, 400);
    assert.equal(invalidBody.error.code, "invalid_filter");
    assert.deepEqual(invalidBody.error.details.allowed, ["Low", "Medium", "High", "Urgent"]);
  });
});

test("invalid JSON, validation failures and unknown routes are explicit", async () => {
  await withServer(async (baseUrl) => {
    const malformed = await fetch(`${baseUrl}/api/requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not-json"
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).error.code, "invalid_json");

    const invalid = await fetch(`${baseUrl}/api/requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "short" })
    });
    assert.equal(invalid.status, 422);
    assert.equal((await invalid.json()).error.code, "validation_failed");

    const missing = await fetch(`${baseUrl}/api/requests/SR-999999`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error.code, "not_found");
  });
});

test("static routes use safe paths and useful content types", async () => {
  await withServer(async (baseUrl) => {
    const home = await fetch(`${baseUrl}/`);
    assert.equal(home.status, 200);
    assert.match(home.headers.get("content-type") ?? "", /^text\/html/);
    assert.match(await home.text(), /Service Request Portal/);

    const manifest = await fetch(`${baseUrl}/manifest.webmanifest`);
    assert.equal(manifest.status, 200);
    assert.match(manifest.headers.get("content-type") ?? "", /^application\/manifest\+json/);

    const traversal = await fetch(`${baseUrl}/..%2Fpackage.json`);
    assert.equal(traversal.status, 404);
  });
});
