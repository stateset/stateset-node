import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ShipmentLineStatus {
    PENDING = "PENDING",
    PACKED = "PACKED",
    SHIPPED = "SHIPPED",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED"
}
export declare enum ShipmentLineType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    DOCUMENT = "DOCUMENT",
    SAMPLE = "SAMPLE"
}
export interface ShipmentLineItem {
    item_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    description: string;
    quantity: number;
    unit_of_measure: string;
    weight: {
        value: number;
        unit: 'LB' | 'KG' | 'OZ';
    };
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'IN' | 'CM';
    };
    value: number;
    currency: string;
}
export interface ShipmentLineData {
    shipment_id: NonEmptyString<string>;
    order_line_id?: NonEmptyString<string>;
    type: ShipmentLineType;
    status: ShipmentLineStatus;
    item: ShipmentLineItem;
    tracking?: {
        number: string;
        carrier: string;
        url?: string;
        last_update?: Timestamp;
    };
    package_id?: NonEmptyString<string>;
    customs_info?: {
        hs_code?: string;
        country_of_origin: string;
        declaration_value: number;
        currency: string;
    };
    status_history: Array<{
        status: ShipmentLineStatus;
        changed_at: Timestamp;
        changed_by?: string;
        reason?: string;
    }>;
    created_at: Timestamp;
    updated_at: Timestamp;
    delivered_at?: Timestamp;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export interface ShipmentLineResponse {
    id: NonEmptyString<string>;
    object: 'shipment_line';
    data: ShipmentLineData;
}
export declare class ShipmentLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ShipmentLineNotFoundError extends ShipmentLineError {
    constructor(shipmentLineId: string);
}
export declare class ShipmentLineValidationError extends ShipmentLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class ShipmentLine {
    private readonly client;
    constructor(client: ApiClientLike);
    private validateShipmentLineData;
    private mapResponse;
    list(params?: {
        shipment_id?: string;
        status?: ShipmentLineStatus;
        type?: ShipmentLineType;
        order_line_id?: string;
        package_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        shipment_lines: ShipmentLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(shipmentLineId: NonEmptyString<string>): Promise<ShipmentLineResponse>;
    create(data: ShipmentLineData): Promise<ShipmentLineResponse>;
    update(shipmentLineId: NonEmptyString<string>, data: Partial<ShipmentLineData>): Promise<ShipmentLineResponse>;
    delete(shipmentLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(shipmentLineId: NonEmptyString<string>, status: ShipmentLineStatus, reason?: string): Promise<ShipmentLineResponse>;
    updateTracking(shipmentLineId: NonEmptyString<string>, trackingData: Partial<ShipmentLineData['tracking']>): Promise<ShipmentLineResponse>;
    getMetrics(params?: {
        shipment_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<ShipmentLineStatus, number>;
        type_breakdown: Record<ShipmentLineType, number>;
        average_weight: number;
        delivery_performance: {
            on_time_rate: number;
            average_delivery_time: number;
        };
    }>;
    private handleError;
}
export default ShipmentLine;
//# sourceMappingURL=ShipmentLine.d.ts.map