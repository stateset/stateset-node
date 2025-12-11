import type { ApiClientLike } from '../../types';

// Utility Types
type UnitOfWeight = 'lb' | 'kg' | 'oz';
type UnitOfLength = 'in' | 'cm';
type NonEmptyString<T extends string> = T extends '' ? never : T;

// Enums with improved consistency
export enum ShipmentStatus {
  PENDING = 'pending',
  LABEL_CREATED = 'label_created',
  PICKING = 'picking',
  PICKED = 'picked',
  PACKING = 'packing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  ATTEMPTED_DELIVERY = 'attempted_delivery',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
  CANCELLED = 'cancelled',
}

export enum ShippingCarrier {
  FEDEX = 'FEDEX',
  UPS = 'UPS',
  USPS = 'USPS',
  DHL = 'DHL',
  ONTRAC = 'ONTRAC',
}

export enum ServiceLevel {
  GROUND = 'GROUND',
  TWO_DAY = 'TWO_DAY',
  OVERNIGHT = 'OVERNIGHT',
  INTERNATIONAL = 'INTERNATIONAL',
  ECONOMY = 'ECONOMY',
}

export enum PackageType {
  CUSTOM = 'CUSTOM',
  ENVELOPE = 'ENVELOPE',
  PAK = 'PAK',
  TUBE = 'TUBE',
  BOX_SMALL = 'BOX_SMALL',
  BOX_MEDIUM = 'BOX_MEDIUM',
  BOX_LARGE = 'BOX_LARGE',
  PALLET = 'PALLET',
}

// Common Measurement Types
interface Measurement<T extends string> {
  value: number;
  unit: T;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: UnitOfLength;
}

// Core Interfaces
export interface ShipmentItem {
  item_id: NonEmptyString<string>;
  order_item_id: NonEmptyString<string>;
  quantity: number;
  sku?: string;
  description?: string;
  weight?: Measurement<UnitOfWeight>;
  dimensions?: Dimensions;
  value?: number;
  currency?: string;
  serial_numbers?: string[];
  lot_numbers?: string[];
  package_id?: string;
}

export interface Address {
  name: NonEmptyString<string>;
  company?: string;
  street1: NonEmptyString<string>;
  street2?: string;
  city: NonEmptyString<string>;
  state: NonEmptyString<string>;
  postal_code: NonEmptyString<string>;
  country: NonEmptyString<string>;
  phone: NonEmptyString<string>;
  email?: string;
  is_residential?: boolean;
  delivery_instructions?: string;
  validated?: boolean;
}

export interface Package {
  id: NonEmptyString<string>;
  type: PackageType;
  weight: Measurement<UnitOfWeight>;
  dimensions: Dimensions;
  items: NonEmptyString<string>[]; // item_ids
  tracking_information?: {
    number: string;
    url: string;
    carrier: ShippingCarrier;
  };
  label?: {
    url: string;
    format: 'PDF' | 'PNG' | 'ZPL';
    created_at: string;
  };
  customs_declaration?: CustomsInfo;
}

export interface CustomsInfo {
  contents_type: NonEmptyString<string>;
  contents_explanation?: string;
  customs_certify?: boolean;
  customs_signer?: string;
  non_delivery_option?: 'RETURN' | 'ABANDON';
  restriction_type?: 'NONE' | 'OTHER' | 'DANGEROUS_GOODS';
  eel_pfc?: string;
  customs_items?: Array<{
    description: string;
    quantity: number;
    value: number;
    harmonized_code?: string;
    country_of_origin?: string;
  }>;
}

export interface TrackingEvent {
  timestamp: string;
  status: ShipmentStatus;
  message: string;
  location: Partial<Address>;
  carrier_details?: {
    code: string;
    description: string;
  };
}

export interface ShipmentData {
  order_id: NonEmptyString<string>;
  customer_id: NonEmptyString<string>;
  carrier: ShippingCarrier;
  service_level: ServiceLevel;
  shipping_address: Address;
  return_address?: Address;
  billing_address?: Address;
  items: ShipmentItem[];
  packages: Package[];
  estimated_delivery_date?: string;
  shipping_date?: string;
  delivery_requirements?: {
    signature_required?: boolean;
    adult_signature_required?: boolean;
    weekend_delivery?: boolean;
  };
  insurance?: {
    amount: number;
    currency: string;
    provider?: string;
  };
  customs_info?: CustomsInfo;
  metadata?: Record<string, unknown>;
  org_id?: string;
  tags?: string[];
}

export interface Rate {
  carrier: ShippingCarrier;
  service_level: ServiceLevel;
  cost: {
    amount: number;
    currency: string;
  };
  estimated_delivery: {
    days: number;
    date?: string;
  };
  features: {
    guaranteed_delivery: boolean;
    tracking: boolean;
    insurance_available: boolean;
  };
}

export interface ShippingLabel {
  tracking_number: string;
  label_url: string;
  carrier: ShippingCarrier;
  cost?: number;
  created_at: string;
  expires_at?: string;
}

// Response Types with Discriminated Unions
export type ShipmentResponse = {
  id: NonEmptyString<string>;
  object: 'shipment';
  created_at: string;
  updated_at: string;
  status: ShipmentStatus;
  data: ShipmentData;
} & (
  | { status: ShipmentStatus.PENDING; pending_details: { created_at: string } }
  | {
      status: ShipmentStatus.LABEL_CREATED;
      label_info: { tracking_number: string; label_url: string; created_at: string };
    }
  | {
      status: ShipmentStatus.SHIPPED;
      shipping_info: { carrier: ShippingCarrier; tracking_numbers: string[]; shipped_at: string };
    }
  | {
      status: ShipmentStatus.IN_TRANSIT;
      transit_info: { events: TrackingEvent[]; last_update: string };
    }
  | {
      status: ShipmentStatus.DELIVERED;
      delivery_info: { delivered_at: string; signed_by?: string; proof_of_delivery?: string };
    }
  | {
      status: ShipmentStatus.EXCEPTION;
      exception_info: { code: string; message: string; timestamp: string; resolution?: string };
    }
);

