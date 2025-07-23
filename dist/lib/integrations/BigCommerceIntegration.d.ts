import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum BigCommerceProductStatus {
    ACTIVE = 0,
    DISABLED = 1,
    DRAFT = 2
}
export declare enum BigCommerceOrderStatus {
    PENDING = 1,
    AWAITING_PAYMENT = 2,
    AWAITING_FULFILLMENT = 3,
    AWAITING_SHIPMENT = 4,
    PARTIALLY_SHIPPED = 7,
    SHIPPED = 9,
    COMPLETED = 10,
    CANCELLED = 11
}
export interface BigCommerceProduct {
    id: number;
    name: string;
    sku: string;
    type: 'physical' | 'digital';
    status: BigCommerceProductStatus;
    price: string;
    weight: number;
    variants?: Array<{
        id: number;
        sku: string;
        price?: string;
        inventory_level: number;
    }>;
    images?: Array<{
        id: number;
        url_standard: NonEmptyString<string>;
        is_thumbnail: boolean;
    }>;
    created_at: Timestamp;
    updated_at: Timestamp;
}
export interface BigCommerceOrder {
    id: number;
    status_id: BigCommerceOrderStatus;
    date_created: Timestamp;
    products: Array<{
        id: number;
        product_id: number;
        variant_id?: number;
        quantity: number;
        price_inc_tax: string;
        sku: string;
    }>;
    billing_address: {
        first_name: string;
        last_name: string;
        street_1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    shipping_addresses: Array<{
        id: number;
        first_name: string;
        last_name: string;
        street_1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    }>;
    total_inc_tax: string;
    currency_code: string;
}
export interface BigCommerceShipment {
    id: number;
    order_id: number;
    tracking_number: string;
    tracking_carrier?: string;
    shipping_method: string;
    date_created: Timestamp;
    items: Array<{
        order_product_id: number;
        quantity: number;
    }>;
}
export interface BigCommerceCarrier {
    id: string;
    name: string;
    available_services: Array<{
        id: string;
        name: string;
        code: string;
    }>;
}
export interface BigCommerceRate {
    carrier_id: string;
    service_code: string;
    cost: {
        amount: number;
        currency: string;
    };
    estimated_transit_time: string;
}
export declare class BigCommerceIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class BigCommerceIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        status?: BigCommerceProductStatus;
        limit?: number;
        page?: number;
        include?: 'variants' | 'images' | 'custom_fields';
    }): Promise<{
        products: BigCommerceProduct[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }>;
    createProduct(data: Omit<BigCommerceProduct, 'id' | 'created_at' | 'updated_at'>): Promise<BigCommerceProduct>;
    getOrders(params?: {
        status_id?: BigCommerceOrderStatus;
        date_range?: {
            min_date: Date;
            max_date: Date;
        };
        limit?: number;
        page?: number;
    }): Promise<{
        orders: BigCommerceOrder[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }>;
    createOrder(data: Omit<BigCommerceOrder, 'id' | 'date_created'>): Promise<BigCommerceOrder>;
    getShipments(params?: {
        order_id?: number;
        limit?: number;
        page?: number;
    }): Promise<{
        shipments: BigCommerceShipment[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }>;
    createShipment(data: Omit<BigCommerceShipment, 'id' | 'date_created'>): Promise<BigCommerceShipment>;
    getCarriers(): Promise<BigCommerceCarrier[]>;
    getRates(data: {
        order_id: number;
        shipping_address: BigCommerceOrder['shipping_addresses'][0];
    }): Promise<BigCommerceRate[]>;
}
export {};
//# sourceMappingURL=BigCommerceIntegration.d.ts.map