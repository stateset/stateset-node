import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ResourceUtilizationStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED',
}

export enum ResourceCategory {
  WAREHOUSE = 'WAREHOUSE',
  MANUFACTURING = 'MANUFACTURING',
  STAFFING = 'STAFFING',
}

// Interfaces
export interface ResourceUtilizationData {
  resource_id: NonEmptyString<string>;
  category: ResourceCategory;
  status: ResourceUtilizationStatus;
  utilization_start: Timestamp;
  utilization_end?: Timestamp;
  warehouse_id?: NonEmptyString<string>;
  manufacture_order_id?: NonEmptyString<string>;
  employee_id?: NonEmptyString<string>;
  capacity: number; // e.g., hours, units, slots
  utilized_capacity: number;
  efficiency: number; // percentage (0-100)
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface ResourceUtilizationResponse {
  id: NonEmptyString<string>;
  object: 'resource_utilization';
  data: ResourceUtilizationData;
}

// Error Classes
export class ResourceUtilizationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ResourceUtilizationError';
  }
}

export class ResourceUtilizationNotFoundError extends ResourceUtilizationError {
  constructor(resourceUtilizationId: string) {
    super(`Resource utilization with ID ${resourceUtilizationId} not found`, {
      resourceUtilizationId,
    });
  }
}

export class ResourceUtilizationValidationError extends ResourceUtilizationError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class ResourceUtilization extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'resource_utilizations', 'resource_utilizations');
    this.singleKey = 'resource_utilization';
    this.listKey = 'resource_utilizations';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateResourceUtilizationData(data: ResourceUtilizationData): void {
    if (!data.resource_id) throw new ResourceUtilizationValidationError('Resource ID is required');
    if (!data.utilization_start)
      throw new ResourceUtilizationValidationError('Utilization start date is required');
    if (data.capacity < 0)
      throw new ResourceUtilizationValidationError('Capacity cannot be negative');
    if (data.utilized_capacity < 0)
      throw new ResourceUtilizationValidationError('Utilized capacity cannot be negative');
    if (data.efficiency < 0 || data.efficiency > 100)
      throw new ResourceUtilizationValidationError('Efficiency must be between 0 and 100');
  }

  private mapResponse(data: any): ResourceUtilizationResponse {
    if (!data?.id) throw new ResourceUtilizationError('Invalid response format');
    return {
      id: data.id,
      object: 'resource_utilization',
      data: {
        resource_id: data.resource_id,
        category: data.category,
        status: data.status,
        utilization_start: data.utilization_start,
        utilization_end: data.utilization_end,
        warehouse_id: data.warehouse_id,
        manufacture_order_id: data.manufacture_order_id,
        employee_id: data.employee_id,
        capacity: data.capacity,
        utilized_capacity: data.utilized_capacity,
        efficiency: data.efficiency,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    resource_id?: string;
    category?: ResourceCategory;
    status?: ResourceUtilizationStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    resource_utilizations: ResourceUtilizationResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const resource_utilizations = (response as any).resource_utilizations ?? response;

    return {
      resource_utilizations,
      pagination: (response as any).pagination || {
        total: resource_utilizations.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(resourceUtilizationId: NonEmptyString<string>): Promise<ResourceUtilizationResponse> {
    return super.get(resourceUtilizationId);
  }

  override async create(data: ResourceUtilizationData): Promise<ResourceUtilizationResponse> {
    this.validateResourceUtilizationData(data);
    return super.create(data);
  }

  override async update(
    resourceUtilizationId: NonEmptyString<string>,
    data: Partial<ResourceUtilizationData>
  ): Promise<ResourceUtilizationResponse> {
    return super.update(resourceUtilizationId, data);
  }

  override async delete(resourceUtilizationId: NonEmptyString<string>): Promise<void> {
    await super.delete(resourceUtilizationId);
  }

  async updateUtilization(
    resourceUtilizationId: NonEmptyString<string>,
    utilizationData: { utilized_capacity: number; efficiency: number; utilization_end?: Timestamp }
  ): Promise<ResourceUtilizationResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `resource_utilizations/${resourceUtilizationId}/utilization`,
        utilizationData
      );
      return this.mapResponse((response as any).resource_utilization ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'updateUtilization', resourceUtilizationId);
    }
  }

  private handleError(error: any, _operation: string, _resourceUtilizationId?: string): never {
    throw error;
  }
}
