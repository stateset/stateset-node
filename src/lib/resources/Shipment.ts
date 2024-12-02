import { stateset } from '../../stateset-client';

// Enums for shipment management
export enum ShipmentStatus {
  PENDING = 'PENDING',
  LABEL_CREATED = 'LABEL_CREATED',
  PICKING = 'PICKING',
  PICKED = 'PICKED',
  PACKING = 'PACKING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  ATTEMPTED_DELIVERY = 'ATTEMPTED_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED'
}

export enum ShippingCarrier {
  FEDEX = 'fedex',
  UPS = 'ups',
  USPS = 'usps',
  DHL = 'dhl',
  ONTRAC = 'ontrac'
}

export enum ServiceLevel {
  GROUND = 'ground',
  TWO_DAY = 'two_day',
  OVERNIGHT = 'overnight',
  INTERNATIONAL = 'international',
  ECONOMY = 'economy'
}

export enum PackageType {
  CUSTOM = 'custom',
  ENVELOPE = 'envelope',
  PAK = 'pak',
  TUBE = 'tube',
  BOX_SMALL = 'box_small',
  BOX_MEDIUM = 'box_medium',
  BOX_LARGE = 'box_large',
  PALLET = 'pallet'
}

// Interfaces for shipment data structures
export interface ShipmentItem {
  item_id: string;
  order_item_id: string;
  quantity: number;
  sku?: string;
  description?: string;
  weight?: {
    value: number;
    unit: 'lb' | 'kg' | 'oz';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  value?: number;
  currency?: string;
  serial_numbers?: string[];
  lot_numbers?: string[];
  package_id?: string;
}

export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email?: string;
  is_residential?: boolean;
  delivery_instructions?: string;
}

export interface Package {
  id: string;
  type: PackageType;
  weight: {
    value: number;
    unit: 'lb' | 'kg' | 'oz';
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'in' | 'cm';
  };
  items: string[]; // item_ids
  tracking_number?: string;
  label_url?: string;
  customs_info?: {
    contents_type: string;
    contents_explanation?: string;
    customs_certify?: boolean;
    customs_signer?: string;
    non_delivery_option?: 'return' | 'abandon';
    restriction_type?: 'none' | 'other' | 'dangerous_goods';
    eel_pfc?: string;
  };
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  message: string;
  location: {
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  exception_details?: {
    code: string;
    message: string;
    resolution?: string;
  };
}

export interface ShipmentData {
  order_id: string;
  customer_id: string;
  carrier: ShippingCarrier;
  service_level: ServiceLevel;
  shipping_address: Address;
  return_address?: Address;
  items: ShipmentItem[];
  packages: Package[];
  estimated_delivery_date?: string;
  shipping_date?: string;
  signature_required?: boolean;
  insurance_amount?: number;
  customs_info?: {
    contents_type: string;
    customs_certify: boolean;
    customs_signer: string;
    eel_pfc?: string;
    non_delivery_option: 'return' | 'abandon';
    restriction_type: 'none' | 'other' | 'dangerous_goods';
  };
  metadata?: Record<string, any>;
  org_id?: string;
}

export interface Rate {
  carrier: ShippingCarrier;
  service_level: ServiceLevel;
  rate: {
    amount: number;
    currency: string;
  };
  estimated_days: number;
  guaranteed_delivery?: boolean;
}

// Response Interfaces
interface BaseShipmentResponse {
  id: string;
  object: 'shipment';
  created_at: string;
  updated_at: string;
  status: ShipmentStatus;
  data: ShipmentData;
}

interface PendingShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.PENDING;
  pending: true;
}

interface LabelCreatedShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.LABEL_CREATED;
  labelCreated: true;
  label_info: {
    tracking_number: string;
    label_url: string;
    created_at: string;
  };
}

interface ShippedShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.SHIPPED;
  shipped: true;
  shipping_info: {
    carrier: ShippingCarrier;
    tracking_numbers: string[];
    shipped_at: string;
  };
}

interface InTransitShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.IN_TRANSIT;
  inTransit: true;
  tracking_events: TrackingEvent[];
}

interface DeliveredShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.DELIVERED;
  delivered: true;
  delivery_info: {
    delivered_at: string;
    signed_by?: string;
    proof_of_delivery_url?: string;
  };
}

interface ExceptionShipmentResponse extends BaseShipmentResponse {
  status: ShipmentStatus.EXCEPTION;
  exception: true;
  exception_details: {
    code: string;
    message: string;
    timestamp: string;
    resolution?: string;
  };
}

export type ShipmentResponse =
  | PendingShipmentResponse
  | LabelCreatedShipmentResponse
  | ShippedShipmentResponse
  | InTransitShipmentResponse
  | DeliveredShipmentResponse
  | ExceptionShipmentResponse;

// Custom Error Classes
export class ShipmentNotFoundError extends Error {
  constructor(shipmentId: string) {
    super(`Shipment with ID ${shipmentId} not found`);
    this.name = 'ShipmentNotFoundError';
  }
}

export class ShipmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShipmentValidationError';
  }
}

export class CarrierApiError extends Error {
  constructor(message: string, public readonly carrier: string, public readonly code: string) {
    super(message);
    this.name = 'CarrierApiError';
  }
}

// Main Shipments Class
class Shipments {
  constructor(private readonly stateset: stateset) {}

