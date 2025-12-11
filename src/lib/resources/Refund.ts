import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReason {
  RETURN = 'RETURN',
  CANCELLATION = 'CANCELLATION',
  DEFECTIVE = 'DEFECTIVE',
  OTHER = 'OTHER',
}

// Interfaces
export interface RefundData {
  payment_id: NonEmptyString<string>;
  return_id?: NonEmptyString<string>;
  order_id?: NonEmptyString<string>;
  status: RefundStatus;
  reason: RefundReason;
  amount: number;
  currency: string;
  refund_date?: Timestamp;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface RefundResponse {
  id: NonEmptyString<string>;
  object: 'refund';
  data: RefundData;
}

// Error Classes
export class RefundError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RefundError';
  }
}

export class RefundNotFoundError extends RefundError {
  constructor(refundId: string) {
    super(`Refund with ID ${refundId} not found`, { refundId });
  }
}

export class RefundValidationError extends RefundError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Refunds extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'refunds', 'refunds');
    this.singleKey = 'refund';
    this.listKey = 'refunds';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateRefundData(data: RefundData): void {
    if (!data.payment_id) throw new RefundValidationError('Payment ID is required');
    if (data.amount <= 0) throw new RefundValidationError('Amount must be greater than 0');
  }

  private mapResponse(data: any): RefundResponse {
    if (!data?.id) throw new RefundError('Invalid response format');
    return {
      id: data.id,
      object: 'refund',
      data: {
        payment_id: data.payment_id,
        return_id: data.return_id,
        order_id: data.order_id,
        status: data.status,
        reason: data.reason,
        amount: data.amount,
        currency: data.currency,
        refund_date: data.refund_date,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    payment_id?: string;
    return_id?: string;
    status?: RefundStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    refunds: RefundResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const refunds = (response as any).refunds ?? response;

    return {
      refunds,
      pagination: (response as any).pagination || {
        total: refunds.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(refundId: NonEmptyString<string>): Promise<RefundResponse> {
    return super.get(refundId);
  }

  override async create(data: RefundData): Promise<RefundResponse> {
    this.validateRefundData(data);
    return super.create(data);
  }

  override async update(
    refundId: NonEmptyString<string>,
    data: Partial<RefundData>
  ): Promise<RefundResponse> {
    return super.update(refundId, data);
  }

  override async delete(refundId: NonEmptyString<string>): Promise<void> {
    await super.delete(refundId);
  }

  async processRefund(
    refundId: NonEmptyString<string>,
    refundDate: Timestamp
  ): Promise<RefundResponse> {
    try {
      const response = await this.client.request('POST', `refunds/${refundId}/process`, {
        refund_date: refundDate,
      });
      return this.mapResponse((response as any).refund ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'processRefund', refundId);
    }
  }

  private handleError(error: any, _operation: string, _refundId?: string): never {
    throw error;
  }
}
