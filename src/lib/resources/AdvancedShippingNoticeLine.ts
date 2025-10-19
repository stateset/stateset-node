import type { ApiClientLike } from '../../types';

// Enums
export enum WeightUnit {
  LB = 'LB',
  KG = 'KG',
}

export enum LineItemStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
}

// Interfaces
export interface HazmatInfo {
  un_number?: string;
  class_division?: string;
  packing_group?: string;
}

export interface ASNLineItem {
  id: string;
  asn_id: string;
  purchase_order_line_item_id: string;
  quantity_shipped: number;
  package_number?: string;
  lot_number?: string;
  serial_numbers?: string[];
  expiration_date?: string;
  weight?: number;
  weight_unit?: WeightUnit;
  customs_value?: number;
  customs_currency?: string;
  country_of_origin?: string;
  hazmat_info?: HazmatInfo;
  status: LineItemStatus;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

// Error Classes
export class ASNLineError extends Error {
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

export class ASNLineNotFoundError extends ASNLineError {
  constructor(lineItemId: string) {
    super(`ASN Line Item with ID ${lineItemId} not found`, 'ASNLineNotFoundError');
  }
}

export class ASNLineValidationError extends ASNLineError {
  constructor(message: string) {
    super(message, 'ASNLineValidationError');
  }
}

// Utility Types
type CreateASNLineItem = Omit<ASNLineItem, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: LineItemStatus;
};

// Main ASNLines Class
export class ASNLines {
  constructor(private readonly client: ApiClientLike) {}

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any
  ): Promise<T> {
    try {
      return await this.client.request(method, path, data);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ASNLineNotFoundError(path.split('/')[2] || 'unknown');
      }
      if (error.status === 400) {
        throw new ASNLineValidationError(error.message);
      }
      throw error;
    }
  }

  private validateLineItem(data: Partial<ASNLineItem>): void {
    if (data.quantity_shipped !== undefined && data.quantity_shipped <= 0) {
      throw new ASNLineValidationError('Quantity shipped must be greater than 0');
    }
  }

  async list(
    params: {
      asn_id?: string;
      status?: LineItemStatus;
      purchase_order_line_item_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ line_items: ASNLineItem[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = params.asn_id ? `asns/${params.asn_id}/line_items` : 'asn_line_items';

    return this.request<{ line_items: ASNLineItem[]; total: number }>(
      'GET',
      `${endpoint}?${queryParams.toString()}`
    );
  }

  async get(lineItemId: string): Promise<ASNLineItem> {
    return this.request<ASNLineItem>('GET', `asn_line_items/${lineItemId}`);
  }

  async create(lineItemData: CreateASNLineItem): Promise<ASNLineItem> {
    this.validateLineItem(lineItemData);
    return this.request<ASNLineItem>('POST', 'asn_line_items', {
      ...lineItemData,
      status: lineItemData.status || LineItemStatus.PENDING,
    });
  }

  async update(lineItemId: string, lineItemData: Partial<ASNLineItem>): Promise<ASNLineItem> {
    this.validateLineItem(lineItemData);
    return this.request<ASNLineItem>('PUT', `asn_line_items/${lineItemId}`, lineItemData);
  }

  async delete(lineItemId: string): Promise<void> {
    await this.request<void>('DELETE', `asn_line_items/${lineItemId}`);
  }

  async bulkCreate(
    asnId: string,
    lineItems: Array<Omit<CreateASNLineItem, 'asn_id'>>
  ): Promise<ASNLineItem[]> {
    if (!lineItems.length) {
      throw new ASNLineValidationError('At least one line item is required for bulk create');
    }
    lineItems.forEach(this.validateLineItem);

    return this.request<ASNLineItem[]>('POST', `asns/${asnId}/line_items/bulk`, {
      line_items: lineItems.map(item => ({
        ...item,
        status: item.status || LineItemStatus.PENDING,
      })),
    });
  }

  async updateTrackingInfo(
    lineItemId: string,
    trackingInfo: {
      package_number?: string;
      tracking_number?: string;
      carrier_status?: string;
    }
  ): Promise<ASNLineItem> {
    return this.request<ASNLineItem>('PUT', `asn_line_items/${lineItemId}/tracking`, trackingInfo);
  }

  async updateStatus(
    lineItemId: string,
    status: LineItemStatus,
    statusDetails: {
      timestamp?: string;
      notes?: string;
    } = {}
  ): Promise<ASNLineItem> {
    return this.request<ASNLineItem>('PUT', `asn_line_items/${lineItemId}/status`, {
      status,
      ...statusDetails,
    });
  }

  async getTrackingHistory(
    lineItemId: string,
    params: {
      from_date?: Date;
      to_date?: Date;
    } = {}
  ): Promise<
    Array<{
      timestamp: string;
      status: LineItemStatus;
      package_number?: string;
      tracking_number?: string;
      carrier_status?: string;
      notes?: string;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params.from_date) queryParams.append('from_date', params.from_date.toISOString());
    if (params.to_date) queryParams.append('to_date', params.to_date.toISOString());

    return this.request(
      'GET',
      `asn_line_items/${lineItemId}/tracking-history?${queryParams.toString()}`
    );
  }
}

export default ASNLines;
