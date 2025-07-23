import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum WooCommerceProductStatus {
    PUBLISH = "publish",
    DRAFT = "draft",
    PENDING = "pending",
    PRIVATE = "private"
}
export declare enum WooCommerceOrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    ON_HOLD = "on-hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
    FAILED = "failed"
}
export interface WooCommerceProduct {
    id: number;
    name: string;
    slug: string;
    status: WooCommerceProductStatus;
    type: 'simple' | 'variable' | 'grouped' | 'external';
    price: string;
    regular_price: string;
    sale_price?: string;
    manage_stock: boolean;
    stock_quantity?: number;
    weight?: string;
    dimensions?: {
        length: string;
        width: string;
        height: string;
    };
    images: Array<{
        id: number;
        src: NonEmptyString<string>;
        name?: string;
    }>;
    date_created: Timestamp;
    date_modified: Timestamp;
}
export interface WooCommerceOrder {
    id: number;
    order_key: string;
    status: WooCommerceOrderStatus;
    date_created: Timestamp;
    customer_id: number;
    billing: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone?: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    line_items: Array<{
        id: number;
        product_id: number;
        quantity: number;
        price: string;
        total: string;
    }>;
    total: string;
    currency: string;
}
export interface WooCommerceShipment {
    id: number;
    order_id: number;
    tracking_number: string;
    carrier: string;
    date_shipped: Timestamp;
    items: Array<{
        product_id: number;
        quantity: number;
    }>;
}
export interface WooCommerceCarrier {
    id: string;
    name: string;
    services: Array<{
        id: string;
        name: string;
    }>;
}
export interface WooCommerceRate {
    carrier_id: string;
    service_id: string;
    cost: number;
    estimated_delivery?: string;
}
export declare class WooCommerceIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class WooCommerceIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        status?: WooCommerceProductStatus;
        type?: WooCommerceProduct['type'];
        page?: number;
        per_page?: number;
    }): Promise<{
        products: WooCommerceProduct[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    }>;
    createProduct(data: Omit<WooCommerceProduct, 'id' | 'date_created' | 'date_modified'>): Promise<WooCommerceProduct>;
    getOrders(params?: {
        status?: WooCommerceOrderStatus;
        date_range?: {
            after: Date;
            before: Date;
        };
        page?: number;
        per_page?: number;
    }): Promise<{
        orders: WooCommerceOrder[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    }>;
    createOrder(data: Omit<WooCommerceOrder, 'id' | 'order_key' | 'date_created'>): Promise<WooCommerceOrder>;
    getShipments(params?: {
        order_id?: number;
        page?: number;
        per_page?: number;
    }): Promise<{
        shipments: WooCommerceShipment[];
        pagination: {
            total: number;
            page: number;
            per_page: number;
            total_pages: number;
        };
    }>;
    createShipment(data: Omit<WooCommerceShipment, 'id'>): Promise<WooCommerceShipment>;
    getCarriers(): Promise<WooCommerceCarrier[]>;
    getRates(data: {
        order_id: number;
        shipping: WooCommerceOrder['shipping'];
    }): Promise<WooCommerceRate[]>;
}
export {};
//# sourceMappingURL=WooCommerceIntegration.d.ts.map