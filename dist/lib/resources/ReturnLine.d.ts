import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ReturnLineStatus {
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    INSPECTED = "INSPECTED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    PROCESSED = "PROCESSED",
    CANCELLED = "CANCELLED"
}
export declare enum ReturnReason {
    DEFECTIVE = "DEFECTIVE",
    WRONG_ITEM = "WRONG_ITEM",
    NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED",
    CHANGED_MIND = "CHANGED_MIND",
    DAMAGED = "DAMAGED",
    OTHER = "OTHER"
}
export interface ReturnLineItem {
    product_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    serial_number?: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency: string;
    condition: 'NEW' | 'USED' | 'DAMAGED' | 'OPEN_BOX';
}
export interface ReturnLineData {
    return_id: NonEmptyString<string>;
    order_id: NonEmptyString<string>;
    item: ReturnLineItem;
    reason: ReturnReason;
    status: ReturnLineStatus;
    requested_action: 'REFUND' | 'REPLACEMENT' | 'REPAIR' | 'STORE_CREDIT';
    customer_notes?: string;
    inspection?: {
        inspected_at: Timestamp;
        inspector_id: string;
        condition_notes?: string;
        photos?: string[];
    };
    resolution?: {
        type: 'REFUND' | 'REPLACEMENT' | 'REPAIR' | 'STORE_CREDIT';
        amount?: number;
        replacement_item_id?: string;
        completed_at: Timestamp;
        notes?: string;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    status_history: Array<{
        status: ReturnLineStatus;
        changed_at: Timestamp;
        changed_by: string;
        reason?: string;
    }>;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export interface ReturnLineResponse {
    id: NonEmptyString<string>;
    object: 'return_line';
    data: ReturnLineData;
}
export declare class ReturnLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ReturnLineNotFoundError extends ReturnLineError {
    constructor(returnLineId: string);
}
export declare class ReturnLineValidationError extends ReturnLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class ReturnLines {
    private readonly client;
    constructor(client: stateset);
    private validateReturnLineData;
    private mapResponse;
    list(params?: {
        return_id?: string;
        order_id?: string;
        status?: ReturnLineStatus;
        reason?: ReturnReason;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        return_lines: ReturnLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(returnLineId: NonEmptyString<string>): Promise<ReturnLineResponse>;
    create(data: ReturnLineData): Promise<ReturnLineResponse>;
    update(returnLineId: NonEmptyString<string>, data: Partial<ReturnLineData>): Promise<ReturnLineResponse>;
    delete(returnLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(returnLineId: NonEmptyString<string>, status: ReturnLineStatus, reason?: string): Promise<ReturnLineResponse>;
    recordInspection(returnLineId: NonEmptyString<string>, inspectionData: Omit<ReturnLineData['inspection'], 'inspected_at'>): Promise<ReturnLineResponse>;
    getMetrics(params?: {
        return_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<ReturnLineStatus, number>;
        reason_breakdown: Record<ReturnReason, number>;
        average_processing_time: number;
        approval_rate: number;
    }>;
    private handleError;
}
export default ReturnLines;
//# sourceMappingURL=ReturnLine.d.ts.map