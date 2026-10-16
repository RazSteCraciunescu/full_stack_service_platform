import { type Server } from "node:http";
import { InMemoryRequestStore } from "./store.js";
export interface AppServerOptions {
    store?: InMemoryRequestStore;
}
export declare function createAppServer(options?: AppServerOptions): Server;
export declare function startServer(port?: number, host?: string): Server;
