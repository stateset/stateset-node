import { stateset } from '../../stateset-client';

type WorkorderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

interface BaseWorkorderResponse {
  id: string;
  object: 'workorder';
  status: WorkorderStatus;
}

interface PendingWorkorderResponse extends BaseWorkorderResponse {
  status: 'PENDING';
  pending: true;
}

interface InProgressWorkorderResponse extends BaseWorkorderResponse {
  status: 'IN_PROGRESS';
  inProgress: true;
}

interface CompletedWorkorderResponse extends BaseWorkorderResponse {
  status: 'COMPLETED';
  completed: true;
}

interface CancelledWorkorderResponse extends BaseWorkorderResponse {
  status: 'CANCELLED';
  cancelled: true;
}

interface OnHoldWorkorderResponse extends BaseWorkorderResponse {
  status: 'ON_HOLD';
  onHold: true;
}

type WorkorderResponse = PendingWorkorderResponse | InProgressWorkorderResponse | CompletedWorkorderResponse | CancelledWorkorderResponse | OnHoldWorkorderResponse;

interface ApiResponse {
  update_workorders_by_pk: {
    id: string;
    status: WorkorderStatus;
    [key: string]: any;
  };
}

interface WorkorderData {
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduled_start_date: string;
  estimated_duration: number; // in hours
  assigned_to?: string;
  [key: string]: any;
}

class Workorders {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): WorkorderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_workorders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const workorderData = response.update_workorders_by_pk;

    const baseResponse: BaseWorkorderResponse = {
      id: workorderData.id,
      object: 'workorder',
      status: workorderData.status,
    };

    switch (workorderData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'IN_PROGRESS':
        return { ...baseResponse, status: 'IN_PROGRESS', inProgress: true };
      case 'COMPLETED':
        return { ...baseResponse, status: 'COMPLETED', completed: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      case 'ON_HOLD':
        return { ...baseResponse, status: 'ON_HOLD', onHold: true };
      default:
        throw new Error(`Unexpected workorder status: ${workorderData.status}`);
    }
  }

  async list(): Promise<WorkorderResponse[]> {
    const response = await this.stateset.request('GET', 'workorders');
    return response.map((workorder: any) => this.handleCommandResponse({ update_workorders_by_pk: workorder }));
  }

  async get(workorderId: string): Promise<WorkorderResponse> {
    const response = await this.stateset.request('GET', `workorders/${workorderId}`);
    return this.handleCommandResponse({ update_workorders_by_pk: response });
  }

  async create(workorderData: WorkorderData): Promise<WorkorderResponse> {
    const response = await this.stateset.request('POST', 'workorders', workorderData);
    return this.handleCommandResponse(response);
  }

  async update(workorderId: string, workorderData: Partial<WorkorderData>): Promise<WorkorderResponse> {
    const response = await this.stateset.request('PUT', `workorders/${workorderId}`, workorderData);
    return this.handleCommandResponse(response);
  }

  async delete(workorderId: string): Promise<void> {
    await this.stateset.request('DELETE', `workorders/${workorderId}`);
  }

  async startWork(workorderId: string): Promise<InProgressWorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/start`);
    return this.handleCommandResponse(response) as InProgressWorkorderResponse;
  }

  async completeWork(workorderId: string): Promise<CompletedWorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/complete`);
    return this.handleCommandResponse(response) as CompletedWorkorderResponse;
  }

  async cancelWork(workorderId: string): Promise<CancelledWorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/cancel`);
    return this.handleCommandResponse(response) as CancelledWorkorderResponse;
  }

  async putOnHold(workorderId: string): Promise<OnHoldWorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/hold`);
    return this.handleCommandResponse(response) as OnHoldWorkorderResponse;
  }

  async resumeWork(workorderId: string): Promise<InProgressWorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/resume`);
    return this.handleCommandResponse(response) as InProgressWorkorderResponse;
  }

  async assignWorker(workorderId: string, workerId: string): Promise<WorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/assign`, { worker_id: workerId });
    return this.handleCommandResponse(response);
  }

  async addNote(workorderId: string, note: string): Promise<WorkorderResponse> {
    const response = await this.stateset.request('POST', `workorders/${workorderId}/notes`, { note });
    return this.handleCommandResponse(response);
  }
}

export default Workorders;