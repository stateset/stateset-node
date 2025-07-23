import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ContactType {
    CUSTOMER = "CUSTOMER",
    SUPPLIER = "SUPPLIER",
    VENDOR = "VENDOR",
    EMPLOYEE = "EMPLOYEE"
}
export declare enum ContactStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING = "PENDING"
}
export interface ContactData {
    entity_id: NonEmptyString<string>;
    type: ContactType;
    status: ContactStatus;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    job_title?: string;
    address?: {
        line1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    is_primary?: boolean;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface ContactResponse {
    id: NonEmptyString<string>;
    object: 'contact';
    data: ContactData;
}
export declare class ContactError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ContactNotFoundError extends ContactError {
    constructor(contactId: string);
}
export declare class ContactValidationError extends ContactError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Contacts {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateContactData;
    private mapResponse;
    list(params?: {
        entity_id?: string;
        type?: ContactType;
        status?: ContactStatus;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        contacts: ContactResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(contactId: NonEmptyString<string>): Promise<ContactResponse>;
    create(data: ContactData): Promise<ContactResponse>;
    update(contactId: NonEmptyString<string>, data: Partial<ContactData>): Promise<ContactResponse>;
    delete(contactId: NonEmptyString<string>): Promise<void>;
    setPrimary(contactId: NonEmptyString<string>): Promise<ContactResponse>;
    private handleError;
}
export {};
//# sourceMappingURL=Contact.d.ts.map