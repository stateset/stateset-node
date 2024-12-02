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
export interface OrderItem {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount: number;
    metadata?: {
        weight?: number;
        dimensions?: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
        [key: string]: any;
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
    refund_details?: {
        refund_id: string;
        amount: number;
        reason: string;
        date: string;
    }[];
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
        dimensions: {
            length: number;
            width: number;
            height: number;
            unit: string;
        };
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
    metadata?: Record<string, any>;
    org_id?: string;
}
export interface FulfillmentEvent {
    timestamp: string;
    status: OrderStatus;
    location?: string;
    description: string;
    performed_by?: string;
    metadata?: Record<string, any>;
}
interface BaseOrderResponse {
    id: string;
    object: 'order';
    created_at: string;
    updated_at: string;
    status: OrderStatus;
    data: OrderData;
}
interface DraftOrderResponse extends BaseOrderResponse {
    status: OrderStatus.DRAFT;
    draft: true;
}
interface PendingOrderResponse extends BaseOrderResponse {
    status: OrderStatus.PENDING;
    pending: true;
}
interface ConfirmedOrderResponse extends BaseOrderResponse {
    status: OrderStatus.CONFIRMED;
    confirmed: true;
}
interface ProcessingOrderResponse extends BaseOrderResponse {
    status: OrderStatus.PROCESSING;
    processing: true;
}
interface ShippedOrderResponse extends BaseOrderResponse {
    status: OrderStatus.SHIPPED;
    shipped: true;
    shipping_details: ShippingDetails;
}
interface DeliveredOrderResponse extends BaseOrderResponse {
    status: OrderStatus.DELIVERED;
    delivered: true;
    delivery_confirmation?: {
        timestamp: string;
        signature?: string;
        photo?: string;
    };
}
interface CancelledOrderResponse extends BaseOrderResponse {
    status: OrderStatus.CANCELLED;
    cancelled: true;
    cancellation_reason: string;
    cancelled_at: string;
}
interface ReturnedOrderResponse extends BaseOrderResponse {
    status: OrderStatus.RETURNED;
    returned: true;
    return_details: {
        rma_number: string;
        reason: string;
        received_at: string;
        condition: string;
    };
}
interface RefundedOrderResponse extends BaseOrderResponse {
    status: OrderStatus.REFUNDED;
    refunded: true;
    refund_details: {
        amount: number;
        reason: string;
        processed_at: string;
        transaction_id: string;
    };
}
export type OrderResponse = DraftOrderResponse | PendingOrderResponse | ConfirmedOrderResponse | ProcessingOrderResponse | ShippedOrderResponse | DeliveredOrderResponse | CancelledOrderResponse | ReturnedOrderResponse | RefundedOrderResponse;
export declare class OrderNotFoundError extends Error {
    constructor(orderId: string);
}
export declare class OrderStateError extends Error {
    constructor(message: string);
}
export declare class OrderValidationError extends Error {
    constructor(message: string);
}
declare class Orders {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List orders with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of OrderResponse objects
     */
    list(params?: {
        status?: OrderStatus;
        customer_id?: string;
        date_from?: Date;
        date_to?: Date;
        priority?: FulfillmentPriority;
        payment_status?: PaymentStatus;
        org_id?: string;
    }): Promise<OrderResponse[]>;
    /**
     * Get specific order by ID
     * @param orderId - Order ID
     * @returns OrderResponse object
     */
    get(orderId: string): Promise<OrderResponse>;
    /**
     * Create new order
     * @param orderData - OrderData object
     * @returns OrderResponse object
     */
    create(orderData: OrderData): Promise<OrderResponse>;
    /**
     * Update existing order
     * @param orderId - Order ID
     * @param orderData - Partial<OrderData> object
     * @returns OrderResponse object
     */
    update(orderId: string, orderData: Partial<OrderData>): Promise<OrderResponse>;
    /**
     * Process order status changes
     * @param orderId - Order ID
     * @returns ConfirmedOrderResponse object
     */
    confirm(orderId: string): Promise<ConfirmedOrderResponse>;
    /**
     * Start processing an order
     * @param orderId - Order ID
     * @returns ProcessingOrderResponse object
     */
    process(orderId: string): Promise<ProcessingOrderResponse>;
    /**
     * Ship an order
     * @param orderId - Order ID
     * @param shippingDetails - ShippingDetails object
     * @returns ShippedOrderResponse object
     */
    ship(orderId: string, shippingDetails: ShippingDetails): Promise<ShippedOrderResponse>;
    /**
     * Mark an order as delivered
     * @param orderId - Order ID
     * @param confirmation - Optional confirmation object
     * @returns DeliveredOrderResponse object
     */
    markDelivered(orderId: string, confirmation?: {
        signature?: string;
        photo?: string;
    }): Promise<DeliveredOrderResponse>;
    /**
     * Cancel an order
     * @param orderId - Order ID
     * @param cancellationData - Cancellation data
     * @returns CancelledOrderResponse object
     */
    cancel(orderId: string, cancellationData: {
        reason: string;
    }): Promise<CancelledOrderResponse>;
    /**
     * Process a return for an order
     * @param orderId - Order ID
     * @param returnData - Return data
     * @returns ReturnedOrderResponse object
     */
    processReturn(orderId: string, returnData: {
        rma_number: string;
        reason: string;
        condition: string;
    }): Promise<ReturnedOrderResponse>;
    /**
     * Process a refund for an order
     * @param orderId - Order ID
     * @param refundData - Refund data
     * @returns RefundedOrderResponse object
     */
    processRefund(orderId: string, refundData: {
        amount: number;
        reason: string;
    }): Promise<RefundedOrderResponse>;
    /**
     * Add a fulfillment event to an order
     * @param orderId - Order ID
     * @param event - FulfillmentEvent object
     * @returns OrderResponse object
     */
    addFulfillmentEvent(orderId: string, event: FulfillmentEvent): Promise<OrderResponse>;
    /**
     * Get fulfillment history for an order
     * @param orderId - Order ID
     * @param params - Optional filtering parameters
     * @returns Array of FulfillmentEvent objects
     */
    getFulfillmentHistory(orderId: string, params?: {
        start_date?: Date;
        end_date?: Date;
    }): Promise<FulfillmentEvent[]>;
    /**
     * Get tracking information for an order
     * @param orderId - Order ID
     * @returns Tracking information object
     */
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
    /**
     * Get order metrics
     * @param params - Optional filtering parameters
     * @returns Metrics object
     */
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
