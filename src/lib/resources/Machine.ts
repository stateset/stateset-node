// lib/resources/Machine.ts

type MachineStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'OFFLINE' | 'MALFUNCTION';

interface BaseMachineResponse {
  id: string;
  object: 'machine';
  status: MachineStatus;
}

interface OperationalMachineResponse extends BaseMachineResponse {
  status: 'OPERATIONAL';
  operational: true;
}

interface MaintenanceMachineResponse extends BaseMachineResponse {
  status: 'MAINTENANCE';
  maintenance: true;
}

interface OfflineMachineResponse extends BaseMachineResponse {
  status: 'OFFLINE';
  offline: true;
}

interface MalfunctionMachineResponse extends BaseMachineResponse {
  status: 'MALFUNCTION';
  malfunction: true;
}

type MachineResponse = OperationalMachineResponse | MaintenanceMachineResponse | OfflineMachineResponse | MalfunctionMachineResponse;

interface ApiResponse {
  update_machines_by_pk: {
    id: string;
    status: MachineStatus;
    [key: string]: any;
  };
}

interface MachineData {
  name: string;
  model: string;
  manufacturer: string;
  installation_date: string;
  [key: string]: any;
}

interface RuntimeData {
  start_time: string;
  end_time: string;
  output_quantity: number;
}

interface MaintenanceData {
  scheduled_date: string;
  description: string;
  technician_id: string;
}

interface PerformanceMetrics {
  efficiency: number;
  uptime: number;
  output_rate: number;
  [key: string]: any;
}

export default class Machines {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): MachineResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_machines_by_pk) {
      throw new Error('Unexpected response format');
    }

    const machineData = response.update_machines_by_pk;

    const baseResponse: BaseMachineResponse = {
      id: machineData.id,
      object: 'machine',
      status: machineData.status,
    };

    switch (machineData.status) {
      case 'OPERATIONAL':
        return { ...baseResponse, status: 'OPERATIONAL', operational: true };
      case 'MAINTENANCE':
        return { ...baseResponse, status: 'MAINTENANCE', maintenance: true };
      case 'OFFLINE':
        return { ...baseResponse, status: 'OFFLINE', offline: true };
      case 'MALFUNCTION':
        return { ...baseResponse, status: 'MALFUNCTION', malfunction: true };
      default:
        throw new Error(`Unexpected machine status: ${machineData.status}`);
    }
  }

  async create(data: MachineData): Promise<MachineResponse> {
    const response = await this.client.request('POST', 'machines', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<MachineResponse> {
    const response = await this.client.request('GET', `machines/${id}`);
    return this.handleCommandResponse({ update_machines_by_pk: response });
  }

  async update(id: string, data: Partial<MachineData>): Promise<MachineResponse> {
    const response = await this.client.request('PUT', `machines/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<MachineResponse[]> {
    const response = await this.client.request('GET', 'machines', params);
    return response.map((machine: any) => this.handleCommandResponse({ update_machines_by_pk: machine }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `machines/${id}`);
  }

  async logRuntime(id: string, data: RuntimeData): Promise<MachineResponse> {
    const response = await this.client.request('POST', `machines/${id}/runtime`, data);
    return this.handleCommandResponse(response);
  }

  async scheduleMaintenance(id: string, data: MaintenanceData): Promise<MaintenanceMachineResponse> {
    const response = await this.client.request('POST', `machines/${id}/maintenance`, data);
    return this.handleCommandResponse(response) as MaintenanceMachineResponse;
  }

  async getPerformanceMetrics(id: string, params?: any): Promise<PerformanceMetrics> {
    return this.client.request('GET', `machines/${id}/performance`, params);
  }

  async setOperational(id: string): Promise<OperationalMachineResponse> {
    const response = await this.client.request('POST', `machines/${id}/set-operational`);
    return this.handleCommandResponse(response) as OperationalMachineResponse;
  }

  async setOffline(id: string): Promise<OfflineMachineResponse> {
    const response = await this.client.request('POST', `machines/${id}/set-offline`);
    return this.handleCommandResponse(response) as OfflineMachineResponse;
  }

  async reportMalfunction(id: string, description: string): Promise<MalfunctionMachineResponse> {
    const response = await this.client.request('POST', `machines/${id}/report-malfunction`, { description });
    return this.handleCommandResponse(response) as MalfunctionMachineResponse;
  }
}