import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum WorkOrderLineStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  FAILED = 'FAILED',
}

export enum WorkOrderLineType {
  PART = 'PART',
  LABOR = 'LABOR',
  MATERIAL = 'MATERIAL',
  SERVICE = 'SERVICE',
  TOOL = 'TOOL',
}

// Core Interfaces
export interface WorkOrderLineItem {
  item_id: NonEmptyString<string>;
  sku?: string;
  description: string;
  quantity: number;
  unit_of_measure: string;
  unit_cost: number;
  total_cost: number;
  currency: string;
}

export interface WorkOrderLineData {
  work_order_id: NonEmptyString<string>;
  type: WorkOrderLineType;
  status: WorkOrderLineStatus;
  item: WorkOrderLineItem;
  task_id?: NonEmptyString<string>;
  resource_id?: NonEmptyString<string>;
  execution?: {
    started_at?: Timestamp;
    completed_at?: Timestamp;
    performed_by?: string;
    notes?: string[];
  };
  cost_details: {
    estimated_cost: number;
    actual_cost?: number;
    currency: string;
    cost_breakdown?: Array<{
      category: string;
      amount: number;
      description?: string;
    }>;
  };
  quality_check?: {
    parameter: string;
    expected_value: string;
    actual_value?: string;
    passed?: boolean;
    checked_at?: Timestamp;
    checked_by?: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  status_history: Array<{
    status: WorkOrderLineStatus;
    changed_at: Timestamp;
    changed_by: string;
    reason?: string;
  }>;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type
export interface WorkOrderLineResponse {
  id: NonEmptyString<string>;
  object: 'work_order_line';
  data: WorkOrderLineData;
}

// Error Classes
export class WorkOrderLineError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WorkOrderLineNotFoundError extends WorkOrderLineError {
  constructor(workOrderLineId: string) {
    super(`Work order line with ID ${workOrderLineId} not found`, { workOrderLineId });
  }
}

export class WorkOrderLineValidationError extends WorkOrderLineError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Main WorkOrderLines Class
export class WorkOrderLines {
  constructor(private readonly client: ApiClientLike) {}

  private validateWorkOrderLineData(data: WorkOrderLineData): void {
    if (!data.work_order_id) {
      throw new WorkOrderLineValidationError('Work order ID is required');
    }
    if (!data.item?.item_id) {
      throw new WorkOrderLineValidationError('Item ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new WorkOrderLineValidationError('Valid quantity is required');
    }
    if (data.cost_details.estimated_cost < 0) {
      throw new WorkOrderLineValidationError('Estimated cost cannot be negative');
    }
  }

  private mapResponse(data: any): WorkOrderLineResponse {
    if (!data?.id || !data.work_order_id) {
      throw new WorkOrderLineError('Invalid response format');
    }

    return {
      id: data.id,
      object: 'work_order_line',
      data: {
        work_order_id: data.work_order_id,
        type: data.type,
        status: data.status,
        item: data.item,
        task_id: data.task_id,
        resource_id: data.resource_id,
        execution: data.execution,
        cost_details: data.cost_details,
        quality_check: data.quality_check,
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
      work_order_id?: string;
      status?: WorkOrderLineStatus;
      type?: WorkOrderLineType;
      task_id?: string;
      resource_id?: string;
      org_id?: string;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    work_order_lines: WorkOrderLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.work_order_id && { work_order_id: params.work_order_id }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.task_id && { task_id: params.task_id }),
      ...(params.resource_id && { resource_id: params.resource_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.client.request('GET', `work_order_line_items?${query}`);
      return {
        work_order_lines: response.work_order_lines.map(this.mapResponse),
        pagination: response.pagination || {
          total: response.work_order_lines.length,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(workOrderLineId: NonEmptyString<string>): Promise<WorkOrderLineResponse> {
    try {
      const response = await this.client.request('GET', `work_order_line_items/${workOrderLineId}`);
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'get', workOrderLineId);
    }
  }

  async create(data: WorkOrderLineData): Promise<WorkOrderLineResponse> {
    this.validateWorkOrderLineData(data);
    try {
      const response = await this.client.request('POST', 'work_order_line_items', data);
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    workOrderLineId: NonEmptyString<string>,
    data: Partial<WorkOrderLineData>
  ): Promise<WorkOrderLineResponse> {
    try {
      const response = await this.client.request(
        'PUT',
        `work_order_line_items/${workOrderLineId}`,
        data
      );
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'update', workOrderLineId);
    }
  }

  async delete(workOrderLineId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `work_order_line_items/${workOrderLineId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', workOrderLineId);
    }
  }

  async updateStatus(
    workOrderLineId: NonEmptyString<string>,
    status: WorkOrderLineStatus,
    reason?: string
  ): Promise<WorkOrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `work_order_line_items/${workOrderLineId}/status`,
        { status, reason }
      );
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', workOrderLineId);
    }
  }

  async recordExecution(
    workOrderLineId: NonEmptyString<string>,
    executionData: Partial<WorkOrderLineData['execution']>
  ): Promise<WorkOrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `work_order_line_items/${workOrderLineId}/execution`,
        executionData
      );
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'recordExecution', workOrderLineId);
    }
  }

  async submitQualityCheck(
    workOrderLineId: NonEmptyString<string>,
    qualityCheck: WorkOrderLineData['quality_check']
  ): Promise<WorkOrderLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `work_order_line_items/${workOrderLineId}/quality-check`,
        qualityCheck
      );
      return this.mapResponse(response.work_order_line);
    } catch (error: any) {
      throw this.handleError(error, 'submitQualityCheck', workOrderLineId);
    }
  }

  async getMetrics(
    params: {
      work_order_id?: string;
      org_id?: string;
      date_range?: { from: Date; to: Date };
    } = {}
  ): Promise<{
    total_lines: number;
    status_breakdown: Record<WorkOrderLineStatus, number>;
    type_breakdown: Record<WorkOrderLineType, number>;
    average_cost: number;
    completion_rate: number;
    quality_pass_rate: number;
  }> {
    const query = new URLSearchParams({
      ...(params.work_order_id && { work_order_id: params.work_order_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    try {
      const response = await this.client.request('GET', `work_order_line_items/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, operation: string, workOrderLineId?: string): never {
    if (error.status === 404) throw new WorkOrderLineNotFoundError(workOrderLineId || 'unknown');
    if (error.status === 400) throw new WorkOrderLineValidationError(error.message, error.errors);
    throw new WorkOrderLineError(`Failed to ${operation} work order line: ${error.message}`, {
      operation,
      originalError: error,
    });
  }
}

export default WorkOrderLines;
