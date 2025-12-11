import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ReturnLineStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  INSPECTED = 'INSPECTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED',
}

export enum ReturnReason {
  DEFECTIVE = 'DEFECTIVE',
  WRONG_ITEM = 'WRONG_ITEM',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  CHANGED_MIND = 'CHANGED_MIND',
  DAMAGED = 'DAMAGED',
  OTHER = 'OTHER',
}

// Core Interfaces
export interface ReturnLineItem {
  product_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  serial_number?: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency: string;
  condition: 'NEW' | 'USED' | 'DAMAGED' | 'OPEN_BOX';
}

export interface ReturnLineData {
  return_id: NonEmptyString<string>;
  order_id: NonEmptyString<string>;
  item: ReturnLineItem;
  reason: ReturnReason;
  status: ReturnLineStatus;
  requested_action: 'REFUND' | 'REPLACEMENT' | 'REPAIR' | 'STORE_CREDIT';
  customer_notes?: string;
  inspection?: {
    inspected_at: Timestamp;
    inspector_id: string;
    condition_notes?: string;
    photos?: string[]; // URLs to evidence
  };
  resolution?: {
    type: 'REFUND' | 'REPLACEMENT' | 'REPAIR' | 'STORE_CREDIT';
    amount?: number;
    replacement_item_id?: string;
    completed_at: Timestamp;
    notes?: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status_history: Array<{
    status: ReturnLineStatus;
    changed_at: Timestamp;
    changed_by: string;
    reason?: string;
  }>;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type
export interface ReturnLineResponse {
  id: NonEmptyString<string>;
  object: 'return_line';
  data: ReturnLineData;
}

// Error Classes
export class ReturnLineError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ReturnLineNotFoundError extends ReturnLineError {
  constructor(returnLineId: string) {
    super(`Return line with ID ${returnLineId} not found`, { returnLineId });
  }
}

export class ReturnLineValidationError extends ReturnLineError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Main ReturnLines Class
export class ReturnLines {
  constructor(private readonly client: ApiClientLike) {}

  private validateReturnLineData(data: ReturnLineData): void {
    if (!data.return_id) {
      throw new ReturnLineValidationError('Return ID is required');
    }
    if (!data.order_id) {
      throw new ReturnLineValidationError('Order ID is required');
    }
    if (!data.item?.product_id) {
      throw new ReturnLineValidationError('Product ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new ReturnLineValidationError('Valid quantity is required');
    }
    if (!data.reason) {
      throw new ReturnLineValidationError('Return reason is required');
    }
  }

  private mapResponse(data: any): ReturnLineResponse {
    if (!data?.id || !data.return_id) {
      throw new ReturnLineError('Invalid response format');
    }

    return {
      id: data.id,
      object: 'return_line',
      data: {
        return_id: data.return_id,
        order_id: data.order_id,
        item: data.item,
        reason: data.reason,
        status: data.status,
        requested_action: data.requested_action,
        customer_notes: data.customer_notes,
        inspection: data.inspection,
        resolution: data.resolution,
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
      return_id?: string;
      order_id?: string;
      status?: ReturnLineStatus;
      reason?: ReturnReason;
      org_id?: string;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    return_lines: ReturnLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.return_id && { return_id: params.return_id }),
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.status && { status: params.status }),
      ...(params.reason && { reason: params.reason }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.client.request('GET', `return_line_items?${query}`);
      return {
        return_lines: response.return_lines.map(this.mapResponse),
        pagination: response.pagination || {
          total: response.return_lines.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(returnLineId: NonEmptyString<string>): Promise<ReturnLineResponse> {
    try {
      const response = await this.client.request('GET', `return_line_items/${returnLineId}`);
      return this.mapResponse(response.return_line);
    } catch (error: any) {
      throw this.handleError(error, 'get', returnLineId);
    }
  }

  async create(data: ReturnLineData): Promise<ReturnLineResponse> {
    this.validateReturnLineData(data);
    try {
      const response = await this.client.request('POST', 'return_line_items', data);
      return this.mapResponse(response.return_line);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    returnLineId: NonEmptyString<string>,
    data: Partial<ReturnLineData>
  ): Promise<ReturnLineResponse> {
    try {
      const response = await this.client.request('PUT', `return_line_items/${returnLineId}`, data);
      return this.mapResponse(response.return_line);
    } catch (error: any) {
      throw this.handleError(error, 'update', returnLineId);
    }
  }

  async delete(returnLineId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `return_line_items/${returnLineId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', returnLineId);
    }
  }

  async updateStatus(
    returnLineId: NonEmptyString<string>,
    status: ReturnLineStatus,
    reason?: string
  ): Promise<ReturnLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `return_line_items/${returnLineId}/status`,
        { status, reason }
      );
      return this.mapResponse(response.return_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', returnLineId);
    }
  }

  async recordInspection(
    returnLineId: NonEmptyString<string>,
    inspectionData: Omit<ReturnLineData['inspection'], 'inspected_at'>
  ): Promise<ReturnLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `return_line_items/${returnLineId}/inspection`,
        inspectionData
      );
      return this.mapResponse(response.return_line);
    } catch (error: any) {
      throw this.handleError(error, 'recordInspection', returnLineId);
    }
  }

  async getMetrics(
    params: {
      return_id?: string;
      org_id?: string;
      date_range?: { from: Date; to: Date };
    } = {}
  ): Promise<{
    total_lines: number;
    status_breakdown: Record<ReturnLineStatus, number>;
    reason_breakdown: Record<ReturnReason, number>;
    average_processing_time: number;
    approval_rate: number;
  }> {
    const query = new URLSearchParams({
      ...(params.return_id && { return_id: params.return_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    try {
      const response = await this.client.request('GET', `return_line_items/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, _operation: string, _returnLineId?: string): never {
    throw error;
  }
}

export default ReturnLines;
