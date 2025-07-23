import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
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
    MAINTENANCE = "MAINTENANCE",
    REPAIR = "REPAIR",
    INSPECTION = "INSPECTION",
    INSTALLATION = "INSTALLATION",
    UPGRADE = "UPGRADE",
    CLEANING = "CLEANING",
    CALIBRATION = "CALIBRATION",
    QUALITY_CHECK = "QUALITY_CHECK"
}
export declare enum WorkorderPriority {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
    ROUTINE = "ROUTINE"
}
export declare enum MaintenanceType {
    PREVENTIVE = "PREVENTIVE",
    CORRECTIVE = "CORRECTIVE",
    PREDICTIVE = "PREDICTIVE",
    CONDITION_BASED = "CONDITION_BASED",
    EMERGENCY = "EMERGENCY"
}
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
        estimated: number;
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
export type WorkorderResponse = {
    id: NonEmptyString<string>;
    object: 'workorder';
    created_at: Timestamp;
    updated_at: Timestamp;
    status: WorkorderStatus;
    data: WorkorderData;
} & ({
    status: WorkorderStatus.DRAFT;
    draft_details: {
        created_by: string;
    };
} | {
    status: WorkorderStatus.SCHEDULED;
    schedule_details: {
        start_date: Timestamp;
        end_date: Timestamp;
        assigned_resources: Resource[];
    };
} | {
    status: WorkorderStatus.IN_PROGRESS;
    progress: {
        completed_tasks: number;
        total_tasks: number;
        current_task?: Task;
        time_elapsed: number;
    };
} | {
    status: WorkorderStatus.COMPLETED;
    completion_details: {
        completed_at: Timestamp;
        completed_by: string;
        quality_results: QualityCheck[];
    };
} | {
    status: WorkorderStatus.FAILED;
    failure_details: {
        reason: string;
        failed_tasks: Task[];
    };
});
export declare class WorkorderError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class WorkorderNotFoundError extends WorkorderError {
    constructor(workorderId: string);
}
export declare class WorkorderValidationError extends WorkorderError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class ResourceConflictError extends WorkorderError {
    readonly resourceId?: string | undefined;
    constructor(message: string, resourceId?: string | undefined);
}
export declare class Workorders {
    private readonly client;
    constructor(client: stateset);
    private validateWorkorderData;
    private mapResponse;
    list(params?: {
        status?: WorkorderStatus;
        type?: WorkorderType;
        priority?: WorkorderPriority;
        asset_id?: string;
        facility_id?: string;
        assigned_to?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        workorders: WorkorderResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(workorderId: NonEmptyString<string>): Promise<WorkorderResponse>;
    create(data: WorkorderData): Promise<WorkorderResponse>;
    update(workorderId: NonEmptyString<string>, data: Partial<WorkorderData>): Promise<WorkorderResponse>;
    delete(workorderId: NonEmptyString<string>): Promise<void>;
    startWork(workorderId: NonEmptyString<string>): Promise<WorkorderResponse>;
    completeWork(workorderId: NonEmptyString<string>, completionData?: {
        notes?: string;
        final_cost?: number;
        actual_duration?: number;
    }): Promise<WorkorderResponse>;
    cancelWork(workorderId: NonEmptyString<string>, cancellationData: {
        reason: string;
        notes?: string;
    }): Promise<WorkorderResponse>;
    putOnHold(workorderId: NonEmptyString<string>, holdData: {
        reason: string;
        estimated_resume_date?: Timestamp;
    }): Promise<WorkorderResponse>;
    resumeWork(workorderId: NonEmptyString<string>): Promise<WorkorderResponse>;
    assignWorker(workorderId: NonEmptyString<string>, workerId: NonEmptyString<string>): Promise<WorkorderResponse>;
    addNote(workorderId: NonEmptyString<string>, note: NonEmptyString<string>): Promise<WorkorderResponse>;
    updateTask(workorderId: NonEmptyString<string>, taskId: NonEmptyString<string>, taskData: Partial<Task>): Promise<WorkorderResponse>;
    completeTask(workorderId: NonEmptyString<string>, taskId: NonEmptyString<string>, completionData: {
        actual_duration: number;
        quality_check_results?: Array<{
            parameter: string;
            actual_value: string;
            passed: boolean;
        }>;
        notes?: string;
    }): Promise<WorkorderResponse>;
    assignResource(workorderId: NonEmptyString<string>, resourceData: Resource): Promise<WorkorderResponse>;
    submitQualityCheck(workorderId: NonEmptyString<string>, qualityChecks: QualityCheck[]): Promise<WorkorderResponse>;
    getMetrics(params?: {
        date_range?: {
            start: Date;
            end: Date;
        };
        type?: WorkorderType;
        facility_id?: string;
        org_id?: string;
        group_by?: 'DAY' | 'WEEK' | 'MONTH';
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
        trends?: Record<string, number>;
    }>;
    private handleError;
}
export default Workorders;
//# sourceMappingURL=WorkOrder.d.ts.map