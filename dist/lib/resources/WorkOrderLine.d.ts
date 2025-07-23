import { stateset } from '../../stateset-client';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum WorkOrderLineStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    ON_HOLD = "ON_HOLD",
    FAILED = "FAILED"
}
export declare enum WorkOrderLineType {
    PART = "PART",
    LABOR = "LABOR",
    MATERIAL = "MATERIAL",
    SERVICE = "SERVICE",
    TOOL = "TOOL"
}
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
export interface WorkOrderLineResponse {
    id: NonEmptyString<string>;
    object: 'work_order_line';
    data: WorkOrderLineData;
}
export declare class WorkOrderLineError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class WorkOrderLineNotFoundError extends WorkOrderLineError {
    constructor(workOrderLineId: string);
}
export declare class WorkOrderLineValidationError extends WorkOrderLineError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export declare class WorkOrderLines {
    private readonly client;
    constructor(client: stateset);
    private validateWorkOrderLineData;
    private mapResponse;
    list(params?: {
        work_order_id?: string;
        status?: WorkOrderLineStatus;
        type?: WorkOrderLineType;
        task_id?: string;
        resource_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
        limit?: number;
        offset?: number;
    }): Promise<{
        work_order_lines: WorkOrderLineResponse[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(workOrderLineId: NonEmptyString<string>): Promise<WorkOrderLineResponse>;
    create(data: WorkOrderLineData): Promise<WorkOrderLineResponse>;
    update(workOrderLineId: NonEmptyString<string>, data: Partial<WorkOrderLineData>): Promise<WorkOrderLineResponse>;
    delete(workOrderLineId: NonEmptyString<string>): Promise<void>;
    updateStatus(workOrderLineId: NonEmptyString<string>, status: WorkOrderLineStatus, reason?: string): Promise<WorkOrderLineResponse>;
    recordExecution(workOrderLineId: NonEmptyString<string>, executionData: Partial<WorkOrderLineData['execution']>): Promise<WorkOrderLineResponse>;
    submitQualityCheck(workOrderLineId: NonEmptyString<string>, qualityCheck: WorkOrderLineData['quality_check']): Promise<WorkOrderLineResponse>;
    getMetrics(params?: {
        work_order_id?: string;
        org_id?: string;
        date_range?: {
            from: Date;
            to: Date;
        };
    }): Promise<{
        total_lines: number;
        status_breakdown: Record<WorkOrderLineStatus, number>;
        type_breakdown: Record<WorkOrderLineType, number>;
        average_cost: number;
        completion_rate: number;
        quality_pass_rate: number;
    }>;
    private handleError;
}
export default WorkOrderLines;
//# sourceMappingURL=WorkOrderLine.d.ts.map