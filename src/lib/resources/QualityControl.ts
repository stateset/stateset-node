import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum QualityControlStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  ON_HOLD = 'ON_HOLD'
}

// Interfaces
export interface QualityControlData {
  order_id?: NonEmptyString<string>;
  product_id?: NonEmptyString<string>;
  status: QualityControlStatus;
  inspection_date: Timestamp;
  inspector_id: NonEmptyString<string>;
  standards: Array<{
    parameter: string;
    specification: string;
    tolerance?: { min: number; max: number; unit: string };
  }>;
  results: Array<{
    parameter: string;
    actual_value: string;
    passed: boolean;
    notes?: string;
  }>;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface QualityControlResponse {
  id: NonEmptyString<string>;
  object: 'quality_control';
  data: QualityControlData;
}

// Error Classes
export class QualityControlError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'QualityControlError';
  }
}

export class QualityControlNotFoundError extends QualityControlError {
  constructor(qualityControlId: string) {
    super(`Quality control with ID ${qualityControlId} not found`, { qualityControlId });
  }
}

export class QualityControlValidationError extends QualityControlError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class QualityControl {
  constructor(private readonly stateset: stateset) {}

  private validateQualityControlData(data: QualityControlData): void {
    if (!data.inspector_id) throw new QualityControlValidationError('Inspector ID is required');
    if (!data.inspection_date) throw new QualityControlValidationError('Inspection date is required');
    if (!data.standards?.length) throw new QualityControlValidationError('At least one quality standard is required');
  }

  private mapResponse(data: any): QualityControlResponse {
    if (!data?.id) throw new QualityControlError('Invalid response format');
    return {
      id: data.id,
      object: 'quality_control',
      data: {
        order_id: data.order_id,
        product_id: data.product_id,
        status: data.status,
        inspection_date: data.inspection_date,
        inspector_id: data.inspector_id,
        standards: data.standards,
        results: data.results,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    order_id?: string;
    product_id?: string;
    status?: QualityControlStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    quality_controls: QualityControlResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.order_id) queryParams.append('order_id', params.order_id);
      if (params.product_id) queryParams.append('product_id', params.product_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `quality_controls?${queryParams.toString()}`);
      return {
        quality_controls: response.quality_controls.map(this.mapResponse),
        pagination: {
          total: response.total || response.quality_controls.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(qualityControlId: NonEmptyString<string>): Promise<QualityControlResponse> {
    try {
      const response = await this.stateset.request('GET', `quality_controls/${qualityControlId}`);
      return this.mapResponse(response.quality_control);
    } catch (error: any) {
      throw this.handleError(error, 'get', qualityControlId);
    }
  }

  async create(data: QualityControlData): Promise<QualityControlResponse> {
    this.validateQualityControlData(data);
    try {
      const response = await this.stateset.request('POST', 'quality_controls', data);
      return this.mapResponse(response.quality_control);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    qualityControlId: NonEmptyString<string>,
    data: Partial<QualityControlData>
  ): Promise<QualityControlResponse> {
    try {
      const response = await this.stateset.request('PUT', `quality_controls/${qualityControlId}`, data);
      return this.mapResponse(response.quality_control);
    } catch (error: any) {
      throw this.handleError(error, 'update', qualityControlId);
    }
  }

  async delete(qualityControlId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `quality_controls/${qualityControlId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', qualityControlId);
    }
  }

  async recordResults(
    qualityControlId: NonEmptyString<string>,
    results: QualityControlData['results']
  ): Promise<QualityControlResponse> {
    try {
      const response = await this.stateset.request(
        'POST',
        `quality_controls/${qualityControlId}/results`,
        { results }
      );
      return this.mapResponse(response.quality_control);
    } catch (error: any) {
      throw this.handleError(error, 'recordResults', qualityControlId);
    }
  }

  private handleError(error: any, operation: string, qualityControlId?: string): never {
    if (error.status === 404) throw new QualityControlNotFoundError(qualityControlId || 'unknown');
    if (error.status === 400) throw new QualityControlValidationError(error.message, error.errors);
    throw new QualityControlError(
      `Failed to ${operation} quality control: ${error.message}`,
      { operation, originalError: error }
    );
  }
}