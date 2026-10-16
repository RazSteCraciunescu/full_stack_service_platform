import type { CreateCommentInput, CreateRequestInput, RequestFilters, ServiceRequest, UpdateRequestInput } from "./types.js";
export declare class InMemoryRequestStore {
    #private;
    constructor(seed: ServiceRequest[]);
    static fromSeedFiles(): InMemoryRequestStore;
    list(filters?: RequestFilters): ServiceRequest[];
    get(id: string): ServiceRequest | undefined;
    create(input: CreateRequestInput, now?: Date): ServiceRequest;
    update(id: string, input: UpdateRequestInput, now?: Date): ServiceRequest | undefined;
    addComment(id: string, input: CreateCommentInput, now?: Date): ServiceRequest | undefined;
    reset(): ServiceRequest[];
    knowledgeArticles(): unknown[];
}
