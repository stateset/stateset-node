import { stateset } from '../../stateset-client';
export declare enum JobStatus {
    PLANNED = "PLANNED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD"
}
export declare enum JobPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
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
export type JobResponse = PlannedJobResponse | InProgressJobResponse | CompletedJobResponse | CancelledJobResponse | OnHoldJobResponse;
export declare class JobNotFoundError extends Error {
    constructor(jobId: string);
}
export declare class JobValidationError extends Error {
    constructor(message: string);
}
export declare class JobStateError extends Error {
    constructor(message: string);
}
declare class ProductionJob {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * Validates job data
     */
    private validateJobData;
    /**
     * Processes API response into typed JobResponse
     */
    private handleCommandResponse;
    /**
     * List all production jobs with optional filtering
     */
    list(params?: {
        status?: JobStatus;
        priority?: JobPriority;
        bom_id?: string;
        org_id?: string;
        start_after?: Date;
        start_before?: Date;
    }): Promise<JobResponse[]>;
    /**
     * Get a specific production job by ID
     * @param jobId - Production job ID
     * @returns JobResponse object
     */
    get(jobId: string): Promise<JobResponse>;
    /**
     * Create a new production job
     * @param jobData - JobData object
     * @returns JobResponse object
     */
    create(jobData: JobData): Promise<JobResponse>;
    /**
     * Update an existing production job
     * @param jobId - Production job ID
     * @param jobData - Partial<JobData> object
     * @returns JobResponse object
     */
    update(jobId: string, jobData: Partial<JobData>): Promise<JobResponse>;
    /**
     * Delete a production job
     * @param jobId - Production job ID
     */
    delete(jobId: string): Promise<void>;
    /**
     * Status management methods
     * @param jobId - Production job ID
     * @returns InProgressJobResponse object
     */
    start(jobId: string): Promise<InProgressJobResponse>;
    /**
     * Complete a production job
     * @param jobId - Production job ID
     * @param results - Results object
     * @returns CompletedJobResponse object
     */
    complete(jobId: string, results: {
        yield_quantity: number;
        scrap_quantity?: number;
        labor_hours?: number;
    }): Promise<CompletedJobResponse>;
    /**
     * Cancel a production job
     * @param jobId - Production job ID
     * @param reason - Reason for cancellation
     * @returns CancelledJobResponse object
     */
    cancel(jobId: string, reason: string): Promise<CancelledJobResponse>;
    /**
     * Hold a production job
     * @param jobId - Production job ID
     * @param reason - Reason for holding
     * @returns OnHoldJobResponse object
     */
    hold(jobId: string, reason: string): Promise<OnHoldJobResponse>;
    /**
     * Resume a production job
     * @param jobId - Production job ID
     * @returns InProgressJobResponse object
     */
    resume(jobId: string): Promise<InProgressJobResponse>;
    /**
     * Material management methods
     */
    allocateMaterial(jobId: string, materialId: string, allocation: {
        quantity: number;
        warehouse_location?: string;
        batch_number?: string;
    }): Promise<JobResponse>;
    /**
     * Record material usage
     */
    recordMaterialUsage(jobId: string, materialId: string, usage: {
        quantity_used: number;
        scrap_quantity?: number;
        notes?: string;
    }): Promise<JobResponse>;
    /**
     * Quality management methods
     */
    addQualityCheck(jobId: string, check: QualityCheck): Promise<JobResponse>;
    /**
     * Update a quality check
     */
    updateQualityCheck(jobId: string, checkId: string, result: {
        result: 'PASS' | 'FAIL';
        inspector: string;
        notes?: string;
    }): Promise<JobResponse>;
    /**
     * Progress tracking methods
     */
    updateProgress(jobId: string, progress: {
        completed_quantity: number;
        remaining_time_estimate?: number;
        notes?: string;
    }): Promise<JobResponse>;
    /**
     * Report generation methods
     */
    generateReport(jobId: string, type: 'summary' | 'detailed' | 'quality' | 'materials'): Promise<{
        url: string;
        generated_at: string;
        expires_at: string;
    }>;
}
export default ProductionJob;
