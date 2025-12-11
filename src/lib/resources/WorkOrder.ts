import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum WorkorderStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  ON_HOLD = 'ON_HOLD',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum WorkorderType {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  INSPECTION = 'INSPECTION',
  INSTALLATION = 'INSTALLATION',
  UPGRADE = 'UPGRADE',
  CLEANING = 'CLEANING',
  CALIBRATION = 'CALIBRATION',
  QUALITY_CHECK = 'QUALITY_CHECK',
}

export enum WorkorderPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  ROUTINE = 'ROUTINE',
}

export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',
  CORRECTIVE = 'CORRECTIVE',
  PREDICTIVE = 'PREDICTIVE',
  CONDITION_BASED = 'CONDITION_BASED',
  EMERGENCY = 'EMERGENCY',
}

// Core Interfaces
export interface Resource {
  id: NonEmptyString<string>;
  type: 'WORKER' | 'EQUIPMENT' | 'TOOL' | 'MATERIAL';
  name: string;
  quantity?: number;
  unit?: string;
  cost: {
    per_unit?: number;
    total?: number;
    currency: string;
  };
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_USE' | 'UNAVAILABLE';
  schedule?: {
    start: Timestamp;
    end: Timestamp;
  };
  location?: string;
}

export interface Task {
  id: NonEmptyString<string>;
  sequence: number;
  description: string;
  duration: {
    estimated: number; // in minutes
    actual?: number;
  };
  resources: Resource[];
  dependencies?: NonEmptyString<string>[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  details: {
    instructions?: string[];
    safety_requirements?: string[];
    quality_checks?: Array<{
      parameter: string;
      expected_value: string;
      actual_value?: string;
      passed?: boolean;
    }>;
  };
  completion?: {
    by: string;
    at: Timestamp;
    notes?: string[];
  };
}

export interface SafetyRequirement {
  type: NonEmptyString<string>;
  description: string;
  ppe: string[];
  hazard_level: 'LOW' | 'MEDIUM' | 'HIGH';
  precautions: string[];
  emergency_procedures?: string[];
}

export interface WorkorderMetrics {
  schedule: {
    planned_start: Timestamp;
    planned_end: Timestamp;
    actual_start?: Timestamp;
    actual_end?: Timestamp;
  };
  costs: {
    estimated: number;
    actual?: number;
    currency: string;
  };
  labor: {
    hours_estimated: number;
    hours_actual?: number;
  };
  downtime?: {
    planned: number;
    actual?: number;
    unit: 'HOURS' | 'MINUTES';
  };
}

export interface QualityCheck {
  parameter: NonEmptyString<string>;
  specification: string;
  measurement: string;
  tolerance?: {
    min?: number;
    max?: number;
    unit: string;
  };
  result?: 'PASS' | 'FAIL';
  inspector?: string;
  inspection_date?: Timestamp;
  notes?: string;
}

export interface WorkorderData {
  type: WorkorderType;
  maintenance_type?: MaintenanceType;
  description: NonEmptyString<string>;
  priority: WorkorderPriority;
  asset_id: NonEmptyString<string>;
  location: {
    facility_id: NonEmptyString<string>;
    area: string;
    position?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  tasks: Task[];
  resources: Resource[];
  safety_requirements: SafetyRequirement[];
  quality_checks: QualityCheck[];
  metrics: WorkorderMetrics;
  attachments?: Array<{
    type: string;
    url: NonEmptyString<string>;
    name: string;
    uploaded_at: Timestamp;
  }>;
  related_workorders?: NonEmptyString<string>[];
  warranty_information?: {
    warranty_id: string;
    coverage_details: string;
    expiration_date: Timestamp;
  };
  metadata?: Record<string, unknown>;
  org_id?: string;
  tags?: string[];
}

// Response Type with Discriminated Union
export type WorkorderResponse = {
  id: NonEmptyString<string>;
  object: 'workorder';
  created_at: Timestamp;
  updated_at: Timestamp;
  status: WorkorderStatus;
  data: WorkorderData;
} & (
  | { status: WorkorderStatus.DRAFT; draft_details: { created_by: string } }
  | {
      status: WorkorderStatus.SCHEDULED;
      schedule_details: {
        start_date: Timestamp;
        end_date: Timestamp;
        assigned_resources: Resource[];
      };
    }
  | {
      status: WorkorderStatus.IN_PROGRESS;
      progress: {
        completed_tasks: number;
        total_tasks: number;
        current_task?: Task;
        time_elapsed: number;
      };
    }
  | {
      status: WorkorderStatus.COMPLETED;
      completion_details: {
        completed_at: Timestamp;
        completed_by: string;
        quality_results: QualityCheck[];
      };
    }
  | { status: WorkorderStatus.FAILED; failure_details: { reason: string; failed_tasks: Task[] } }
);

// Error Classes
export class WorkorderError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class WorkorderNotFoundError extends WorkorderError {
  constructor(workorderId: string) {
    super(`Work order with ID ${workorderId} not found`, { workorderId });
  }
}

export class WorkorderValidationError extends WorkorderError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export class ResourceConflictError extends WorkorderError {
  constructor(
    message: string,
    public readonly resourceId?: string
  ) {
    super(message, { resourceId });
  }
}

// Main Workorders Class
export class Workorders {
  constructor(private readonly client: ApiClientLike) {}

