import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum TikTokOrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum TikTokFulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Core Interfaces
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

// Error Classes
export class TikTokShopIntegrationError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'TikTokShopIntegrationError';
  }
}

export default class TikTokShopIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.tiktokshop.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!(field) || !data[field as keyof T]) {
        throw new TikTokShopIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(params: {
    status?: TikTokProduct['status'];
    category_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    products: TikTokProduct[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.category_id && { category_id: params.category_id }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `products?${query}`);
      return {
        products: response.products,
        pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(data: Omit<TikTokProduct, 'product_id'>): Promise<TikTokProduct> {
    this.validateRequestData(data, ['sku', 'name', 'price', 'images', 'category_id']);
    try {
      return await this.request('POST', 'products', data);
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(params: {
    status?: TikTokOrderStatus;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    orders: TikTokOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `orders?${query}`);
      return {
        orders: response.orders,
        pagination: response.pagination || { total: response.orders.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(data: Omit<TikTokOrder, 'order_id' | 'order_number' | 'created_at'>): Promise<TikTokOrder> {
    this.validateRequestData(data, ['items', 'shipping_address', 'total_amount']);
    try {
      return await this.request('POST', 'orders', data);
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getCustomers(params: {
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    customers: TikTokCustomer[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.search && { search: params.search }),
    });

    try {
      const response = await this.request('GET', `customers?${query}`);
      return {
        customers: response.customers,
        pagination: response.pagination || { total: response.customers.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to fetch customers', { originalError: error });
    }
  }

  public async createCustomer(data: Omit<TikTokCustomer, 'customer_id' | 'created_at'>): Promise<TikTokCustomer> {
    this.validateRequestData(data, ['name']);
    try {
      return await this.request('POST', 'customers', data);
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to create customer', { originalError: error });
    }
  }

  public async getReviews(params: {
    product_id?: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    reviews: TikTokReview[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.product_id && { product_id: params.product_id }),
      ...(params.rating && { rating: params.rating.toString() }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `reviews?${query}`);
      return {
        reviews: response.reviews,
        pagination: response.pagination || { total: response.reviews.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to fetch reviews', { originalError: error });
    }
  }

  public async createReview(data: Omit<TikTokReview, 'review_id' | 'created_at'>): Promise<TikTokReview> {
    this.validateRequestData(data, ['product_id', 'order_id', 'rating', 'reviewer_id']);
    try {
      return await this.request('POST', 'reviews', data);
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to create review', { originalError: error });
    }
  }

  public async getFulfillments(params: {
    status?: TikTokFulfillmentStatus;
    order_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    fulfillments: TikTokFulfillment[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `fulfillments?${query}`);
      return {
        fulfillments: response.fulfillments,
        pagination: response.pagination || { total: response.fulfillments.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to fetch fulfillments', { originalError: error });
    }
  }

  public async createFulfillment(data: Omit<TikTokFulfillment, 'fulfillment_id'>): Promise<TikTokFulfillment> {
    this.validateRequestData(data, ['order_id', 'status']);
    try {
      return await this.request('POST', 'fulfillments', data);
    } catch (error: any) {
      throw new TikTokShopIntegrationError('Failed to create fulfillment', { originalError: error });
    }
  }
}