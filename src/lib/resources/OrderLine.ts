import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum OrderLineStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  BACKORDERED = 'BACKORDERED',
  RETURNED = 'RETURNED',
}

export enum OrderLineType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  DIGITAL = 'DIGITAL',
  BUNDLE = 'BUNDLE',
}

// Core Interfaces
export interface OrderLineItem {
  product_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency: string;
  tax_amount?: number;
  discount_amount?: number;
}

export interface OrderLineData {
  order_id: NonEmptyString<string>;
  type: OrderLineType;
  status: OrderLineStatus;
  item: OrderLineItem;
  fulfillment?: {
    warehouse_id: string;
    shipped_at?: Timestamp;
    tracking_number?: string;
    carrier?: string;
  };
  pricing: {
    subtotal: number;
    total: number;
    discounts_applied?: Array<{
      discount_id: string;
      amount: number;
      description?: string;
    }>;
    taxes_applied?: Array<{
      tax_id: string;
      amount: number;
      rate: number;
    }>;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status_history: Array<{
    status: OrderLineStatus;
    changed_at: Timestamp;
    changed_by: string;
    reason?: string;
  }>;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type
export interface OrderLineResponse {
  id: NonEmptyString<string>;
  object: 'order_line';
  data: OrderLineData;
}

// Error Classes
export class OrderLineError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OrderLineNotFoundError extends OrderLineError {
  constructor(orderLineId: string) {
    super(`Order line with ID ${orderLineId} not found`, { orderLineId });
  }
}

export class OrderLineValidationError extends OrderLineError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Main OrderLines Class
export class OrderLines {
  constructor(private readonly client: ApiClientLike) {}

  private validateOrderLineData(data: OrderLineData): void {
    if (!data.order_id) {
      throw new OrderLineValidationError('Order ID is required');
    }
    if (!data.item?.product_id) {
      throw new OrderLineValidationError('Product ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new OrderLineValidationError('Valid quantity is required');
    }
    if (data.pricing.subtotal < 0 || data.pricing.total < 0) {
      throw new OrderLineValidationError('Pricing amounts cannot be negative');
    }
  }

  private mapResponse(data: any): OrderLineResponse {
    if (!data?.id || !data.order_id) {
      throw new OrderLineError('Invalid response format');
    }

    return {
      id: data.id,
      object: 'order_line',
      data: {
        order_id: data.order_id,
        type: data.type,
        status: data.status,
        item: data.item,
        fulfillment: data.fulfillment,
        pricing: data.pricing,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status_history: data.status_history || [],
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(
    params: {
      order_id?: string;
      status?: OrderLineStatus;
      type?: OrderLineType;
      org_id?: string;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    order_lines: OrderLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.client.request('GET', `order_line_items?${query}`);
      return {
        order_lines: response.order_lines.map(this.mapResponse),
        pagination: response.pagination || {
          total: response.order_lines.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(orderLineId: NonEmptyString<string>): Promise<OrderLineResponse> {
    try {
      const response = await this.client.request('GET', `order_line_items/${orderLineId}`);
      return this.mapResponse(response.order_line);
    } catch (error: any) {
      throw this.handleError(error, 'get', orderLineId);
    }
  }

  async create(data: OrderLineData): Promise<OrderLineResponse> {
    this.validateOrderLineData(data);
    try {
      const response = await this.client.request('POST', 'order_line_items', data);
      return this.mapResponse(response.order_line);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    orderLineId: NonEmptyString<string>,
    data: Partial<OrderLineData>
  ): Promise<OrderLineResponse> {
    try {
      const response = await this.client.request('PUT', `order_line_items/${orderLineId}`, data);
      return this.mapResponse(response.order_line);
    } catch (error: any) {
      throw this.handleError(error, 'update', orderLineId);
    }
  }

  async delete(orderLineId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `order_line_items/${orderLineId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', orderLineId);
    }
  }

  async updateStatus(
    orderLineId: NonEmptyString<string>,
    status: OrderLineStatus,
    reason?: string
  ): Promise<OrderLineResponse> {
    try {
      const response = await this.client.request('POST', `order_line_items/${orderLineId}/status`, {
        status,
        reason,
      });
      return this.mapResponse(response.order_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', orderLineId);
    }
  }

  async updateFulfillment(
    orderLineId: NonEmptyString<string>,
    fulfillmentData: Partial<OrderLineData['fulfillment']>
  ): Promise<OrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `order_line_items/${orderLineId}/fulfillment`,
        fulfillmentData
      );
      return this.mapResponse(response.order_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateFulfillment', orderLineId);
    }
  }

  async getMetrics(
    params: {
      order_id?: string;
      org_id?: string;
      date_range?: { from: Date; to: Date };
    } = {}
  ): Promise<{
    total_lines: number;
    status_breakdown: Record<OrderLineStatus, number>;
    type_breakdown: Record<OrderLineType, number>;
    average_line_value: number;
    fulfillment_rate: number;
  }> {
    const query = new URLSearchParams({
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    try {
      const response = await this.client.request('GET', `order_line_items/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, _operation: string, _orderLineId?: string): never {
    throw error;
  }
}

export default OrderLines;
