import { stateset } from '../../stateset-client';

export type FulfillmentOrderStatus =
  | 'OPEN'
  | 'ALLOCATED'
  | 'PICKED'
  | 'PACKED'
  | 'SHIPPED'
  | 'CANCELLED';

interface BaseFulfillmentOrderResponse {
  id: string;
  object: 'fulfillmentorder';
  status: FulfillmentOrderStatus;
}

interface OpenFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'OPEN';
  open: true;
}
interface AllocatedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'ALLOCATED';
  allocated: true;
}
interface PickedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'PICKED';
  picked: true;
}
interface PackedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'PACKED';
  packed: true;
}
interface ShippedFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'SHIPPED';
  shipped: true;
}
interface CancelledFulfillmentOrderResponse extends BaseFulfillmentOrderResponse {
  status: 'CANCELLED';
  cancelled: true;
}

export type FulfillmentOrderResponse =
  | OpenFulfillmentOrderResponse
  | AllocatedFulfillmentOrderResponse
  | PickedFulfillmentOrderResponse
  | PackedFulfillmentOrderResponse
  | ShippedFulfillmentOrderResponse
  | CancelledFulfillmentOrderResponse;



export interface FulfillmentOrderLine {
  item_id: string;
  quantity: number;
  [key: string]: any;
}

export interface FulfillmentOrderData {
  order_id: string;
  warehouse_id: string;
  lines: FulfillmentOrderLine[];
  [key: string]: any;
}

class FulfillmentOrders {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): FulfillmentOrderResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_fulfillmentorders_by_pk) {
      throw new Error('Unexpected response format');
    }

    const fo = response.update_fulfillmentorders_by_pk;

    const base: BaseFulfillmentOrderResponse = {
      id: fo.id,
      object: 'fulfillmentorder',
      status: fo.status,
    };

    switch (fo.status) {
      case 'OPEN':
        return { ...base, status: 'OPEN', open: true };
      case 'ALLOCATED':
        return { ...base, status: 'ALLOCATED', allocated: true };
      case 'PICKED':
        return { ...base, status: 'PICKED', picked: true };
      case 'PACKED':
        return { ...base, status: 'PACKED', packed: true };
      case 'SHIPPED':
        return { ...base, status: 'SHIPPED', shipped: true };
      case 'CANCELLED':
        return { ...base, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected fulfillment order status: ${fo.status}`);
    }
  }

  async list(): Promise<FulfillmentOrderResponse[]> {
    const response = await this.stateset.request('GET', 'fulfillmentorders');
    return response.map((fo: any) =>
      this.handleCommandResponse({ update_fulfillmentorders_by_pk: fo })
    );
  }

  async get(id: string): Promise<FulfillmentOrderResponse> {
    const response = await this.stateset.request('GET', `fulfillmentorders/${id}`);
    return this.handleCommandResponse({ update_fulfillmentorders_by_pk: response });
  }

  async create(data: FulfillmentOrderData): Promise<FulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', 'fulfillmentorders', data);
    return this.handleCommandResponse(response);
  }

  async update(id: string, data: Partial<FulfillmentOrderData>): Promise<FulfillmentOrderResponse> {
    const response = await this.stateset.request('PUT', `fulfillmentorders/${id}`, data);
    return this.handleCommandResponse(response);
  }

  async delete(id: string): Promise<void> {
    await this.stateset.request('DELETE', `fulfillmentorders/${id}`);
  }

  async allocate(id: string): Promise<AllocatedFulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', `fulfillmentorders/${id}/allocate`);
    return this.handleCommandResponse(response) as AllocatedFulfillmentOrderResponse;
  }

  async pick(id: string): Promise<PickedFulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', `fulfillmentorders/${id}/pick`);
    return this.handleCommandResponse(response) as PickedFulfillmentOrderResponse;
  }

  async pack(id: string): Promise<PackedFulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', `fulfillmentorders/${id}/pack`);
    return this.handleCommandResponse(response) as PackedFulfillmentOrderResponse;
  }

  async ship(id: string): Promise<ShippedFulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', `fulfillmentorders/${id}/ship`);
    return this.handleCommandResponse(response) as ShippedFulfillmentOrderResponse;
  }

  async cancel(id: string): Promise<CancelledFulfillmentOrderResponse> {
    const response = await this.stateset.request('POST', `fulfillmentorders/${id}/cancel`);
    return this.handleCommandResponse(response) as CancelledFulfillmentOrderResponse;
  }
}

export default FulfillmentOrders;
