import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum AmazonOrderStatus {
  PENDING = 'Pending',
  UN_SHIPPED = 'Unshipped',
  PARTIALLY_SHIPPED = 'PartiallyShipped',
  SHIPPED = 'Shipped',
  CANCELED = 'Canceled',
  UNFULFILLABLE = 'Unfulfillable',
}

export enum AmazonFulfillmentMethod {
  FBA = 'FBA', // Fulfillment by Amazon
  FBM = 'FBM', // Fulfillment by Merchant
}

// Core Interfaces
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

// Error Classes
export class AmazonIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AmazonIntegrationError';
  }
}

export default class AmazonIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.amazon.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new AmazonIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(
    params: {
      limit?: number;
      offset?: number;
      status?: AmazonProduct['status'];
      category?: string;
    } = {}
  ): Promise<{
    products: AmazonProduct[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.status && { status: params.status }),
      ...(params.category && { category: params.category }),
    });

    try {
      const response = await this.request('GET', `products?${query.toString()}`);
      return {
        products: response.products,
        pagination: response.pagination || {
          total: response.products.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(data: Omit<AmazonProduct, 'asin'>): Promise<AmazonProduct> {
    this.validateRequestData(data, ['sku', 'title', 'price']);
    try {
      return await this.request('POST', 'products', data);
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(
    params: {
      status?: AmazonOrderStatus;
      fulfillment_method?: AmazonFulfillmentMethod;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    orders: AmazonOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.fulfillment_method && { fulfillment_method: params.fulfillment_method }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `orders?${query.toString()}`);
      return {
        orders: response.orders,
        pagination: response.pagination || {
          total: response.orders.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(
    data: Omit<AmazonOrder, 'amazon_order_id' | 'purchase_date'>
  ): Promise<AmazonOrder> {
    this.validateRequestData(data, ['items', 'shipping_address']);
    try {
      return await this.request('POST', 'orders', data);
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getInventory(
    params: {
      limit?: number;
      offset?: number;
      sku?: string;
    } = {}
  ): Promise<{
    inventory: AmazonInventory[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.sku && { sku: params.sku }),
    });

    try {
      const response = await this.request('GET', `inventory?${query.toString()}`);
      return {
        inventory: response.inventory,
        pagination: response.pagination || {
          total: response.inventory.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to fetch inventory', { originalError: error });
    }
  }

  public async createInventory(
    data: Pick<AmazonInventory, 'sku' | 'quantity_available'>
  ): Promise<AmazonInventory> {
    this.validateRequestData(data, ['sku', 'quantity_available']);
    if (data.quantity_available < 0) {
      throw new AmazonIntegrationError('Quantity available cannot be negative');
    }
    try {
      return await this.request('POST', 'inventory', data);
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to create inventory', { originalError: error });
    }
  }

  public async getReviews(
    params: {
      asin?: string;
      rating?: 1 | 2 | 3 | 4 | 5;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    reviews: AmazonReview[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.asin && { asin: params.asin }),
      ...(params.rating && { rating: params.rating.toString() }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.request('GET', `reviews?${query.toString()}`);
      return {
        reviews: response.reviews,
        pagination: response.pagination || {
          total: response.reviews.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new AmazonIntegrationError('Failed to fetch reviews', { originalError: error });
    }
  }

  public async createReview(data: Omit<AmazonReview, 'review_id' | 'date'>): Promise<AmazonReview> {
    this.validateRequestData(data, ['asin', 'rating', 'title', 'content', 'reviewer_id']);
    try {
      return await this.request('POST', 'reviews', data);
    } catch (error: any) {
      return error;
    }
  }
}
