import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ResourceUtilizationStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export enum ResourceCategory {
  WAREHOUSE = 'WAREHOUSE',
  MANUFACTURING = 'MANUFACTURING',
  STAFFING = 'STAFFING'
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
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'ResourceUtilizationError';
  }
}

export class ResourceUtilizationNotFoundError extends ResourceUtilizationError {
  constructor(resourceUtilizationId: string) {
    super(`Resource utilization with ID ${resourceUtilizationId} not found`, { resourceUtilizationId });
  }
}

export class ResourceUtilizationValidationError extends ResourceUtilizationError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class ResourceUtilization {
  constructor(private readonly stateset: ApiClientLike) {}

  private validateResourceUtilizationData(data: ResourceUtilizationData): void {
    if (!data.resource_id) throw new ResourceUtilizationValidationError('Resource ID is required');
    if (!data.utilization_start) throw new ResourceUtilizationValidationError('Utilization start date is required');
    if (data.capacity < 0) throw new ResourceUtilizationValidationError('Capacity cannot be negative');
    if (data.utilized_capacity < 0) throw new ResourceUtilizationValidationError('Utilized capacity cannot be negative');
    if (data.efficiency < 0 || data.efficiency > 100) throw new ResourceUtilizationValidationError('Efficiency must be between 0 and 100');
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

  async list(params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.resource_id) queryParams.append('resource_id', params.resource_id);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `resource_utilizations?${queryParams.toString()}`);
      return {
        resource_utilizations: response.resource_utilizations.map(this.mapResponse),
        pagination: {
          total: response.total || response.resource_utilizations.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(resourceUtilizationId: NonEmptyString<string>): Promise<ResourceUtilizationResponse> {
    try {
      const response = await this.stateset.request('GET', `resource_utilizations/${resourceUtilizationId}`);
      return this.mapResponse(response.resource_utilization);
    } catch (error: any) {
      throw this.handleError(error, 'get', resourceUtilizationId);
    }
  }

  async create(data: ResourceUtilizationData): Promise<ResourceUtilizationResponse> {
    this.validateResourceUtilizationData(data);
    try {
      const response = await this.stateset.request('POST', 'resource_utilizations', data);
      return this.mapResponse(response.resource_utilization);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    resourceUtilizationId: NonEmptyString<string>,
    data: Partial<ResourceUtilizationData>
  ): Promise<ResourceUtilizationResponse> {
    try {
      const response = await this.stateset.request('PUT', `resource_utilizations/${resourceUtilizationId}`, data);
      return this.mapResponse(response.resource_utilization);
    } catch (error: any) {
      throw this.handleError(error, 'update', resourceUtilizationId);
    }
  }

  async delete(resourceUtilizationId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `resource_utilizations/${resourceUtilizationId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', resourceUtilizationId);
    }
  }

  async updateUtilization(
    resourceUtilizationId: NonEmptyString<string>,
    utilizationData: { utilized_capacity: number; efficiency: number; utilization_end?: Timestamp }
  ): Promise<ResourceUtilizationResponse> {
    try {
      const response = await this.stateset.request(
        'POST',
        `resource_utilizations/${resourceUtilizationId}/utilization`,
        utilizationData
      );
      return this.mapResponse(response.resource_utilization);
    } catch (error: any) {
      throw this.handleError(error, 'updateUtilization', resourceUtilizationId);
    }
  }

  private handleError(error: any, operation: string, resourceUtilizationId?: string): never {
    if (error.status === 404) throw new ResourceUtilizationNotFoundError(resourceUtilizationId || 'unknown');
    if (error.status === 400) throw new ResourceUtilizationValidationError(error.message, error.errors);
    throw new ResourceUtilizationError(
      `Failed to ${operation} resource utilization: ${error.message}`,
      { operation, originalError: error }
    );
  }
}