import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ShopifyProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

export enum ShopifyOrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum ShopifyInventoryAdjustmentType {
  INCREASE = 'increase',
  DECREASE = 'decrease',
  SET = 'set',
}

// Core Interfaces
export interface ShopifyProduct {
  id: NonEmptyString<string>;
  title: string;
  handle: string;
  status: ShopifyProductStatus;
  variants: Array<{
    id: string;
    sku: string;
    price: string; // Shopify uses string for price
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

// Error Classes
export class ShopifyIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ShopifyIntegrationError';
  }
}

export default class ShopifyIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.shopify.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new ShopifyIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(
    params: {
      status?: ShopifyProductStatus;
      limit?: number; // Shopify uses limit up to 250
      page_info?: string; // For cursor-based pagination
      fields?: string[]; // Specific fields to return
    } = {}
  ): Promise<{
    products: ShopifyProduct[];
    pagination: { limit: number; page_info?: string };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page_info && { page_info: params.page_info }),
      ...(params.fields && { fields: params.fields.join(',') }),
    });

    try {
      const response = await this.request('GET', `products?${query}`);
      return {
        products: response.products,
        pagination: { limit: params.limit || 50, page_info: response.next_page_info },
      };
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(
    data: Omit<ShopifyProduct, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ShopifyProduct> {
    this.validateRequestData(data, ['title']);
    try {
      const response = await this.request('POST', 'products', { product: data });
      return response.product;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async updateProduct(
    id: NonEmptyString<string>,
    data: Partial<ShopifyProduct>
  ): Promise<ShopifyProduct> {
    try {
      const response = await this.request('PUT', `products/${id}`, { product: data });
      return response.product;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to update product', {
        originalError: error,
        productId: id,
      });
    }
  }

  public async deleteProduct(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.request('DELETE', `products/${id}`);
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to delete product', {
        originalError: error,
        productId: id,
      });
    }
  }

  public async getOrders(
    params: {
      status?: ShopifyOrderStatus;
      date_range?: { since: Date; until: Date };
      limit?: number;
      page_info?: string;
    } = {}
  ): Promise<{
    orders: ShopifyOrder[];
    pagination: { limit: number; page_info?: string };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.date_range?.since && { created_at_min: params.date_range.since.toISOString() }),
      ...(params.date_range?.until && { created_at_max: params.date_range.until.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page_info && { page_info: params.page_info }),
    });

    try {
      const response = await this.request('GET', `orders?${query}`);
      return {
        orders: response.orders,
        pagination: { limit: params.limit || 50, page_info: response.next_page_info },
      };
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(
    data: Omit<ShopifyOrder, 'id' | 'order_number' | 'created_at'>
  ): Promise<ShopifyOrder> {
    this.validateRequestData(data, ['line_items']);
    try {
      const response = await this.request('POST', 'orders', { order: data });
      return response.order;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async updateOrder(
    id: NonEmptyString<string>,
    data: Partial<ShopifyOrder>
  ): Promise<ShopifyOrder> {
    try {
      const response = await this.request('PUT', `orders/${id}`, { order: data });
      return response.order;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to update order', {
        originalError: error,
        orderId: id,
      });
    }
  }

  public async deleteOrder(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.request('DELETE', `orders/${id}`);
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to delete order', {
        originalError: error,
        orderId: id,
      });
    }
  }

  public async getCustomers(
    params: {
      limit?: number;
      page_info?: string;
      search?: string;
    } = {}
  ): Promise<{
    customers: ShopifyCustomer[];
    pagination: { limit: number; page_info?: string };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page_info && { page_info: params.page_info }),
      ...(params.search && { query: params.search }),
    });

    try {
      const response = await this.request('GET', `customers?${query}`);
      return {
        customers: response.customers,
        pagination: { limit: params.limit || 50, page_info: response.next_page_info },
      };
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to fetch customers', { originalError: error });
    }
  }

  public async createCustomer(
    data: Omit<ShopifyCustomer, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ShopifyCustomer> {
    this.validateRequestData(data, ['email']);
    try {
      const response = await this.request('POST', 'customers', { customer: data });
      return response.customer;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to create customer', { originalError: error });
    }
  }

  public async updateCustomer(
    id: NonEmptyString<string>,
    data: Partial<ShopifyCustomer>
  ): Promise<ShopifyCustomer> {
    try {
      const response = await this.request('PUT', `customers/${id}`, { customer: data });
      return response.customer;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to update customer', {
        originalError: error,
        customerId: id,
      });
    }
  }

  public async deleteCustomer(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.request('DELETE', `customers/${id}`);
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to delete customer', {
        originalError: error,
        customerId: id,
      });
    }
  }

  public async getInventory(
    params: {
      location_id?: string;
      limit?: number;
      page_info?: string;
    } = {}
  ): Promise<{
    inventory_items: ShopifyInventory[];
    pagination: { limit: number; page_info?: string };
  }> {
    const query = new URLSearchParams({
      ...(params.location_id && { location_ids: params.location_id }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page_info && { page_info: params.page_info }),
    });

    try {
      const response = await this.request('GET', `inventory_items?${query}`);
      return {
        inventory_items: response.inventory_items,
        pagination: { limit: params.limit || 50, page_info: response.next_page_info },
      };
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to fetch inventory', { originalError: error });
    }
  }

  public async createInventory(data: {
    variant_id: string;
    location_id: string;
    available: number;
  }): Promise<ShopifyInventory> {
    this.validateRequestData(data, ['variant_id', 'location_id', 'available']);
    if (data.available < 0) {
      throw new ShopifyIntegrationError('Available quantity cannot be negative');
    }
    try {
      const response = await this.request('POST', 'inventory_levels/set', { inventory_item: data });
      return response.inventory_item;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to create inventory', { originalError: error });
    }
  }

  public async updateInventory(
    id: NonEmptyString<string>,
    data: { available: number; adjustment_type?: ShopifyInventoryAdjustmentType }
  ): Promise<ShopifyInventory> {
    this.validateRequestData(data, ['available']);
    if (data.available < 0) {
      throw new ShopifyIntegrationError('Available quantity cannot be negative');
    }
    try {
      const endpoint =
        data.adjustment_type === ShopifyInventoryAdjustmentType.SET
          ? 'inventory_levels/set'
          : 'inventory_levels/adjust';
      const response = await this.request('PUT', endpoint, { inventory_item_id: id, ...data });
      return response.inventory_item;
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to update inventory', {
        originalError: error,
        inventoryItemId: id,
      });
    }
  }

  public async deleteInventory(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.request('DELETE', `inventory_levels/${id}`);
    } catch (error: any) {
      throw new ShopifyIntegrationError('Failed to delete inventory', {
        originalError: error,
        inventoryItemId: id,
      });
    }
  }
}
