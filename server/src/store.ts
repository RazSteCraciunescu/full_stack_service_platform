import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type {
  CreateCommentInput,
  CreateRequestInput,
  RequestFilters,
  ServiceRequest,
  UpdateRequestInput
} from "./types.js";

const seedPath = resolve(process.cwd(), "data", "requests.json");
const knowledgePath = resolve(process.cwd(), "data", "knowledge-articles.json");

function clone<T>(value: T): T {
  return structuredClone(value);
}

function nextNumber(items: ServiceRequest[]): number {
  return items.reduce((highest, item) => {
    const value = Number.parseInt(item.id.replace(/^SR-/, ""), 10);
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 1000) + 1;
}

export class InMemoryRequestStore {
  #seed: ServiceRequest[];
  #items: ServiceRequest[];
  #nextId: number;

  constructor(seed: ServiceRequest[]) {
    this.#seed = clone(seed);
    this.#items = clone(seed);
    this.#nextId = nextNumber(seed);
  }

  static fromSeedFiles(): InMemoryRequestStore {
    return new InMemoryRequestStore(JSON.parse(readFileSync(seedPath, "utf8")) as ServiceRequest[]);
  }

  list(filters: RequestFilters = {}): ServiceRequest[] {
    const query = filters.q?.trim().toLowerCase();
    return clone(
      this.#items
        .filter((item) => !filters.status || item.status === filters.status)
        .filter((item) => !filters.priority || item.priority === filters.priority)
        .filter((item) => !filters.category || item.category === filters.category)
        .filter((item) => !filters.assignee || item.assignee?.toLowerCase() === filters.assignee.toLowerCase())
        .filter((item) => {
          if (!query) return true;
          const searchable = [
            item.id,
            item.title,
            item.description,
            item.category,
            item.requester.name,
            item.requester.email,
            item.assignee ?? "",
            ...item.tags
          ].join(" ").toLowerCase();
          return searchable.includes(query);
        })
        .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))
    );
  }

  get(id: string): ServiceRequest | undefined {
    const item = this.#items.find((request) => request.id.toLowerCase() === id.toLowerCase());
    return item ? clone(item) : undefined;
  }

  create(input: CreateRequestInput, now = new Date()): ServiceRequest {
    const stamp = now.toISOString();
    const item: ServiceRequest = {
      id: `SR-${this.#nextId++}`,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: "Open",
      requester: clone(input.requester),
      assignee: null,
      channel: input.channel ?? "Portal",
      createdAt: stamp,
      updatedAt: stamp,
      dueAt: null,
      tags: clone(input.tags ?? []),
      satisfaction: null,
      comments: []
    };
    this.#items.push(item);
    return clone(item);
  }

  update(id: string, input: UpdateRequestInput, now = new Date()): ServiceRequest | undefined {
    const index = this.#items.findIndex((request) => request.id.toLowerCase() === id.toLowerCase());
    if (index < 0) return undefined;
    const current = this.#items[index]!;
    const updated: ServiceRequest = {
      ...current,
      ...input,
      tags: input.tags ? clone(input.tags) : current.tags,
      updatedAt: now.toISOString()
    };
    this.#items[index] = updated;
    return clone(updated);
  }

  addComment(id: string, input: CreateCommentInput, now = new Date()): ServiceRequest | undefined {
    const index = this.#items.findIndex((request) => request.id.toLowerCase() === id.toLowerCase());
    if (index < 0) return undefined;
    const current = this.#items[index]!;
    const sequence = current.comments.length + 1;
    const updated: ServiceRequest = {
      ...current,
      comments: [
        ...current.comments,
        {
          id: `C-${current.id.replace("SR-", "")}-${sequence}-${randomUUID().slice(0, 4)}`,
          author: input.author,
          body: input.body,
          createdAt: now.toISOString()
        }
      ],
      updatedAt: now.toISOString()
    };
    this.#items[index] = updated;
    return clone(updated);
  }

  reset(): ServiceRequest[] {
    this.#items = clone(this.#seed);
    this.#nextId = nextNumber(this.#seed);
    return this.list();
  }

  knowledgeArticles(): unknown[] {
    return clone(JSON.parse(readFileSync(knowledgePath, "utf8")) as unknown[]);
  }
}
