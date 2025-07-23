import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum AmazonOrderStatus {
    PENDING = "Pending",
    UN_SHIPPED = "Unshipped",
    PARTIALLY_SHIPPED = "PartiallyShipped",
    SHIPPED = "Shipped",
    CANCELED = "Canceled",
    UNFULFILLABLE = "Unfulfillable"
}
export declare enum AmazonFulfillmentMethod {
    FBA = "FBA",// Fulfillment by Amazon
    FBM = "FBM"
}
export interface AmazonProduct {
    asin: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    title: string;
    description?: string;
    price: {
        amount: number;
        currency: string;
    };
    images?: Array<{
        url: NonEmptyString<string>;
        variant: 'MAIN' | 'PT01' | 'SWCH';
    }>;
    category: string;
    status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}
export interface AmazonOrder {
    amazon_order_id: NonEmptyString<string>;
    purchase_date: Timestamp;
    status: AmazonOrderStatus;
    fulfillment_method: AmazonFulfillmentMethod;
    items: Array<{
        order_item_id: NonEmptyString<string>;
        asin: string;
        sku: string;
        quantity: number;
        price: number;
    }>;
    shipping_address: {
        name: string;
        street1: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
}
export interface AmazonInventory {
    asin: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    quantity_available: number;
    quantity_inbound: number;
    warehouse_location?: string;
    last_updated: Timestamp;
}
export interface AmazonReview {
    review_id: NonEmptyString<string>;
    asin: string;
    rating: 1 | 2 | 3 | 4 | 5;
    title: string;
    content: string;
    reviewer_id: string;
    date: Timestamp;
}
export interface AmazonFulfillment {
    fulfillment_id: NonEmptyString<string>;
    amazon_order_id: NonEmptyString<string>;
    status: 'RECEIVED' | 'PLANNING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    shipping_method: string;
    tracking_number?: string;
    shipped_date?: Timestamp;
}
export interface AmazonReport {
    report_id: NonEmptyString<string>;
    report_type: string;
    start_date: Timestamp;
    end_date: Timestamp;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    download_url?: string;
}
export declare class AmazonIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class AmazonIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        limit?: number;
        offset?: number;
        status?: AmazonProduct['status'];
        category?: string;
    }): Promise<{
        products: AmazonProduct[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createProduct(data: Omit<AmazonProduct, 'asin'>): Promise<AmazonProduct>;
    getOrders(params?: {
        status?: AmazonOrderStatus;
        fulfillment_method?: AmazonFulfillmentMethod;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        orders: AmazonOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createOrder(data: Omit<AmazonOrder, 'amazon_order_id' | 'purchase_date'>): Promise<AmazonOrder>;
    getInventory(params?: {
        limit?: number;
        offset?: number;
        sku?: string;
    }): Promise<{
        inventory: AmazonInventory[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createInventory(data: Pick<AmazonInventory, 'sku' | 'quantity_available'>): Promise<AmazonInventory>;
    getReviews(params?: {
        asin?: string;
        rating?: 1 | 2 | 3 | 4 | 5;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        reviews: AmazonReview[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createReview(data: Omit<AmazonReview, 'review_id' | 'date'>): Promise<AmazonReview>;
}
export {};
//# sourceMappingURL=AmazonIntegration.d.ts.map