  private validateWorkorderData(data: WorkorderData): void {
    if (!data.description) throw new WorkorderValidationError('Description is required');
    if (!data.asset_id) throw new WorkorderValidationError('Asset ID is required');
    if (!data.location.facility_id) throw new WorkorderValidationError('Facility ID is required');
    if (!data.tasks?.length) throw new WorkorderValidationError('At least one task is required');
  }

  private mapResponse(data: any): WorkorderResponse {
    if (!data?.id || !data.status) throw new WorkorderError('Invalid response format');

    const baseResponse = {
      id: data.id,
      object: 'workorder' as const,
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: data.status,
      data: data.data || data,
    };

    switch (data.status) {
      case WorkorderStatus.DRAFT:
        return {
          ...baseResponse,
          status: WorkorderStatus.DRAFT,
          draft_details: { created_by: data.created_by || 'unknown' },
        };
      case WorkorderStatus.SCHEDULED:
        return {
          ...baseResponse,
          status: WorkorderStatus.SCHEDULED,
          schedule_details: data.schedule_details,
        };
      case WorkorderStatus.IN_PROGRESS:
        return { ...baseResponse, status: WorkorderStatus.IN_PROGRESS, progress: data.progress };
      case WorkorderStatus.COMPLETED:
        return {
          ...baseResponse,
          status: WorkorderStatus.COMPLETED,
          completion_details: data.completion_details,
        };
      case WorkorderStatus.FAILED:
        return {
          ...baseResponse,
          status: WorkorderStatus.FAILED,
          failure_details: data.failure_details,
        };
      default:
        return baseResponse as WorkorderResponse;
    }
  }

  async list(
    params: {
      status?: WorkorderStatus;
      type?: WorkorderType;
      priority?: WorkorderPriority;
      asset_id?: string;
      facility_id?: string;
      assigned_to?: string;
      date_range?: { from: Date; to: Date };
      org_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    workorders: WorkorderResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.priority && { priority: params.priority }),
      ...(params.asset_id && { asset_id: params.asset_id }),
      ...(params.facility_id && { facility_id: params.facility_id }),
      ...(params.assigned_to && { assigned_to: params.assigned_to }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await this.client.request('GET', `workorders?${query}`);
    return {
      workorders: response.workorders.map(this.mapResponse),
      pagination: response.pagination || {
        total: response.workorders.length,
        limit: params.limit || 100,
        offset: params.offset || 0,
      },
    };
  }

  async get(workorderId: NonEmptyString<string>): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('GET', `workorders/${workorderId}`);
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'get', workorderId);
    }
  }

