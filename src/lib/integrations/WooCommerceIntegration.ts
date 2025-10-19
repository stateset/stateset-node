import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum WooCommerceProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
  PENDING = 'pending',
  PRIVATE = 'private',
}

export enum WooCommerceOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  ON_HOLD = 'on-hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

// Core Interfaces
export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  status: WooCommerceProductStatus;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  price: string; // WooCommerce uses string for price
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

// Error Classes
export class WooCommerceIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WooCommerceIntegrationError';
  }
}

export default class WooCommerceIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.woocommerce.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new WooCommerceIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(
    params: {
      status?: WooCommerceProductStatus;
      type?: WooCommerceProduct['type'];
      page?: number;
      per_page?: number; // WooCommerce caps at 100
    } = {}
  ): Promise<{
    products: WooCommerceProduct[];
    pagination: { total: number; page: number; per_page: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.per_page && { per_page: params.per_page.toString() }),
    });

    try {
      const response = await this.request('GET', `wc/v3/products?${query}`);
      return {
        products: response.data,
        pagination: {
          total: parseInt(response.headers['x-wp-total'], 10),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
        },
      };
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(
    data: Omit<WooCommerceProduct, 'id' | 'date_created' | 'date_modified'>
  ): Promise<WooCommerceProduct> {
    this.validateRequestData(data, ['name', 'type']);
    try {
      const response = await this.request('POST', 'wc/v3/products', data);
      return response;
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(
    params: {
      status?: WooCommerceOrderStatus;
      date_range?: { after: Date; before: Date };
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<{
    orders: WooCommerceOrder[];
    pagination: { total: number; page: number; per_page: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.date_range?.after && { after: params.date_range.after.toISOString() }),
      ...(params.date_range?.before && { before: params.date_range.before.toISOString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.per_page && { per_page: params.per_page.toString() }),
    });

    try {
      const response = await this.request('GET', `wc/v3/orders?${query}`);
      return {
        orders: response.data,
        pagination: {
          total: parseInt(response.headers['x-wp-total'], 10),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
        },
      };
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(
    data: Omit<WooCommerceOrder, 'id' | 'order_key' | 'date_created'>
  ): Promise<WooCommerceOrder> {
    this.validateRequestData(data, ['line_items', 'billing']);
    try {
      const response = await this.request('POST', 'wc/v3/orders', data);
      return response;
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getShipments(
    params: {
      order_id?: number;
      page?: number;
      per_page?: number;
    } = {}
  ): Promise<{
    shipments: WooCommerceShipment[];
    pagination: { total: number; page: number; per_page: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.order_id && { order_id: params.order_id.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.per_page && { per_page: params.per_page.toString() }),
    });

    try {
      // Note: WooCommerce core doesn't have a native shipments endpoint; this assumes a shipping plugin
      const response = await this.request('GET', `wc/v3/shipments?${query}`);
      return {
        shipments: response.data,
        pagination: {
          total: parseInt(response.headers['x-wp-total'], 10),
          page: params.page || 1,
          per_page: params.per_page || 10,
          total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
        },
      };
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to fetch shipments', { originalError: error });
    }
  }

  public async createShipment(data: Omit<WooCommerceShipment, 'id'>): Promise<WooCommerceShipment> {
    this.validateRequestData(data, ['order_id', 'tracking_number', 'carrier']);
    try {
      // Note: This assumes a shipping plugin endpoint; adjust based on actual plugin
      const response = await this.request('POST', 'wc/v3/shipments', data);
      return response;
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to create shipment', { originalError: error });
    }
  }

  public async getCarriers(): Promise<WooCommerceCarrier[]> {
    try {
      // Note: WooCommerce doesn't have a native carriers endpoint; this assumes a shipping plugin
      const response = await this.request('GET', 'wc/v3/shipping/carriers');
      return response.data;
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to fetch carriers', { originalError: error });
    }
  }

  public async getRates(data: {
    order_id: number;
    shipping: WooCommerceOrder['shipping'];
  }): Promise<WooCommerceRate[]> {
    this.validateRequestData(data, ['order_id', 'shipping']);
    try {
      // Note: WooCommerce rates typically come from shipping plugins; adjust endpoint accordingly
      const response = await this.request(
        'POST',
        `wc/v3/orders/${data.order_id}/shipping/rates`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new WooCommerceIntegrationError('Failed to fetch rates', { originalError: error });
    }
  }
}
