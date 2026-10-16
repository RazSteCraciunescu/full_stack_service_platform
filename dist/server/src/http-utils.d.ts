import type { IncomingMessage, ServerResponse } from "node:http";
export declare class HttpError extends Error {
    status: number;
    code: string;
    details?: unknown;
    constructor(status: number, code: string, message: string, details?: unknown);
}
export declare function sendJson(response: ServerResponse, status: number, payload: unknown, headers?: Record<string, string>): void;
export declare function sendProblem(response: ServerResponse, status: number, code: string, message: string, details?: unknown): void;
export declare function readJson(request: IncomingMessage, limitBytes?: number): Promise<unknown>;
export declare function setCommonHeaders(response: ServerResponse, requestId: string): void;
