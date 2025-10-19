import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ShipmentLineStatus {
  PENDING = 'PENDING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}

export enum ShipmentLineType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  DOCUMENT = 'DOCUMENT',
  SAMPLE = 'SAMPLE'
}

// Core Interfaces
export interface ShipmentLineItem {
  item_id: NonEmptyString<string>;
  sku: NonEmptyString<string>;
  description: string;
  quantity: number;
  unit_of_measure: string;
  weight: {
    value: number;
    unit: 'LB' | 'KG' | 'OZ';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'IN' | 'CM';
  };
  value: number;
  currency: string;
}

export interface ShipmentLineData {
  shipment_id: NonEmptyString<string>;
  order_line_id?: NonEmptyString<string>;
  type: ShipmentLineType;
  status: ShipmentLineStatus;
  item: ShipmentLineItem;
  tracking?: {
    number: string;
    carrier: string;
    url?: string;
    last_update?: Timestamp;
  };
  package_id?: NonEmptyString<string>;
  customs_info?: {
    hs_code?: string;
    country_of_origin: string;
    declaration_value: number;
    currency: string;
  };
  status_history: Array<{
    status: ShipmentLineStatus;
    changed_at: Timestamp;
    changed_by?: string;
    reason?: string;
  }>;
  created_at: Timestamp;
  updated_at: Timestamp;
  delivered_at?: Timestamp;
  org_id?: string;
  metadata?: Record<string, unknown>;
}

// Response Type
export interface ShipmentLineResponse {
  id: NonEmptyString<string>;
  object: 'shipment_line';
  data: ShipmentLineData;
}

// Error Classes
export class ShipmentLineError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ShipmentLineNotFoundError extends ShipmentLineError {
  constructor(shipmentLineId: string) {
    super(`Shipment line with ID ${shipmentLineId} not found`, { shipmentLineId });
  }
}

export class ShipmentLineValidationError extends ShipmentLineError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

// Main ShipmentLine Class
export class ShipmentLine {
  constructor(private readonly client: ApiClientLike) {}

  private validateShipmentLineData(data: ShipmentLineData): void {
    if (!data.shipment_id) {
      throw new ShipmentLineValidationError('Shipment ID is required');
    }
    if (!data.item?.item_id) {
      throw new ShipmentLineValidationError('Item ID is required');
    }
    if (!data.item?.quantity || data.item.quantity <= 0) {
      throw new ShipmentLineValidationError('Valid quantity is required');
    }
    if (data.item.weight.value < 0) {
      throw new ShipmentLineValidationError('Weight cannot be negative');
    }
  }

  private mapResponse(data: any): ShipmentLineResponse {
    if (!data?.id || !data.shipment_id) {
      throw new ShipmentLineError('Invalid response format');
    }

    return {
      id: data.id,
      object: 'shipment_line',
      data: {
        shipment_id: data.shipment_id,
        order_line_id: data.order_line_id,
        type: data.type,
        status: data.status,
        item: data.item,
        tracking: data.tracking,
        package_id: data.package_id,
        customs_info: data.customs_info,
        status_history: data.status_history || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
        delivered_at: data.delivered_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params: {
    shipment_id?: string;
    status?: ShipmentLineStatus;
    type?: ShipmentLineType;
    order_line_id?: string;
    package_id?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    shipment_lines: ShipmentLineResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.shipment_id && { shipment_id: params.shipment_id }),
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.order_line_id && { order_line_id: params.order_line_id }),
      ...(params.package_id && { package_id: params.package_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    try {
      const response = await this.client.request('GET', `shipment_line_items?${query}`);
      return {
        shipment_lines: response.shipment_lines.map(this.mapResponse),
        pagination: response.pagination || { total: response.shipment_lines.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(shipmentLineId: NonEmptyString<string>): Promise<ShipmentLineResponse> {
    try {
      const response = await this.client.request('GET', `shipment_line_items/${shipmentLineId}`);
      return this.mapResponse(response.shipment_line);
    } catch (error: any) {
      throw this.handleError(error, 'get', shipmentLineId);
    }
  }

  async create(data: ShipmentLineData): Promise<ShipmentLineResponse> {
    this.validateShipmentLineData(data);
    try {
      const response = await this.client.request('POST', 'shipment_line_items', data);
      return this.mapResponse(response.shipment_line);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    shipmentLineId: NonEmptyString<string>,
    data: Partial<ShipmentLineData>
  ): Promise<ShipmentLineResponse> {
    try {
      const response = await this.client.request('PUT', `shipment_line_items/${shipmentLineId}`, data);
      return this.mapResponse(response.shipment_line);
    } catch (error: any) {
      throw this.handleError(error, 'update', shipmentLineId);
    }
  }

  async delete(shipmentLineId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `shipment_line_items/${shipmentLineId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', shipmentLineId);
    }
  }

  async updateStatus(
    shipmentLineId: NonEmptyString<string>,
    status: ShipmentLineStatus,
    reason?: string
  ): Promise<ShipmentLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `shipment_line_items/${shipmentLineId}/status`,
        { status, reason }
      );
      return this.mapResponse(response.shipment_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateStatus', shipmentLineId);
    }
  }

  async updateTracking(
    shipmentLineId: NonEmptyString<string>,
    trackingData: Partial<ShipmentLineData['tracking']>
  ): Promise<ShipmentLineResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `shipment_line_items/${shipmentLineId}/tracking`,
        trackingData
      );
      return this.mapResponse(response.shipment_line);
    } catch (error: any) {
      throw this.handleError(error, 'updateTracking', shipmentLineId);
    }
  }

  async getMetrics(params: {
    shipment_id?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
  } = {}): Promise<{
    total_lines: number;
    status_breakdown: Record<ShipmentLineStatus, number>;
    type_breakdown: Record<ShipmentLineType, number>;
    average_weight: number;
    delivery_performance: {
      on_time_rate: number;
      average_delivery_time: number;
    };
  }> {
    const query = new URLSearchParams({
      ...(params.shipment_id && { shipment_id: params.shipment_id }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
    });

    try {
      const response = await this.client.request('GET', `shipment_line_items/metrics?${query}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, operation: string, shipmentLineId?: string): never {
    if (error.status === 404) throw new ShipmentLineNotFoundError(shipmentLineId || 'unknown');
    if (error.status === 400) throw new ShipmentLineValidationError(error.message, error.errors);
    throw new ShipmentLineError(
      `Failed to ${operation} shipment line: ${error.message}`,
      { operation, originalError: error }
    );
  }
}

export default ShipmentLine;