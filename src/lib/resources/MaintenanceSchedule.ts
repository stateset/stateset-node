import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum MaintenanceScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
}

// Interfaces
export interface MaintenanceScheduleData {
  asset_id: NonEmptyString<string>;
  machine_id?: NonEmptyString<string>;
  status: MaintenanceScheduleStatus;
  type: MaintenanceType;
  scheduled_date: Timestamp;
  due_date: Timestamp;
  completed_date?: Timestamp;
  technician_id?: NonEmptyString<string>;
  description: string;
  duration_estimate: number; // in hours
  actual_duration?: number; // in hours
  cost_estimate: number;
  actual_cost?: number;
  currency: string;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface MaintenanceScheduleResponse {
  id: NonEmptyString<string>;
  object: 'maintenance_schedule';
  data: MaintenanceScheduleData;
}

// Error Classes
export class MaintenanceScheduleError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MaintenanceScheduleError';
  }
}

export class MaintenanceScheduleNotFoundError extends MaintenanceScheduleError {
  constructor(maintenanceScheduleId: string) {
    super(`Maintenance schedule with ID ${maintenanceScheduleId} not found`, {
      maintenanceScheduleId,
    });
  }
}

export class MaintenanceScheduleValidationError extends MaintenanceScheduleError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class MaintenanceSchedules extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'maintenance_schedules', 'maintenance_schedules');
    this.singleKey = 'maintenance_schedule';
    this.listKey = 'maintenance_schedules';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateMaintenanceScheduleData(data: MaintenanceScheduleData): void {
    if (!data.asset_id) throw new MaintenanceScheduleValidationError('Asset ID is required');
    if (!data.scheduled_date)
      throw new MaintenanceScheduleValidationError('Scheduled date is required');
    if (!data.due_date) throw new MaintenanceScheduleValidationError('Due date is required');
    if (data.duration_estimate < 0)
      throw new MaintenanceScheduleValidationError('Duration estimate cannot be negative');
    if (data.cost_estimate < 0)
      throw new MaintenanceScheduleValidationError('Cost estimate cannot be negative');
  }

  private mapResponse(data: any): MaintenanceScheduleResponse {
    if (!data?.id) throw new MaintenanceScheduleError('Invalid response format');
    return {
      id: data.id,
      object: 'maintenance_schedule',
      data: {
        asset_id: data.asset_id,
        machine_id: data.machine_id,
        status: data.status,
        type: data.type,
        scheduled_date: data.scheduled_date,
        due_date: data.due_date,
        completed_date: data.completed_date,
        technician_id: data.technician_id,
        description: data.description,
        duration_estimate: data.duration_estimate,
        actual_duration: data.actual_duration,
        cost_estimate: data.cost_estimate,
        actual_cost: data.actual_cost,
        currency: data.currency,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    asset_id?: string;
    status?: MaintenanceScheduleStatus;
    type?: MaintenanceType;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    maintenance_schedules: MaintenanceScheduleResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const maintenance_schedules = (response as any).maintenance_schedules ?? response;

    return {
      maintenance_schedules,
      pagination: (response as any).pagination || {
        total: maintenance_schedules.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(maintenanceScheduleId: NonEmptyString<string>): Promise<MaintenanceScheduleResponse> {
    return super.get(maintenanceScheduleId);
  }

  override async create(data: MaintenanceScheduleData): Promise<MaintenanceScheduleResponse> {
    this.validateMaintenanceScheduleData(data);
    return super.create(data);
  }

  override async update(
    maintenanceScheduleId: NonEmptyString<string>,
    data: Partial<MaintenanceScheduleData>
  ): Promise<MaintenanceScheduleResponse> {
    return super.update(maintenanceScheduleId, data);
  }

  override async delete(maintenanceScheduleId: NonEmptyString<string>): Promise<void> {
    await super.delete(maintenanceScheduleId);
  }

  async complete(
    maintenanceScheduleId: NonEmptyString<string>,
    completionData: { completed_date: Timestamp; actual_duration: number; actual_cost: number }
  ): Promise<MaintenanceScheduleResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `maintenance_schedules/${maintenanceScheduleId}/complete`,
        completionData
      );
      return this.mapResponse((response as any).maintenance_schedule ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'complete', maintenanceScheduleId);
    }
  }

  private handleError(error: any, _operation: string, _maintenanceScheduleId?: string): never {
    throw error;
  }
}
