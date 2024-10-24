import { stateset } from '../../stateset-client';

type CycleCountStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'RECONCILED';

interface BaseCycleCountResponse {
  id: string;
  object: 'cycle-count';
  status: CycleCountStatus;
}

interface PendingCycleCountResponse extends BaseCycleCountResponse {
  status: 'PENDING';
  pending: true;
}

interface InProgressCycleCountResponse extends BaseCycleCountResponse {
  status: 'IN_PROGRESS';
  inProgress: true;
}

interface CompletedCycleCountResponse extends BaseCycleCountResponse {
  status: 'COMPLETED';
  completed: true;
}

interface ReconciledCycleCountResponse extends BaseCycleCountResponse {
  status: 'RECONCILED';
  reconciled: true;
}

type CycleCountResponse = PendingCycleCountResponse | InProgressCycleCountResponse | CompletedCycleCountResponse | ReconciledCycleCountResponse;

interface ApiResponse {
  update_cycle_counts_by_pk: {
    id: string;
    status: CycleCountStatus;
    [key: string]: any;
  };
}

interface CycleCountData {
  location: string;
  scheduled_date: string;
  items: {
    item_id: string;
    expected_quantity: number;
  }[];
  [key: string]: any;
}

interface CycleCountCompletionData {
  counted_items: {
    item_id: string;
    actual_quantity: number;
  }[];
}

export default class CycleCounts {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): CycleCountResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_cycle_counts_by_pk) {
      throw new Error('Unexpected response format');
    }

    const cycleCountData = response.update_cycle_counts_by_pk;

    const baseResponse: BaseCycleCountResponse = {
      id: cycleCountData.id,
      object: 'cycle-count',
      status: cycleCountData.status,
    };

    switch (cycleCountData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'IN_PROGRESS':
        return { ...baseResponse, status: 'IN_PROGRESS', inProgress: true };
      case 'COMPLETED':
        return { ...baseResponse, status: 'COMPLETED', completed: true };
      case 'RECONCILED':
        return { ...baseResponse, status: 'RECONCILED', reconciled: true };
      default:
        throw new Error(`Unexpected cycle count status: ${cycleCountData.status}`);
    }
  }

  async create(data: CycleCountData): Promise<CycleCountResponse> {
    const response = await this.client.request('POST', 'cycle-counts', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<CycleCountResponse> {
    const response = await this.client.request('GET', `cycle-counts/${id}`);
    return this.handleCommandResponse({ update_cycle_counts_by_pk: response });
  }

  async update(id: string, data: Partial<CycleCountData>): Promise<CycleCountResponse> {
    const response = await this.client.request('PUT', `cycle-counts/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<CycleCountResponse[]> {
    const response = await this.client.request('GET', 'cycle-counts', params);
    return response.map((cycleCount: any) => this.handleCommandResponse({ update_cycle_counts_by_pk: cycleCount }));
  }

  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `cycle-counts/${id}`);
  }

  async complete(id: string, data: CycleCountCompletionData): Promise<CompletedCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/complete`, data);
    return this.handleCommandResponse(response) as CompletedCycleCountResponse;
  }

  async reconcile(id: string): Promise<ReconciledCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/reconcile`);
    return this.handleCommandResponse(response) as ReconciledCycleCountResponse;
  }

  async start(id: string): Promise<InProgressCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/start`);
    return this.handleCommandResponse(response) as InProgressCycleCountResponse;
  }

  async cancel(id: string): Promise<PendingCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/cancel`);
    return this.handleCommandResponse(response) as PendingCycleCountResponse;
  }

  async getDiscrepancies(id: string): Promise<any> {
    return this.client.request('GET', `cycle-counts/${id}/discrepancies`);
  }
}