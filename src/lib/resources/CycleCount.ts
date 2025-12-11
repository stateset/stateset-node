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

type CycleCountResponse =
  | PendingCycleCountResponse
  | InProgressCycleCountResponse
  | CompletedCycleCountResponse
  | ReconciledCycleCountResponse;

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

  /**
   * Create cycle count
   * @param data - CycleCountData object
   * @returns CycleCountResponse object
   */
  async create(data: CycleCountData): Promise<CycleCountResponse> {
    const response = await this.client.request('POST', 'cycle-counts', data);
    return this.handleCommandResponse(response);
  }

  /**
   * Get cycle count
   * @param id - Cycle count ID
   * @returns CycleCountResponse object
   */
  async get(id: string): Promise<CycleCountResponse> {
    const response = await this.client.request('GET', `cycle-counts/${id}`);
    return this.handleCommandResponse({ update_cycle_counts_by_pk: response });
  }

  /**
   * Update cycle count
   * @param id - Cycle count ID
   * @param data - Partial<CycleCountData> object
   * @returns CycleCountResponse object
   */
  async update(id: string, data: Partial<CycleCountData>): Promise<CycleCountResponse> {
    const response = await this.client.request('PUT', `cycle-counts/${id}`, data);
    return this.handleCommandResponse(response);
  }

  /**
   * List cycle counts
   * @param params - Optional filtering parameters
   * @returns Array of CycleCountResponse objects
   */
  async list(params?: any): Promise<CycleCountResponse[]> {
    const response = await this.client.request('GET', 'cycle-counts', undefined, { params });
    return response.map((cycleCount: any) =>
      this.handleCommandResponse({ update_cycle_counts_by_pk: cycleCount })
    );
  }

  /**
   * Delete cycle count
   * @param id - Cycle count ID
   */
  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `cycle-counts/${id}`);
  }

  /**
   * Complete cycle count
   * @param id - Cycle count ID
   * @param data - CycleCountCompletionData object
   * @returns CompletedCycleCountResponse object
   */
  async complete(id: string, data: CycleCountCompletionData): Promise<CompletedCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/complete`, data);
    return this.handleCommandResponse(response) as CompletedCycleCountResponse;
  }

  /**
   * Reconcile cycle count
   * @param id - Cycle count ID
   * @returns ReconciledCycleCountResponse object
   */
  async reconcile(id: string): Promise<ReconciledCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/reconcile`);
    return this.handleCommandResponse(response) as ReconciledCycleCountResponse;
  }

  /**
   * Start cycle count
   * @param id - Cycle count ID
   * @returns InProgressCycleCountResponse object
   */
  async start(id: string): Promise<InProgressCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/start`);
    return this.handleCommandResponse(response) as InProgressCycleCountResponse;
  }

  /**
   * Cancel cycle count
   * @param id - Cycle count ID
   * @returns PendingCycleCountResponse object
   */
  async cancel(id: string): Promise<PendingCycleCountResponse> {
    const response = await this.client.request('POST', `cycle-counts/${id}/cancel`);
    return this.handleCommandResponse(response) as PendingCycleCountResponse;
  }

  /**
   * Get cycle count discrepancies
   * @param id - Cycle count ID
   * @returns Array of discrepancies
   */
  async getDiscrepancies(id: string): Promise<any> {
    return this.client.request('GET', `cycle-counts/${id}/discrepancies`);
  }
}
