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
     * Original CRUD Operations
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
    get(workorderId: string): Promise<WorkorderResponse>;
    create(workorderData: WorkorderData): Promise<WorkorderResponse>;
    update(workorderId: string, workorderData: Partial<WorkorderData>): Promise<WorkorderResponse>;
    delete(workorderId: string): Promise<void>;
    /**
     * Original Status Management Methods
     */
    startWork(workorderId: string): Promise<InProgressWorkorderResponse>;
    completeWork(workorderId: string, completionData?: {
        notes?: string;
        final_cost?: number;
        actual_duration?: number;
    }): Promise<CompletedWorkorderResponse>;
    cancelWork(workorderId: string, cancellationData?: {
        reason: string;
        notes?: string;
    }): Promise<WorkorderResponse>;
    putOnHold(workorderId: string, holdData?: {
        reason: string;
        estimated_resume_date?: string;
    }): Promise<WorkorderResponse>;
    resumeWork(workorderId: string): Promise<InProgressWorkorderResponse>;
    /**
     * Original Assignment Methods
     */
    assignWorker(workorderId: string, workerId: string): Promise<WorkorderResponse>;
    addNote(workorderId: string, note: string): Promise<WorkorderResponse>;
    /**
     * Task management methods
     */
    updateTask(workorderId: string, taskId: string, taskData: Partial<Task>): Promise<WorkorderResponse>;
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
     * Resource management methods
     */
    assignResource(workorderId: string, resourceData: Resource): Promise<WorkorderResponse>;
    /**
     * Quality control methods
     */
    submitQualityCheck(workorderId: string, qualityChecks: QualityCheck[]): Promise<WorkorderResponse>;
    /**
     * Metrics and reporting
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
