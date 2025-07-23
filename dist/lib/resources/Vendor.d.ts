import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum VendorStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED"
}
export declare enum VendorType {
    SUPPLIER = "SUPPLIER",
    SERVICE_PROVIDER = "SERVICE_PROVIDER",
    CONTRACTOR = "CONTRACTOR"
}
export interface VendorAddress {
    type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
    line1: NonEmptyString<string>;
    line2?: string;
    city: NonEmptyString<string>;
    state: string;
    postal_code: NonEmptyString<string>;
    country: NonEmptyString<string>;
}
export interface VendorContact {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    job_title?: string;
    is_primary?: boolean;
}
export interface VendorPaymentTerms {
    terms: string;
    credit_limit?: number;
    currency: string;
    payment_method?: 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD';
}
export interface VendorPerformanceMetrics {
    on_time_delivery_rate: number;
    quality_score: number;
    total_transactions: number;
    average_lead_time: number;
    last_evaluated: Timestamp;
}
export interface VendorData {
    name: NonEmptyString<string>;
    vendor_code: NonEmptyString<string>;
    status: VendorStatus;
    type: VendorType;
    addresses: VendorAddress[];
    contacts: VendorContact[];
    payment_terms: VendorPaymentTerms;
    performance?: VendorPerformanceMetrics;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface VendorResponse {
    id: NonEmptyString<string>;
    object: 'vendor';
    data: VendorData;
}
export declare class VendorError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class VendorNotFoundError extends VendorError {
    constructor(vendorId: string);
}
export declare class VendorValidationError extends VendorError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Vendors {
    private readonly client;
    constructor(client: stateset);
    private validateVendorData;
    private mapResponse;
    list(params?: {
        status?: VendorStatus;
        type?: VendorType;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        vendors: VendorResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(vendorId: NonEmptyString<string>): Promise<VendorResponse>;
    create(data: VendorData): Promise<VendorResponse>;
    update(vendorId: NonEmptyString<string>, data: Partial<VendorData>): Promise<VendorResponse>;
    delete(vendorId: NonEmptyString<string>): Promise<void>;
    getPerformanceMetrics(vendorId: NonEmptyString<string>): Promise<VendorPerformanceMetrics>;
    updatePaymentTerms(vendorId: NonEmptyString<string>, data: Partial<VendorPaymentTerms>): Promise<VendorResponse>;
    addContact(vendorId: NonEmptyString<string>, contact: VendorContact): Promise<VendorResponse>;
    getVendorMetrics(params?: {
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
    }): Promise<{
        total_vendors: number;
        status_breakdown: Record<VendorStatus, number>;
        type_breakdown: Record<VendorType, number>;
        average_performance: {
            on_time_delivery: number;
            quality_score: number;
        };
    }>;
    private handleError;
}
export {};
//# sourceMappingURL=Vendor.d.ts.map