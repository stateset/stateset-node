import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum CaseTicketStatus {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
    ON_HOLD = "ON_HOLD"
}
export declare enum CaseTicketPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum EscalationLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export interface CaseTicketData {
    customer_id: NonEmptyString<string>;
    order_id?: NonEmptyString<string>;
    product_id?: NonEmptyString<string>;
    status: CaseTicketStatus;
    priority: CaseTicketPriority;
    subject: string;
    description: string;
    assigned_to?: NonEmptyString<string>;
    created_at: Timestamp;
    updated_at: Timestamp;
    resolved_at?: Timestamp;
    notes?: string[];
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface CaseTicketResponse {
    id: NonEmptyString<string>;
    object: 'case_ticket';
    data: CaseTicketData;
}
export declare class CaseTicketError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class CaseTicketNotFoundError extends CaseTicketError {
    constructor(caseTicketId: string);
}
export declare class CaseTicketValidationError extends CaseTicketError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class CasesTickets {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateCaseTicketData;
    private mapResponse;
    list(params?: {
        customer_id?: string;
        order_id?: string;
        status?: CaseTicketStatus;
        priority?: CaseTicketPriority;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        cases_tickets: CaseTicketResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(caseTicketId: NonEmptyString<string>): Promise<CaseTicketResponse>;
    create(data: CaseTicketData): Promise<CaseTicketResponse>;
    update(caseTicketId: NonEmptyString<string>, data: Partial<CaseTicketData>): Promise<CaseTicketResponse>;
    delete(caseTicketId: NonEmptyString<string>): Promise<void>;
    resolve(caseTicketId: NonEmptyString<string>, resolutionNotes: string): Promise<CaseTicketResponse>;
    assign(caseTicketId: NonEmptyString<string>, agentId: NonEmptyString<string>): Promise<CaseTicketResponse>;
    addNote(caseTicketId: NonEmptyString<string>, note: string): Promise<CaseTicketResponse>;
    escalate(caseTicketId: NonEmptyString<string>, level: EscalationLevel): Promise<CaseTicketResponse>;
    close(caseTicketId: NonEmptyString<string>): Promise<CaseTicketResponse>;
    reopen(caseTicketId: NonEmptyString<string>, note: string): Promise<CaseTicketResponse>;
    private handleError;
}
export {};
