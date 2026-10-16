import { type CreateCommentInput, type CreateRequestInput, type UpdateRequestInput, type ValidationResult } from "./types.js";
export declare function validateCreateRequest(input: unknown): ValidationResult<CreateRequestInput>;
export declare function validateUpdateRequest(input: unknown): ValidationResult<UpdateRequestInput>;
export declare function validateComment(input: unknown): ValidationResult<CreateCommentInput>;
