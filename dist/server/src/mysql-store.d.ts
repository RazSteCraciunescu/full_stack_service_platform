import type { CreateRequestInput, RequestFilters, ServiceRequest, UpdateRequestInput } from "./types.js";
export interface MysqlConnectionLike {
    execute<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<[T[], unknown]>;
    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
export declare class MysqlRequestStore {
    private readonly connection;
    constructor(connection: MysqlConnectionLike);
    list(filters?: RequestFilters): Promise<ServiceRequest[]>;
    get(publicId: string): Promise<ServiceRequest | undefined>;
    create(input: CreateRequestInput): Promise<ServiceRequest>;
    update(publicId: string, input: UpdateRequestInput): Promise<ServiceRequest | undefined>;
}
