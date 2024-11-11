import { stateset } from '../../stateset-client';

type ASNStatus = 'DRAFT' | 'SUBMITTED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

interface BaseASNResponse {
  id: string;
  object: 'asn';
  status: ASNStatus;
}

interface DraftASNResponse extends BaseASNResponse {
  status: 'DRAFT';
  draft: true;
}

interface SubmittedASNResponse extends BaseASNResponse {
  status: 'SUBMITTED';
  submitted: true;
}

interface InTransitASNResponse extends BaseASNResponse {
  status: 'IN_TRANSIT';
  in_transit: true;
}

interface DeliveredASNResponse extends BaseASNResponse {
  status: 'DELIVERED';
  delivered: true;
}

interface CancelledASNResponse extends BaseASNResponse {
  status: 'CANCELLED';
  cancelled: true;
}

type ASNResponse = DraftASNResponse | SubmittedASNResponse | InTransitASNResponse | DeliveredASNResponse | CancelledASNResponse;

interface ApiResponse {
  update_asns_by_pk: {
    id: string;
    status: ASNStatus;
    [key: string]: any;
  };
}

interface ASNData {
  purchase_order_id: string;
  carrier: string;
  tracking_number: string;
  expected_delivery_date: string;
  ship_from_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  ship_to_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  items: {
    purchase_order_item_id: string;
    quantity_shipped: number;
    package_number?: string;
  }[];
  [key: string]: any;
}

class ASN {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): ASNResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_asns_by_pk) {
      throw new Error('Unexpected response format');
    }

    const asnData = response.update_asns_by_pk;

    const baseResponse: BaseASNResponse = {
      id: asnData.id,
      object: 'asn',
      status: asnData.status,
    };

    switch (asnData.status) {
      case 'DRAFT':
        return { ...baseResponse, status: 'DRAFT', draft: true };
      case 'SUBMITTED':
        return { ...baseResponse, status: 'SUBMITTED', submitted: true };
      case 'IN_TRANSIT':
        return { ...baseResponse, status: 'IN_TRANSIT', in_transit: true };
      case 'DELIVERED':
        return { ...baseResponse, status: 'DELIVERED', delivered: true };
      case 'CANCELLED':
        return { ...baseResponse, status: 'CANCELLED', cancelled: true };
      default:
        throw new Error(`Unexpected ASN status: ${asnData.status}`);
    }
  }

  async list(): Promise<ASNResponse[]> {
    const response = await this.stateset.request('GET', 'asns');
    return response.map((asn: any) => this.handleCommandResponse({ update_asns_by_pk: asn }));
  }

  async get(asnId: string): Promise<ASNResponse> {
    const response = await this.stateset.request('GET', `asns/${asnId}`);
    return this.handleCommandResponse({ update_asns_by_pk: response });
  }

  async create(asnData: ASNData): Promise<ASNResponse> {
    const response = await this.stateset.request('POST', 'asns', asnData);
    return this.handleCommandResponse(response);
  }

  async update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse> {
    const response = await this.stateset.request('PUT', `asns/${asnId}`, asnData);
    return this.handleCommandResponse(response);
  }

  async delete(asnId: string): Promise<void> {
    await this.stateset.request('DELETE', `asns/${asnId}`);
  }

  async submit(asnId: string): Promise<SubmittedASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/submit`);
    return this.handleCommandResponse(response) as SubmittedASNResponse;
  }

  async markInTransit(asnId: string, transitDetails?: { 
    departure_date?: string;
    estimated_arrival_date?: string;
    carrier_status_updates?: string;
  }): Promise<InTransitASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/in-transit`, transitDetails);
    return this.handleCommandResponse(response) as InTransitASNResponse;
  }

  async markDelivered(asnId: string, deliveryDetails: {
    delivery_date: string;
    received_by?: string;
    delivery_notes?: string;
  }): Promise<DeliveredASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/deliver`, deliveryDetails);
    return this.handleCommandResponse(response) as DeliveredASNResponse;
  }

  async cancel(asnId: string): Promise<CancelledASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/cancel`);
    return this.handleCommandResponse(response) as CancelledASNResponse;
  }

  async addItem(asnId: string, item: ASNData['items'][0]): Promise<ASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/items`, item);
    return this.handleCommandResponse(response);
  }

  async removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse> {
    const response = await this.stateset.request('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
    return this.handleCommandResponse(response);
  }

  async updateShippingInfo(asnId: string, shippingInfo: {
    carrier?: string;
    tracking_number?: string;
    expected_delivery_date?: string;
  }): Promise<ASNResponse> {
    const response = await this.stateset.request('PUT', `asns/${asnId}/shipping-info`, shippingInfo);
    return this.handleCommandResponse(response);
  }
}

export default ASN;