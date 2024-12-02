import { stateset } from '../../stateset-client';

// Enums for machine management
export enum MachineStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  OFFLINE = 'OFFLINE',
  MALFUNCTION = 'MALFUNCTION',
  STANDBY = 'STANDBY',
  SETUP = 'SETUP'
}

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  CONDITION_BASED = 'condition_based',
  EMERGENCY = 'emergency'
}

export enum MalfunctionSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Interfaces for machine data structures
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

// Response Interfaces
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

export type MachineResponse = 
  | OperationalMachineResponse 
  | MaintenanceMachineResponse 
  | OfflineMachineResponse 
  | MalfunctionMachineResponse;

// Custom Error Classes
export class MachineNotFoundError extends Error {
  constructor(machineId: string) {
    super(`Machine with ID ${machineId} not found`);
    this.name = 'MachineNotFoundError';
  }
}

export class MachineStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MachineStateError';
  }
}

export class MachineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MachineValidationError';
  }
}

// Main Machines Class
class Machines {
  constructor(private readonly stateset: stateset) {}

  /**
   * List machines with optional filtering
   * @param params - Optional filtering parameters
   * @returns Array of MachineResponse objects
   */
  async list(params?: {
    status?: MachineStatus;
    facility_id?: string;
    manufacturer?: string;
    maintenance_due?: boolean;
    org_id?: string;
  }): Promise<MachineResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.facility_id) queryParams.append('facility_id', params.facility_id);
    if (params?.manufacturer) queryParams.append('manufacturer', params.manufacturer);
    if (params?.maintenance_due !== undefined) queryParams.append('maintenance_due', params.maintenance_due.toString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `machines?${queryParams.toString()}`);
    return response.machines;
  }

  /**
   * Get specific machine by ID
   * @param machineId - Machine ID
   * @returns MachineResponse object
   */
  async get(machineId: string): Promise<MachineResponse> {
    try {
      const response = await this.stateset.request('GET', `machines/${machineId}`);
      return response.machine;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MachineNotFoundError(machineId);
      }
      throw error;
    }
  }

  /**
   * Create new machine
   * @param machineData - MachineData object
   * @returns MachineResponse object
   */
  async create(machineData: MachineData): Promise<MachineResponse> {
    try {
      const response = await this.stateset.request('POST', 'machines', machineData);
      return response.machine;
    } catch (error: any) {
      if (error.status === 400) {
        throw new MachineValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update existing machine
   * @param machineId - Machine ID
   * @param machineData - Partial<MachineData> object
   * @returns MachineResponse object
   */
  async update(machineId: string, machineData: Partial<MachineData>): Promise<MachineResponse> {
    try {
      const response = await this.stateset.request('PUT', `machines/${machineId}`, machineData);
      return response.machine;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MachineNotFoundError(machineId);
      }
      throw error;
    }
  }

  /**
   * Delete machine
   * @param machineId - Machine ID
   */
  async delete(machineId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `machines/${machineId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new MachineNotFoundError(machineId);
      }
      throw error;
    }
  }

  /**
   * Log machine runtime
   * @param machineId - Machine ID
   * @param data - RuntimeData object
   * @returns MachineResponse object
   */
  async logRuntime(machineId: string, data: RuntimeData): Promise<MachineResponse> {
    if (new Date(data.end_time) <= new Date(data.start_time)) {
      throw new MachineValidationError('End time must be after start time');
    }

    try {
      const response = await this.stateset.request('POST', `machines/${machineId}/runtime`, data);
      return response.machine;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MachineNotFoundError(machineId);
      }
      throw error;
    }
  }

  /**
   * Schedule maintenance
   * @param machineId - Machine ID
   * @param data - MaintenanceData object
   * @returns MaintenanceMachineResponse object
   */
  async scheduleMaintenance(
        machineId: string, 
    data: MaintenanceData
  ): Promise<MaintenanceMachineResponse> {
    try {
      const response = await this.stateset.request(
        'POST', 
        `machines/${machineId}/maintenance`, 
        data
      );
      return response.machine as MaintenanceMachineResponse;
    } catch (error: any) {
      if (error.status === 409) {
        throw new MachineStateError('Machine is not available for maintenance');
      }
      throw error;
    }
  }

  /**
   * Get performance metrics
   * @param machineId - Machine ID
   * @param params - Optional filtering parameters
   * @returns PerformanceMetrics object
   */
  async getPerformanceMetrics(
    machineId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      metrics?: (keyof PerformanceMetrics)[];
    }
  ): Promise<PerformanceMetrics> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.metrics) queryParams.append('metrics', params.metrics.join(','));

    return this.stateset.request('GET', `machines/${machineId}/performance?${queryParams.toString()}`);
  }

  /**
   * Set machine status to operational
   * @param machineId - Machine ID
   * @returns OperationalMachineResponse object
   */
  async setOperational(machineId: string): Promise<OperationalMachineResponse> {
    const response = await this.stateset.request('POST', `machines/${machineId}/set-operational`);
    return response.machine as OperationalMachineResponse;
  }

  async setOffline(machineId: string, reason?: string): Promise<OfflineMachineResponse> {
    const response = await this.stateset.request('POST', `machines/${machineId}/set-offline`, { reason });
    return response.machine as OfflineMachineResponse;
  }

  async reportMalfunction(
    machineId: string, 
    report: MalfunctionReport
  ): Promise<MalfunctionMachineResponse> {
    const response = await this.stateset.request(
      'POST', 
      `machines/${machineId}/report-malfunction`, 
      report
    );
    return response.machine as MalfunctionMachineResponse;
  }

  /**
   * Get maintenance history
   * @param machineId - Machine ID
   * @param params - Optional filtering parameters
   * @returns Array of MaintenanceData objects
   */
  async getMaintenanceHistory(
    machineId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      type?: MaintenanceType;
      limit?: number;
    }
  ): Promise<Array<MaintenanceData & { completed_at: string }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `machines/${machineId}/maintenance-history?${queryParams.toString()}`
    );
    return response.history;
  }

  /**
   * Get machine alerts
   * @param machineId - Machine ID
   * @param params - Optional filtering parameters
   * @returns Array of MalfunctionAlert objects
   */
  async getAlerts(machineId: string, params?: {
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
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());

    const response = await this.stateset.request(
      'GET',
      `machines/${machineId}/alerts?${queryParams.toString()}`
    );
    return response.alerts;
  }
}

export default Machines;