  /**
   * List shipments with optional filtering
   * @param params - Filtering parameters
   * @returns Array of ShipmentResponse objects
   */
  async list(params?: {
    status?: ShipmentStatus;
    carrier?: ShippingCarrier;
    order_id?: string;
    customer_id?: string;
    date_from?: Date;
    date_to?: Date;
    org_id?: string;
  }): Promise<ShipmentResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.carrier) queryParams.append('carrier', params.carrier);
    if (params?.order_id) queryParams.append('order_id', params.order_id);
    if (params?.customer_id) queryParams.append('customer_id', params.customer_id);
    if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
    if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `shipments?${queryParams.toString()}`);
    return response.shipments;
  }

  /**
   * Get shipping rates
   * @param shipmentData - Omit<ShipmentData, 'carrier' | 'service_level'> object
   * @returns Array of Rate objects
   */
  async getRates(
    shipmentData: Omit<ShipmentData, 'carrier' | 'service_level'>
  ): Promise<Rate[]> {
    const response = await this.stateset.request('POST', 'shipments/rates', shipmentData);
    return response.rates;
  }

  /**
   * Create shipment and generate label
   * @param shipmentData - ShipmentData object
   * @returns LabelCreatedShipmentResponse object
   */
  async create(shipmentData: ShipmentData): Promise<LabelCreatedShipmentResponse> {
    try {
      const response = await this.stateset.request('POST', 'shipments', shipmentData);
      return response.shipment;
    } catch (error: any) {
      if (error.status === 400) {
        throw new ShipmentValidationError(error.message);
      }
      if (error.carrier_error) {
        throw new CarrierApiError(error.message, error.carrier, error.carrier_code);
      }
      throw error;
    }
  }

  /**
   * Update shipment
   * @param shipmentId - Shipment ID
   * @param shipmentData - Partial<ShipmentData> object
   * @returns ShipmentResponse object
   */
  async update(
    shipmentId: string, 
    shipmentData: Partial<ShipmentData>
  ): Promise<ShipmentResponse> {
    try {
      const response = await this.stateset.request(
        'PUT',
        `shipments/${shipmentId}`,
        shipmentData
      );
      return response.shipment;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ShipmentNotFoundError(shipmentId);
      }
      throw error;
    }
  }

  /**
   * Package management methods
   * @param shipmentId - Shipment ID
   * @param packageData - Omit<Package, 'id'> object
   * @returns ShipmentResponse object
   */
  async addPackage(
    shipmentId: string,
    packageData: Omit<Package, 'id'>
  ): Promise<ShipmentResponse> {
    const response = await this.stateset.request(
      'POST',
      `shipments/${shipmentId}/packages`,
      packageData
    );
    return response.shipment;
  }

  async updatePackage(
    shipmentId: string,
    packageId: string,
    packageData: Partial<Package>
  ): Promise<ShipmentResponse> {
    const response = await this.stateset.request(
      'PUT',
      `shipments/${shipmentId}/packages/${packageId}`,
      packageData
    );
    return response.shipment;
  }

  /**
   * Generate return label
   * @param shipmentId - Shipment ID
   * @param returnData - Return data object
   * @returns Object with tracking_number, label_url, and carrier
   */
  async generateReturnLabel(
    shipmentId: string,
    returnData?: {
      return_address?: Address;
      service_level?: ServiceLevel;
    }
  ): Promise<{
    tracking_number: string;
    label_url: string;
    carrier: ShippingCarrier;
  }> {
    const response = await this.stateset.request(
      'POST',
      `shipments/${shipmentId}/return-label`,
      returnData
    );
    return response.label;
  }

  /**
   * Tracking methods
   * @param shipmentId - Shipment ID
   * @param params - Filtering parameters
   * @returns Object with status, estimated_delivery_date, actual_delivery_date, events, and proof_of_delivery_url
   */
  async getTrackingDetails(
    shipmentId: string,
    params?: {
      include_proof_of_delivery?: boolean;
    }
  ): Promise<{
    status: ShipmentStatus;
    estimated_delivery_date?: string;
    actual_delivery_date?: string;
    events: TrackingEvent[];
    proof_of_delivery_url?: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.include_proof_of_delivery) {
      queryParams.append('include_pod', 'true');
    }

    const response = await this.stateset.request(
      'GET',
      `shipments/${shipmentId}/tracking?${queryParams.toString()}`
    );
    return response.tracking;
  }

  /**
   * Get shipment metrics
   * @param params - Filtering parameters
   * @returns Object with total_shipments, average_delivery_time, on_time_delivery_rate, exception_rate, average_shipping_cost, carrier_breakdown, and status_breakdown
   */
  async getMetrics(params?: {
    start_date?: Date;
    end_date?: Date;
    carrier?: ShippingCarrier;
    org_id?: string;
  }): Promise<{
    total_shipments: number;
    average_delivery_time: number;
    on_time_delivery_rate: number;
    exception_rate: number;
    average_shipping_cost: number;
    carrier_breakdown: Record<ShippingCarrier, number>;
    status_breakdown: Record<ShipmentStatus, number>;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.carrier) queryParams.append('carrier', params.carrier);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request(
      'GET',
      `shipments/metrics?${queryParams.toString()}`
    );
    return response.metrics;
  }
}

export default Shipments;