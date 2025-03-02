import { stateset } from '../../stateset-client';

// Constants and Enums
const DEFAULT_CURRENCY = 'USD';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PICKING = 'PICKING',
  PACKING = 'PACKING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export enum FulfillmentPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

// Base Interfaces
interface Metadata {
  [key: string]: any;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

// Core Data Structures
export interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  metadata?: Metadata & {
    weight?: number;
    dimensions?: Dimensions;
  };
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  street_address1: string;
  street_address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
  delivery_instructions?: string;
}

export interface PaymentDetails {
  payment_method: string;
  transaction_id?: string;
  status: PaymentStatus;
  amount_paid: number;
  currency: string;
  payment_date?: string;
  refund_details?: Array<{
    refund_id: string;
    amount: number;
    reason: string;
    date: string;
  }>;
}

export interface ShippingDetails {
  carrier: string;
  method: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  shipping_cost: number;
  tracking_url?: string;
  label_url?: string;
  package_details?: {
    weight: number;
    dimensions: Dimensions;
    packages: number;
  };
}

export interface OrderTotals {
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  discount_total: number;
  grand_total: number;
  currency: string;
}

export interface OrderData {
  customer_id: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  shipping_details?: ShippingDetails;
  payment_details: PaymentDetails;
  totals: OrderTotals;
  notes?: string[];
  priority?: FulfillmentPriority;
  source?: string;
  metadata?: Metadata;
  org_id?: string;
}

export interface FulfillmentEvent {
  timestamp: string;
  status: OrderStatus;
  location?: string;
  description: string;
  performed_by?: string;
  metadata?: Metadata;
}

// Response Types
interface BaseOrderResponse {
  id: string;
  object: 'order';
  created_at: string;
  updated_at: string;
  status: OrderStatus;
  data: OrderData;
}

export type OrderResponse = BaseOrderResponse & {
  [K in OrderStatus]: {
    status: K;
  } & (K extends OrderStatus.SHIPPED ? { shipping_details: ShippingDetails }
    : K extends OrderStatus.DELIVERED ? { delivered: true; delivery_confirmation?: {
        timestamp: string;
        signature?: string;
        photo?: string;
      } }
    : K extends OrderStatus.CANCELLED ? { cancelled: true; cancellation_reason: string; cancelled_at: string }
    : K extends OrderStatus.RETURNED ? { returned: true; return_details: {
        rma_number: string;
        reason: string;
        received_at: string;
        condition: string;
      } }
    : K extends OrderStatus.REFUNDED ? { refunded: true; refund_details: {
        amount: number;
        reason: string;
        processed_at: string;
        transaction_id: string;
      } }
    : {});
}[OrderStatus];

// Custom Error Classes
export class OrderError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class OrderNotFoundError extends OrderError {
  constructor(orderId: string) {
    super(`Order with ID ${orderId} not found`, 'OrderNotFoundError');
  }
}

export class OrderStateError extends OrderError {
  constructor(message: string) {
    super(message, 'OrderStateError');
  }
}

export class OrderValidationError extends OrderError {
  constructor(message: string) {
    super(message, 'OrderValidationError');
  }
}

// Utility Functions
const validateOrderTotals = (orderData: OrderData): void => {
  const calculatedTotal = orderData.items.reduce((total, item) => total + item.total_amount, 0);
  if (Math.abs(calculatedTotal - orderData.totals.subtotal) > 0.01) {
    throw new OrderValidationError('Order items total does not match subtotal');
  }
};

// Main Orders Class
export class Orders {
  constructor(private readonly client: stateset) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    try {
      return await this.client.request(method, path, data);
    } catch (error: any) {
      if (error.status === 404) {
        throw new OrderNotFoundError(path.split('/')[2] || 'unknown');
      }
      if (error.status === 400) {
        throw new OrderValidationError(error.message);
      }
      throw error;
    }
  }

  async list(params: {
    status?: OrderStatus;
    customer_id?: string;
    date_from?: Date;
    date_to?: Date;
    priority?: FulfillmentPriority;
    payment_status?: PaymentStatus;
    org_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ orders: OrderResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    const response = await this.request<{ orders: OrderResponse[]; total: number }>(
      'GET',
      `orders?${queryParams.toString()}`
    );
    return response;
  }

  async get(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>('GET', `orders/${orderId}`);
  }

  async create(orderData: OrderData): Promise<OrderResponse> {
    validateOrderTotals(orderData);
    return this.request<OrderResponse>('POST', 'orders', {
      ...orderData,
      totals: { ...orderData.totals, currency: orderData.totals.currency || DEFAULT_CURRENCY },
    });
  }

  async update(orderId: string, orderData: Partial<OrderData>): Promise<OrderResponse> {
    if (orderData.totals && orderData.items) {
      validateOrderTotals(orderData as OrderData);
    }
    return this.request<OrderResponse>('PUT', `orders/${orderId}`, orderData);
  }

  async confirm(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/confirm`);
  }

  async process(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/process`);
  }

  async ship(orderId: string, shippingDetails: ShippingDetails): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/ship`, shippingDetails);
  }

  async markDelivered(
    orderId: string,
    confirmation?: { signature?: string; photo?: string }
  ): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/deliver`, confirmation);
  }

  async cancel(orderId: string, cancellationData: { reason: string }): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/cancel`, cancellationData);
  }

  async processReturn(
    orderId: string,
    returnData: { rma_number: string; reason: string; condition: string }
  ): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/return`, returnData);
  }

  async processRefund(
    orderId: string,
    refundData: { amount: number; reason: string }
  ): Promise<OrderResponse> {
    return this.request<OrderResponse>('POST', `orders/${orderId}/refund`, refundData);
  }

  async addFulfillmentEvent(orderId: string, event: FulfillmentEvent): Promise<OrderResponse> {
    return this.request<OrderResponse>(
      'POST',
      `orders/${orderId}/fulfillment-events`,
      event
    );
  }

  async getFulfillmentHistory(
    orderId: string,
    params: { start_date?: Date; end_date?: Date } = {}
  ): Promise<FulfillmentEvent[]> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params.end_date) queryParams.append('end_date', params.end_date.toISOString());

    return this.request<FulfillmentEvent[]>(
      'GET',
      `orders/${orderId}/fulfillment-history?${queryParams.toString()}`
    );
  }

  async getTracking(orderId: string): Promise<{
    tracking_number: string;
    carrier: string;
    status: string;
    estimated_delivery: string;
    tracking_url: string;
    events: Array<{ timestamp: string; location: string; status: string; description: string }>;
  }> {
    return this.request('GET', `orders/${orderId}/tracking`);
  }

  async getMetrics(params: {
    start_date?: Date;
    end_date?: Date;
    org_id?: string;
  } = {}): Promise<{
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    fulfillment_rate: number;
    return_rate: number;
    status_breakdown: Record<OrderStatus, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params.org_id) queryParams.append('org_id', params.org_id);

    return this.request('GET', `orders/metrics?${queryParams.toString()}`);
  }
}

export default Orders;