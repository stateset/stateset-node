import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum CreditDebitType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}
export declare enum CreditDebitStatus {
    PENDING = "PENDING",
    APPLIED = "APPLIED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export interface CreditsDebitsData {
    customer_id: NonEmptyString<string>;
    type: CreditDebitType;
    status: CreditDebitStatus;
    amount: number;
    currency: string;
    reason: string;
    issued_date: Timestamp;
    expiry_date?: Timestamp;
    applied_date?: Timestamp;
    order_id?: NonEmptyString<string>;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface CreditsDebitsResponse {
    id: NonEmptyString<string>;
    object: 'credit_debit';
    data: CreditsDebitsData;
}
export declare class CreditsDebitsError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class CreditsDebitsNotFoundError extends CreditsDebitsError {
    constructor(creditsDebitsId: string);
}
export declare class CreditsDebitsValidationError extends CreditsDebitsError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class CreditsDebits {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateCreditsDebitsData;
    private mapResponse;
    list(params?: {
        customer_id?: string;
        type?: CreditDebitType;
        status?: CreditDebitStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        credits_debits: CreditsDebitsResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(creditsDebitsId: NonEmptyString<string>): Promise<CreditsDebitsResponse>;
    create(data: CreditsDebitsData): Promise<CreditsDebitsResponse>;
    update(creditsDebitsId: NonEmptyString<string>, data: Partial<CreditsDebitsData>): Promise<CreditsDebitsResponse>;
    delete(creditsDebitsId: NonEmptyString<string>): Promise<void>;
    applyCreditDebit(creditsDebitsId: NonEmptyString<string>, appliedDate: Timestamp): Promise<CreditsDebitsResponse>;
    private handleError;
}
export {};
