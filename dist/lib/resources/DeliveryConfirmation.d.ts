import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum DeliveryConfirmationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    DISPUTED = "DISPUTED",
    FAILED = "FAILED"
}
export interface DeliveryConfirmationData {
    shipment_id: NonEmptyString<string>;
    status: DeliveryConfirmationStatus;
    delivery_date: Timestamp;
    recipient_name?: string;
    proof_of_delivery?: {
        signature_url?: string;
        photo_url?: string;
        notes?: string;
    };
    confirmed_by?: NonEmptyString<string>;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface DeliveryConfirmationResponse {
    id: NonEmptyString<string>;
    object: 'delivery_confirmation';
    data: DeliveryConfirmationData;
}
export declare class DeliveryConfirmationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class DeliveryConfirmationNotFoundError extends DeliveryConfirmationError {
    constructor(deliveryConfirmationId: string);
}
export declare class DeliveryConfirmationValidationError extends DeliveryConfirmationError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class DeliveryConfirmations {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateDeliveryConfirmationData;
    private mapResponse;
    list(params?: {
        shipment_id?: string;
        status?: DeliveryConfirmationStatus;
        org_id?: string;
        date_from?: Date;
        date_to?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        delivery_confirmations: DeliveryConfirmationResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(deliveryConfirmationId: NonEmptyString<string>): Promise<DeliveryConfirmationResponse>;
    create(data: DeliveryConfirmationData): Promise<DeliveryConfirmationResponse>;
    update(deliveryConfirmationId: NonEmptyString<string>, data: Partial<DeliveryConfirmationData>): Promise<DeliveryConfirmationResponse>;
    delete(deliveryConfirmationId: NonEmptyString<string>): Promise<void>;
    confirmDelivery(deliveryConfirmationId: NonEmptyString<string>, confirmationData: {
        recipient_name: string;
        proof_of_delivery: DeliveryConfirmationData['proof_of_delivery'];
    }): Promise<DeliveryConfirmationResponse>;
    private handleError;
}
export {};
