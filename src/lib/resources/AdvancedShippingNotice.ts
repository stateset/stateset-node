import type { ApiClientLike } from '../../types';

// Enums
export enum ASNStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Interfaces
interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ASNItem {
  purchase_order_item_id: string;
  quantity_shipped: number;
  package_number?: string;
}

export interface ASNData {
  purchase_order_id: string;
  carrier: string;
  tracking_number: string;
  expected_delivery_date: string;
  ship_from_address: Address;
  ship_to_address: Address;
  items: ASNItem[];
  metadata?: Record<string, any>;
}

// Response Types
interface BaseASNResponse {
  id: string;
  object: 'asn';
  created_at: string;
  updated_at: string;
  status: ASNStatus;
  data: ASNData;
}

export type ASNResponse = BaseASNResponse &
  {
    [K in ASNStatus]: {
      status: K;
    } & (K extends ASNStatus.DRAFT
      ? { draft: true }
      : K extends ASNStatus.SUBMITTED
        ? { submitted: true }
        : K extends ASNStatus.IN_TRANSIT
          ? { in_transit: true }
          : K extends ASNStatus.DELIVERED
            ? { delivered: true }
            : K extends ASNStatus.CANCELLED
              ? { cancelled: true; cancellation_reason?: string }
              : {});
  }[ASNStatus];

// Error Classes
export class ASNError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class ASNNotFoundError extends ASNError {
  constructor(asnId: string) {
    super(`ASN with ID ${asnId} not found`, 'ASNNotFoundError');
  }
}

export class ASNStateError extends ASNError {
  constructor(message: string) {
    super(message, 'ASNStateError');
  }
}

// Main ASN Class
export class ASN {
  constructor(private readonly client: ApiClientLike) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    const response = await this.client.request(method, path, data);
    return this.normalizeResponse(response);
  }

  private normalizeResponse(response: any): any {
    if (response.error) {
      throw new Error(response.error);
    }

    const asnData = response.update_asns_by_pk || response;
    if (!asnData?.id || !asnData?.status) {
      throw new Error('Unexpected response format');
    }

    return asnData;
  }

  async list(
    params: {
      status?: ASNStatus;
      purchase_order_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ asns: ASNResponse[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const response = await this.request<{ asns: ASNResponse[]; total: number }>(
      'GET',
      `asns?${queryParams.toString()}`
    );
    return response;
  }

  async get(asnId: string): Promise<ASNResponse> {
    return this.request<ASNResponse>('GET', `asns/${asnId}`);
  }

  async create(asnData: ASNData): Promise<ASNResponse> {
    if (!asnData.items.length) {
      throw new ASNStateError('ASN must contain at least one item');
    }
    return this.request<ASNResponse>('POST', 'asns', asnData);
  }

  async update(asnId: string, asnData: Partial<ASNData>): Promise<ASNResponse> {
    return this.request<ASNResponse>('PUT', `asns/${asnId}`, asnData);
  }

  async delete(asnId: string): Promise<void> {
    await this.request<void>('DELETE', `asns/${asnId}`);
  }

  async submit(asnId: string): Promise<ASNResponse> {
    return this.request<ASNResponse>('POST', `asns/${asnId}/submit`);
  }

  async markInTransit(
    asnId: string,
    transitDetails: {
      departure_date?: string;
      estimated_arrival_date?: string;
      carrier_status_updates?: string;
    } = {}
  ): Promise<ASNResponse> {
    return this.request<ASNResponse>('POST', `asns/${asnId}/in-transit`, transitDetails);
  }

  async markDelivered(
    asnId: string,
    deliveryDetails: {
      delivery_date: string;
      received_by?: string;
      delivery_notes?: string;
    }
  ): Promise<ASNResponse> {
    return this.request<ASNResponse>('POST', `asns/${asnId}/deliver`, deliveryDetails);
  }

  async cancel(
    asnId: string,
    cancellationDetails: {
      reason?: string;
    } = {}
  ): Promise<ASNResponse> {
    return this.request<ASNResponse>('POST', `asns/${asnId}/cancel`, cancellationDetails);
  }

  async addItem(asnId: string, item: ASNItem): Promise<ASNResponse> {
    if (item.quantity_shipped <= 0) {
      throw new ASNStateError('Quantity shipped must be greater than 0');
    }
    return this.request<ASNResponse>('POST', `asns/${asnId}/items`, item);
  }

  async removeItem(asnId: string, purchaseOrderItemId: string): Promise<ASNResponse> {
    return this.request<ASNResponse>('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
  }

  async updateShippingInfo(
    asnId: string,
    shippingInfo: {
      carrier?: string;
      tracking_number?: string;
      expected_delivery_date?: string;
    }
  ): Promise<ASNResponse> {
    return this.request<ASNResponse>('PUT', `asns/${asnId}/shipping-info`, shippingInfo);
  }

  async getTracking(asnId: string): Promise<{
    status: ASNStatus;
    tracking_number: string;
    carrier: string;
    estimated_delivery_date: string;
    events: Array<{
      timestamp: string;
      location: string;
      description: string;
    }>;
  }> {
    return this.request('GET', `asns/${asnId}/tracking`);
  }
}

export default ASN;
