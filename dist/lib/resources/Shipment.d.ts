import { stateset } from '../../stateset-client';
type UnitOfWeight = 'lb' | 'kg' | 'oz';
type UnitOfLength = 'in' | 'cm';
type NonEmptyString<T extends string> = T extends '' ? never : T;
export declare enum ShipmentStatus {
    PENDING = "pending",
    LABEL_CREATED = "label_created",
    PICKING = "picking",
    PICKED = "picked",
    PACKING = "packing",
    PACKED = "packed",
    SHIPPED = "shipped",
    IN_TRANSIT = "in_transit",
    OUT_FOR_DELIVERY = "out_for_delivery",
    ATTEMPTED_DELIVERY = "attempted_delivery",
    DELIVERED = "delivered",
    EXCEPTION = "exception",
    CANCELLED = "cancelled"
}
export declare enum ShippingCarrier {
    FEDEX = "FEDEX",
    UPS = "UPS",
    USPS = "USPS",
    DHL = "DHL",
    ONTRAC = "ONTRAC"
}
export declare enum ServiceLevel {
    GROUND = "GROUND",
    TWO_DAY = "TWO_DAY",
    OVERNIGHT = "OVERNIGHT",
    INTERNATIONAL = "INTERNATIONAL",
    ECONOMY = "ECONOMY"
}
export declare enum PackageType {
    CUSTOM = "CUSTOM",
    ENVELOPE = "ENVELOPE",
    PAK = "PAK",
    TUBE = "TUBE",
    BOX_SMALL = "BOX_SMALL",
    BOX_MEDIUM = "BOX_MEDIUM",
    BOX_LARGE = "BOX_LARGE",
    PALLET = "PALLET"
}
interface Measurement<T extends string> {
    value: number;
    unit: T;
}
interface Dimensions {
    length: number;
    width: number;
    height: number;
    unit: UnitOfLength;
}
export interface ShipmentItem {
    item_id: NonEmptyString<string>;
    order_item_id: NonEmptyString<string>;
    quantity: number;
    sku?: string;
    description?: string;
    weight?: Measurement<UnitOfWeight>;
    dimensions?: Dimensions;
    value?: number;
    currency?: string;
    serial_numbers?: string[];
    lot_numbers?: string[];
    package_id?: string;
}
export interface Address {
    name: NonEmptyString<string>;
    company?: string;
    street1: NonEmptyString<string>;
    street2?: string;
    city: NonEmptyString<string>;
    state: NonEmptyString<string>;
    postal_code: NonEmptyString<string>;
    country: NonEmptyString<string>;
    phone: NonEmptyString<string>;
    email?: string;
    is_residential?: boolean;
    delivery_instructions?: string;
    validated?: boolean;
}
export interface Package {
    id: NonEmptyString<string>;
    type: PackageType;
    weight: Measurement<UnitOfWeight>;
    dimensions: Dimensions;
    items: NonEmptyString<string>[];
    tracking_information?: {
        number: string;
        url: string;
        carrier: ShippingCarrier;
    };
    label?: {
        url: string;
        format: 'PDF' | 'PNG' | 'ZPL';
        created_at: string;
    };
    customs_declaration?: CustomsInfo;
}
export interface CustomsInfo {
    contents_type: NonEmptyString<string>;
    contents_explanation?: string;
    customs_certify?: boolean;
    customs_signer?: string;
    non_delivery_option?: 'RETURN' | 'ABANDON';
    restriction_type?: 'NONE' | 'OTHER' | 'DANGEROUS_GOODS';
    eel_pfc?: string;
    customs_items?: Array<{
        description: string;
        quantity: number;
        value: number;
        harmonized_code?: string;
        country_of_origin?: string;
    }>;
}
export interface TrackingEvent {
    timestamp: string;
    status: ShipmentStatus;
    message: string;
    location: Partial<Address>;
    carrier_details?: {
        code: string;
        description: string;
    };
}
export interface ShipmentData {
    order_id: NonEmptyString<string>;
    customer_id: NonEmptyString<string>;
    carrier: ShippingCarrier;
    service_level: ServiceLevel;
    shipping_address: Address;
    return_address?: Address;
    billing_address?: Address;
    items: ShipmentItem[];
    packages: Package[];
    estimated_delivery_date?: string;
    shipping_date?: string;
    delivery_requirements?: {
        signature_required?: boolean;
        adult_signature_required?: boolean;
        weekend_delivery?: boolean;
    };
    insurance?: {
        amount: number;
        currency: string;
        provider?: string;
    };
    customs_info?: CustomsInfo;
    metadata?: Record<string, unknown>;
    org_id?: string;
    tags?: string[];
}
export interface Rate {
    carrier: ShippingCarrier;
    service_level: ServiceLevel;
    cost: {
        amount: number;
        currency: string;
    };
    estimated_delivery: {
        days: number;
        date?: string;
    };
    features: {
        guaranteed_delivery: boolean;
        tracking: boolean;
        insurance_available: boolean;
    };
}
export interface ShippingLabel {
    tracking_number: string;
    label_url: string;
    carrier: ShippingCarrier;
    cost?: number;
    created_at: string;
    expires_at?: string;
}
export type ShipmentResponse = {
    id: NonEmptyString<string>;
    object: 'shipment';
    created_at: string;
    updated_at: string;
    status: ShipmentStatus;
    data: ShipmentData;
} & ({
    status: ShipmentStatus.PENDING;
    pending_details: {
        created_at: string;
    };
} | {
    status: ShipmentStatus.LABEL_CREATED;
    label_info: {
        tracking_number: string;
        label_url: string;
        created_at: string;
    };
} | {
    status: ShipmentStatus.SHIPPED;
    shipping_info: {
        carrier: ShippingCarrier;
        tracking_numbers: string[];
        shipped_at: string;
    };
} | {
    status: ShipmentStatus.IN_TRANSIT;
    transit_info: {
        events: TrackingEvent[];
        last_update: string;
    };
} | {
    status: ShipmentStatus.DELIVERED;
    delivery_info: {
        delivered_at: string;
        signed_by?: string;
        proof_of_delivery?: string;
    };
} | {
    status: ShipmentStatus.EXCEPTION;
    exception_info: {
        code: string;
        message: string;
        timestamp: string;
        resolution?: string;
    };
});
export declare class ShipmentError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ShipmentNotFoundError extends ShipmentError {
    constructor(shipmentId: string);
}
export declare class ShipmentValidationError extends ShipmentError {
    readonly validationErrors?: Record<string, string> | undefined;
    constructor(message: string, validationErrors?: Record<string, string> | undefined);
}
export declare class CarrierApiError extends ShipmentError {
    readonly carrier: ShippingCarrier;
    readonly code: string;
    constructor(message: string, carrier: ShippingCarrier, code: string);
}
export declare class Shipments {
    private readonly client;
    constructor(client: stateset);
    private validateShipmentData;
    list(params?: {
        status?: ShipmentStatus;
        carrier?: ShippingCarrier;
        order_id?: string;
        customer_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        shipments: ShipmentResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    getRates(data: Omit<ShipmentData, 'carrier' | 'service_level'>): Promise<Rate[]>;
    create(data: ShipmentData): Promise<ShipmentResponse>;
    update(shipmentId: string, data: Partial<ShipmentData>): Promise<ShipmentResponse>;
    addPackage(shipmentId: string, packageData: Omit<Package, 'id'>): Promise<ShipmentResponse>;
    generateReturnLabel(shipmentId: string, options?: {
        return_address?: Address;
        service_level?: ServiceLevel;
        reason?: string;
    }): Promise<{
        tracking_number: string;
        label_url: string;
        carrier: ShippingCarrier;
        expires_at: string;
    }>;
    generateLabel(shipmentId: string, options?: {
        format?: 'PDF' | 'PNG' | 'ZPL';
        test_label?: boolean;
    }): Promise<ShippingLabel>;
    getTrackingDetails(shipmentId: string, options?: {
        include_proof_of_delivery?: boolean;
        include_full_history?: boolean;
    }): Promise<{
        status: ShipmentStatus;
        estimated_delivery_date?: string;
        actual_delivery_date?: string;
        events: TrackingEvent[];
        proof_of_delivery?: string;
    }>;
    getMetrics(params?: {
        date_range?: {
            start: Date;
            end: Date;
        };
        carrier?: ShippingCarrier;
        org_id?: string;
        group_by?: 'day' | 'week' | 'month';
    }): Promise<{
        total_shipments: number;
        average_delivery_time: number;
        on_time_delivery_rate: number;
        exception_rate: number;
        average_shipping_cost: number;
        carrier_breakdown: Record<ShippingCarrier, number>;
        status_breakdown: Record<ShipmentStatus, number>;
        trends?: Record<string, number>;
    }>;
    private handleApiError;
}
export default Shipments;
//# sourceMappingURL=Shipment.d.ts.map