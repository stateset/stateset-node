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
    operating_parameters?: {
        min_temperature?: number;
        max_temperature?: number;
        min_pressure?: number;
        max_pressure?: number;
        [key: string]: any;
    };
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
export interface PerformanceMetrics {
    time_period: {
        start: string;
        end: string;
    };
    efficiency: number;
    availability: number;
    quality: number;
    oee: number;
    uptime: number;
    downtime: number;
    mtbf: number;
    mttr: number;
    output_rate: number;
    energy_efficiency: number;
    maintenance_costs: number;
    production_volume: number;
    defect_rate: number;
}
interface BaseMachineResponse {
    id: string;
    object: 'machine';
    created_at: string;
    updated_at: string;
    status: MachineStatus;
    data: MachineData;
}
interface OperationalMachineResponse extends BaseMachineResponse {
    status: MachineStatus.OPERATIONAL;
    operational: true;
    current_runtime?: RuntimeData;
}
interface MaintenanceMachineResponse extends BaseMachineResponse {
    status: MachineStatus.MAINTENANCE;
    maintenance: true;
    maintenance_data: MaintenanceData;
}
interface OfflineMachineResponse extends BaseMachineResponse {
    status: MachineStatus.OFFLINE;
    offline: true;
    last_runtime?: RuntimeData;
}
interface MalfunctionMachineResponse extends BaseMachineResponse {
    status: MachineStatus.MALFUNCTION;
    malfunction: true;
    malfunction_report: MalfunctionReport;
}
export type MachineResponse = OperationalMachineResponse | MaintenanceMachineResponse | OfflineMachineResponse | MalfunctionMachineResponse;
export declare class MachineNotFoundError extends Error {
    constructor(machineId: string);
}
export declare class MachineStateError extends Error {
    constructor(message: string);
}
export declare class MachineValidationError extends Error {
    constructor(message: string);
}
declare class Machines {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List machines with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of MachineResponse objects
     */
    list(params?: {
        status?: MachineStatus;
        facility_id?: string;
        manufacturer?: string;
        maintenance_due?: boolean;
        org_id?: string;
    }): Promise<MachineResponse[]>;
    /**
     * Get specific machine by ID
     * @param machineId - Machine ID
     * @returns MachineResponse object
     */
    get(machineId: string): Promise<MachineResponse>;
    /**
     * Create new machine
     * @param machineData - MachineData object
     * @returns MachineResponse object
     */
    create(machineData: MachineData): Promise<MachineResponse>;
    /**
     * Update existing machine
     * @param machineId - Machine ID
     * @param machineData - Partial<MachineData> object
     * @returns MachineResponse object
     */
    update(machineId: string, machineData: Partial<MachineData>): Promise<MachineResponse>;
    /**
     * Delete machine
     * @param machineId - Machine ID
     */
    delete(machineId: string): Promise<void>;
    /**
     * Log machine runtime
     * @param machineId - Machine ID
     * @param data - RuntimeData object
     * @returns MachineResponse object
     */
    logRuntime(machineId: string, data: RuntimeData): Promise<MachineResponse>;
    /**
     * Schedule maintenance
     * @param machineId - Machine ID
     * @param data - MaintenanceData object
     * @returns MaintenanceMachineResponse object
     */
    scheduleMaintenance(machineId: string, data: MaintenanceData): Promise<MaintenanceMachineResponse>;
    /**
     * Get performance metrics
     * @param machineId - Machine ID
     * @param params - Optional filtering parameters
     * @returns PerformanceMetrics object
     */
    getPerformanceMetrics(machineId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        metrics?: (keyof PerformanceMetrics)[];
    }): Promise<PerformanceMetrics>;
    /**
     * Set machine status to operational
     * @param machineId - Machine ID
     * @returns OperationalMachineResponse object
     */
    setOperational(machineId: string): Promise<OperationalMachineResponse>;
    setOffline(machineId: string, reason?: string): Promise<OfflineMachineResponse>;
    reportMalfunction(machineId: string, report: MalfunctionReport): Promise<MalfunctionMachineResponse>;
    /**
     * Get maintenance history
     * @param machineId - Machine ID
     * @param params - Optional filtering parameters
     * @returns Array of MaintenanceData objects
     */
    getMaintenanceHistory(machineId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        type?: MaintenanceType;
        limit?: number;
    }): Promise<Array<MaintenanceData & {
        completed_at: string;
    }>>;
    /**
     * Get machine alerts
     * @param machineId - Machine ID
     * @param params - Optional filtering parameters
     * @returns Array of MalfunctionAlert objects
     */
    getAlerts(machineId: string, params?: {
        severity?: MalfunctionSeverity;
        start_date?: Date;
        resolved?: boolean;
    }): Promise<Array<{
        id: string;
        type: string;
        severity: MalfunctionSeverity;
        message: string;
        created_at: string;
        resolved_at?: string;
    }>>;
}
export default Machines;
