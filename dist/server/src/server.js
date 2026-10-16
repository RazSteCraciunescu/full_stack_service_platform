import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { InMemoryRequestStore } from "./store.js";
import { calculateMetrics } from "./metrics.js";
import { requestCategories, requestPriorities, requestStatuses } from "./types.js";
import { HttpError, readJson, sendJson, sendProblem, setCommonHeaders } from "./http-utils.js";
import { serveStatic } from "./static.js";
import { validateComment, validateCreateRequest, validateUpdateRequest } from "./validation.js";
const publicRoot = resolve(process.cwd(), "public");
const openApiPath = resolve(process.cwd(), "api", "openapi.json");
function matchRequestPath(pathname) {
    const match = pathname.match(/^\/api\/requests\/(SR-\d+)(\/comments)?$/i);
    if (!match)
        return undefined;
    return { id: match[1].toUpperCase(), comments: Boolean(match[2]) };
}
function parseEnum(value, allowed, field) {
    if (value === null || value === "")
        return undefined;
    if (allowed.includes(value))
        return value;
    throw new HttpError(400, "invalid_filter", `Unsupported ${field} filter.`, {
        field,
        allowed
    });
}
export function createAppServer(options = {}) {
    const store = options.store ?? InMemoryRequestStore.fromSeedFiles();
    return createServer(async (request, response) => {
        const requestId = randomUUID();
        setCommonHeaders(response, requestId);
        response.setHeader("access-control-allow-origin", "*");
        response.setHeader("access-control-allow-methods", "GET, POST, PATCH, OPTIONS");
        response.setHeader("access-control-allow-headers", "content-type, x-request-id");
        if (request.method === "OPTIONS") {
            response.writeHead(204);
            response.end();
            return;
        }
        const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
        const method = request.method ?? "GET";
        try {
            if (method === "GET" && url.pathname === "/api/health") {
                sendJson(response, 200, {
                    status: "ok",
                    service: "service-request-platform",
                    storage: "in-memory-demo",
                    time: new Date().toISOString(),
                    requestId
                });
                return;
            }
            if (method === "GET" && url.pathname === "/api/frameworks") {
                sendJson(response, 200, {
                    clients: [
                        { name: "React + TypeScript", role: "primary source client", path: "/", source: "apps/react-client" },
                        { name: "Vue 3", role: "analytics client", path: "/vue/", source: "apps/vue-dashboard" },
                        { name: "AngularJS 1.8", role: "legacy maintenance client", path: "/angularjs/", source: "apps/angularjs-admin" },
                        { name: "HTML + Sass + JavaScript", role: "fundamentals client", path: "/fundamentals/", source: "apps/fundamentals" }
                    ]
                });
                return;
            }
            if (method === "GET" && url.pathname === "/api/requests") {
                const status = parseEnum(url.searchParams.get("status"), requestStatuses, "status");
                const priority = parseEnum(url.searchParams.get("priority"), requestPriorities, "priority");
                const category = parseEnum(url.searchParams.get("category"), requestCategories, "category");
                const items = store.list({
                    q: url.searchParams.get("q") ?? undefined,
                    status: status,
                    priority: priority,
                    category: category,
                    assignee: url.searchParams.get("assignee") ?? undefined
                });
                sendJson(response, 200, { items, total: items.length });
                return;
            }
            if (method === "POST" && url.pathname === "/api/requests") {
                const validation = validateCreateRequest(await readJson(request));
                if (!validation.ok) {
                    sendProblem(response, 422, "validation_failed", "The request could not be created.", validation.errors);
                    return;
                }
                const created = store.create(validation.value);
                sendJson(response, 201, created, { location: `/api/requests/${created.id}` });
                return;
            }
            if (method === "GET" && url.pathname === "/api/metrics") {
                sendJson(response, 200, calculateMetrics(store.list(), new Date()));
                return;
            }
            if (method === "GET" && url.pathname === "/api/knowledge-articles") {
                sendJson(response, 200, { items: store.knowledgeArticles() });
                return;
            }
            if (method === "POST" && url.pathname === "/api/demo/reset") {
                sendJson(response, 200, { items: store.reset(), message: "Demo data restored." });
                return;
            }
            if (method === "GET" && url.pathname === "/api/openapi.json") {
                const { readFileSync } = await import("node:fs");
                response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
                response.end(readFileSync(openApiPath, "utf8"));
                return;
            }
            const requestPath = matchRequestPath(url.pathname);
            if (requestPath && method === "GET" && !requestPath.comments) {
                const item = store.get(requestPath.id);
                if (!item) {
                    sendProblem(response, 404, "not_found", `Request ${requestPath.id} was not found.`);
                    return;
                }
                sendJson(response, 200, item);
                return;
            }
            if (requestPath && method === "PATCH" && !requestPath.comments) {
                const validation = validateUpdateRequest(await readJson(request));
                if (!validation.ok) {
                    sendProblem(response, 422, "validation_failed", "The request could not be updated.", validation.errors);
                    return;
                }
                const item = store.update(requestPath.id, validation.value);
                if (!item) {
                    sendProblem(response, 404, "not_found", `Request ${requestPath.id} was not found.`);
                    return;
                }
                sendJson(response, 200, item);
                return;
            }
            if (requestPath && method === "POST" && requestPath.comments) {
                const validation = validateComment(await readJson(request));
                if (!validation.ok) {
                    sendProblem(response, 422, "validation_failed", "The comment could not be added.", validation.errors);
                    return;
                }
                const item = store.addComment(requestPath.id, validation.value);
                if (!item) {
                    sendProblem(response, 404, "not_found", `Request ${requestPath.id} was not found.`);
                    return;
                }
                sendJson(response, 201, item.comments[item.comments.length - 1]);
                return;
            }
            if ((method === "GET" || method === "HEAD") && serveStatic(request, response, publicRoot, url.pathname))
                return;
            sendProblem(response, 404, "not_found", "The requested route does not exist.");
        }
        catch (error) {
            if (error instanceof HttpError) {
                sendProblem(response, error.status, error.code, error.message, error.details);
                return;
            }
            console.error(`[${requestId}]`, error);
            sendProblem(response, 500, "internal_error", "An unexpected server error occurred.");
        }
    });
}
export function startServer(port = Number(process.env.PORT ?? 4174), host = process.env.HOST ?? "127.0.0.1") {
    const server = createAppServer();
    server.listen(port, host, () => {
        console.log(`Service Request Platform running at http://${host}:${port}`);
    });
    return server;
}
const currentEntry = process.argv[1] ? resolve(process.argv[1]) : "";
if (currentEntry && fileURLToPath(import.meta.url) === currentEntry)
    startServer();
//# sourceMappingURL=server.js.map