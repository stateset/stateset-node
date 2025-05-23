import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum LedgerEventType {
    PAYMENT = "PAYMENT",
    REFUND = "REFUND",
    CREDIT = "CREDIT",
    DEBIT = "DEBIT",
    ADJUSTMENT = "ADJUSTMENT",
    SALE = "SALE",
    PURCHASE = "PURCHASE"
}
export interface LedgerData {
    event_type: LedgerEventType;
    reference_id: NonEmptyString<string>;
    customer_id?: NonEmptyString<string>;
    amount: number;
    currency: string;
    event_date: Timestamp;
    description: string;
    account_id?: NonEmptyString<string>;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface LedgerResponse {
    id: NonEmptyString<string>;
    object: 'ledger';
    data: LedgerData;
}
export declare class LedgerError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class LedgerNotFoundError extends LedgerError {
    constructor(ledgerId: string);
}
export declare class LedgerValidationError extends LedgerError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Ledger {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateLedgerData;
    private mapResponse;
    list(params?: {
        event_type?: LedgerEventType;
        reference_id?: string;
        customer_id?: string;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        ledger_entries: LedgerResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(ledgerId: NonEmptyString<string>): Promise<LedgerResponse>;
    create(data: LedgerData): Promise<LedgerResponse>;
    update(ledgerId: NonEmptyString<string>, data: Partial<LedgerData>): Promise<LedgerResponse>;
    delete(ledgerId: NonEmptyString<string>): Promise<void>;
    getBalance(params?: {
        customer_id?: string;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
    }): Promise<{
        total_credits: number;
        total_debits: number;
        net_balance: number;
        currency: string;
    }>;
    private handleError;
}
export {};
