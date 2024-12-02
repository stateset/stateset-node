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

  /**
   * List ASNs
   * @returns Array of ASNResponse objects
   */
  async list(): Promise<ASNResponse[]> {
    const response = await this.stateset.request('GET', 'asns');
    return response.map((asn: any) => this.handleCommandResponse({ update_asns_by_pk: asn }));
  }

  /**
   * Get ASN
   * @param asnId - ASN ID
   * @returns ASNResponse object
   */
  async get(asnId: string): Promise<ASNResponse> {
    const response = await this.stateset.request('GET', `asns/${asnId}`);
    return this.handleCommandResponse({ update_asns_by_pk: response });
  }

  /**
   * Create ASN
   * @param asnData - ASNData object
   * @returns ASNResponse object
   */
  async create(asnData: ASNData): Promise<ASNResponse> {
    const response = await this.stateset.request('POST', 'asns', asnData);
    return this.handleCommandResponse(response);
  }

  /**
   * Update ASN
   * @param asnId - ASN ID
   * @param asnData - Partial<ASNData> object
   * @returns ASNResponse object
   */
  async update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse> {
    const response = await this.stateset.request('PUT', `asns/${asnId}`, asnData);
    return this.handleCommandResponse(response);
  }

  /**
   * Delete ASN
   * @param asnId - ASN ID
   */
  async delete(asnId: string): Promise<void> {
    await this.stateset.request('DELETE', `asns/${asnId}`);
  }

  /**
   * Submit ASN
   * @param asnId - ASN ID
   * @returns SubmittedASNResponse object
   */
  async submit(asnId: string): Promise<SubmittedASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/submit`);
    return this.handleCommandResponse(response) as SubmittedASNResponse;
  }

  /**
   * Mark ASN as in transit
   * @param asnId - ASN ID
   * @param transitDetails - TransitDetails object
   * @returns InTransitASNResponse object
   */
  async markInTransit(asnId: string, transitDetails?: { 
    departure_date?: string;
    estimated_arrival_date?: string;
    carrier_status_updates?: string;
  }): Promise<InTransitASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/in-transit`, transitDetails);
    return this.handleCommandResponse(response) as InTransitASNResponse;
  }

  /**
   * Mark ASN as delivered
   * @param asnId - ASN ID
   * @param deliveryDetails - DeliveryDetails object
   * @returns DeliveredASNResponse object
   */
  async markDelivered(asnId: string, deliveryDetails: {
    delivery_date: string;
    received_by?: string;
    delivery_notes?: string;
  }): Promise<DeliveredASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/deliver`, deliveryDetails);
    return this.handleCommandResponse(response) as DeliveredASNResponse;
  }

  /**
   * Cancel ASN
   * @param asnId - ASN ID
   * @returns CancelledASNResponse object
   */
  async cancel(asnId: string): Promise<CancelledASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/cancel`);
    return this.handleCommandResponse(response) as CancelledASNResponse;
  }

  /**
   * Add item to ASN
   * @param asnId - ASN ID
   * @param item - ASNData['items'][0] object
   * @returns ASNResponse object
   */
  async addItem(asnId: string, item: ASNData['items'][0]): Promise<ASNResponse> {
    const response = await this.stateset.request('POST', `asns/${asnId}/items`, item);
    return this.handleCommandResponse(response);
  }

  /**
   * Remove item from ASN
   * @param asnId - ASN ID
   * @param purchaseOrderItemId - Purchase order item ID
   * @returns ASNResponse object
   */
  async removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse> {
    const response = await this.stateset.request('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
    return this.handleCommandResponse(response);
  }

  /**
   * Update shipping information for ASN
   * @param asnId - ASN ID
   * @param shippingInfo - ShippingInfo object
   * @returns ASNResponse object
   */
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