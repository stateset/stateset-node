import { stateset } from '../../stateset-client';
export declare enum ResponseType {
    TEXT = "text",
    ACTION = "action",
    ERROR = "error",
    SYSTEM = "system"
}
export declare enum ResponseStatus {
    PENDING = "pending",
    SENT = "sent",
    FAILED = "failed"
}
export interface ResponseData {
    content: string;
    type: ResponseType;
    status?: ResponseStatus;
    metadata?: Record<string, any>;
    agent_id?: string;
    user_id?: string;
    org_id?: string;
}
export interface AgentResponseRecord {
    id: string;
    created_at: string;
    updated_at: string;
    data: ResponseData;
}
export declare class ResponseNotFoundError extends Error {
    constructor(responseId: string);
}
export declare class ResponseValidationError extends Error {
    constructor(message: string);
}
declare class Responses {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List responses with optional filtering
     */
    list(params?: {
        agent_id?: string;
        user_id?: string;
        org_id?: string;
        status?: ResponseStatus;
        type?: ResponseType;
    }): Promise<AgentResponseRecord[]>;
    /**
     * Get a specific response
     */
    get(responseId: string): Promise<AgentResponseRecord>;
    /**
     * Create a new response
     */
    create(data: ResponseData): Promise<AgentResponseRecord>;
    /**
     * Update an existing response
     */
    update(responseId: string, data: Partial<ResponseData>): Promise<AgentResponseRecord>;
    /**
     * Delete a response
     */
    delete(responseId: string): Promise<void>;
}
export default Responses;
