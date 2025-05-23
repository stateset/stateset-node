import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum CarrierStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum CarrierType {
    FREIGHT = "FREIGHT",
    PARCEL = "PARCEL",
    COURIER = "COURIER"
}
export interface CarrierData {
    name: NonEmptyString<string>;
    carrier_code: NonEmptyString<string>;
    status: CarrierStatus;
    type: CarrierType;
    contact_email?: string;
    contact_phone?: string;
    rates: Array<{
        service_code: string;
        service_name: string;
        base_rate: number;
        currency: string;
    }>;
    performance?: {
        on_time_delivery_rate: number;
        average_transit_time: number;
        total_shipments: number;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface CarrierResponse {
    id: NonEmptyString<string>;
    object: 'carrier';
    data: CarrierData;
}
export declare class CarrierError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class CarrierNotFoundError extends CarrierError {
    constructor(carrierId: string);
}
export declare class CarrierValidationError extends CarrierError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Carriers {
    private readonly stateset;
    constructor(stateset: stateset);
    private validateCarrierData;
    private mapResponse;
    list(params?: {
        status?: CarrierStatus;
        type?: CarrierType;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        carriers: CarrierResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(carrierId: NonEmptyString<string>): Promise<CarrierResponse>;
    create(data: CarrierData): Promise<CarrierResponse>;
    update(carrierId: NonEmptyString<string>, data: Partial<CarrierData>): Promise<CarrierResponse>;
    delete(carrierId: NonEmptyString<string>): Promise<void>;
    updatePerformance(carrierId: NonEmptyString<string>, performance: CarrierData['performance']): Promise<CarrierResponse>;
    private handleError;
}
export {};
