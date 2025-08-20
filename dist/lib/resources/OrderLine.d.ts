import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum OrderLineStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    BACKORDERED = "BACKORDERED",
    RETURNED = "RETURNED"
}
export declare enum OrderLineType {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    DIGITAL = "DIGITAL",
    BUNDLE = "BUNDLE"
}
export interface OrderLineItem {
    product_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency: string;
    tax_amount?: number;
    discount_amount?: number;
}
export interface OrderLineData {
    order_id: NonEmptyString<string>;
    type: OrderLineType;
    status: OrderLineStatus;
    item: OrderLineItem;
    fulfillment?: {
        warehouse_id: string;
        shipped_at?: Timestamp;
        tracking_number?: string;
        carrier?: string;
    };
    pricing: {
        subtotal: number;
        total: number;
        discounts_applied?: Array<{
            discount_id: string;
            amount: number;
            description?: string;
        }>;
        taxes_applied?: Array<{
            tax_id: string;
            amount: number;
            rate: number;
        }>;
    };
    created_at: Timestamp;
    updated_at: Timestamp;
    status_history: Array<{
        status: OrderLineStatus;
        changed_at: Timestamp;
        changed_by: string;
        reason?: string;
    }>;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export interface OrderLineResponse {
    id: NonEmptyString<string>;
    object: 'order_line';
    data: OrderLineData;
}
export declare class OrderLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class OrderLineNotFoundError extends OrderLineError {
    constructor(orderLineId: string);
}
export declare class OrderLineValidationError extends OrderLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class OrderLines {
    private readonly client;
    constructor(client: ApiClientLike);
    private validateOrderLineData;
    private mapResponse;
    list(params?: {
        order_id?: string;
        status?: OrderLineStatus;
        type?: OrderLineType;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        order_lines: OrderLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(orderLineId: NonEmptyString<string>): Promise<OrderLineResponse>;
    create(data: OrderLineData): Promise<OrderLineResponse>;
    update(orderLineId: NonEmptyString<string>, data: Partial<OrderLineData>): Promise<OrderLineResponse>;
    delete(orderLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(orderLineId: NonEmptyString<string>, status: OrderLineStatus, reason?: string): Promise<OrderLineResponse>;
    updateFulfillment(orderLineId: NonEmptyString<string>, fulfillmentData: Partial<OrderLineData['fulfillment']>): Promise<OrderLineResponse>;
    getMetrics(params?: {
        order_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<OrderLineStatus, number>;
        type_breakdown: Record<OrderLineType, number>;
        average_line_value: number;
        fulfillment_rate: number;
    }>;
    private handleError;
}
export default OrderLines;
//# sourceMappingURL=OrderLine.d.ts.map