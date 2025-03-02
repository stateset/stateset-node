import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum CarrierType {
  FREIGHT = 'FREIGHT',
  PARCEL = 'PARCEL',
  COURIER = 'COURIER'
}

// Interfaces
export interface CarrierData {
  name: NonEmptyString<string>;
  carrier_code: NonEmptyString<string>;
  status: CarrierStatus;
  type: CarrierType;
  contact_email?: string;
  contact_phone?: string;
  rates: Array<{
    service_code: string;
    service_name: string;
    base_rate: number;
    currency: string;
  }>;
  performance?: {
    on_time_delivery_rate: number; // 0-100 percentage
    average_transit_time: number; // in days
    total_shipments: number;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface CarrierResponse {
  id: NonEmptyString<string>;
  object: 'carrier';
  data: CarrierData;
}

// Error Classes
export class CarrierError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'CarrierError';
  }
}

export class CarrierNotFoundError extends CarrierError {
  constructor(carrierId: string) {
    super(`Carrier with ID ${carrierId} not found`, { carrierId });
  }
}

export class CarrierValidationError extends CarrierError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Carriers {
  constructor(private readonly stateset: stateset) {}

  private validateCarrierData(data: CarrierData): void {
    if (!data.name) throw new CarrierValidationError('Carrier name is required');
    if (!data.carrier_code) throw new CarrierValidationError('Carrier code is required');
    if (data.rates?.some(rate => rate.base_rate < 0)) {
      throw new CarrierValidationError('Base rate cannot be negative');
    }
  }

  private mapResponse(data: any): CarrierResponse {
    if (!data?.id) throw new CarrierError('Invalid response format');
    return {
      id: data.id,
      object: 'carrier',
      data: {
        name: data.name,
        carrier_code: data.carrier_code,
        status: data.status,
        type: data.type,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        rates: data.rates,
        performance: data.performance,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    status?: CarrierStatus;
    type?: CarrierType;
    org_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    carriers: CarrierResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.status) queryParams.append('status', params.status);
      if (params.type) queryParams.append('type', params.type);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `carriers?${queryParams.toString()}`);
      return {
        carriers: response.carriers.map(this.mapResponse),
        pagination: {
          total: response.total || response.carriers.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(carrierId: NonEmptyString<string>): Promise<CarrierResponse> {
    try {
      const response = await this.stateset.request('GET', `carriers/${carrierId}`);
      return this.mapResponse(response.carrier);
    } catch (error: any) {
      throw this.handleError(error, 'get', carrierId);
    }
  }

  async create(data: CarrierData): Promise<CarrierResponse> {
    this.validateCarrierData(data);
    try {
      const response = await this.stateset.request('POST', 'carriers', data);
      return this.mapResponse(response.carrier);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(carrierId: NonEmptyString<string>, data: Partial<CarrierData>): Promise<CarrierResponse> {
    try {
      const response = await this.stateset.request('PUT', `carriers/${carrierId}`, data);
      return this.mapResponse(response.carrier);
    } catch (error: any) {
      throw this.handleError(error, 'update', carrierId);
    }
  }

  async delete(carrierId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `carriers/${carrierId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', carrierId);
    }
  }

  async updatePerformance(
    carrierId: NonEmptyString<string>,
    performance: CarrierData['performance']
  ): Promise<CarrierResponse> {
    try {
      const response = await this.stateset.request('POST', `carriers/${carrierId}/performance`, { performance });
      return this.mapResponse(response.carrier);
    } catch (error: any) {
      throw this.handleError(error, 'updatePerformance', carrierId);
    }
  }

  private handleError(error: any, operation: string, carrierId?: string): never {
    if (error.status === 404) throw new CarrierNotFoundError(carrierId || 'unknown');
    if (error.status === 400) throw new CarrierValidationError(error.message, error.errors);
    throw new CarrierError(
      `Failed to ${operation} carrier: ${error.message}`,
      { operation, originalError: error }
    );
  }
}