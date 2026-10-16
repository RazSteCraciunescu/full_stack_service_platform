export class HttpError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
export function sendJson(response, status, payload, headers = {}) {
    const body = JSON.stringify(payload, null, 2);
    response.writeHead(status, {
        "content-type": "application/json; charset=utf-8",
        "content-length": String(Buffer.byteLength(body)),
        ...headers
    });
    response.end(body);
}
export function sendProblem(response, status, code, message, details) {
    sendJson(response, status, { error: { code, message, ...(details ? { details } : {}) } });
}
export async function readJson(request, limitBytes = 1_000_000) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > limitBytes)
            throw new HttpError(413, "payload_too_large", "Request body exceeds the one-megabyte limit.");
        chunks.push(chunk);
    }
    if (chunks.length === 0)
        return {};
    const text = Buffer.concat(chunks).toString("utf8");
    try {
        return JSON.parse(text);
    }
    catch {
        throw new HttpError(400, "invalid_json", "Request body must contain valid JSON.");
    }
}
export function setCommonHeaders(response, requestId) {
    response.setHeader("x-request-id", requestId);
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("x-frame-options", "DENY");
    response.setHeader("referrer-policy", "no-referrer");
    response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("cross-origin-resource-policy", "same-origin");
    response.setHeader("content-security-policy", "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
}
//# sourceMappingURL=http-utils.js.map