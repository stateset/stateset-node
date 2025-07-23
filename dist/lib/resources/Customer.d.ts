import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum CustomerStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PROSPECT = "PROSPECT",
    SUSPENDED = "SUSPENDED"
}
export declare enum CustomerType {
    INDIVIDUAL = "INDIVIDUAL",
    BUSINESS = "BUSINESS",
    GOVERNMENT = "GOVERNMENT",
    NONPROFIT = "NONPROFIT"
}
export interface CustomerAddress {
    type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
    street1: NonEmptyString<string>;
    street2?: string;
    city: NonEmptyString<string>;
    state: string;
    postal_code: NonEmptyString<string>;
    country: NonEmptyString<string>;
    is_residential?: boolean;
    validated?: boolean;
}
export interface CustomerContact {
    type: 'PHONE' | 'EMAIL' | 'FAX';
    value: NonEmptyString<string>;
    is_primary?: boolean;
    verified?: boolean;
}
export interface CustomerData {
    name: NonEmptyString<string>;
    type: CustomerType;
    status: CustomerStatus;
    email: NonEmptyString<string>;
    phone?: string;
    addresses: CustomerAddress[];
    contacts?: CustomerContact[];
    billing_info?: {
        payment_terms?: string;
        credit_limit?: number;
        currency: string;
        tax_id?: string;
    };
    preferences?: {
        communication?: 'EMAIL' | 'PHONE' | 'MAIL';
        language?: string;
        timezone?: string;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    last_activity?: Timestamp;
    org_id?: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
}
export interface CustomerResponse {
    id: NonEmptyString<string>;
    object: 'customer';
    data: CustomerData;
}
export declare class CustomerError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class CustomerNotFoundError extends CustomerError {
    constructor(customerId: string);
}
export declare class CustomerValidationError extends CustomerError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class Customers {
    private readonly client;
    constructor(client: stateset);
    private validateCustomerData;
    private mapResponse;
    list(params?: {
        status?: CustomerStatus;
        type?: CustomerType;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        customers: CustomerResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(customerId: NonEmptyString<string>): Promise<CustomerResponse>;
    create(data: CustomerData): Promise<CustomerResponse>;
    update(customerId: NonEmptyString<string>, data: Partial<CustomerData>): Promise<CustomerResponse>;
    delete(customerId: NonEmptyString<string>): Promise<void>;
    addAddress(customerId: NonEmptyString<string>, address: CustomerAddress): Promise<CustomerResponse>;
    addContact(customerId: NonEmptyString<string>, contact: CustomerContact): Promise<CustomerResponse>;
    getMetrics(params?: {
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        type?: CustomerType;
    }): Promise<{
        total_customers: number;
        status_breakdown: Record<CustomerStatus, number>;
        type_breakdown: Record<CustomerType, number>;
        active_customers: number;
        new_customer_rate: number;
    }>;
    private handleError;
}
export default Customers;
//# sourceMappingURL=Customer.d.ts.map