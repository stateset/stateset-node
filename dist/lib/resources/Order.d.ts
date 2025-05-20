import { stateset } from '../../stateset-client';
export declare enum OrderStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    PICKING = "PICKING",
    PACKING = "PACKING",
    SHIPPED = "SHIPPED",
    IN_TRANSIT = "IN_TRANSIT",
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED",
    REFUNDED = "REFUNDED"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    PAID = "paid",
    PARTIALLY_REFUNDED = "partially_refunded",
    REFUNDED = "refunded",
    FAILED = "failed"
}
export declare enum FulfillmentPriority {
    URGENT = "urgent",
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
interface Metadata {
    [key: string]: any;
}
interface Dimensions {
    length: number;
    width: number;
    height: number;
    unit: string;
}
export interface OrderItem {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount: number;
    metadata?: Metadata & {
        weight?: number;
        dimensions?: Dimensions;
    };
}
export interface ShippingAddress {
    first_name: string;
    last_name: string;
    company?: string;
    street_address1: string;
    street_address2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    email?: string;
    delivery_instructions?: string;
}
export interface PaymentDetails {
    payment_method: string;
    transaction_id?: string;
    status: PaymentStatus;
    amount_paid: number;
    currency: string;
    payment_date?: string;
    refund_details?: Array<{
        refund_id: string;
        amount: number;
        reason: string;
        date: string;
    }>;
}
export interface ShippingDetails {
    carrier: string;
    method: string;
    tracking_number?: string;
    estimated_delivery_date?: string;
    shipping_cost: number;
    tracking_url?: string;
    label_url?: string;
    package_details?: {
        weight: number;
        dimensions: Dimensions;
        packages: number;
    };
}
export interface OrderTotals {
    subtotal: number;
    shipping_total: number;
    tax_total: number;
    discount_total: number;
    grand_total: number;
    currency: string;
}
export interface OrderData {
    customer_id: string;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    shipping_details?: ShippingDetails;
    payment_details: PaymentDetails;
    totals: OrderTotals;
    notes?: string[];
    priority?: FulfillmentPriority;
    source?: string;
    metadata?: Metadata;
    org_id?: string;
}
export interface FulfillmentEvent {
    timestamp: string;
    status: OrderStatus;
    location?: string;
    description: string;
    performed_by?: string;
    metadata?: Metadata;
}
interface BaseOrderResponse {
    id: string;
    object: 'order';
    created_at: string;
    updated_at: string;
    status: OrderStatus;
    data: OrderData;
}
export type OrderResponse = BaseOrderResponse & {
    [K in OrderStatus]: {
        status: K;
    } & (K extends OrderStatus.SHIPPED ? {
        shipping_details: ShippingDetails;
    } : K extends OrderStatus.DELIVERED ? {
        delivered: true;
        delivery_confirmation?: {
            timestamp: string;
            signature?: string;
            photo?: string;
        };
    } : K extends OrderStatus.CANCELLED ? {
        cancelled: true;
        cancellation_reason: string;
        cancelled_at: string;
    } : K extends OrderStatus.RETURNED ? {
        returned: true;
        return_details: {
            rma_number: string;
            reason: string;
            received_at: string;
            condition: string;
        };
    } : K extends OrderStatus.REFUNDED ? {
        refunded: true;
        refund_details: {
            amount: number;
            reason: string;
            processed_at: string;
            transaction_id: string;
        };
    } : {});
}[OrderStatus];
export declare class OrderError extends Error {
    constructor(message: string, name: string);
}
export declare class OrderNotFoundError extends OrderError {
    constructor(orderId: string);
}
export declare class OrderStateError extends OrderError {
    constructor(message: string);
}
export declare class OrderValidationError extends OrderError {
    constructor(message: string);
}
export declare class Orders {
    private readonly client;
    constructor(client: stateset);
    private request;
    list(params?: {
        status?: OrderStatus;
        customer_id?: string;
        date_from?: Date;
        date_to?: Date;
        priority?: FulfillmentPriority;
        payment_status?: PaymentStatus;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        orders: OrderResponse[];
        total: number;
    }>;
    get(orderId: string): Promise<OrderResponse>;
    create(orderData: OrderData): Promise<OrderResponse>;
    update(orderId: string, orderData: Partial<OrderData>): Promise<OrderResponse>;
    confirm(orderId: string): Promise<OrderResponse>;
    process(orderId: string): Promise<OrderResponse>;
    ship(orderId: string, shippingDetails: ShippingDetails): Promise<OrderResponse>;
    markDelivered(orderId: string, confirmation?: {
        signature?: string;
        photo?: string;
    }): Promise<OrderResponse>;
    cancel(orderId: string, cancellationData: {
        reason: string;
    }): Promise<OrderResponse>;
    processReturn(orderId: string, returnData: {
        rma_number: string;
        reason: string;
        condition: string;
    }): Promise<OrderResponse>;
    processRefund(orderId: string, refundData: {
        amount: number;
        reason: string;
    }): Promise<OrderResponse>;
    updateShippingAddress(orderId: string, address: ShippingAddress): Promise<OrderResponse>;
    updateBillingAddress(orderId: string, address: ShippingAddress): Promise<OrderResponse>;
    addFulfillmentEvent(orderId: string, event: FulfillmentEvent): Promise<OrderResponse>;
    getFulfillmentHistory(orderId: string, params?: {
        start_date?: Date;
        end_date?: Date;
    }): Promise<FulfillmentEvent[]>;
    getTracking(orderId: string): Promise<{
        tracking_number: string;
        carrier: string;
        status: string;
        estimated_delivery: string;
        tracking_url: string;
        events: Array<{
            timestamp: string;
            location: string;
            status: string;
            description: string;
        }>;
    }>;
    getMetrics(params?: {
        start_date?: Date;
        end_date?: Date;
        org_id?: string;
    }): Promise<{
        total_orders: number;
        total_revenue: number;
        average_order_value: number;
        fulfillment_rate: number;
        return_rate: number;
        status_breakdown: Record<OrderStatus, number>;
    }>;
}
export default Orders;
