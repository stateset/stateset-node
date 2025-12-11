import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum CarrierType {
  FREIGHT = 'FREIGHT',
  PARCEL = 'PARCEL',
  COURIER = 'COURIER',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
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
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Carriers extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'carriers', 'carriers');
    this.singleKey = 'carrier';
    this.listKey = 'carriers';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

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

  override async list(params?: {
    status?: CarrierStatus;
    type?: CarrierType;
    org_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    carriers: CarrierResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await super.list(params as any);
    const carriers = (response as any).carriers ?? response;
    return {
      carriers,
      pagination: (response as any).pagination || {
        total: carriers.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(carrierId: NonEmptyString<string>): Promise<CarrierResponse> {
    return super.get(carrierId);
  }

  override async create(data: CarrierData): Promise<CarrierResponse> {
    this.validateCarrierData(data);
    return super.create(data);
  }

  override async update(
    carrierId: NonEmptyString<string>,
    data: Partial<CarrierData>
  ): Promise<CarrierResponse> {
    return super.update(carrierId, data);
  }

  override async delete(carrierId: NonEmptyString<string>): Promise<void> {
    await super.delete(carrierId);
  }

  async updatePerformance(
    carrierId: NonEmptyString<string>,
    performance: CarrierData['performance']
  ): Promise<CarrierResponse> {
    try {
      const response = await this.client.request('POST', `carriers/${carrierId}/performance`, {
        performance,
      });
      return this.mapResponse((response as any).carrier ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'updatePerformance', carrierId);
    }
  }

  private handleError(error: any, _operation: string, _carrierId?: string): never {
    throw error;
  }
}
