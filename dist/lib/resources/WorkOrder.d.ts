import { stateset } from '../../stateset-client';
export declare enum WorkorderStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    PAUSED = "PAUSED",
    ON_HOLD = "ON_HOLD",
    REVIEW = "REVIEW",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
}
export declare enum WorkorderType {
    MAINTENANCE = "maintenance",
    REPAIR = "repair",
    INSPECTION = "inspection",
    INSTALLATION = "installation",
    UPGRADE = "upgrade",
    CLEANING = "cleaning",
    CALIBRATION = "calibration",
    QUALITY_CHECK = "quality_check"
}
export declare enum WorkorderPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    ROUTINE = "routine"
}
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    CONDITION_BASED = "condition_based",
    EMERGENCY = "emergency"
}
export interface Resource {
    id: string;
    type: 'worker' | 'equipment' | 'tool' | 'material';
    name: string;
    quantity?: number;
    unit?: string;
    cost_per_unit?: number;
    total_cost?: number;
    status?: 'available' | 'assigned' | 'in_use';
    scheduled_time?: {
        start: string;
        end: string;
    };
}
export interface Task {
    id: string;
    sequence: number;
    description: string;
    estimated_duration: number;
    actual_duration?: number;
    required_resources: Resource[];
    dependencies?: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    instructions?: string[];
    safety_requirements?: string[];
    quality_checks?: Array<{
        parameter: string;
        expected_value: string;
        actual_value?: string;
        passed?: boolean;
    }>;
    completed_by?: string;
    completed_at?: string;
    notes?: string[];
}
export interface SafetyRequirement {
    type: string;
    description: string;
    required_ppe: string[];
    hazard_level: 'low' | 'medium' | 'high';
    precautions: string[];
    emergency_procedures?: string[];
}
export interface WorkorderMetrics {
    planned_start: string;
    planned_end: string;
    actual_start?: string;
    actual_end?: string;
    estimated_cost: number;
    actual_cost?: number;
    labor_hours: {
        estimated: number;
        actual?: number;
    };
    downtime?: {
        planned: number;
        actual: number;
        unit: 'hours' | 'minutes';
    };
}
export interface QualityCheck {
    parameter: string;
    specification: string;
    measurement: string;
    tolerance?: {
        min?: number;
        max?: number;
        unit: string;
    };
    result?: 'pass' | 'fail';
    inspector?: string;
    inspection_date?: string;
    notes?: string;
}
export interface WorkorderData {
    type: WorkorderType;
    maintenance_type?: MaintenanceType;
    description: string;
    priority: WorkorderPriority;
    asset_id: string;
    location: {
        facility_id: string;
        area: string;
        position?: string;
    };
    tasks: Task[];
    resources: Resource[];
    safety_requirements: SafetyRequirement[];
    quality_checks: QualityCheck[];
    metrics: WorkorderMetrics;
    attachments?: Array<{
        type: string;
        url: string;
        name: string;
    }>;
    related_workorders?: string[];
    warranty_information?: {
        warranty_id: string;
        coverage_details: string;
        expiration_date: string;
    };
    metadata?: Record<string, any>;
    org_id?: string;
}
interface BaseWorkorderResponse {
    id: string;
    object: 'workorder';
    created_at: string;
    updated_at: string;
    status: WorkorderStatus;
    data: WorkorderData;
}
interface DraftWorkorderResponse extends BaseWorkorderResponse {
    status: WorkorderStatus.DRAFT;
    draft: true;
}
interface ScheduledWorkorderResponse extends BaseWorkorderResponse {
    status: WorkorderStatus.SCHEDULED;
    scheduled: true;
    schedule_details: {
        start_date: string;
        end_date: string;
        assigned_resources: Resource[];
    };
}
interface InProgressWorkorderResponse extends BaseWorkorderResponse {
    status: WorkorderStatus.IN_PROGRESS;
    inProgress: true;
    progress: {
        completed_tasks: number;
        total_tasks: number;
        current_task?: Task;
        time_elapsed: number;
        estimated_completion?: string;
    };
}
interface CompletedWorkorderResponse extends BaseWorkorderResponse {
    status: WorkorderStatus.COMPLETED;
    completed: true;
    completion_details: {
        completed_at: string;
        completed_by: string;
        quality_check_results: QualityCheck[];
        final_cost: number;
        actual_duration: number;
    };
}
interface FailedWorkorderResponse extends BaseWorkorderResponse {
    status: WorkorderStatus.FAILED;
    failed: true;
    failure_details: {
        reason: string;
        failed_tasks: Task[];
        recommended_actions?: string[];
    };
}
export type WorkorderResponse = DraftWorkorderResponse | ScheduledWorkorderResponse | InProgressWorkorderResponse | CompletedWorkorderResponse | FailedWorkorderResponse;
export declare class WorkorderNotFoundError extends Error {
    constructor(workorderId: string);
}
export declare class WorkorderValidationError extends Error {
    constructor(message: string);
}
export declare class ResourceConflictError extends Error {
    constructor(message: string);
}
declare class Workorders {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * @param params - Filtering parameters
     * @returns Array of WorkorderResponse objects
     */
    list(params?: {
        status?: WorkorderStatus;
        type?: WorkorderType;
        priority?: WorkorderPriority;
        asset_id?: string;
        facility_id?: string;
        assigned_to?: string;
        date_from?: Date;
        date_to?: Date;
        org_id?: string;
    }): Promise<WorkorderResponse[]>;
    /**
     * @param workorderId - Workorder ID
     * @returns WorkorderResponse object
     */
    get(workorderId: string): Promise<WorkorderResponse>;
    /**
     * @param workorderData - WorkorderData object
     * @returns WorkorderResponse object
     */
    create(workorderData: WorkorderData): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param workorderData - Partial<WorkorderData> object
     * @returns WorkorderResponse object
     */
    update(workorderId: string, workorderData: Partial<WorkorderData>): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     */
    delete(workorderId: string): Promise<void>;
    /**
     * @param workorderId - Workorder ID
     * @returns InProgressWorkorderResponse object
     */
    startWork(workorderId: string): Promise<InProgressWorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param completionData - Completion data
     * @returns CompletedWorkorderResponse object
     */
    completeWork(workorderId: string, completionData?: {
        notes?: string;
        final_cost?: number;
        actual_duration?: number;
    }): Promise<CompletedWorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param cancellationData - Cancellation data
     * @returns WorkorderResponse object
     */
    cancelWork(workorderId: string, cancellationData?: {
        reason: string;
        notes?: string;
    }): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param holdData - Hold data
     * @returns WorkorderResponse object
     */
    putOnHold(workorderId: string, holdData?: {
        reason: string;
        estimated_resume_date?: string;
    }): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @returns InProgressWorkorderResponse object
     */
    resumeWork(workorderId: string): Promise<InProgressWorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param workerId - Worker ID
     * @returns WorkorderResponse object
     */
    assignWorker(workorderId: string, workerId: string): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param note - Note
     * @returns WorkorderResponse object
     */
    addNote(workorderId: string, note: string): Promise<WorkorderResponse>;
    /**
     * Task management methods
     */
    updateTask(workorderId: string, taskId: string, taskData: Partial<Task>): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param taskId - Task ID
     * @param completionData - Completion data
     * @returns WorkorderResponse object
     */
    completeTask(workorderId: string, taskId: string, completionData: {
        actual_duration: number;
        quality_check_results?: Array<{
            parameter: string;
            actual_value: string;
            passed: boolean;
        }>;
        notes?: string;
    }): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param resourceData - ResourceData object
     * @returns WorkorderResponse object
     */
    assignResource(workorderId: string, resourceData: Resource): Promise<WorkorderResponse>;
    /**
     * @param workorderId - Workorder ID
     * @param qualityChecks - QualityCheck[] object
     * @returns WorkorderResponse object
     */
    submitQualityCheck(workorderId: string, qualityChecks: QualityCheck[]): Promise<WorkorderResponse>;
    /**
     * @param params - Filtering parameters
     * @returns Metrics object
     */
    getMetrics(params?: {
        start_date?: Date;
        end_date?: Date;
        type?: WorkorderType;
        facility_id?: string;
        org_id?: string;
    }): Promise<{
        total_workorders: number;
        average_completion_time: number;
        on_time_completion_rate: number;
        resource_utilization: Record<string, number>;
        cost_metrics: {
            total_cost: number;
            average_cost: number;
            cost_variance: number;
        };
        quality_metrics: {
            pass_rate: number;
            failure_rate: number;
            rework_rate: number;
        };
        status_breakdown: Record<WorkorderStatus, number>;
        type_breakdown: Record<WorkorderType, number>;
    }>;
}
export default Workorders;
