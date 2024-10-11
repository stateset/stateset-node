import { stateset } from '../../stateset-client';

type ManufacturerOrderStatus = 'DRAFT' | 'SUBMITTED' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';

interface BaseManufacturerOrderResponse {
  id: string;
  object: 'manufacturerorder';
  status: ManufacturerOrderStatus;
}

interface DraftManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: 'DRAFT';
  draft: true;
}

interface SubmittedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: 'SUBMITTED';
  submitted: true;
}

interface InProductionManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: 'IN_PRODUCTION';
  inProduction: true;
}

interface CompletedManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: 'COMPLETED';
  completed: true;
}

interface CancelledManufacturerOrderResponse extends BaseManufacturerOrderResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type ManufacturerOrderResponse = DraftManufacturerOrderResponse | SubmittedManufacturerOrderResponse | InProductionManufacturerOrderResponse | CompletedManufacturerOrderResponse | CancelledManufacturerOrderResponse;

interface ApiResponse {
  update_manufacturerorders_by_pk: {
    id: string;
    status: ManufacturerOrderStatus;
    [key: string]: any;
  };
}

interface ManufacturerOrderData {
  manufacturer_id: string;
  product_id: string;
  quantity: number;
  expected_completion_date: string;
  [key: string]: any;
}

class ManufacturerOrders {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): ManufacturerOrderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_manufacturerorders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const orderData = response.update_manufacturerorders_by_pk;

    const baseResponse: BaseManufacturerOrderResponse = {
      id: orderData.id,
      object: 'manufacturerorder',
      status: orderData.status,
    };

    switch (orderData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'SUBMITTED':
        return { ...baseResponse, status: 'SUBMITTED', submitted: true };
      case 'IN_PRODUCTION':
        return { ...baseResponse, status: 'IN_PRODUCTION', inProduction: true };
      case 'COMPLETED':
        return { ...baseResponse, status: 'COMPLETED', completed: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected manufacturer order status: ${orderData.status}`);
    }
  }

  async list(): Promise<ManufacturerOrderResponse[]> {
    const response = await this.stateset.request('GET', 'manufacturerorders');
    return response.map((order: any) => this.handleCommandResponse({ update_manufacturerorders_by_pk: order }));
  }

  async get(manufacturerOrderId: string): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request('GET', `manufacturerorders/${manufacturerOrderId}`);
    return this.handleCommandResponse({ update_manufacturerorders_by_pk: response });
  }

  async create(manufacturerOrderData: ManufacturerOrderData): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', 'manufacturerorders', manufacturerOrderData);
    return this.handleCommandResponse(response);
  }

  async update(manufacturerOrderId: string, manufacturerOrderData: Partial<ManufacturerOrderData>): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request('PUT', `manufacturerorders/${manufacturerOrderId}`, manufacturerOrderData);
    return this.handleCommandResponse(response);
  }

  async delete(manufacturerOrderId: string): Promise<void> {
    await this.stateset.request('DELETE', `manufacturerorders/${manufacturerOrderId}`);
  }

  async submit(manufacturerOrderId: string): Promise<SubmittedManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${manufacturerOrderId}/submit`);
    return this.handleCommandResponse(response) as SubmittedManufacturerOrderResponse;
  }

  async startProduction(manufacturerOrderId: string): Promise<InProductionManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${manufacturerOrderId}/start-production`);
    return this.handleCommandResponse(response) as InProductionManufacturerOrderResponse;
  }

  async complete(manufacturerOrderId: string): Promise<CompletedManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${manufacturerOrderId}/complete`);
    return this.handleCommandResponse(response) as CompletedManufacturerOrderResponse;
  }

  async cancel(manufacturerOrderId: string): Promise<CancelledManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${manufacturerOrderId}/cancel`);
    return this.handleCommandResponse(response) as CancelledManufacturerOrderResponse;
  }

  async updateProductionStatus(manufacturerOrderId: string, statusUpdate: string): Promise<ManufacturerOrderResponse> {
    const response = await this.stateset.request('POST', `manufacturerorders/${manufacturerOrderId}/production-status`, { status_update: statusUpdate });
    return this.handleCommandResponse(response);
  }
}

export default ManufacturerOrders;