import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum TikTokOrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    RETURNED = "RETURNED"
}
export declare enum TikTokFulfillmentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export interface TikTokProduct {
    product_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    name: string;
    description?: string;
    price: {
        amount: number;
        currency: string;
    };
    images: Array<{
        url: NonEmptyString<string>;
        type: 'MAIN' | 'DETAIL';
    }>;
    category_id: string;
    status: 'LIVE' | 'DRAFT' | 'ARCHIVED';
    inventory: {
        quantity: number;
        last_updated: Timestamp;
    };
}
export interface TikTokOrder {
    order_id: NonEmptyString<string>;
    order_number: string;
    created_at: Timestamp;
    status: TikTokOrderStatus;
    items: Array<{
        item_id: NonEmptyString<string>;
        sku: string;
        quantity: number;
        unit_price: number;
    }>;
    shipping_address: {
        full_name: string;
        address_line1: string;
        city: string;
        region: string;
        postal_code: string;
        country_code: string;
    };
    total_amount: {
        amount: number;
        currency: string;
    };
}
export interface TikTokCustomer {
    customer_id: NonEmptyString<string>;
    email?: string;
    phone?: string;
    name: string;
    created_at: Timestamp;
    last_purchase?: Timestamp;
}
export interface TikTokReview {
    review_id: NonEmptyString<string>;
    product_id: string;
    order_id: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment?: string;
    created_at: Timestamp;
    reviewer_id: string;
}
export interface TikTokFulfillment {
    fulfillment_id: NonEmptyString<string>;
    order_id: NonEmptyString<string>;
    status: TikTokFulfillmentStatus;
    tracking_number?: string;
    carrier?: string;
    shipped_at?: Timestamp;
    delivered_at?: Timestamp;
}
export declare class TikTokShopIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class TikTokShopIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        status?: TikTokProduct['status'];
        category_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        products: TikTokProduct[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createProduct(data: Omit<TikTokProduct, 'product_id'>): Promise<TikTokProduct>;
    getOrders(params?: {
        status?: TikTokOrderStatus;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        orders: TikTokOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createOrder(data: Omit<TikTokOrder, 'order_id' | 'order_number' | 'created_at'>): Promise<TikTokOrder>;
    getCustomers(params?: {
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        customers: TikTokCustomer[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createCustomer(data: Omit<TikTokCustomer, 'customer_id' | 'created_at'>): Promise<TikTokCustomer>;
    getReviews(params?: {
        product_id?: string;
        rating?: 1 | 2 | 3 | 4 | 5;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        reviews: TikTokReview[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createReview(data: Omit<TikTokReview, 'review_id' | 'created_at'>): Promise<TikTokReview>;
    getFulfillments(params?: {
        status?: TikTokFulfillmentStatus;
        order_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        fulfillments: TikTokFulfillment[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createFulfillment(data: Omit<TikTokFulfillment, 'fulfillment_id'>): Promise<TikTokFulfillment>;
}
export {};
//# sourceMappingURL=TikTokShopIntegration.d.ts.map