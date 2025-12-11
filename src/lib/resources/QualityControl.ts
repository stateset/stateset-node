import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum QualityControlStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  ON_HOLD = 'ON_HOLD',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
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
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class QualityControl extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'quality_controls', 'quality_controls');
    this.singleKey = 'quality_control';
    this.listKey = 'quality_controls';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateQualityControlData(data: QualityControlData): void {
    if (!data.inspector_id) throw new QualityControlValidationError('Inspector ID is required');
    if (!data.inspection_date)
      throw new QualityControlValidationError('Inspection date is required');
    if (!data.standards?.length)
      throw new QualityControlValidationError('At least one quality standard is required');
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

  override async list(params?: {
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
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const quality_controls = (response as any).quality_controls ?? response;

    return {
      quality_controls,
      pagination: (response as any).pagination || {
        total: quality_controls.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(qualityControlId: NonEmptyString<string>): Promise<QualityControlResponse> {
    return super.get(qualityControlId);
  }

  override async create(data: QualityControlData): Promise<QualityControlResponse> {
    this.validateQualityControlData(data);
    return super.create(data);
  }

  override async update(
    qualityControlId: NonEmptyString<string>,
    data: Partial<QualityControlData>
  ): Promise<QualityControlResponse> {
    return super.update(qualityControlId, data);
  }

  override async delete(qualityControlId: NonEmptyString<string>): Promise<void> {
    await super.delete(qualityControlId);
  }

  async recordResults(
    qualityControlId: NonEmptyString<string>,
    results: QualityControlData['results']
  ): Promise<QualityControlResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `quality_controls/${qualityControlId}/results`,
        { results }
      );
      return this.mapResponse((response as any).quality_control ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'recordResults', qualityControlId);
    }
  }

  private handleError(error: any, _operation: string, _qualityControlId?: string): never {
    throw error;
  }
}
