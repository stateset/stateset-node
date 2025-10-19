import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum SupplierStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING",
    SUSPENDED = "SUSPENDED"
}
export declare enum SupplierType {
    MANUFACTURER = "MANUFACTURER",
    DISTRIBUTOR = "DISTRIBUTOR",
    WHOLESALER = "WHOLESALER",
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
}
export interface SupplierAddress {
    type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
    street1: NonEmptyString<string>;
    street2?: string;
    city: NonEmptyString<string>;
    state: string;
    postal_code: NonEmptyString<string>;
    country: NonEmptyString<string>;
}
export interface SupplierContact {
    type: 'PHONE' | 'EMAIL' | 'FAX';
    value: NonEmptyString<string>;
    name?: string;
    role?: string;
    is_primary?: boolean;
}
export interface SupplierPaymentTerms {
    terms: string;
    credit_limit?: number;
    currency: string;
    discount?: {
        percentage: number;
        days: number;
    };
    late_penalty?: {
        percentage: number;
        grace_period_days: number;
    };
}
export interface SupplierPerformanceMetrics {
    on_time_delivery_rate: number;
    quality_rating: number;
    order_accuracy_rate: number;
    average_lead_time: number;
    total_orders: number;
    last_evaluated: Timestamp;
}
export interface SupplierData {
    name: NonEmptyString<string>;
    type: SupplierType;
    status: SupplierStatus;
    supplier_code: NonEmptyString<string>;
    email: NonEmptyString<string>;
    phone?: string;
    addresses: SupplierAddress[];
    contacts?: SupplierContact[];
    payment_terms: SupplierPaymentTerms;
    performance?: SupplierPerformanceMetrics;
    categories?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
}
export interface SupplierResponse {
    id: NonEmptyString<string>;
    object: 'supplier';
    data: SupplierData;
}
export declare class SupplierError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class SupplierNotFoundError extends SupplierError {
    constructor(supplierId: string);
}
export declare class SupplierValidationError extends SupplierError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Suppliers {
    private client;
    constructor(client: ApiClientLike);
    private validateSupplierData;
    private mapResponse;
    create(data: SupplierData): Promise<SupplierResponse>;
    get(id: NonEmptyString<string>): Promise<SupplierResponse>;
    update(id: NonEmptyString<string>, data: Partial<SupplierData>): Promise<SupplierResponse>;
    list(params?: {
        status?: SupplierStatus;
        type?: SupplierType;
        category?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        suppliers: SupplierResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    delete(id: NonEmptyString<string>): Promise<void>;
    getPerformanceMetrics(id: NonEmptyString<string>): Promise<SupplierPerformanceMetrics>;
    updatePaymentTerms(id: NonEmptyString<string>, data: Partial<SupplierPaymentTerms>): Promise<SupplierResponse>;
    listProducts(id: NonEmptyString<string>, params?: {
        limit?: number;
        offset?: number;
        category?: string;
    }): Promise<{
        products: Array<{
            id: string;
            sku: string;
            name: string;
            price: number;
            currency: string;
        }>;
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    addContact(id: NonEmptyString<string>, contact: SupplierContact): Promise<SupplierResponse>;
    getMetrics(params?: {
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        type?: SupplierType;
    }): Promise<{
        total_suppliers: number;
        status_breakdown: Record<SupplierStatus, number>;
        type_breakdown: Record<SupplierType, number>;
        average_performance: {
            on_time_delivery: number;
            quality: number;
            accuracy: number;
        };
        active_suppliers: number;
    }>;
    private handleError;
}
export {};
//# sourceMappingURL=Supplier.d.ts.map