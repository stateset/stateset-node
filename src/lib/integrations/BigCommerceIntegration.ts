import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum BigCommerceProductStatus {
  ACTIVE = 0,
  DISABLED = 1,
  DRAFT = 2,
}

export enum BigCommerceOrderStatus {
  PENDING = 1,
  AWAITING_PAYMENT = 2,
  AWAITING_FULFILLMENT = 3,
  AWAITING_SHIPMENT = 4,
  PARTIALLY_SHIPPED = 7,
  SHIPPED = 9,
  COMPLETED = 10,
  CANCELLED = 11,
}

// Core Interfaces
export interface BigCommerceProduct {
  id: number;
  name: string;
  sku: string;
  type: 'physical' | 'digital';
  status: BigCommerceProductStatus;
  price: string; // BigCommerce uses string for price
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

// Error Classes
export class BigCommerceIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BigCommerceIntegrationError';
  }
}

export default class BigCommerceIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.bigcommerce.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new BigCommerceIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(
    params: {
      status?: BigCommerceProductStatus;
      limit?: number; // BigCommerce typically caps at 250
      page?: number;
      include?: 'variants' | 'images' | 'custom_fields';
    } = {}
  ): Promise<{
    products: BigCommerceProduct[];
    pagination: { total: number; page: number; limit: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.include && { include: params.include }),
    });

    try {
      const response = await this.request('GET', `catalog/products?${query}`);
      return {
        products: response.data,
        pagination: {
          total: response.meta.pagination.total,
          page: response.meta.pagination.current_page,
          limit: response.meta.pagination.per_page,
          total_pages: response.meta.pagination.total_pages,
        },
      };
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(
    data: Omit<BigCommerceProduct, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BigCommerceProduct> {
    this.validateRequestData(data, ['name', 'type', 'price', 'weight']);
    try {
      const response = await this.request('POST', 'catalog/products', data);
      return response.data;
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(
    params: {
      status_id?: BigCommerceOrderStatus;
      date_range?: { min_date: Date; max_date: Date };
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{
    orders: BigCommerceOrder[];
    pagination: { total: number; page: number; limit: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status_id && { status_id: params.status_id.toString() }),
      ...(params.date_range?.min_date && {
        min_date_created: params.date_range.min_date.toISOString(),
      }),
      ...(params.date_range?.max_date && {
        max_date_created: params.date_range.max_date.toISOString(),
      }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page && { page: params.page.toString() }),
    });

    try {
      const response = await this.request('GET', `orders?${query}`);
      return {
        orders: response.data,
        pagination: {
          total: response.meta.pagination.total,
          page: response.meta.pagination.current_page,
          limit: response.meta.pagination.per_page,
          total_pages: response.meta.pagination.total_pages,
        },
      };
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(
    data: Omit<BigCommerceOrder, 'id' | 'date_created'>
  ): Promise<BigCommerceOrder> {
    this.validateRequestData(data, ['products', 'billing_address']);
    try {
      const response = await this.request('POST', 'orders', data);
      return response.data;
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getShipments(
    params: {
      order_id?: number;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{
    shipments: BigCommerceShipment[];
    pagination: { total: number; page: number; limit: number; total_pages: number };
  }> {
    const query = new URLSearchParams({
      ...(params.order_id && { order_id: params.order_id.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page && { page: params.page.toString() }),
    });

    try {
      const response = await this.request('GET', `orders/shipments?${query}`);
      return {
        shipments: response.data,
        pagination: {
          total: response.meta.pagination.total,
          page: response.meta.pagination.current_page,
          limit: response.meta.pagination.per_page,
          total_pages: response.meta.pagination.total_pages,
        },
      };
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to fetch shipments', { originalError: error });
    }
  }

  public async createShipment(
    data: Omit<BigCommerceShipment, 'id' | 'date_created'>
  ): Promise<BigCommerceShipment> {
    this.validateRequestData(data, ['order_id', 'tracking_number', 'items']);
    try {
      const response = await this.request('POST', `orders/${data.order_id}/shipments`, data);
      return response.data;
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to create shipment', { originalError: error });
    }
  }

  public async getCarriers(): Promise<BigCommerceCarrier[]> {
    try {
      const response = await this.request('GET', 'shipping/carriers');
      return response.data;
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to fetch carriers', { originalError: error });
    }
  }

  public async getRates(data: {
    order_id: number;
    shipping_address: BigCommerceOrder['shipping_addresses'][0];
  }): Promise<BigCommerceRate[]> {
    this.validateRequestData(data, ['order_id', 'shipping_address']);
    try {
      const response = await this.request('POST', `orders/${data.order_id}/shipping_rates`, {
        shipping_address: data.shipping_address,
      });
      return response.data;
    } catch (error: any) {
      throw new BigCommerceIntegrationError('Failed to fetch shipping rates', {
        originalError: error,
      });
    }
  }
}
