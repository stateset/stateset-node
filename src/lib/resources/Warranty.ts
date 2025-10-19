import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum WarrantyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED'
}

export enum WarrantyType {
  MANUFACTURER = 'MANUFACTURER',
  EXTENDED = 'EXTENDED',
  THIRD_PARTY = 'THIRD_PARTY'
}

// Core Interfaces
export interface WarrantyItem {
  item_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  serial_number?: string;
  description: string;
  purchase_date: Timestamp;
  warranty_start: Timestamp;
  warranty_end: Timestamp;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
}

export interface WarrantyClaim {
  claim_id: NonEmptyString<string>;
  reported_at: Timestamp;
  issue_description: string;
  photos?: string[]; // URLs to evidence
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  resolution?: {
    type: 'REPAIR' | 'REPLACEMENT' | 'REFUND';
    completed_at: Timestamp;
    notes?: string;
  };
}

export interface WarrantyData {
  customer_id: NonEmptyString<string>;
  order_id: NonEmptyString<string>;
  type: WarrantyType;
  items: WarrantyItem[];
  claims?: WarrantyClaim[];
  coverage: {
    duration_months: number;
    terms: string;
    exclusions?: string[];
  };
  status_history: Array<{
    status: WarrantyStatus;
    changed_at: Timestamp;
    changed_by: string;
    reason?: string;
  }>;
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type with Discriminated Union
export type WarrantyResponse = {
  id: NonEmptyString<string>;
  object: 'warranty';
  status: WarrantyStatus;
  data: WarrantyData;
} & (
  | { status: WarrantyStatus.PENDING; pending_details: { submitted_at: Timestamp } }
  | { status: WarrantyStatus.APPROVED; approved_at: Timestamp }
  | { status: WarrantyStatus.REJECTED; rejection_reason: string }
  | { status: WarrantyStatus.CANCELLED; cancellation_reason?: string }
  | { status: WarrantyStatus.CLOSED; closed_at: Timestamp }
  | { status: WarrantyStatus.REOPENED; reopened_reason: string }
);

// Error Classes
export class WarrantyError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WarrantyNotFoundError extends WarrantyError {
  constructor(warrantyId: string) {
    super(`Warranty with ID ${warrantyId} not found`, { warrantyId });
  }
}

export class WarrantyValidationError extends WarrantyError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export class WarrantyOperationError extends WarrantyError {
  constructor(message: string, public readonly operation?: string) {
    super(message);
  }
}

// Main Warranty Class
export class Warranty {
  constructor(private readonly client: ApiClientLike) {}

  private validateWarrantyData(data: WarrantyData): void {
    if (!data.customer_id) throw new WarrantyValidationError('Customer ID is required');
    if (!data.order_id) throw new WarrantyValidationError('Order ID is required');
    if (!data.items?.length) throw new WarrantyValidationError('At least one item is required');
    if (!data.coverage?.duration_months) {
      throw new WarrantyValidationError('Warranty duration is required');
    }

    data.items.forEach((item, index) => {
      if (!item.warranty_start || !item.warranty_end) {
        throw new WarrantyValidationError(`Item[${index}] must have warranty dates`);
      }
    });
  }

