import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum WarrantyStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    CLOSED = "CLOSED",
    REOPENED = "REOPENED"
}
export declare enum WarrantyType {
    MANUFACTURER = "MANUFACTURER",
    EXTENDED = "EXTENDED",
    THIRD_PARTY = "THIRD_PARTY"
}
export interface WarrantyItem {
    item_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    serial_number?: string;
    description: string;
    purchase_date: Timestamp;
    warranty_start: Timestamp;
    warranty_end: Timestamp;
    condition: 'NEW' | 'USED' | 'REFURBISHED';
}
export interface WarrantyClaim {
    claim_id: NonEmptyString<string>;
    reported_at: Timestamp;
    issue_description: string;
    photos?: string[];
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
    resolution?: {
        type: 'REPAIR' | 'REPLACEMENT' | 'REFUND';
        completed_at: Timestamp;
        notes?: string;
    };
}
export interface WarrantyData {
    customer_id: NonEmptyString<string>;
    order_id: NonEmptyString<string>;
    type: WarrantyType;
    items: WarrantyItem[];
    claims?: WarrantyClaim[];
    coverage: {
        duration_months: number;
        terms: string;
        exclusions?: string[];
    };
    status_history: Array<{
        status: WarrantyStatus;
        changed_at: Timestamp;
        changed_by: string;
        reason?: string;
    }>;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export type WarrantyResponse = {
    id: NonEmptyString<string>;
    object: 'warranty';
    status: WarrantyStatus;
    data: WarrantyData;
} & ({
    status: WarrantyStatus.PENDING;
    pending_details: {
        submitted_at: Timestamp;
    };
} | {
    status: WarrantyStatus.APPROVED;
    approved_at: Timestamp;
} | {
    status: WarrantyStatus.REJECTED;
    rejection_reason: string;
} | {
    status: WarrantyStatus.CANCELLED;
    cancellation_reason?: string;
} | {
    status: WarrantyStatus.CLOSED;
    closed_at: Timestamp;
} | {
    status: WarrantyStatus.REOPENED;
    reopened_reason: string;
});
export declare class WarrantyError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class WarrantyNotFoundError extends WarrantyError {
    constructor(warrantyId: string);
}
export declare class WarrantyValidationError extends WarrantyError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class WarrantyOperationError extends WarrantyError {
    readonly operation?: string | undefined;
    constructor(message: string, operation?: string | undefined);
}
export declare class Warranty {
    private readonly client;
    constructor(client: stateset);
    private validateWarrantyData;
    private mapResponse;
    list(params?: {
        status?: WarrantyStatus;
        customer_id?: string;
        order_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        warranties: WarrantyResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(warrantyId: NonEmptyString<string>): Promise<WarrantyResponse>;
    create(data: WarrantyData): Promise<WarrantyResponse>;
    approve(warrantyId: NonEmptyString<string>, reason?: string): Promise<WarrantyResponse>;
    reject(warrantyId: NonEmptyString<string>, reason: string): Promise<WarrantyResponse>;
    cancel(warrantyId: NonEmptyString<string>, reason?: string): Promise<WarrantyResponse>;
    close(warrantyId: NonEmptyString<string>): Promise<WarrantyResponse>;
    reopen(warrantyId: NonEmptyString<string>, reason: string): Promise<WarrantyResponse>;
    update(warrantyId: NonEmptyString<string>, data: Partial<WarrantyData>): Promise<WarrantyResponse>;
    delete(warrantyId: NonEmptyString<string>): Promise<void>;
    addClaim(warrantyId: NonEmptyString<string>, claimData: Omit<WarrantyClaim, 'claim_id' | 'status'>): Promise<WarrantyResponse>;
    getMetrics(params?: {
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_warranties: number;
        status_breakdown: Record<WarrantyStatus, number>;
        average_duration: number;
        claim_rate: number;
    }>;
    private handleError;
}
export default Warranty;
