import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum RefundReason {
  RETURN = 'RETURN',
  CANCELLATION = 'CANCELLATION',
  DEFECTIVE = 'DEFECTIVE',
  OTHER = 'OTHER'
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
  constructor(message: string, public readonly details?: Record<string, unknown>) {
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
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Refunds {
  constructor(private readonly stateset: stateset) {}

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

  async list(params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.payment_id) queryParams.append('payment_id', params.payment_id);
      if (params.return_id) queryParams.append('return_id', params.return_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `refunds?${queryParams.toString()}`);
      return {
        refunds: response.refunds.map(this.mapResponse),
        pagination: {
          total: response.total || response.refunds.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(refundId: NonEmptyString<string>): Promise<RefundResponse> {
    try {
      const response = await this.stateset.request('GET', `refunds/${refundId}`);
      return this.mapResponse(response.refund);
    } catch (error: any) {
      throw this.handleError(error, 'get', refundId);
    }
  }

  async create(data: RefundData): Promise<RefundResponse> {
    this.validateRefundData(data);
    try {
      const response = await this.stateset.request('POST', 'refunds', data);
      return this.mapResponse(response.refund);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(refundId: NonEmptyString<string>, data: Partial<RefundData>): Promise<RefundResponse> {
    try {
      const response = await this.stateset.request('PUT', `refunds/${refundId}`, data);
      return this.mapResponse(response.refund);
    } catch (error: any) {
      throw this.handleError(error, 'update', refundId);
    }
  }

  async delete(refundId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `refunds/${refundId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', refundId);
    }
  }

  async processRefund(refundId: NonEmptyString<string>, refundDate: Timestamp): Promise<RefundResponse> {
    try {
      const response = await this.stateset.request('POST', `refunds/${refundId}/process`, { refund_date: refundDate });
      return this.mapResponse(response.refund);
    } catch (error: any) {
      throw this.handleError(error, 'processRefund', refundId);
    }
  }

  private handleError(error: any, operation: string, refundId?: string): never {
    if (error.status === 404) throw new RefundNotFoundError(refundId || 'unknown');
    if (error.status === 400) throw new RefundValidationError(error.message, error.errors);
    throw new RefundError(
      `Failed to ${operation} refund: ${error.message}`,
      { operation, originalError: error }
    );
  }
}