  private mapResponse(data: any): WarrantyResponse {
    if (!data?.id || !data.status) {
      throw new WarrantyError('Invalid response format');
    }

    const baseResponse: Omit<WarrantyResponse, keyof any> = {
      id: data.id,
      object: 'warranty',
      status: data.status,
      data: data.data || data,
    };

    switch (data.status) {
      case WarrantyStatus.PENDING:
        return { ...baseResponse, status: WarrantyStatus.PENDING, pending_details: { submitted_at: data.created_at } } as WarrantyResponse;
      case WarrantyStatus.APPROVED:
        return { ...baseResponse, status: WarrantyStatus.APPROVED, approved_at: data.updated_at } as WarrantyResponse;
      case WarrantyStatus.REJECTED:
        return { ...baseResponse, status: WarrantyStatus.REJECTED, rejection_reason: data.rejection_reason || 'Not specified' } as WarrantyResponse;
      case WarrantyStatus.CANCELLED:
        return { ...baseResponse, status: WarrantyStatus.CANCELLED, cancellation_reason: data.cancellation_reason } as WarrantyResponse;
      case WarrantyStatus.CLOSED:
        return { ...baseResponse, status: WarrantyStatus.CLOSED, closed_at: data.updated_at } as WarrantyResponse;
      case WarrantyStatus.REOPENED:
        return { ...baseResponse, status: WarrantyStatus.REOPENED, reopened_reason: data.reopened_reason || 'Not specified' } as WarrantyResponse ;
      default:
        throw new WarrantyError(`Unexpected warranty status: ${data.status}`);
    }
  }

  async list(params: {
    status?: WarrantyStatus;
    customer_id?: string;
    order_id?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    warranties: WarrantyResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.customer_id && { customer_id: params.customer_id }),
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await this.client.request('GET', `warranties?${query}`);
    return {
      warranties: response.warranties.map(this.mapResponse),
      pagination: response.pagination,
    };
  }

  async get(warrantyId: NonEmptyString<string>): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('GET', `warranties/${warrantyId}`);
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'get', warrantyId);
    }
  }

  async create(data: WarrantyData): Promise<WarrantyResponse> {
    this.validateWarrantyData(data);
    try {
      const response = await this.client.request('POST', 'warranties', data);
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async approve(warrantyId: NonEmptyString<string>, reason?: string): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/approve/${warrantyId}`, { reason });
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'approve', warrantyId);
    }
  }

  async reject(warrantyId: NonEmptyString<string>, reason: string): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/reject/${warrantyId}`, { reason });
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'reject', warrantyId);
    }
  }

  async cancel(warrantyId: NonEmptyString<string>, reason?: string): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/cancel/${warrantyId}`, { reason });
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'cancel', warrantyId);
    }
  }

  async close(warrantyId: NonEmptyString<string>): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/close/${warrantyId}`);
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'close', warrantyId);
    }
  }

  async reopen(warrantyId: NonEmptyString<string>, reason: string): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/reopen/${warrantyId}`, { reason });
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'reopen', warrantyId);
    }
  }

  async update(warrantyId: NonEmptyString<string>, data: Partial<WarrantyData>): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('PUT', `warranties/${warrantyId}`, data);
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'update', warrantyId);
    }
  }

  async delete(warrantyId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `warranties/${warrantyId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', warrantyId);
    }
  }

  async addClaim(
    warrantyId: NonEmptyString<string>,
    claimData: Omit<WarrantyClaim, 'claim_id' | 'status'>
  ): Promise<WarrantyResponse> {
    try {
      const response = await this.client.request('POST', `warranties/${warrantyId}/claims`, claimData);
      return this.mapResponse(response.warranty);
    } catch (error: any) {
      throw this.handleError(error, 'addClaim', warrantyId);
    }
  }

  async getMetrics(params: {
    org_id?: string;
    date_range?: { from: Date; to: Date };
  } = {}): Promise<{
    total_warranties: number;
    status_breakdown: Record<WarrantyStatus, number>;
    average_duration: number;
    claim_rate: number;
  }> {
    const query = new URLSearchParams({
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    const response = await this.client.request('GET', `warranties/metrics?${query}`);
    return response.metrics;
  }

  private handleError(error: any, operation: string, warrantyId?: string): never {
    if (error.status === 404) throw new WarrantyNotFoundError(warrantyId || 'unknown');
    if (error.status === 400) throw new WarrantyValidationError(error.message, error.errors);
    throw new WarrantyOperationError(
      `Failed to ${operation} warranty: ${error.message}`,
      operation
    );
  }
}

export default Warranty;