import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryRequestStore } from "../../dist/server/src/store.js";

test("store filters requests by text and priority", () => {
  const store = InMemoryRequestStore.fromSeedFiles();
  const result = store.list({ q: "diacritics", priority: "High" });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "SR-1039");
});

test("store returns clones instead of exposing internal state", () => {
  const store = InMemoryRequestStore.fromSeedFiles();
  const first = store.get("SR-1042");
  assert.ok(first);
  first.title = "Changed outside the store";
  assert.notEqual(store.get("SR-1042")?.title, first.title);
});

test("store supports create, update, comment and reset", () => {
  const store = InMemoryRequestStore.fromSeedFiles();
  const originalCount = store.list().length;
  const created = store.create(
    {
      title: "Knowledge article link opens the wrong page",
      description: "The billing article card opens an account article after the latest navigation change.",
      category: "Documentation",
      priority: "Low",
      requester: { name: "Dana Ionescu", email: "dana.ionescu@example.test" },
      channel: "Portal",
      tags: ["knowledge"]
    },
    new Date("2026-08-30T12:00:00Z")
  );

  assert.equal(store.list().length, originalCount + 1);
  assert.equal(created.status, "Open");

  const updated = store.update(
    created.id,
    { status: "In Progress", assignee: "Jordan Lee" },
    new Date("2026-08-30T12:10:00Z")
  );
  assert.equal(updated?.status, "In Progress");
  assert.equal(updated?.assignee, "Jordan Lee");

  const commented = store.addComment(
    created.id,
    { author: "Jordan Lee", body: "Added to the documentation queue." },
    new Date("2026-08-30T12:15:00Z")
  );
  assert.equal(commented?.comments.length, 1);

  assert.equal(store.reset().length, originalCount);
  assert.equal(store.get(created.id), undefined);
});
