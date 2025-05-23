import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum RefundStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PROCESSED = "PROCESSED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum RefundReason {
    RETURN = "RETURN",
    CANCELLATION = "CANCELLATION",
    DEFECTIVE = "DEFECTIVE",
    OTHER = "OTHER"
}
export interface RefundData {
    payment_id: NonEmptyString<string>;
    return_id?: NonEmptyString<string>;
    order_id?: NonEmptyString<string>;
    status: RefundStatus;
    reason: RefundReason;
    amount: number;
    currency: string;
    refund_date?: Timestamp;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface RefundResponse {
    id: NonEmptyString<string>;
    object: 'refund';
    data: RefundData;
}
export declare class RefundError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class RefundNotFoundError extends RefundError {
    constructor(refundId: string);
}
export declare class RefundValidationError extends RefundError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Refunds {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateRefundData;
    private mapResponse;
    list(params?: {
        payment_id?: string;
        return_id?: string;
        status?: RefundStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        refunds: RefundResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(refundId: NonEmptyString<string>): Promise<RefundResponse>;
    create(data: RefundData): Promise<RefundResponse>;
    update(refundId: NonEmptyString<string>, data: Partial<RefundData>): Promise<RefundResponse>;
    delete(refundId: NonEmptyString<string>): Promise<void>;
    processRefund(refundId: NonEmptyString<string>, refundDate: Timestamp): Promise<RefundResponse>;
    private handleError;
}
export {};
