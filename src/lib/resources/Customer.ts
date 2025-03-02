import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  SUSPENDED = 'SUSPENDED'
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT'
}

// Core Interfaces
export interface CustomerAddress {
  type: 'BILLING' | 'SHIPPING' | 'PRIMARY';
  street1: NonEmptyString<string>;
  street2?: string;
  city: NonEmptyString<string>;
  state: string;
  postal_code: NonEmptyString<string>;
  country: NonEmptyString<string>;
  is_residential?: boolean;
  validated?: boolean;
}

export interface CustomerContact {
  type: 'PHONE' | 'EMAIL' | 'FAX';
  value: NonEmptyString<string>;
  is_primary?: boolean;
  verified?: boolean;
}

export interface CustomerData {
  name: NonEmptyString<string>;
  type: CustomerType;
  status: CustomerStatus;
  email: NonEmptyString<string>;
  phone?: string;
  addresses: CustomerAddress[];
  contacts?: CustomerContact[];
  billing_info?: {
    payment_terms?: string;
    credit_limit?: number;
    currency: string;
    tax_id?: string;
  };
  preferences?: {
    communication?: 'EMAIL' | 'PHONE' | 'MAIL';
    language?: string;
    timezone?: string;
  };
  created_at: Timestamp;
  updated_at: Timestamp;
  last_activity?: Timestamp;
  org_id?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

// Response Type
export interface CustomerResponse {
  id: NonEmptyString<string>;
  object: 'customer';
  data: CustomerData;
}

// Error Classes
export class CustomerError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class CustomerNotFoundError extends CustomerError {
  constructor(customerId: string) {
    super(`Customer with ID ${customerId} not found`, { customerId });
  }
}

export class CustomerValidationError extends CustomerError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

// Main Customers Class
export class Customers {
  constructor(private readonly client: stateset) {}

  private validateCustomerData(data: CustomerData): void {
    if (!data.name) throw new CustomerValidationError('Customer name is required');
    if (!data.email) throw new CustomerValidationError('Email is required');
    if (!data.addresses?.length) throw new CustomerValidationError('At least one address is required');
    if (data.billing_info?.credit_limit && data.billing_info.credit_limit < 0) {
      throw new CustomerValidationError('Credit limit cannot be negative');
    }
  }

  private mapResponse(data: any): CustomerResponse {
    if (!data?.id) throw new CustomerError('Invalid response format');
    return {
      id: data.id,
      object: 'customer',
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        email: data.email,
        phone: data.phone,
        addresses: data.addresses,
        contacts: data.contacts,
        billing_info: data.billing_info,
        preferences: data.preferences,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_activity: data.last_activity,
        org_id: data.org_id,
        metadata: data.metadata,
        tags: data.tags,
      },
    };
  }

  async list(params: {
    status?: CustomerStatus;
    type?: CustomerType;
    org_id?: string;
    date_range?: { from: Date; to: Date };
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    customers: CustomerResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.type && { type: params.type }),
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.search && { search: params.search }),
    });

    try {
      const response = await this.client.request('GET', `customers?${query.toString()}`);
      return {
        customers: response.customers.map(this.mapResponse),
        pagination: response.pagination || { total: response.customers.length, limit: params.limit || 100, offset: params.offset || 0 },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(customerId: NonEmptyString<string>): Promise<CustomerResponse> {
    try {
      const response = await this.client.request('GET', `customers/${customerId}`);
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'get', customerId);
    }
  }

  async create(data: CustomerData): Promise<CustomerResponse> {
    this.validateCustomerData(data);
    try {
      const response = await this.client.request('POST', 'customers', data);
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    customerId: NonEmptyString<string>,
    data: Partial<CustomerData>
  ): Promise<CustomerResponse> {
    try {
      const response = await this.client.request('PUT', `customers/${customerId}`, data);
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'update', customerId);
    }
  }

  async delete(customerId: NonEmptyString<string>): Promise<void> {
    try {
      await this.client.request('DELETE', `customers/${customerId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', customerId);
    }
  }

  async addAddress(
    customerId: NonEmptyString<string>,
    address: CustomerAddress
  ): Promise<CustomerResponse> {
    try {
      const response = await this.client.request('POST', `customers/${customerId}/addresses`, address);
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'addAddress', customerId);
    }
  }

  async addContact(
    customerId: NonEmptyString<string>,
    contact: CustomerContact
  ): Promise<CustomerResponse> {
    try {
      const response = await this.client.request('POST', `customers/${customerId}/contacts`, contact);
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'addContact', customerId);
    }
  }

  async getMetrics(params: {
    org_id?: string;
    date_range?: { from: Date; to: Date };
    type?: CustomerType;
  } = {}): Promise<{
    total_customers: number;
    status_breakdown: Record<CustomerStatus, number>;
    type_breakdown: Record<CustomerType, number>;
    active_customers: number;
    new_customer_rate: number;
  }> {
    const query = new URLSearchParams({
      ...(params.org_id && { org_id: params.org_id }),
      ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
      ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
      ...(params.type && { type: params.type }),
    });

    try {
      const response = await this.client.request('GET', `customers/metrics?${query.toString()}`);
      return response.metrics;
    } catch (error: any) {
      throw this.handleError(error, 'getMetrics');
    }
  }

  private handleError(error: any, operation: string, customerId?: string): never {
    if (error.status === 404) throw new CustomerNotFoundError(customerId || 'unknown');
    if (error.status === 400) throw new CustomerValidationError(error.message, error.errors);
    throw new CustomerError(
      `Failed to ${operation} customer: ${error.message}`,
      { operation, originalError: error }
    );
  }
}

export default Customers;