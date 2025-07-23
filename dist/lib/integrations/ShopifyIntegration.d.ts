import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ShopifyProductStatus {
    ACTIVE = "active",
    DRAFT = "draft",
    ARCHIVED = "archived"
}
export declare enum ShopifyOrderStatus {
    OPEN = "open",
    CLOSED = "closed",
    CANCELLED = "cancelled",
    PENDING = "pending"
}
export declare enum ShopifyInventoryAdjustmentType {
    INCREASE = "increase",
    DECREASE = "decrease",
    SET = "set"
}
export interface ShopifyProduct {
    id: NonEmptyString<string>;
    title: string;
    handle: string;
    status: ShopifyProductStatus;
    variants: Array<{
        id: string;
        sku: string;
        price: string;
        inventory_quantity: number;
        weight?: number;
        weight_unit?: 'g' | 'kg' | 'oz' | 'lb';
    }>;
    images: Array<{
        id: string;
        src: NonEmptyString<string>;
        alt?: string;
    }>;
    created_at: Timestamp;
    updated_at: Timestamp;
}
export interface ShopifyOrder {
    id: NonEmptyString<string>;
    order_number: number;
    status: ShopifyOrderStatus;
    created_at: Timestamp;
    line_items: Array<{
        id: string;
        variant_id: string;
        quantity: number;
        price: string;
        sku?: string;
    }>;
    customer: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
    };
    shipping_address?: {
        first_name: string;
        last_name: string;
        address1: string;
        city: string;
        province: string;
        zip: string;
        country: string;
    };
    total_price: string;
    currency: string;
}
export interface ShopifyCustomer {
    id: NonEmptyString<string>;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    accepts_marketing?: boolean;
    addresses: Array<{
        id: string;
        address1: string;
        city: string;
        province: string;
        zip: string;
        country: string;
    }>;
}
export interface ShopifyInventory {
    inventory_item_id: NonEmptyString<string>;
    variant_id: string;
    location_id: string;
    available: number;
    updated_at: Timestamp;
}
export declare class ShopifyIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class ShopifyIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        status?: ShopifyProductStatus;
        limit?: number;
        page_info?: string;
        fields?: string[];
    }): Promise<{
        products: ShopifyProduct[];
        pagination: {
            limit: number;
            page_info?: string;
        };
    }>;
    createProduct(data: Omit<ShopifyProduct, 'id' | 'created_at' | 'updated_at'>): Promise<ShopifyProduct>;
    updateProduct(id: NonEmptyString<string>, data: Partial<ShopifyProduct>): Promise<ShopifyProduct>;
    deleteProduct(id: NonEmptyString<string>): Promise<void>;
    getOrders(params?: {
        status?: ShopifyOrderStatus;
        date_range?: {
            since: Date;
            until: Date;
        };
        limit?: number;
        page_info?: string;
    }): Promise<{
        orders: ShopifyOrder[];
        pagination: {
            limit: number;
            page_info?: string;
        };
    }>;
    createOrder(data: Omit<ShopifyOrder, 'id' | 'order_number' | 'created_at'>): Promise<ShopifyOrder>;
    updateOrder(id: NonEmptyString<string>, data: Partial<ShopifyOrder>): Promise<ShopifyOrder>;
    deleteOrder(id: NonEmptyString<string>): Promise<void>;
    getCustomers(params?: {
        limit?: number;
        page_info?: string;
        search?: string;
    }): Promise<{
        customers: ShopifyCustomer[];
        pagination: {
            limit: number;
            page_info?: string;
        };
    }>;
    createCustomer(data: Omit<ShopifyCustomer, 'id' | 'created_at' | 'updated_at'>): Promise<ShopifyCustomer>;
    updateCustomer(id: NonEmptyString<string>, data: Partial<ShopifyCustomer>): Promise<ShopifyCustomer>;
    deleteCustomer(id: NonEmptyString<string>): Promise<void>;
    getInventory(params?: {
        location_id?: string;
        limit?: number;
        page_info?: string;
    }): Promise<{
        inventory_items: ShopifyInventory[];
        pagination: {
            limit: number;
            page_info?: string;
        };
    }>;
    createInventory(data: {
        variant_id: string;
        location_id: string;
        available: number;
    }): Promise<ShopifyInventory>;
    updateInventory(id: NonEmptyString<string>, data: {
        available: number;
        adjustment_type?: ShopifyInventoryAdjustmentType;
    }): Promise<ShopifyInventory>;
    deleteInventory(id: NonEmptyString<string>): Promise<void>;
}
export {};
//# sourceMappingURL=ShopifyIntegration.d.ts.map