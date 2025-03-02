// lib/resources/Supplier.ts
import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

export enum SupplierType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  WHOLESALER = 'WHOLESALER',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER'
}

// Core Interfaces
export interface SupplierAddress {
  type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
  street1: NonEmptyString<string>;
  street2?: string;
  city: NonEmptyString<string>;
  state: string;
  postal_code: NonEmptyString<string>;
  country: NonEmptyString<string>;
}

export interface SupplierContact {
  type: 'PHONE' | 'EMAIL' | 'FAX';
  value: NonEmptyString<string>;
  name?: string;
  role?: string;
  is_primary?: boolean;
}

export interface SupplierPaymentTerms {
  terms: string; // e.g., "Net 30"
  credit_limit?: number;
  currency: string;
  discount?: {
    percentage: number;
    days: number;
  };
  late_penalty?: {
    percentage: number;
    grace_period_days: number;
  };
}

export interface SupplierPerformanceMetrics {
  on_time_delivery_rate: number;
  quality_rating: number;
  order_accuracy_rate: number;
  average_lead_time: number; // in days
  total_orders: number;
  last_evaluated: Timestamp;
}

export interface SupplierData {
  name: NonEmptyString<string>;
  type: SupplierType;
  status: SupplierStatus;
  supplier_code: NonEmptyString<string>;
  email: NonEmptyString<string>;
  phone?: string;
  addresses: SupplierAddress[];
  contacts?: SupplierContact[];
  payment_terms: SupplierPaymentTerms;
  performance?: SupplierPerformanceMetrics;
  categories?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

// Response Type
export interface SupplierResponse {
  id: NonEmptyString<string>;
  object: 'supplier';
  data: SupplierData;
}

// Error Classes
export class SupplierError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SupplierNotFoundError extends SupplierError {
  constructor(supplierId: string) {
    super(`Supplier with ID ${supplierId} not found`, { supplierId });
  }
}

export class SupplierValidationError extends SupplierError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Suppliers {
  constructor(private client: stateset) {}

  private validateSupplierData(data: SupplierData): void {
    if (!data.name) throw new SupplierValidationError('Supplier name is required');
    if (!data.supplier_code) throw new SupplierValidationError('Supplier code is required');
    if (!data.email) throw new SupplierValidationError('Email is required');
    if (!data.addresses?.length) throw new SupplierValidationError('At least one address is required');
    if (!data.payment_terms?.terms) throw new SupplierValidationError('Payment terms are required');
  }

  private mapResponse(data: any): SupplierResponse {
    if (!data?.id) throw new SupplierError('Invalid response format');
    return {
      id: data.id,
      object: 'supplier',
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        supplier_code: data.supplier_code,
        email: data.email,
        phone: data.phone,
        addresses: data.addresses,
        contacts: data.contacts,
        payment_terms: data.payment_terms,
        performance: data.performance,
        categories: data.categories,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
        tags: data.tags,
      },
    };
  }

  async create(data: SupplierData): Promise<SupplierResponse> {
    this.validateSupplierData(data);
    try {
      const response = await this.client.request('POST', 'suppliers', data);
      return this.mapResponse(response.supplier);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async get(id: NonEmptyString<string>): Promise<SupplierResponse> {
    try {
      const response = await this.client.request('GET', `suppliers/${id}`);
      return this.mapResponse(response.supplier);
    } catch (error: any) {
      throw this.handleError(error, 'get', id);
    }
  }

  async update(id: NonEmptyString<string>, data: Partial<SupplierData>): Promise<SupplierResponse> {
    try {
      const response = await this.client.request('PUT', `suppliers/${id}`, data);
      return this.mapResponse(response.supplier);
    } catch (error: any) {
      throw this.handleError(error, 'update', id);
    }
  }

  async list(params: {
    status?: SupplierStatus;
    type?: SupplierType;
    category?: string;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    suppliers: SupplierResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.category && { category: params.category }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.search && { search: params.search }),
    });

    try {
      const response = await this.client.request('GET', `suppliers?${query.toString()}`);
      return {
        suppliers: response.suppliers.map(this.mapResponse),
        pagination: response.pagination || { total: response.suppliers.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async delete(id: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `suppliers/${id}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', id);
    }
  }

  async getPerformanceMetrics(id: NonEmptyString<string>): Promise<SupplierPerformanceMetrics> {
    try {
      const response = await this.client.request('GET', `suppliers/${id}/performance`);
      return response.performance;
    } catch (error: any) {
      throw this.handleError(error, 'getPerformanceMetrics', id);
    }
  }

  async updatePaymentTerms(
    id: NonEmptyString<string>,
    data: Partial<SupplierPaymentTerms>
  ): Promise<SupplierResponse> {
    if (data.credit_limit && data.credit_limit < 0) {
      throw new SupplierValidationError('Credit limit cannot be negative');
    }
    try {
      const response = await this.client.request('PUT', `suppliers/${id}/payment-terms`, data);
      return this.mapResponse(response.supplier);
    } catch (error: any) {
      throw this.handleError(error, 'updatePaymentTerms', id);
    }
  }

  async listProducts(
    id: NonEmptyString<string>,
    params: {
      limit?: number;
      offset?: number;
      category?: string;
    } = {}
  ): Promise<{
    products: Array<{
      id: string;
      sku: string;
      name: string;
      price: number;
      currency: string;
    }>;
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.category && { category: params.category }),
    });

    try {
      const response = await this.client.request('GET', `suppliers/${id}/products?${query.toString()}`);
      return {
        products: response.products,
        pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'listProducts', id);
    }
  }

  async addContact(
    id: NonEmptyString<string>,
    contact: SupplierContact
  ): Promise<SupplierResponse> {
    try {
      const response = await this.client.request('POST', `suppliers/${id}/contacts`, contact);
      return this.mapResponse(response.supplier);
    } catch (error: any) {
      throw this.handleError(error, 'addContact', id);
    }
  }

  async getMetrics(params: {
    org_id?: string;
    date_range?: { from: Date; to: Date };
    type?: SupplierType;
  } = {}): Promise<{
    total_suppliers: number;
    status_breakdown: Record<SupplierStatus, number>;
    type_breakdown: Record<SupplierType, number>;
    average_performance: {
      on_time_delivery: number;
      quality: number;
      accuracy: number;
    };
    active_suppliers: number;
  }> {
    const query = new URLSearchParams({
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.type && { type: params.type }),
    });

    try {
      const response = await this.client.request('GET', `suppliers/metrics?${query.toString()}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, operation: string, supplierId?: string): never {
    if (error.status === 404) throw new SupplierNotFoundError(supplierId || 'unknown');
    if (error.status === 400) throw new SupplierValidationError(error.message, error.errors);
    throw new SupplierError(
      `Failed to ${operation} supplier: ${error.message}`,
      { operation, originalError: error }
    );
  }
}