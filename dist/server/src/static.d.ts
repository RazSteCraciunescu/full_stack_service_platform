import type { IncomingMessage, ServerResponse } from "node:http";
export declare function serveStatic(request: IncomingMessage, response: ServerResponse, publicRoot: string, pathname: string): boolean;
