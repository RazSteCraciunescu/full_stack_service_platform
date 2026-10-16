declare module "node:http" {
  export type IncomingMessage = any;
  export type ServerResponse = any;
  export type Server = any;
  export function createServer(handler: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>): Server;
}

declare module "node:fs" {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: string): string;
  export function statSync(path: string): { isFile(): boolean; size: number };
  export function createReadStream(path: string): { pipe(destination: unknown): void; on(event: string, handler: (error: Error) => void): void };
}

declare module "node:path" {
  export function extname(path: string): string;
  export function join(...parts: string[]): string;
  export function normalize(path: string): string;
  export function resolve(...parts: string[]): string;
  export const sep: string;
}

declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}

declare module "node:crypto" {
  export function randomUUID(): string;
}

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  exitCode?: number;
  cwd(): string;
  on(event: string, handler: (...args: any[]) => void): void;
};

declare const Buffer: {
  byteLength(value: string): number;
  concat(chunks: any[]): { toString(encoding: string): string };
};
