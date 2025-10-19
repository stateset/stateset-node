import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum WarrantyLineStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum WarrantyLineType {
    REPAIR = "REPAIR",
    REPLACEMENT = "REPLACEMENT",
    REFUND = "REFUND",
    SERVICE = "SERVICE"
}
export interface WarrantyLineItem {
    product_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    serial_number?: string;
    description: string;
    quantity: number;
    unit_price: number;
    currency: string;
    condition: 'NEW' | 'USED' | 'REFURBISHED' | 'DAMAGED';
}
export interface WarrantyLineData {
    warranty_id: NonEmptyString<string>;
    type: WarrantyLineType;
    status: WarrantyLineStatus;
    item: WarrantyLineItem;
    claim_description: string;
    resolution?: {
        type: WarrantyLineType;
        approved_at: Timestamp;
        completed_at?: Timestamp;
        notes?: string;
        replacement_item_id?: string;
        refund_amount?: number;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    status_history: Array<{
        status: WarrantyLineStatus;
        changed_at: Timestamp;
        changed_by: string;
        reason?: string;
    }>;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export interface WarrantyLineResponse {
    id: NonEmptyString<string>;
    object: 'warranty_line';
    data: WarrantyLineData;
}
export declare class WarrantyLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class WarrantyLineNotFoundError extends WarrantyLineError {
    constructor(warrantyLineId: string);
}
export declare class WarrantyLineValidationError extends WarrantyLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class WarrantyLines {
    private readonly client;
    constructor(client: ApiClientLike);
    private validateWarrantyLineData;
    private mapResponse;
    list(params?: {
        warranty_id?: string;
        status?: WarrantyLineStatus;
        type?: WarrantyLineType;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        warranty_lines: WarrantyLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(warrantyLineId: NonEmptyString<string>): Promise<WarrantyLineResponse>;
    create(data: WarrantyLineData): Promise<WarrantyLineResponse>;
    update(warrantyLineId: NonEmptyString<string>, data: Partial<WarrantyLineData>): Promise<WarrantyLineResponse>;
    delete(warrantyLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(warrantyLineId: NonEmptyString<string>, status: WarrantyLineStatus, reason?: string): Promise<WarrantyLineResponse>;
    getMetrics(params?: {
        warranty_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<WarrantyLineStatus, number>;
        type_breakdown: Record<WarrantyLineType, number>;
        average_processing_time: number;
    }>;
    private handleError;
}
export default WarrantyLines;
//# sourceMappingURL=WarrantyLine.d.ts.map