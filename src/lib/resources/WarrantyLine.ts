import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum WarrantyLineStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum WarrantyLineType {
  REPAIR = 'REPAIR',
  REPLACEMENT = 'REPLACEMENT',
  REFUND = 'REFUND',
  SERVICE = 'SERVICE'
}

// Core Interfaces
export interface WarrantyLineItem {
  product_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  serial_number?: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED' | 'DAMAGED';
}

export interface WarrantyLineData {
  warranty_id: NonEmptyString<string>;
  type: WarrantyLineType;
  status: WarrantyLineStatus;
  item: WarrantyLineItem;
  claim_description: string;
  resolution?: {
    type: WarrantyLineType;
    approved_at: Timestamp;
    completed_at?: Timestamp;
    notes?: string;
    replacement_item_id?: string;
    refund_amount?: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status_history: Array<{
    status: WarrantyLineStatus;
    changed_at: Timestamp;
    changed_by: string;
    reason?: string;
  }>;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type
export interface WarrantyLineResponse {
  id: NonEmptyString<string>;
  object: 'warranty_line';
  data: WarrantyLineData;
}

// Error Classes
export class WarrantyLineError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WarrantyLineNotFoundError extends WarrantyLineError {
  constructor(warrantyLineId: string) {
    super(`Warranty line with ID ${warrantyLineId} not found`, { warrantyLineId });
  }
}

export class WarrantyLineValidationError extends WarrantyLineError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

// Main WarrantyLines Class
export class WarrantyLines {
  constructor(private readonly client: stateset) {}

  private validateWarrantyLineData(data: WarrantyLineData): void {
    if (!data.warranty_id) {
      throw new WarrantyLineValidationError('Warranty ID is required');
    }
    if (!data.item?.product_id) {
      throw new WarrantyLineValidationError('Product ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new WarrantyLineValidationError('Valid quantity is required');
    }
    if (!data.claim_description) {
      throw new WarrantyLineValidationError('Claim description is required');
    }
  }

  private mapResponse(data: any): WarrantyLineResponse {
    if (!data?.id || !data.warranty_id) {
      throw new WarrantyLineError('Invalid response format');
    }

    return {
      id: data.id,
      object: 'warranty_line',
      data: {
        warranty_id: data.warranty_id,
        type: data.type,
        status: data.status,
        item: data.item,
        claim_description: data.claim_description,
        resolution: data.resolution,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status_history: data.status_history || [],
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params: {
    warranty_id?: string;
    status?: WarrantyLineStatus;
    type?: WarrantyLineType;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    warranty_lines: WarrantyLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.warranty_id && { warranty_id: params.warranty_id }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.client.request('GET', `warranty_line_items?${query}`);
      return {
        warranty_lines: response.warranty_lines.map(this.mapResponse),
        pagination: response.pagination || { total: response.warranty_lines.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(warrantyLineId: NonEmptyString<string>): Promise<WarrantyLineResponse> {
    try {
      const response = await this.client.request('GET', `warranty_line_items/${warrantyLineId}`);
      return this.mapResponse(response.warranty_line);
    } catch (error: any) {
      throw this.handleError(error, 'get', warrantyLineId);
    }
  }

  async create(data: WarrantyLineData): Promise<WarrantyLineResponse> {
    this.validateWarrantyLineData(data);
    try {
      const response = await this.client.request('POST', 'warranty_line_items', data);
      return this.mapResponse(response.warranty_line);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    warrantyLineId: NonEmptyString<string>,
    data: Partial<WarrantyLineData>
  ): Promise<WarrantyLineResponse> {
    try {
      const response = await this.client.request('PUT', `warranty_line_items/${warrantyLineId}`, data);
      return this.mapResponse(response.warranty_line);
    } catch (error: any) {
      throw this.handleError(error, 'update', warrantyLineId);
    }
  }

  async delete(warrantyLineId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `warranty_line_items/${warrantyLineId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', warrantyLineId);
    }
  }

  async updateStatus(
    warrantyLineId: NonEmptyString<string>,
    status: WarrantyLineStatus,
    reason?: string
  ): Promise<WarrantyLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `warranty_line_items/${warrantyLineId}/status`,
        { status, reason }
      );
      return this.mapResponse(response.warranty_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', warrantyLineId);
    }
  }

  async getMetrics(params: {
    warranty_id?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
  } = {}): Promise<{
    total_lines: number;
    status_breakdown: Record<WarrantyLineStatus, number>;
    type_breakdown: Record<WarrantyLineType, number>;
    average_processing_time: number;
  }> {
    const query = new URLSearchParams({
      ...(params.warranty_id && { warranty_id: params.warranty_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    try {
      const response = await this.client.request('GET', `warranty_line_items/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, operation: string, warrantyLineId?: string): never {
    if (error.status === 404) throw new WarrantyLineNotFoundError(warrantyLineId || 'unknown');
    if (error.status === 400) throw new WarrantyLineValidationError(error.message, error.errors);
    throw new WarrantyLineError(
      `Failed to ${operation} warranty line: ${error.message}`,
      { operation, originalError: error }
    );
  }
}

export default WarrantyLines;