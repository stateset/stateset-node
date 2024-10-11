// lib/resources/Fulfillment.ts

type FulfillmentStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface BaseFulfillmentResponse {
  id: string;
  object: 'fulfillment';
  status: FulfillmentStatus;
}

interface PendingFulfillmentResponse extends BaseFulfillmentResponse {
  status: 'PENDING';
  pending: true;
}

interface ProcessingFulfillmentResponse extends BaseFulfillmentResponse {
  status: 'PROCESSING';
  processing: true;
}

interface ShippedFulfillmentResponse extends BaseFulfillmentResponse {
  status: 'SHIPPED';
  shipped: true;
}

interface DeliveredFulfillmentResponse extends BaseFulfillmentResponse {
  status: 'DELIVERED';
  delivered: true;
}

interface CancelledFulfillmentResponse extends BaseFulfillmentResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type FulfillmentResponse = PendingFulfillmentResponse | ProcessingFulfillmentResponse | ShippedFulfillmentResponse | DeliveredFulfillmentResponse | CancelledFulfillmentResponse;

interface ApiResponse {
  update_fulfillments_by_pk: {
    id: string;
    status: FulfillmentStatus;
    [key: string]: any;
  };
}

interface FulfillmentData {
  order_id: string;
  items: {
    item_id: string;
    quantity: number;
  }[];
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  [key: string]: any;
}

interface ShipmentData {
  carrier: string;
  tracking_number: string;
  shipping_method: string;
  [key: string]: any;
}

interface TrackingData {
  tracking_number: string;
  status: string;
  estimated_delivery_date?: string;
  [key: string]: any;
}

export default class Fulfillment {
  constructor(private client: any) {}

  private handleCommandResponse(response: any): FulfillmentResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_fulfillments_by_pk) {
      throw new Error('Unexpected response format');
    }

    const fulfillmentData = response.update_fulfillments_by_pk;

    const baseResponse: BaseFulfillmentResponse = {
      id: fulfillmentData.id,
      object: 'fulfillment',
      status: fulfillmentData.status,
    };

    switch (fulfillmentData.status) {
      case 'PENDING':
        return { ...baseResponse, status: 'PENDING', pending: true };
      case 'PROCESSING':
        return { ...baseResponse, status: 'PROCESSING', processing: true };
      case 'SHIPPED':
        return { ...baseResponse, status: 'SHIPPED', shipped: true };
      case 'DELIVERED':
        return { ...baseResponse, status: 'DELIVERED', delivered: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected fulfillment status: ${fulfillmentData.status}`);
    }
  }

  async create(data: FulfillmentData): Promise<FulfillmentResponse> {
    const response = await this.client.request('POST', 'fulfillments', data);
    return this.handleCommandResponse(response);
  }

  async get(id: string): Promise<FulfillmentResponse> {
    const response = await this.client.request('GET', `fulfillments/${id}`);
    return this.handleCommandResponse({ update_fulfillments_by_pk: response });
  }

  async update(id: string, data: Partial<FulfillmentData>): Promise<FulfillmentResponse> {
    const response = await this.client.request('PUT', `fulfillments/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async list(params?: any): Promise<FulfillmentResponse[]> {
    const response = await this.client.request('GET', 'fulfillments', params);
    return response.map((fulfillment: any) => this.handleCommandResponse({ update_fulfillments_by_pk: fulfillment }));
  }

  async cancel(id: string): Promise<CancelledFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledFulfillmentResponse;
  }

  async createShipment(id: string, data: ShipmentData): Promise<ShippedFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/shipments`, data);
    return this.handleCommandResponse(response) as ShippedFulfillmentResponse;
  }

  async getShipments(id: string): Promise<ShipmentData[]> {
    return this.client.request('GET', `fulfillments/${id}/shipments`);
  }

  async updateTracking(id: string, data: TrackingData): Promise<FulfillmentResponse> {
    const response = await this.client.request('PUT', `fulfillments/${id}/tracking`, data);
    return this.handleCommandResponse(response);
  }

  async process(id: string): Promise<ProcessingFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/process`);
    return this.handleCommandResponse(response) as ProcessingFulfillmentResponse;
  }

  async markAsDelivered(id: string): Promise<DeliveredFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/deliver`);
    return this.handleCommandResponse(response) as DeliveredFulfillmentResponse;
  }
}