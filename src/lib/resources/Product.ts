// lib/resources/Product.ts
import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  DISCONTINUED = 'DISCONTINUED'
}

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  BUNDLE = 'BUNDLE'
}

// Core Interfaces
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

// Response Type
export interface ProductResponse {
  id: NonEmptyString<string>;
  object: 'product';
  data: ProductData;
}

// Error Classes
export class ProductError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ProductNotFoundError extends ProductError {
  constructor(productId: string) {
    super(`Product with ID ${productId} not found`, { productId });
  }
}

export class ProductValidationError extends ProductError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Products {
  constructor(private client: stateset) {}

  private validateProductData(data: ProductData): void {
    if (!data.name) throw new ProductValidationError('Product name is required');
    if (!data.sku) throw new ProductValidationError('SKU is required');
    if (data.price < 0) throw new ProductValidationError('Price cannot be negative');
    if (data.cost && data.cost < 0) throw new ProductValidationError('Cost cannot be negative');
  }

  private mapResponse(data: any): ProductResponse {
    if (!data?.id) throw new ProductError('Invalid response format');
    return {
      id: data.id,
      object: 'product',
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        sku: data.sku,
        description: data.description,
        price: data.price,
        cost: data.cost,
        currency: data.currency,
        variants: data.variants,
        inventory: data.inventory,
        categories: data.categories,
        tags: data.tags,
        images: data.images,
        specifications: data.specifications,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async create(data: ProductData): Promise<ProductResponse> {
    this.validateProductData(data);
    try {
      const response = await this.client.request('POST', 'products', data);
      return this.mapResponse(response.product);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async get(id: NonEmptyString<string>): Promise<ProductResponse> {
    try {
      const response = await this.client.request('GET', `products/${id}`);
      return this.mapResponse(response.product);
    } catch (error: any) {
      throw this.handleError(error, 'get', id);
    }
  }

  async update(id: NonEmptyString<string>, data: Partial<ProductData>): Promise<ProductResponse> {
    try {
      const response = await this.client.request('PUT', `products/${id}`, data);
      return this.mapResponse(response.product);
    } catch (error: any) {
      throw this.handleError(error, 'update', id);
    }
  }

  async list(params: {
    status?: ProductStatus;
    type?: ProductType;
    category?: string;
    tag?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    products: ProductResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.category && { category: params.category }),
      ...(params.tag && { tag: params.tag }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.search && { search: params.search }),
    });

    try {
      const response = await this.client.request('GET', `products?${query.toString()}`);
      return {
        products: response.products.map(this.mapResponse),
        pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async delete(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `products/${id}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', id);
    }
  }

  async getInventory(id: NonEmptyString<string>): Promise<ProductInventory[]> {
    try {
      const response = await this.client.request('GET', `products/${id}/inventory`);
      return response.inventory;
    } catch (error: any) {
      throw this.handleError(error, 'getInventory', id);
    }
  }

  async updateInventory(
    id: NonEmptyString<string>,
    data: Partial<ProductInventory> & { warehouse_id: string }
  ): Promise<ProductInventory> {
    if (!data.warehouse_id) throw new ProductValidationError('Warehouse ID is required for inventory update');
    if (data.quantity && data.quantity < 0) throw new ProductValidationError('Inventory quantity cannot be negative');

    try {
      const response = await this.client.request('PUT', `products/${id}/inventory`, data);
      return response.inventory;
    } catch (error: any) {
      throw this.handleError(error, 'updateInventory', id);
    }
  }

  async getMetrics(params: {
    org_id?: string;
    date_range?: { from: Date; to: Date };
    type?: ProductType;
  } = {}): Promise<{
    total_products: number;
    status_breakdown: Record<ProductStatus, number>;
    type_breakdown: Record<ProductType, number>;
    average_price: number;
    inventory_metrics: {
      total_quantity: number;
      low_stock_count: number;
      out_of_stock_count: number;
    };
  }> {
    const query = new URLSearchParams({
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.type && { type: params.type }),
    });

    try {
      const response = await this.client.request('GET', `products/metrics?${query.toString()}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  async addVariant(
    id: NonEmptyString<string>,
    variantData: Omit<ProductVariant, 'variant_id'>
  ): Promise<ProductResponse> {
    try {
      const response = await this.client.request('POST', `products/${id}/variants`, variantData);
      return this.mapResponse(response.product);
    } catch (error: any) {
      throw this.handleError(error, 'addVariant', id);
    }
  }

  private handleError(error: any, operation: string, productId?: string): never {
    if (error.status === 404) throw new ProductNotFoundError(productId || 'unknown');
    if (error.status === 400) throw new ProductValidationError(error.message, error.errors);
    throw new ProductError(
      `Failed to ${operation} product: ${error.message}`,
      { operation, originalError: error }
    );
  }
}