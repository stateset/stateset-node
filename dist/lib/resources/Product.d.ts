import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ProductStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DRAFT = "DRAFT",
    DISCONTINUED = "DISCONTINUED"
}
export declare enum ProductType {
    PHYSICAL = "PHYSICAL",
    DIGITAL = "DIGITAL",
    SERVICE = "SERVICE",
    BUNDLE = "BUNDLE"
}
export interface ProductVariant {
    variant_id: NonEmptyString<string>;
    sku: NonEmptyString<string>;
    attributes: Record<string, string>;
    price: number;
    inventory_quantity: number;
    weight?: {
        value: number;
        unit: 'LB' | 'KG' | 'OZ';
    };
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: 'IN' | 'CM';
    };
}
export interface ProductInventory {
    quantity: number;
    warehouse_id: NonEmptyString<string>;
    location?: string;
    last_updated: Timestamp;
    minimum_stock_level?: number;
    reorder_point?: number;
    reserved_quantity?: number;
}
export interface ProductData {
    name: NonEmptyString<string>;
    type: ProductType;
    status: ProductStatus;
    sku: NonEmptyString<string>;
    description?: string;
    price: number;
    cost?: number;
    currency: string;
    variants?: ProductVariant[];
    inventory?: ProductInventory[];
    categories?: string[];
    tags?: string[];
    images?: Array<{
        url: NonEmptyString<string>;
        alt_text?: string;
        is_primary?: boolean;
    }>;
    specifications?: Record<string, string>;
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, unknown>;
}
export interface ProductResponse {
    id: NonEmptyString<string>;
    object: 'product';
    data: ProductData;
}
export declare class ProductError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class ProductNotFoundError extends ProductError {
    constructor(productId: string);
}
export declare class ProductValidationError extends ProductError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class Products {
    private client;
    constructor(client: stateset);
    private validateProductData;
    private mapResponse;
    create(data: ProductData): Promise<ProductResponse>;
    get(id: NonEmptyString<string>): Promise<ProductResponse>;
    update(id: NonEmptyString<string>, data: Partial<ProductData>): Promise<ProductResponse>;
    list(params?: {
        status?: ProductStatus;
        type?: ProductType;
        category?: string;
        tag?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        products: ProductResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    delete(id: NonEmptyString<string>): Promise<void>;
    getInventory(id: NonEmptyString<string>): Promise<ProductInventory[]>;
    updateInventory(id: NonEmptyString<string>, data: Partial<ProductInventory> & {
        warehouse_id: string;
    }): Promise<ProductInventory>;
    getMetrics(params?: {
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        type?: ProductType;
    }): Promise<{
        total_products: number;
        status_breakdown: Record<ProductStatus, number>;
        type_breakdown: Record<ProductType, number>;
        average_price: number;
        inventory_metrics: {
            total_quantity: number;
            low_stock_count: number;
            out_of_stock_count: number;
        };
    }>;
    addVariant(id: NonEmptyString<string>, variantData: Omit<ProductVariant, 'variant_id'>): Promise<ProductResponse>;
    private handleError;
}
export {};
