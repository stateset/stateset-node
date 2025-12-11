import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ManufactureOrderLineStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum ManufactureOrderLineType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  COMPONENT = 'COMPONENT',
  FINISHED_GOOD = 'FINISHED_GOOD',
  BYPRODUCT = 'BYPRODUCT',
  SCRAP = 'SCRAP',
}

// Interfaces for Manufacture Order Line Data Structures
export interface ManufactureOrderLineItem {
  item_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  description: string;
  quantity: number;
  unit_of_measure: string;
  unit_cost: number;
  total_cost: number;
  currency: string;
}

export interface ManufactureOrderLineData {
  manufacture_order_id: NonEmptyString<string>;
  type: ManufactureOrderLineType;
  status: ManufactureOrderLineStatus;
  item: ManufactureOrderLineItem;
  work_center_id?: NonEmptyString<string>;
  production?: {
    planned_start: Timestamp;
    actual_start?: Timestamp;
    planned_end: Timestamp;
    actual_end?: Timestamp;
    produced_quantity: number;
    operator_id?: string;
  };
  material_requirements?: Array<{
    material_id: NonEmptyString<string>;
    quantity_required: number;
    quantity_consumed: number;
    unit_of_measure: string;
  }>;
  quality_check?: {
    parameter: string;
    specification: string;
    actual_value?: string;
    passed?: boolean;
    checked_at?: Timestamp;
    checked_by?: string;
  };
  cost_details: {
    estimated_cost: number;
    actual_cost?: number;
    currency: string;
    cost_breakdown?: Array<{
      category: 'LABOR' | 'MATERIAL' | 'OVERHEAD';
      amount: number;
      description?: string;
    }>;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status_history: Array<{
    status: ManufactureOrderLineStatus;
    changed_at: Timestamp;
    changed_by?: string;
    reason?: string;
  }>;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface ManufactureOrderLineResponse {
  id: NonEmptyString<string>;
  object: 'manufacture_order_line';
  data: ManufactureOrderLineData;
}

// Custom Error Classes
export class ManufactureOrderLineError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ManufactureOrderLineError';
  }
}

export class ManufactureOrderLineNotFoundError extends ManufactureOrderLineError {
  constructor(manufactureOrderLineId: string) {
    super(`Manufacture order line with ID ${manufactureOrderLineId} not found`, {
      manufactureOrderLineId,
    });
  }
}

export class ManufactureOrderLineValidationError extends ManufactureOrderLineError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Main ManufactureOrderLines Class
export default class ManufactureOrderLines extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'manufacture_order_line_items', 'manufacture_order_line_items');
    this.singleKey = 'manufacture_order_line';
    this.listKey = 'manufacture_order_lines';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateManufactureOrderLineData(data: ManufactureOrderLineData): void {
    if (!data.manufacture_order_id) {
      throw new ManufactureOrderLineValidationError('Manufacture order ID is required');
    }
    if (!data.item?.item_id) {
      throw new ManufactureOrderLineValidationError('Item ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new ManufactureOrderLineValidationError('Quantity must be greater than 0');
    }
    if (data.cost_details.estimated_cost < 0) {
      throw new ManufactureOrderLineValidationError('Estimated cost cannot be negative');
    }
  }

  private mapResponse(data: any): ManufactureOrderLineResponse {
    if (!data?.id || !data.manufacture_order_id) {
      throw new ManufactureOrderLineError('Invalid response format');
    }
    return {
      id: data.id,
      object: 'manufacture_order_line',
      data: {
        manufacture_order_id: data.manufacture_order_id,
        type: data.type,
        status: data.status,
        item: data.item,
        work_center_id: data.work_center_id,
        production: data.production,
        material_requirements: data.material_requirements,
        quality_check: data.quality_check,
        cost_details: data.cost_details,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status_history: data.status_history || [],
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    manufacture_order_id?: string;
    status?: ManufactureOrderLineStatus;
    type?: ManufactureOrderLineType;
    work_center_id?: string;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    manufacture_order_lines: ManufactureOrderLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const manufacture_order_lines = (response as any).manufacture_order_lines ?? response;

    return {
      manufacture_order_lines,
      pagination: (response as any).pagination || {
        total: manufacture_order_lines.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(manufactureOrderLineId: NonEmptyString<string>): Promise<ManufactureOrderLineResponse> {
    return super.get(manufactureOrderLineId);
  }

  override async create(data: ManufactureOrderLineData): Promise<ManufactureOrderLineResponse> {
    this.validateManufactureOrderLineData(data);
    return super.create(data);
  }

  override async update(
    manufactureOrderLineId: NonEmptyString<string>,
    data: Partial<ManufactureOrderLineData>
  ): Promise<ManufactureOrderLineResponse> {
    return super.update(manufactureOrderLineId, data);
  }

  override async delete(manufactureOrderLineId: NonEmptyString<string>): Promise<void> {
    await super.delete(manufactureOrderLineId);
  }

  async updateStatus(
    manufactureOrderLineId: NonEmptyString<string>,
    status: ManufactureOrderLineStatus,
    reason?: string
  ): Promise<ManufactureOrderLineResponse> {
    try {
      const response = await this.client.request(
        'PUT',
        `manufacture_order_line_items/${manufactureOrderLineId}/status`,
        { status, reason }
      );
      return this.mapResponse((response as any).manufacture_order_line ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', manufactureOrderLineId);
    }
  }

  async recordProduction(
    manufactureOrderLineId: NonEmptyString<string>,
    productionData: Partial<ManufactureOrderLineData['production']>
  ): Promise<ManufactureOrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `manufacture_order_line_items/${manufactureOrderLineId}/production`,
        productionData
      );
      return this.mapResponse((response as any).manufacture_order_line ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'recordProduction', manufactureOrderLineId);
    }
  }

  async submitQualityCheck(
    manufactureOrderLineId: NonEmptyString<string>,
    qualityCheckData: ManufactureOrderLineData['quality_check']
  ): Promise<ManufactureOrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `manufacture_order_line_items/${manufactureOrderLineId}/quality-check`,
        qualityCheckData
      );
      return this.mapResponse((response as any).manufacture_order_line ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'submitQualityCheck', manufactureOrderLineId);
    }
  }

  async getMetrics(params?: {
    manufacture_order_id?: string;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
  }): Promise<{
    total_lines: number;
    status_breakdown: Record<ManufactureOrderLineStatus, number>;
    type_breakdown: Record<ManufactureOrderLineType, number>;
    production_efficiency: number;
    average_cost_per_unit: number;
    quality_pass_rate: number;
  }> {
    const requestParams: Record<string, unknown> = {};
    if (params?.manufacture_order_id)
      requestParams.manufacture_order_id = params.manufacture_order_id;
    if (params?.org_id) requestParams.org_id = params.org_id;
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    try {
      const response = await this.client.request(
        'GET',
        'manufacture_order_line_items/metrics',
        undefined,
        { params: requestParams }
      );
      return (response as any).metrics ?? response;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, _operation: string, _manufactureOrderLineId?: string): never {
    throw error;
  }
}