// Error Classes with additional context
export class ShipmentError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ShipmentNotFoundError extends ShipmentError {
  constructor(shipmentId: string) {
    super(`Shipment with ID ${shipmentId} not found`, { shipmentId });
  }
}

export class ShipmentValidationError extends ShipmentError {
  constructor(
    message: string,
    public readonly validationErrors?: Record<string, string>
  ) {
    super(message);
  }
}

export class CarrierApiError extends ShipmentError {
  constructor(
    message: string,
    public readonly carrier: ShippingCarrier,
    public readonly code: string
  ) {
    super(message, { carrier, code });
  }
}

// Main Shipments Class with improved error handling and validation
export class Shipments {
  constructor(private readonly client: ApiClientLike) {}

  private validateShipmentData(data: ShipmentData): void {
    if (!data.order_id) throw new ShipmentValidationError('Order ID is required');
    if (!data.customer_id) throw new ShipmentValidationError('Customer ID is required');
    if (!data.shipping_address) throw new ShipmentValidationError('Shipping address is required');
  }

  async list(
    params: {
      status?: ShipmentStatus;
      carrier?: ShippingCarrier;
      order_id?: string;
      customer_id?: string;
      date_range?: { from: Date; to: Date };
      org_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    shipments: ShipmentResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.carrier && { carrier: params.carrier }),
      ...(params.order_id && { order_id: params.order_id }),
      ...(params.customer_id && { customer_id: params.customer_id }),
      ...(params.date_range?.from && { date_from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { date_to: params.date_range.to.toISOString() }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await this.client.request('GET', `shipments?${query}`);
    return response;
  }

  async getRates(data: Omit<ShipmentData, 'carrier' | 'service_level'>): Promise<Rate[]> {
    this.validateShipmentData(data as ShipmentData);
    const response = await this.client.request('POST', 'shipments/rates', data);
    return response.rates;
  }

  async create(data: ShipmentData): Promise<ShipmentResponse> {
    this.validateShipmentData(data);
    try {
      const response = await this.client.request('POST', 'shipments', data);
      return response.shipment;
    } catch (error: any) {
      throw this.handleApiError(error);
    }
  }

  async update(shipmentId: string, data: Partial<ShipmentData>): Promise<ShipmentResponse> {
    try {
      const response = await this.client.request('PUT', `shipments/${shipmentId}`, data);
      return response.shipment;
    } catch (error: any) {
      throw this.handleApiError(error, shipmentId);
    }
  }

  async addPackage(
    shipmentId: string,
    packageData: Omit<Package, 'id'>
  ): Promise<ShipmentResponse> {
    const response = await this.client.request(
      'POST',
      `shipments/${shipmentId}/packages`,
      packageData
    );
    return response.shipment;
  }

  async generateReturnLabel(
    shipmentId: string,
    options: {
      return_address?: Address;
      service_level?: ServiceLevel;
      reason?: string;
    } = {}
  ): Promise<{
    tracking_number: string;
    label_url: string;
    carrier: ShippingCarrier;
    expires_at: string;
  }> {
    const response = await this.client.request(
      'POST',
      `shipments/${shipmentId}/return-label`,
      options
    );
    return response.label;
  }

  async generateLabel(
    shipmentId: string,
    options: { format?: 'PDF' | 'PNG' | 'ZPL'; test_label?: boolean } = {}
  ): Promise<ShippingLabel> {
    const response = await this.client.request('POST', `shipments/${shipmentId}/label`, options);
    return response.label;
  }

  async getTrackingDetails(
    shipmentId: string,
    options: {
      include_proof_of_delivery?: boolean;
      include_full_history?: boolean;
    } = {}
  ): Promise<{
    status: ShipmentStatus;
    estimated_delivery_date?: string;
    actual_delivery_date?: string;
    events: TrackingEvent[];
    proof_of_delivery?: string;
  }> {
    const query = new URLSearchParams({
      ...(options.include_proof_of_delivery && { include_pod: 'true' }),
      ...(options.include_full_history && { full_history: 'true' }),
    });
    const response = await this.client.request('GET', `shipments/${shipmentId}/tracking?${query}`);
    return response.tracking;
  }

  async getMetrics(
    params: {
      date_range?: { start: Date; end: Date };
      carrier?: ShippingCarrier;
      org_id?: string;
      group_by?: 'day' | 'week' | 'month';
    } = {}
  ): Promise<{
    total_shipments: number;
    average_delivery_time: number;
    on_time_delivery_rate: number;
    exception_rate: number;
    average_shipping_cost: number;
    carrier_breakdown: Record<ShippingCarrier, number>;
    status_breakdown: Record<ShipmentStatus, number>;
    trends?: Record<string, number>;
  }> {
    const query = new URLSearchParams({
      ...(params.date_range?.start && { start_date: params.date_range.start.toISOString() }),
      ...(params.date_range?.end && { end_date: params.date_range.end.toISOString() }),
      ...(params.carrier && { carrier: params.carrier }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.group_by && { group_by: params.group_by }),
    });
    const response = await this.client.request('GET', `shipments/metrics?${query}`);
    return response.metrics;
  }

  private handleApiError(error: any, _shipmentId?: string): never {
    throw error;
  }
}

export default Shipments;
