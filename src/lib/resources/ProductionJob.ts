import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums and Types
export enum JobStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export enum JobPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Interfaces for ProductionJob data structures
export interface WorkStation {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  availability?: boolean;
}

export interface MaterialRequirement {
  item_id: string;
  quantity_required: number;
  quantity_allocated?: number;
  warehouse_location?: string;
  batch_number?: string;
}

export interface QualityCheck {
  check_point: string;
  criteria: string;
  result?: 'PASS' | 'FAIL';
  inspector?: string;
  timestamp?: string;
  notes?: string;
}

export interface JobMetadata {
  customer_id?: string;
  order_reference?: string;
  batch_number?: string;
  department?: string;
  facility_id?: string;
  [key: string]: any;
}

export interface JobData {
  name: string;
  description?: string;
  bom_id: string;
  quantity: number;
  planned_start_date: string;
  planned_end_date: string;
  priority: JobPriority;
  workstation?: WorkStation;
  materials: MaterialRequirement[];
  quality_checks?: QualityCheck[];
  metadata?: JobMetadata;
  actual_start_date?: string;
  actual_end_date?: string;
  labor_hours?: number;
  yield_quantity?: number;
  scrap_quantity?: number;
  org_id?: string;
}

// Response Interfaces
interface BaseJobResponse {
  id: string;
  object: 'productionjob';
  created_at: string;
  updated_at: string;
  status: JobStatus;
  data: JobData;
}

interface PlannedJobResponse extends BaseJobResponse {
  status: JobStatus.PLANNED;
  planned: true;
}

interface InProgressJobResponse extends BaseJobResponse {
  status: JobStatus.IN_PROGRESS;
  in_progress: true;
}

interface CompletedJobResponse extends BaseJobResponse {
  status: JobStatus.COMPLETED;
  completed: true;
}

interface CancelledJobResponse extends BaseJobResponse {
  status: JobStatus.CANCELLED;
  cancelled: true;
}

interface OnHoldJobResponse extends BaseJobResponse {
  status: JobStatus.ON_HOLD;
  on_hold: true;
}

export type JobResponse =
  | PlannedJobResponse
  | InProgressJobResponse
  | CompletedJobResponse
  | CancelledJobResponse
  | OnHoldJobResponse;

// Custom Error Classes
export class JobNotFoundError extends Error {
  constructor(jobId: string) {
    super(`Production Job with ID ${jobId} not found`);
    this.name = 'JobNotFoundError';
  }
}

export class JobValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JobValidationError';
  }
}

export class JobStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JobStateError';
  }
}

