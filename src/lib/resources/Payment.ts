import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

// Interfaces
export interface PaymentData {
  customer_id: NonEmptyString<string>;
  order_id?: NonEmptyString<string>;
  invoice_id?: NonEmptyString<string>;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_date: Timestamp;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface PaymentResponse {
  id: NonEmptyString<string>;
  object: 'payment';
  data: PaymentData;
}

// Error Classes
export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentNotFoundError extends PaymentError {
  constructor(paymentId: string) {
    super(`Payment with ID ${paymentId} not found`, { paymentId });
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Payments extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'payments', 'payments');
    this.singleKey = 'payment';
    this.listKey = 'payments';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validatePaymentData(data: PaymentData): void {
    if (!data.customer_id) throw new PaymentValidationError('Customer ID is required');
    if (!data.payment_date) throw new PaymentValidationError('Payment date is required');
    if (data.amount <= 0) throw new PaymentValidationError('Amount must be greater than 0');
  }

  private mapResponse(data: any): PaymentResponse {
    if (!data?.id) throw new PaymentError('Invalid response format');
    return {
      id: data.id,
      object: 'payment',
      data: {
        customer_id: data.customer_id,
        order_id: data.order_id,
        invoice_id: data.invoice_id,
        status: data.status,
        method: data.method,
        amount: data.amount,
        currency: data.currency,
        transaction_id: data.transaction_id,
        payment_date: data.payment_date,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    customer_id?: string;
    order_id?: string;
    status?: PaymentStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    payments: PaymentResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const payments = (response as any).payments ?? response;

    return {
      payments,
      pagination: (response as any).pagination || {
        total: payments.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(paymentId: NonEmptyString<string>): Promise<PaymentResponse> {
    return super.get(paymentId);
  }

  override async create(data: PaymentData): Promise<PaymentResponse> {
    this.validatePaymentData(data);
    return super.create(data);
  }

  override async update(
    paymentId: NonEmptyString<string>,
    data: Partial<PaymentData>
  ): Promise<PaymentResponse> {
    return super.update(paymentId, data);
  }

  override async delete(paymentId: NonEmptyString<string>): Promise<void> {
    await super.delete(paymentId);
  }

  async processPayment(
    paymentId: NonEmptyString<string>,
    transactionId: string
  ): Promise<PaymentResponse> {
    try {
      const response = await this.client.request('POST', `payments/${paymentId}/process`, {
        transaction_id: transactionId,
      });
      return this.mapResponse((response as any).payment ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'processPayment', paymentId);
    }
  }

  private handleError(error: any, _operation: string, _paymentId?: string): never {
    throw error;
  }
}
