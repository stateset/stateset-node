import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export enum VendorType {
  SUPPLIER = 'SUPPLIER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  CONTRACTOR = 'CONTRACTOR',
}

// Interfaces
export interface VendorAddress {
  type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
  line1: NonEmptyString<string>;
  line2?: string;
  city: NonEmptyString<string>;
  state: string;
  postal_code: NonEmptyString<string>;
  country: NonEmptyString<string>;
}

export interface VendorContact {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  is_primary?: boolean;
}

export interface VendorPaymentTerms {
  terms: string; // e.g., "Net 30"
  credit_limit?: number;
  currency: string;
  payment_method?: 'CHECK' | 'ACH' | 'WIRE' | 'CREDIT_CARD';
}

export interface VendorPerformanceMetrics {
  on_time_delivery_rate: number; // 0-100 percentage
  quality_score: number; // 0-100 scale
  total_transactions: number;
  average_lead_time: number; // in days
  last_evaluated: Timestamp;
}

export interface VendorData {
  name: NonEmptyString<string>;
  vendor_code: NonEmptyString<string>;
  status: VendorStatus;
  type: VendorType;
  addresses: VendorAddress[];
  contacts: VendorContact[];
  payment_terms: VendorPaymentTerms;
  performance?: VendorPerformanceMetrics;
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface VendorResponse {
  id: NonEmptyString<string>;
  object: 'vendor';
  data: VendorData;
}

// Error Classes
export class VendorError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'VendorError';
  }
}

export class VendorNotFoundError extends VendorError {
  constructor(vendorId: string) {
    super(`Vendor with ID ${vendorId} not found`, { vendorId });
  }
}

export class VendorValidationError extends VendorError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Vendors {
  constructor(private readonly client: ApiClientLike) {}

  private validateVendorData(data: VendorData): void {
    if (!data.name) throw new VendorValidationError('Vendor name is required');
    if (!data.vendor_code) throw new VendorValidationError('Vendor code is required');
    if (!data.addresses?.length)
      throw new VendorValidationError('At least one address is required');
    if (!data.contacts?.length) throw new VendorValidationError('At least one contact is required');
    if (!data.payment_terms?.terms) throw new VendorValidationError('Payment terms are required');
    if (data.payment_terms?.credit_limit && data.payment_terms.credit_limit < 0) {
      throw new VendorValidationError('Credit limit cannot be negative');
    }
  }

  private mapResponse(data: any): VendorResponse {
    if (!data?.id) throw new VendorError('Invalid response format');
    return {
      id: data.id,
      object: 'vendor',
      data: {
        name: data.name,
        vendor_code: data.vendor_code,
        status: data.status,
        type: data.type,
        addresses: data.addresses,
        contacts: data.contacts,
        payment_terms: data.payment_terms,
        performance: data.performance,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    status?: VendorStatus;
    type?: VendorType;
    org_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    vendors: VendorResponse[];
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
      const response = await this.client.request('GET', `vendors?${queryParams.toString()}`);
      return {
        vendors: response.vendors.map(this.mapResponse),
        pagination: {
          total: response.total || response.vendors.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(vendorId: NonEmptyString<string>): Promise<VendorResponse> {
    try {
      const response = await this.client.request('GET', `vendors/${vendorId}`);
      return this.mapResponse(response.vendor);
    } catch (error: any) {
      throw this.handleError(error, 'get', vendorId);
    }
  }

  async create(data: VendorData): Promise<VendorResponse> {
    this.validateVendorData(data);
    try {
      const response = await this.client.request('POST', 'vendors', data);
      return this.mapResponse(response.vendor);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    vendorId: NonEmptyString<string>,
    data: Partial<VendorData>
  ): Promise<VendorResponse> {
    try {
      const response = await this.client.request('PUT', `vendors/${vendorId}`, data);
      return this.mapResponse(response.vendor);
    } catch (error: any) {
      throw this.handleError(error, 'update', vendorId);
    }
  }

  async delete(vendorId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `vendors/${vendorId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', vendorId);
    }
  }

  async getPerformanceMetrics(vendorId: NonEmptyString<string>): Promise<VendorPerformanceMetrics> {
    try {
      const response = await this.client.request('GET', `vendors/${vendorId}/performance`);
      return response.performance;
    } catch (error: any) {
      throw this.handleError(error, 'getPerformanceMetrics', vendorId);
    }
  }

  async updatePaymentTerms(
    vendorId: NonEmptyString<string>,
    data: Partial<VendorPaymentTerms>
  ): Promise<VendorResponse> {
    if (data.credit_limit && data.credit_limit < 0) {
      throw new VendorValidationError('Credit limit cannot be negative');
    }
    try {
      const response = await this.client.request('PUT', `vendors/${vendorId}/payment-terms`, data);
      return this.mapResponse(response.vendor);
    } catch (error: any) {
      throw this.handleError(error, 'updatePaymentTerms', vendorId);
    }
  }

  async addContact(
    vendorId: NonEmptyString<string>,
    contact: VendorContact
  ): Promise<VendorResponse> {
    if (!contact.first_name || !contact.last_name) {
      throw new VendorValidationError('Contact first and last names are required');
    }
    try {
      const response = await this.client.request('POST', `vendors/${vendorId}/contacts`, contact);
      return this.mapResponse(response.vendor);
    } catch (error: any) {
      throw this.handleError(error, 'addContact', vendorId);
    }
  }

  async getVendorMetrics(params?: { org_id?: string; date_from?: Date; date_to?: Date }): Promise<{
    total_vendors: number;
    status_breakdown: Record<VendorStatus, number>;
    type_breakdown: Record<VendorType, number>;
    average_performance: {
      on_time_delivery: number;
      quality_score: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
    }

    try {
      const response = await this.client.request(
        'GET',
        `vendors/metrics?${queryParams.toString()}`
      );
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getVendorMetrics');
    }
  }

  private handleError(error: any, _operation: string, _vendorId?: string): never {
    throw error;
  }
}
