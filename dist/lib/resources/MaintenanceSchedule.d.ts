import type { ApiClientLike } from '../../types';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum MaintenanceScheduleStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    OVERDUE = "OVERDUE"
}
export declare enum MaintenanceType {
    PREVENTIVE = "PREVENTIVE",
    CORRECTIVE = "CORRECTIVE",
    PREDICTIVE = "PREDICTIVE"
}
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
    duration_estimate: number;
    actual_duration?: number;
    cost_estimate: number;
    actual_cost?: number;
    currency: string;
    notes?: string[];
    created_at: Timestamp;
    updated_at: Timestamp;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface MaintenanceScheduleResponse {
    id: NonEmptyString<string>;
    object: 'maintenance_schedule';
    data: MaintenanceScheduleData;
}
export declare class MaintenanceScheduleError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export declare class MaintenanceScheduleNotFoundError extends MaintenanceScheduleError {
    constructor(maintenanceScheduleId: string);
}
export declare class MaintenanceScheduleValidationError extends MaintenanceScheduleError {
    readonly errors?: Record<string, string> | undefined;
    constructor(message: string, errors?: Record<string, string> | undefined);
}
export default class MaintenanceSchedules {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    private validateMaintenanceScheduleData;
    private mapResponse;
    list(params?: {
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
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    get(maintenanceScheduleId: NonEmptyString<string>): Promise<MaintenanceScheduleResponse>;
    create(data: MaintenanceScheduleData): Promise<MaintenanceScheduleResponse>;
    update(maintenanceScheduleId: NonEmptyString<string>, data: Partial<MaintenanceScheduleData>): Promise<MaintenanceScheduleResponse>;
    delete(maintenanceScheduleId: NonEmptyString<string>): Promise<void>;
    complete(maintenanceScheduleId: NonEmptyString<string>, completionData: {
        completed_date: Timestamp;
        actual_duration: number;
        actual_cost: number;
    }): Promise<MaintenanceScheduleResponse>;
    private handleError;
}
export {};
//# sourceMappingURL=MaintenanceSchedule.d.ts.map