import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ContactType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  VENDOR = 'VENDOR',
  EMPLOYEE = 'EMPLOYEE'
}

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

// Interfaces
export interface ContactData {
  entity_id: NonEmptyString<string>;
  type: ContactType;
  status: ContactStatus;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  is_primary?: boolean;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface ContactResponse {
  id: NonEmptyString<string>;
  object: 'contact';
  data: ContactData;
}

// Error Classes
export class ContactError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'ContactError';
  }
}

export class ContactNotFoundError extends ContactError {
  constructor(contactId: string) {
    super(`Contact with ID ${contactId} not found`, { contactId });
  }
}

export class ContactValidationError extends ContactError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Contacts {
  constructor(private readonly stateset: ApiClientLike) {}

  private validateContactData(data: ContactData): void {
    if (!data.entity_id) throw new ContactValidationError('Entity ID is required');
    if (!data.first_name || !data.last_name) throw new ContactValidationError('First and last name are required');
    if (!data.email && !data.phone) throw new ContactValidationError('At least one of email or phone is required');
  }

  private mapResponse(data: any): ContactResponse {
    if (!data?.id) throw new ContactError('Invalid response format');
    return {
      id: data.id,
      object: 'contact',
      data: {
        entity_id: data.entity_id,
        type: data.type,
        status: data.status,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        job_title: data.job_title,
        address: data.address,
        is_primary: data.is_primary,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    entity_id?: string;
    type?: ContactType;
    status?: ContactStatus;
    org_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    contacts: ContactResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.entity_id) queryParams.append('entity_id', params.entity_id);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `contacts?${queryParams.toString()}`);
      return {
        contacts: response.contacts.map(this.mapResponse),
        pagination: {
          total: response.total || response.contacts.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(contactId: NonEmptyString<string>): Promise<ContactResponse> {
    try {
      const response = await this.stateset.request('GET', `contacts/${contactId}`);
      return this.mapResponse(response.contact);
    } catch (error: any) {
      throw this.handleError(error, 'get', contactId);
    }
  }

  async create(data: ContactData): Promise<ContactResponse> {
    this.validateContactData(data);
    try {
      const response = await this.stateset.request('POST', 'contacts', data);
      return this.mapResponse(response.contact);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(contactId: NonEmptyString<string>, data: Partial<ContactData>): Promise<ContactResponse> {
    try {
      const response = await this.stateset.request('PUT', `contacts/${contactId}`, data);
      return this.mapResponse(response.contact);
    } catch (error: any) {
      throw this.handleError(error, 'update', contactId);
    }
  }

  async delete(contactId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `contacts/${contactId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', contactId);
    }
  }

  async setPrimary(contactId: NonEmptyString<string>): Promise<ContactResponse> {
    try {
      const response = await this.stateset.request('POST', `contacts/${contactId}/set_primary`, {});
      return this.mapResponse(response.contact);
    } catch (error: any) {
      throw this.handleError(error, 'setPrimary', contactId);
    }
  }

  private handleError(error: any, operation: string, contactId?: string): never {
    if (error.status === 404) throw new ContactNotFoundError(contactId || 'unknown');
    if (error.status === 400) throw new ContactValidationError(error.message, error.errors);
    throw new ContactError(
      `Failed to ${operation} contact: ${error.message}`,
      { operation, originalError: error }
    );
  }
}