// Main ProductionJob Class
class ProductionJob extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'productionjob', 'productionjob');
    this.singleKey = 'update_productionjob_by_pk';
  }

  protected override mapSingle(data: any): any {
    return this.handleCommandResponse({ update_productionjob_by_pk: data });
  }

  protected override mapListItem(item: any): any {
    return this.mapSingle(item);
  }

  /**
   * Validates job data
   */
  private validateJobData(jobData: JobData): void {
    if (jobData.quantity <= 0) {
      throw new JobValidationError('Production quantity must be greater than 0');
    }

    if (new Date(jobData.planned_end_date) <= new Date(jobData.planned_start_date)) {
      throw new JobValidationError('Planned end date must be after planned start date');
    }

    jobData.materials.forEach(material => {
      if (material.quantity_required <= 0) {
        throw new JobValidationError('Material quantity must be greater than 0');
      }
    });
  }

  /**
   * Processes API response into typed JobResponse
   */
  private handleCommandResponse(response: any): JobResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_productionjob_by_pk) {
      throw new Error('Unexpected response format');
    }

    const jobData = response.update_productionjob_by_pk;

    const baseResponse: BaseJobResponse = {
      id: jobData.id,
      object: 'productionjob',
      created_at: jobData.created_at,
      updated_at: jobData.updated_at,
      status: jobData.status,
      data: jobData.data,
    };

    switch (jobData.status) {
      case JobStatus.PLANNED:
        return { ...baseResponse, status: JobStatus.PLANNED, planned: true };
      case JobStatus.IN_PROGRESS:
        return { ...baseResponse, status: JobStatus.IN_PROGRESS, in_progress: true };
      case JobStatus.COMPLETED:
        return { ...baseResponse, status: JobStatus.COMPLETED, completed: true };
      case JobStatus.CANCELLED:
        return { ...baseResponse, status: JobStatus.CANCELLED, cancelled: true };
      case JobStatus.ON_HOLD:
        return { ...baseResponse, status: JobStatus.ON_HOLD, on_hold: true };
      default:
        throw new Error(`Unexpected job status: ${jobData.status}`);
    }
  }

  /**
   * List all production jobs with optional filtering
   */
  override async list(params?: {
    status?: JobStatus;
    priority?: JobPriority;
    bom_id?: string;
    org_id?: string;
    start_after?: Date;
    start_before?: Date;
  }): Promise<JobResponse[]> {
    return super.list(params as any);
  }

  /**
   * Get a specific production job by ID
   * @param jobId - Production job ID
   * @returns JobResponse object
   */
  override async get(jobId: string): Promise<JobResponse> {
    return super.get(jobId);
  }

  /**
   * Create a new production job
   * @param jobData - JobData object
   * @returns JobResponse object
   */
  override async create(jobData: JobData): Promise<JobResponse> {
    this.validateJobData(jobData);
    return super.create(jobData);
  }

  /**
   * Update an existing production job
   * @param jobId - Production job ID
   * @param jobData - Partial<JobData> object
   * @returns JobResponse object
   */
  override async update(jobId: string, jobData: Partial<JobData>): Promise<JobResponse> {
    return super.update(jobId, jobData);
  }

  /**
   * Delete a production job
   * @param jobId - Production job ID
   */
  override async delete(jobId: string): Promise<void> {
    await super.delete(jobId);
  }

  /**
   * Status management methods
   * @param jobId - Production job ID
   * @returns InProgressJobResponse object
   */
  async start(jobId: string): Promise<InProgressJobResponse> {
    const response = await this.client.request('POST', `productionjob/${jobId}/start`);
    return this.handleCommandResponse(response) as InProgressJobResponse;
  }

  /**
   * Complete a production job
   * @param jobId - Production job ID
   * @param results - Results object
   * @returns CompletedJobResponse object
   */
  async complete(
    jobId: string,
    results: {
      yield_quantity: number;
      scrap_quantity?: number;
      labor_hours?: number;
    }
  ): Promise<CompletedJobResponse> {
    const response = await this.client.request(
      'POST',
      `productionjob/${jobId}/complete`,
      results
    );
    return this.handleCommandResponse(response) as CompletedJobResponse;
  }

  /**
   * Cancel a production job
   * @param jobId - Production job ID
   * @param reason - Reason for cancellation
   * @returns CancelledJobResponse object
   */
  async cancel(jobId: string, reason: string): Promise<CancelledJobResponse> {
    const response = await this.client.request('POST', `productionjob/${jobId}/cancel`, {
      reason,
    });
    return this.handleCommandResponse(response) as CancelledJobResponse;
  }

  /**
   * Hold a production job
   * @param jobId - Production job ID
   * @param reason - Reason for holding
   * @returns OnHoldJobResponse object
   */
  async hold(jobId: string, reason: string): Promise<OnHoldJobResponse> {
    const response = await this.client.request('POST', `productionjob/${jobId}/hold`, { reason });
    return this.handleCommandResponse(response) as OnHoldJobResponse;
  }

  /**
   * Resume a production job
   * @param jobId - Production job ID
   * @returns InProgressJobResponse object
   */
  async resume(jobId: string): Promise<InProgressJobResponse> {
    const response = await this.client.request('POST', `productionjob/${jobId}/resume`);
    return this.handleCommandResponse(response) as InProgressJobResponse;
  }

  /**
   * Material management methods
   */
  async allocateMaterial(
    jobId: string,
    materialId: string,
    allocation: {
      quantity: number;
      warehouse_location?: string;
      batch_number?: string;
    }
  ): Promise<JobResponse> {
    const response = await this.client.request(
      'POST',
      `productionjob/${jobId}/materials/${materialId}/allocate`,
      allocation
    );
    return this.handleCommandResponse(response);
  }

  /**
   * Record material usage
   */
  async recordMaterialUsage(
    jobId: string,
    materialId: string,
    usage: {
      quantity_used: number;
      scrap_quantity?: number;
      notes?: string;
    }
  ): Promise<JobResponse> {
    const response = await this.client.request(
      'POST',
      `productionjob/${jobId}/materials/${materialId}/usage`,
      usage
    );
    return this.handleCommandResponse(response);
  }

  /**
   * Quality management methods
   */
  async addQualityCheck(jobId: string, check: QualityCheck): Promise<JobResponse> {
    const response = await this.client.request(
      'POST',
      `productionjob/${jobId}/quality-checks`,
      check
    );
    return this.handleCommandResponse(response);
  }

  /**
   * Update a quality check
   */
  async updateQualityCheck(
    jobId: string,
    checkId: string,
    result: {
      result: 'PASS' | 'FAIL';
      inspector: string;
      notes?: string;
    }
  ): Promise<JobResponse> {
    const response = await this.client.request(
      'PUT',
      `productionjob/${jobId}/quality-checks/${checkId}`,
      result
    );
    return this.handleCommandResponse(response);
  }

  /**
   * Progress tracking methods
   */
  async updateProgress(
    jobId: string,
    progress: {
      completed_quantity: number;
      remaining_time_estimate?: number;
      notes?: string;
    }
  ): Promise<JobResponse> {
    const response = await this.client.request(
      'POST',
      `productionjob/${jobId}/progress`,
      progress
    );
    return this.handleCommandResponse(response);
  }

  /**
   * Report generation methods
   */
  async generateReport(
    jobId: string,
    type: 'summary' | 'detailed' | 'quality' | 'materials'
  ): Promise<{
    url: string;
    generated_at: string;
    expires_at: string;
  }> {
    const response = await this.client.request(
      'GET',
      `productionjob/${jobId}/report?type=${type}`
    );
    return response;
  }
}

export default ProductionJob;
