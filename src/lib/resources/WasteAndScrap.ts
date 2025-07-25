// lib/resources/WasteAndScrap.ts

type WasteAndScrapStatus = 'PENDING' | 'PROCESSED' | 'DISPOSED' | 'RECYCLED';

interface BaseWasteAndScrapResponse {
  id: string;
  object: 'waste-and-scrap';
  status: WasteAndScrapStatus;
}

interface PendingWasteAndScrapResponse extends BaseWasteAndScrapResponse {
  status: 'PENDING';
  pending: true;
}

interface ProcessedWasteAndScrapResponse extends BaseWasteAndScrapResponse {
  status: 'PROCESSED';
  processed: true;
}

interface DisposedWasteAndScrapResponse extends BaseWasteAndScrapResponse {
  status: 'DISPOSED';
  disposed: true;
}

interface RecycledWasteAndScrapResponse extends BaseWasteAndScrapResponse {
  status: 'RECYCLED';
  recycled: true;
}

type WasteAndScrapResponse = PendingWasteAndScrapResponse | ProcessedWasteAndScrapResponse | DisposedWasteAndScrapResponse | RecycledWasteAndScrapResponse;



interface WasteAndScrapData {
  type: 'WASTE' | 'SCRAP';
  source: string;
  quantity: number;
  unit: string;
  description: string;
  [key: string]: any;
}

interface DisposalData {
  disposal_method: string;
  disposal_date: string;
  quantity_disposed: number;
  [key: string]: any;
}

interface ReportParams {
  start_date: string;
  end_date: string;
  type?: 'WASTE' | 'SCRAP' | 'ALL';
  [key: string]: any;
}

export default class WasteAndScrap {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): WasteAndScrapResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_waste_and_scrap_by_pk) {
      throw new Error('Unexpected response format');
    }

    const wasteAndScrapData = response.update_waste_and_scrap_by_pk;

    const baseResponse: BaseWasteAndScrapResponse = {
      id: wasteAndScrapData.id,
      object: 'waste-and-scrap',
      status: wasteAndScrapData.status,
    };

    switch (wasteAndScrapData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'PROCESSED':
        return { ...baseResponse, status: 'PROCESSED', processed: true };
      case 'DISPOSED':
        return { ...baseResponse, status: 'DISPOSED', disposed: true };
      case 'RECYCLED':
        return { ...baseResponse, status: 'RECYCLED', recycled: true };
      default:
        throw new Error(`Unexpected waste and scrap status: ${wasteAndScrapData.status}`);
    }
  }

  /**
   * @param data - WasteAndScrapData object
   * @returns WasteAndScrapResponse object
   */ 
  async create(data: WasteAndScrapData): Promise<WasteAndScrapResponse> {
    const response = await this.client.request('POST', 'waste-and-scrap', data);
    return this.handleCommandResponse(response);
  }

  /**
   * @param id - WasteAndScrap ID
   * @returns WasteAndScrapResponse object
   */
  async get(id: string): Promise<WasteAndScrapResponse> {
    const response = await this.client.request('GET', `waste-and-scrap/${id}`);
    return this.handleCommandResponse({ update_waste_and_scrap_by_pk: response });
  }

  /**
   * @param id - WasteAndScrap ID
   * @param data - Partial<WasteAndScrapData> object
   * @returns WasteAndScrapResponse object
   */
  async update(id: string, data: Partial<WasteAndScrapData>): Promise<WasteAndScrapResponse> {
    const response = await this.client.request('PUT', `waste-and-scrap/${id}`, data);
    return this.handleCommandResponse(response);
  }

  /**
   * @param params - Filtering parameters
   * @returns Array of WasteAndScrapResponse objects
   */
  async list(params?: any): Promise<WasteAndScrapResponse[]> {
    const response = await this.client.request('GET', 'waste-and-scrap', params);
    return response.map((item: any) => this.handleCommandResponse({ update_waste_and_scrap_by_pk: item }));
  }

  /**
   * @param id - WasteAndScrap ID
   */
  async delete(id: string): Promise<void> {
    await this.client.request('DELETE', `waste-and-scrap/${id}`);
  }

  /**
   * @param params - Filtering parameters
   * @returns Array of WasteAndScrapResponse objects
   */
  async generateReport(params: ReportParams): Promise<any> {
    return this.client.request('GET', 'waste-and-scrap/report', params);
  }

  /**
   * @param id - WasteAndScrap ID
   * @param data - DisposalData object
   * @returns DisposedWasteAndScrapResponse object
   */
  async recordDisposal(id: string, data: DisposalData): Promise<DisposedWasteAndScrapResponse> {
    const response = await this.client.request('POST', `waste-and-scrap/${id}/dispose`, data);
    return this.handleCommandResponse(response) as DisposedWasteAndScrapResponse;
  }

  /**
   * @param id - WasteAndScrap ID
   * @returns ProcessedWasteAndScrapResponse object
   */
  async markAsProcessed(id: string): Promise<ProcessedWasteAndScrapResponse> {
    const response = await this.client.request('POST', `waste-and-scrap/${id}/process`);
    return this.handleCommandResponse(response) as ProcessedWasteAndScrapResponse;
  }

  /**
   * @param id - WasteAndScrap ID
   * @returns RecycledWasteAndScrapResponse object
   */
  async markAsRecycled(id: string): Promise<RecycledWasteAndScrapResponse> {
    const response = await this.client.request('POST', `waste-and-scrap/${id}/recycle`);
    return this.handleCommandResponse(response) as RecycledWasteAndScrapResponse;
  }

  /**
   * @param id - WasteAndScrap ID
   * @returns Array of DisposalData objects
   */
  async getDisposalHistory(id: string): Promise<DisposalData[]> {
    return this.client.request('GET', `waste-and-scrap/${id}/disposal-history`);
  }
}