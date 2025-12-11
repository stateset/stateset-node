import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROSPECT = 'PROSPECT',
  SUSPENDED = 'SUSPENDED',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  NONPROFIT = 'NONPROFIT',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
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
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

// Main Customers Class
export class Customers extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'customers', 'customers');
    this.singleKey = 'customer';
    this.listKey = 'customers';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateCustomerData(data: CustomerData): void {
    if (!data.name) throw new CustomerValidationError('Customer name is required');
    if (!data.email) throw new CustomerValidationError('Email is required');
    if (!data.addresses?.length)
      throw new CustomerValidationError('At least one address is required');
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

  override async list(
    params: {
      status?: CustomerStatus;
      type?: CustomerType;
      org_id?: string;
      date_range?: { from: Date; to: Date };
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<{
    customers: CustomerResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const { date_range, ...rest } = params;
    const requestParams: Record<string, unknown> = { ...rest };
    if (date_range?.from) requestParams.from = date_range.from.toISOString();
    if (date_range?.to) requestParams.to = date_range.to.toISOString();

    const response = await super.list(requestParams as any);
    const customers = (response as any).customers ?? response;
    return {
      customers,
      pagination: (response as any).pagination || {
        total: customers.length,
        limit: params.limit || 100,
        offset: params.offset || 0,
      },
    };
  }

  override async get(customerId: NonEmptyString<string>): Promise<CustomerResponse> {
    return super.get(customerId);
  }

  override async create(data: CustomerData): Promise<CustomerResponse> {
    this.validateCustomerData(data);
    return super.create(data);
  }

  override async update(
    customerId: NonEmptyString<string>,
    data: Partial<CustomerData>
  ): Promise<CustomerResponse> {
    return super.update(customerId, data);
  }

  override async delete(customerId: NonEmptyString<string>): Promise<void> {
    await super.delete(customerId);
  }

  async addAddress(
    customerId: NonEmptyString<string>,
    address: CustomerAddress
  ): Promise<CustomerResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `customers/${customerId}/addresses`,
        address
      );
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
      const response = await this.client.request(
        'POST',
        `customers/${customerId}/contacts`,
        contact
      );
      return this.mapResponse(response.customer);
    } catch (error: any) {
      throw this.handleError(error, 'addContact', customerId);
    }
  }

  async getMetrics(
    params: {
      org_id?: string;
      date_range?: { from: Date; to: Date };
      type?: CustomerType;
    } = {}
  ): Promise<{
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

  private handleError(error: any, _operation: string, _customerId?: string): never {
    throw error;
  }
}

export default Customers;
