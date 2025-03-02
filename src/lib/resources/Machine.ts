import { stateset } from '../../stateset-client';

// Enums
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

// Interfaces
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
  operating_parameters?: Record<string, { min?: number; max?: number; unit?: string }>;
}

export interface MaintenanceSchedule {
  frequency: string;
  last_maintenance: string;
  next_maintenance: string;
  procedure_document_url?: string;
  required_parts?: string[];
  estimated_duration: number; // in hours
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
  estimated_duration: number; // in hours
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

// Response Types
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
  } & (K extends MachineStatus.OPERATIONAL ? { operational: true; current_runtime?: RuntimeData }
    : K extends MachineStatus.MAINTENANCE ? { maintenance: true; maintenance_data: MaintenanceData }
    : K extends MachineStatus.OFFLINE ? { offline: true; last_runtime?: RuntimeData }
    : K extends MachineStatus.MALFUNCTION ? { malfunction: true; malfunction_report: MalfunctionReport }
    : K extends MachineStatus.STANDBY ? { standby: true }
    : K extends MachineStatus.SETUP ? { setup: true }
    : {});
}[MachineStatus];

// Error Classes
export class MachineError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class MachineNotFoundError extends MachineError {
  constructor(machineId: string) {
    super(`Machine with ID ${machineId} not found`, 'MachineNotFoundError');
  }
}

export class MachineStateError extends MachineError {
  constructor(message: string) {
    super(message, 'MachineStateError');
  }
}

export class MachineValidationError extends MachineError {
  constructor(message: string) {
    super(message, 'MachineValidationError');
  }
}

// Main Machines Class
export class Machines {
  constructor(private readonly client: stateset) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    try {
      const response = await this.client.request(method, path, data);
      return response.machine || response.machines || response;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MachineNotFoundError(path.split('/')[2] || 'unknown');
      }
      if (error.status === 400) {
        throw new MachineValidationError(error.message);
      }
      if (error.status === 409) {
        throw new MachineStateError(error.message || 'Invalid state transition');
      }
      throw error;
    }
  }

  private validateRuntimeData(data: RuntimeData): void {
    if (new Date(data.end_time) <= new Date(data.start_time)) {
      throw new MachineValidationError('End time must be after start time');
    }
    if (data.output_quantity < 0) {
      throw new MachineValidationError('Output quantity cannot be negative');
    }
  }

  async list(params: {
    status?: MachineStatus;
    facility_id?: string;
    manufacturer?: string;
    maintenance_due?: boolean;
    org_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ machines: MachineResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<{ machines: MachineResponse[]; total: number }>(
      'GET',
      `machines?${queryParams.toString()}`
    );
  }

  async get(machineId: string): Promise<MachineResponse> {
    return this.request<MachineResponse>('GET', `machines/${machineId}`);
  }

  async create(machineData: MachineData): Promise<MachineResponse> {
    return this.request<MachineResponse>('POST', 'machines', machineData);
  }

  async update(machineId: string, machineData: Partial<MachineData>): Promise<MachineResponse> {
    return this.request<MachineResponse>('PUT', `machines/${machineId}`, machineData);
  }

  async delete(machineId: string): Promise<void> {
    await this.request<void>('DELETE', `machines/${machineId}`);
  }

  async logRuntime(machineId: string, data: RuntimeData): Promise<MachineResponse> {
    this.validateRuntimeData(data);
    return this.request<MachineResponse>('POST', `machines/${machineId}/runtime`, data);
  }

  async scheduleMaintenance(machineId: string, data: MaintenanceData): Promise<MachineResponse> {
    if (data.estimated_duration <= 0) {
      throw new MachineValidationError('Estimated duration must be positive');
    }
    return this.request<MachineResponse>('POST', `machines/${machineId}/maintenance`, data);
  }

  async getPerformanceMetrics(
    machineId: string,
    params: {
      start_date?: Date;
      end_date?: Date;
      metrics?: string[];
    } = {}
  ): Promise<{
    time_period: { start: string; end: string };
    metrics: Record<string, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params.metrics) queryParams.append('metrics', params.metrics.join(','));

    return this.request('GET', `machines/${machineId}/performance?${queryParams.toString()}`);
  }

  async setStatus(
    machineId: string,
    status: MachineStatus,
    details: {
      reason?: string;
      operator_id?: string;
    } = {}
  ): Promise<MachineResponse> {
    return this.request<MachineResponse>(
      'POST',
      `machines/${machineId}/set-status`,
      { status, ...details }
    );
  }

  async reportMalfunction(machineId: string, report: MalfunctionReport): Promise<MachineResponse> {
    if (!report.symptoms.length) {
      throw new MachineValidationError('At least one symptom must be reported');
    }
    return this.request<MachineResponse>('POST', `machines/${machineId}/report-malfunction`, report);
  }

  async getMaintenanceHistory(
    machineId: string,
    params: {
      start_date?: Date;
      end_date?: Date;
      type?: MaintenanceType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ history: Array<MaintenanceData & { completed_at?: string; actual_cost?: number }>; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request('GET', `machines/${machineId}/maintenance-history?${queryParams.toString()}`);
  }

  async getAlerts(
    machineId: string,
    params: {
      severity?: MalfunctionSeverity;
      start_date?: Date;
      resolved?: boolean;
      limit?: number;
    } = {}
  ): Promise<Array<{
    id: string;
    type: string;
    severity: MalfunctionSeverity;
    message: string;
    created_at: string;
    resolved_at?: string;
    resolution_notes?: string;
  }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
      }
    });

    return this.request('GET', `machines/${machineId}/alerts?${queryParams.toString()}`);
  }

  async getUtilization(
    machineId: string,
    params: {
      start_date?: Date;
      end_date?: Date;
    } = {}
  ): Promise<{
    utilization_rate: number;
    total_hours: number;
    operating_hours: number;
    downtime_hours: number;
    downtime_reasons: Record<string, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params.end_date) queryParams.append('end_date', params.end_date.toISOString());

    return this.request('GET', `machines/${machineId}/utilization?${queryParams.toString()}`);
  }

  async completeMaintenance(
    machineId: string,
    maintenanceId: string,
    completionData: {
      actual_duration: number;
      actual_cost?: number;
      notes?: string;
      parts_used?: string[];
    }
  ): Promise<MachineResponse> {
    if (completionData.actual_duration <= 0) {
      throw new MachineValidationError('Actual duration must be positive');
    }
    return this.request(
      'POST',
      `machines/${machineId}/maintenance/${maintenanceId}/complete`,
      completionData
    );
  }
}

export default Machines;