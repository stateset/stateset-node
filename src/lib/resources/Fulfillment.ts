import { BaseResource } from './BaseResource';

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

type FulfillmentResponse =
  | PendingFulfillmentResponse
  | ProcessingFulfillmentResponse
  | ShippedFulfillmentResponse
  | DeliveredFulfillmentResponse
  | CancelledFulfillmentResponse;

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

export default class Fulfillment extends BaseResource {
  constructor(client: any) {
    super(client, 'fulfillments', 'fulfillments');
    this.singleKey = 'update_fulfillments_by_pk';
  }

  protected override mapSingle(data: any): any {
    return this.handleCommandResponse({ update_fulfillments_by_pk: data });
  }

  protected override mapListItem(item: any): any {
    return this.mapSingle(item);
  }

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

  /**
   * Create fulfillment
   * @param data - FulfillmentData object
   * @returns FulfillmentResponse object
   */
  override async create(data: FulfillmentData): Promise<FulfillmentResponse> {
    return super.create(data);
  }

  /**
   * Get fulfillment
   * @param id - Fulfillment ID
   * @returns FulfillmentResponse object
   */
  override async get(id: string): Promise<FulfillmentResponse> {
    return super.get(id);
  }

  /**
   * Update fulfillment
   * @param id - Fulfillment ID
   * @param data - Partial<FulfillmentData> object
   * @returns FulfillmentResponse object
   */
  override async update(id: string, data: Partial<FulfillmentData>): Promise<FulfillmentResponse> {
    return super.update(id, data);
  }

  /**
   * List fulfillments
   * @param params - Optional filtering parameters
   * @returns Array of FulfillmentResponse objects
   */
  override async list(params?: any): Promise<FulfillmentResponse[]> {
    return super.list(params);
  }

  /**
   * Cancel fulfillment
   * @param id - Fulfillment ID
   * @returns CancelledFulfillmentResponse object
   */
  async cancel(id: string): Promise<CancelledFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledFulfillmentResponse;
  }

  /**
   * Create shipment
   * @param id - Fulfillment ID
   * @param data - ShipmentData object
   * @returns ShippedFulfillmentResponse object
   */
  async createShipment(id: string, data: ShipmentData): Promise<ShippedFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/shipments`, data);
    return this.handleCommandResponse(response) as ShippedFulfillmentResponse;
  }

  /**
   * Get shipments
   * @param id - Fulfillment ID
   * @returns Array of ShipmentData objects
   */
  async getShipments(id: string): Promise<ShipmentData[]> {
    return this.client.request('GET', `fulfillments/${id}/shipments`);
  }

  /**
   * Update tracking information
   * @param id - Fulfillment ID
   * @param data - TrackingData object
   * @returns FulfillmentResponse object
   */
  async updateTracking(id: string, data: TrackingData): Promise<FulfillmentResponse> {
    const response = await this.client.request('PUT', `fulfillments/${id}/tracking`, data);
    return this.handleCommandResponse(response);
  }

  /**
   * Process fulfillment
   * @param id - Fulfillment ID
   * @returns ProcessingFulfillmentResponse object
   */
  async process(id: string): Promise<ProcessingFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/process`);
    return this.handleCommandResponse(response) as ProcessingFulfillmentResponse;
  }

  /**
   * Mark fulfillment as delivered
   * @param id - Fulfillment ID
   * @returns DeliveredFulfillmentResponse object
   */
  async markAsDelivered(id: string): Promise<DeliveredFulfillmentResponse> {
    const response = await this.client.request('POST', `fulfillments/${id}/deliver`);
    return this.handleCommandResponse(response) as DeliveredFulfillmentResponse;
  }
}
