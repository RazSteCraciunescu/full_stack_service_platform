import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
};
export function serveStatic(request, response, publicRoot, pathname) {
    let decoded;
    try {
        decoded = decodeURIComponent(pathname);
    }
    catch {
        return false;
    }
    const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
    let candidate = resolve(publicRoot, normalize(relative));
    const normalizedRoot = resolve(publicRoot);
    if (candidate !== normalizedRoot && !candidate.startsWith(`${normalizedRoot}${sep}`))
        return false;
    if (existsSync(candidate) && statSync(candidate).isFile())
        return streamFile(request, response, candidate);
    if (!extname(candidate)) {
        candidate = join(candidate, "index.html");
        if (existsSync(candidate) && statSync(candidate).isFile())
            return streamFile(request, response, candidate);
    }
    return false;
}
function streamFile(request, response, path) {
    const stat = statSync(path);
    response.writeHead(200, {
        "content-type": mimeTypes[extname(path).toLowerCase()] ?? "application/octet-stream",
        "content-length": String(stat.size),
        "cache-control": extname(path) === ".html" ? "no-cache" : "public, max-age=3600"
    });
    if (request.method === "HEAD") {
        response.end();
        return true;
    }
    const stream = createReadStream(path);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
    return true;
}
//# sourceMappingURL=static.js.map