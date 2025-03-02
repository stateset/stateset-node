import { stateset } from '../../stateset-client';
export declare enum MachineStatus {
    OPERATIONAL = "OPERATIONAL",
    MAINTENANCE = "MAINTENANCE",
    OFFLINE = "OFFLINE",
    MALFUNCTION = "MALFUNCTION",
    STANDBY = "STANDBY",
    SETUP = "SETUP"
}
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    CONDITION_BASED = "condition_based",
    EMERGENCY = "emergency"
}
export declare enum MalfunctionSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface MachineLocation {
    facility_id: string;
    area: string;
    section?: string;
    position?: string;
    coordinates?: {
        x: number;
        y: number;
        z: number;
    };
}
export interface MachineSpecs {
    model: string;
    manufacturer: string;
    serial_number: string;
    year_built?: number;
    power_requirements?: string;
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    weight?: {
        value: number;
        unit: string;
    };
    operating_parameters?: Record<string, {
        min?: number;
        max?: number;
        unit?: string;
    }>;
}
export interface MaintenanceSchedule {
    frequency: string;
    last_maintenance: string;
    next_maintenance: string;
    procedure_document_url?: string;
    required_parts?: string[];
    estimated_duration: number;
    technician_requirements?: string[];
}
export interface MachineData {
    name: string;
    description?: string;
    specs: MachineSpecs;
    location: MachineLocation;
    installation_date: string;
    warranty_expiration?: string;
    maintenance_schedule?: MaintenanceSchedule;
    org_id?: string;
    metadata?: Record<string, any>;
}
export interface RuntimeData {
    start_time: string;
    end_time: string;
    output_quantity: number;
    product_id?: string;
    operator_id?: string;
    batch_number?: string;
    quality_metrics?: {
        defects: number;
        quality_rate: number;
        [key: string]: any;
    };
    energy_consumption?: number;
}
export interface MaintenanceData {
    type: MaintenanceType;
    scheduled_date: string;
    description: string;
    technician_id: string;
    estimated_duration: number;
    parts_required?: string[];
    procedures?: string[];
    cost_estimate?: number;
    currency?: string;
    priority?: 'high' | 'medium' | 'low';
}
export interface MalfunctionReport {
    description: string;
    severity: MalfunctionSeverity;
    reported_by: string;
    symptoms: string[];
    affected_components?: string[];
    impact_assessment?: string;
    images?: string[];
}
interface BaseMachineResponse {
    id: string;
    object: 'machine';
    created_at: string;
    updated_at: string;
    status: MachineStatus;
    data: MachineData;
}
export type MachineResponse = BaseMachineResponse & {
    [K in MachineStatus]: {
        status: K;
    } & (K extends MachineStatus.OPERATIONAL ? {
        operational: true;
        current_runtime?: RuntimeData;
    } : K extends MachineStatus.MAINTENANCE ? {
        maintenance: true;
        maintenance_data: MaintenanceData;
    } : K extends MachineStatus.OFFLINE ? {
        offline: true;
        last_runtime?: RuntimeData;
    } : K extends MachineStatus.MALFUNCTION ? {
        malfunction: true;
        malfunction_report: MalfunctionReport;
    } : K extends MachineStatus.STANDBY ? {
        standby: true;
    } : K extends MachineStatus.SETUP ? {
        setup: true;
    } : {});
}[MachineStatus];
export declare class MachineError extends Error {
    constructor(message: string, name: string);
}
export declare class MachineNotFoundError extends MachineError {
    constructor(machineId: string);
}
export declare class MachineStateError extends MachineError {
    constructor(message: string);
}
export declare class MachineValidationError extends MachineError {
    constructor(message: string);
}
export declare class Machines {
    private readonly client;
    constructor(client: stateset);
    private request;
    private validateRuntimeData;
    list(params?: {
        status?: MachineStatus;
        facility_id?: string;
        manufacturer?: string;
        maintenance_due?: boolean;
        org_id?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        machines: MachineResponse[];
        total: number;
    }>;
    get(machineId: string): Promise<MachineResponse>;
    create(machineData: MachineData): Promise<MachineResponse>;
    update(machineId: string, machineData: Partial<MachineData>): Promise<MachineResponse>;
    delete(machineId: string): Promise<void>;
    logRuntime(machineId: string, data: RuntimeData): Promise<MachineResponse>;
    scheduleMaintenance(machineId: string, data: MaintenanceData): Promise<MachineResponse>;
    getPerformanceMetrics(machineId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        metrics?: string[];
    }): Promise<{
        time_period: {
            start: string;
            end: string;
        };
        metrics: Record<string, number>;
    }>;
    setStatus(machineId: string, status: MachineStatus, details?: {
        reason?: string;
        operator_id?: string;
    }): Promise<MachineResponse>;
    reportMalfunction(machineId: string, report: MalfunctionReport): Promise<MachineResponse>;
    getMaintenanceHistory(machineId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        type?: MaintenanceType;
        limit?: number;
        offset?: number;
    }): Promise<{
        history: Array<MaintenanceData & {
            completed_at?: string;
            actual_cost?: number;
        }>;
        total: number;
    }>;
    getAlerts(machineId: string, params?: {
        severity?: MalfunctionSeverity;
        start_date?: Date;
        resolved?: boolean;
        limit?: number;
    }): Promise<Array<{
        id: string;
        type: string;
        severity: MalfunctionSeverity;
        message: string;
        created_at: string;
        resolved_at?: string;
        resolution_notes?: string;
    }>>;
    getUtilization(machineId: string, params?: {
        start_date?: Date;
        end_date?: Date;
    }): Promise<{
        utilization_rate: number;
        total_hours: number;
        operating_hours: number;
        downtime_hours: number;
        downtime_reasons: Record<string, number>;
    }>;
    completeMaintenance(machineId: string, maintenanceId: string, completionData: {
        actual_duration: number;
        actual_cost?: number;
        notes?: string;
        parts_used?: string[];
    }): Promise<MachineResponse>;
}
export default Machines;
