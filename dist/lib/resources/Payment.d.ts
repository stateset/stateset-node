import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    CASH = "CASH",
    PAYPAL = "PAYPAL",
    OTHER = "OTHER"
}
export interface PaymentData {
    customer_id: NonEmptyString<string>;
    order_id?: NonEmptyString<string>;
    invoice_id?: NonEmptyString<string>;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    currency: string;
    transaction_id?: string;
    payment_date: Timestamp;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface PaymentResponse {
    id: NonEmptyString<string>;
    object: 'payment';
    data: PaymentData;
}
export declare class PaymentError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class PaymentNotFoundError extends PaymentError {
    constructor(paymentId: string);
}
export declare class PaymentValidationError extends PaymentError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Payments {
    private readonly stateset;
    constructor(stateset: stateset);
    private validatePaymentData;
    private mapResponse;
    list(params?: {
        customer_id?: string;
        order_id?: string;
        status?: PaymentStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        payments: PaymentResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(paymentId: NonEmptyString<string>): Promise<PaymentResponse>;
    create(data: PaymentData): Promise<PaymentResponse>;
    update(paymentId: NonEmptyString<string>, data: Partial<PaymentData>): Promise<PaymentResponse>;
    delete(paymentId: NonEmptyString<string>): Promise<void>;
    processPayment(paymentId: NonEmptyString<string>, transactionId: string): Promise<PaymentResponse>;
    private handleError;
}
export {};
//# sourceMappingURL=Payment.d.ts.map