  async create(data: WorkorderData): Promise<WorkorderResponse> {
    this.validateWorkorderData(data);
    try {
      const response = await this.client.request('POST', 'workorders', data);
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    workorderId: NonEmptyString<string>,
    data: Partial<WorkorderData>
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('PUT', `workorders/${workorderId}`, data);
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'update', workorderId);
    }
  }

  async delete(workorderId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `workorders/${workorderId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', workorderId);
    }
  }

  async startWork(workorderId: NonEmptyString<string>): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('POST', `workorders/${workorderId}/start`);
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'startWork', workorderId);
    }
  }

  async completeWork(
    workorderId: NonEmptyString<string>,
    completionData: {
      notes?: string;
      final_cost?: number;
      actual_duration?: number;
    } = {}
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/complete`,
        completionData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'completeWork', workorderId);
    }
  }

  async cancelWork(
    workorderId: NonEmptyString<string>,
    cancellationData: { reason: string; notes?: string }
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/cancel`,
        cancellationData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'cancelWork', workorderId);
    }
  }

  async putOnHold(
    workorderId: NonEmptyString<string>,
    holdData: { reason: string; estimated_resume_date?: Timestamp }
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/hold`,
        holdData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'putOnHold', workorderId);
    }
  }

  async resumeWork(workorderId: NonEmptyString<string>): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('POST', `workorders/${workorderId}/resume`);
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'resumeWork', workorderId);
    }
  }

  async assignWorker(
    workorderId: NonEmptyString<string>,
    workerId: NonEmptyString<string>
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('POST', `workorders/${workorderId}/assign`, {
        worker_id: workerId,
      });
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'assignWorker', workorderId);
    }
  }

  async addNote(
    workorderId: NonEmptyString<string>,
    note: NonEmptyString<string>
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request('POST', `workorders/${workorderId}/notes`, {
        note,
      });
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'addNote', workorderId);
    }
  }

  async updateTask(
    workorderId: NonEmptyString<string>,
    taskId: NonEmptyString<string>,
    taskData: Partial<Task>
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'PUT',
        `workorders/${workorderId}/tasks/${taskId}`,
        taskData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'updateTask', workorderId);
    }
  }

  async completeTask(
    workorderId: NonEmptyString<string>,
    taskId: NonEmptyString<string>,
    completionData: {
      actual_duration: number;
      quality_check_results?: Array<{ parameter: string; actual_value: string; passed: boolean }>;
      notes?: string;
    }
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/tasks/${taskId}/complete`,
        completionData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'completeTask', workorderId);
    }
  }

  async assignResource(
    workorderId: NonEmptyString<string>,
    resourceData: Resource
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/resources`,
        resourceData
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'assignResource', workorderId);
    }
  }

  async submitQualityCheck(
    workorderId: NonEmptyString<string>,
    qualityChecks: QualityCheck[]
  ): Promise<WorkorderResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `workorders/${workorderId}/quality-checks`,
        { quality_checks: qualityChecks }
      );
      return this.mapResponse(response.workorder);
    } catch (error: any) {
      throw this.handleError(error, 'submitQualityCheck', workorderId);
    }
  }

  async getMetrics(
    params: {
      date_range?: { start: Date; end: Date };
      type?: WorkorderType;
      facility_id?: string;
      org_id?: string;
      group_by?: 'DAY' | 'WEEK' | 'MONTH';
    } = {}
  ): Promise<{
    total_workorders: number;
    average_completion_time: number;
    on_time_completion_rate: number;
    resource_utilization: Record<string, number>;
    cost_metrics: { total_cost: number; average_cost: number; cost_variance: number };
    quality_metrics: { pass_rate: number; failure_rate: number; rework_rate: number };
    status_breakdown: Record<WorkorderStatus, number>;
    type_breakdown: Record<WorkorderType, number>;
    trends?: Record<string, number>;
  }> {
    const query = new URLSearchParams({
      ...(params.date_range?.start && { start_date: params.date_range.start.toISOString() }),
      ...(params.date_range?.end && { end_date: params.date_range.end.toISOString() }),
      ...(params.type && { type: params.type }),
      ...(params.facility_id && { facility_id: params.facility_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.group_by && { group_by: params.group_by }),
    });

    try {
      const response = await this.client.request('GET', `workorders/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, _operation: string, _workorderId?: string): never {
    throw error;
  }
}

export default Workorders;
