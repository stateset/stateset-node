import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ContactType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  VENDOR = 'VENDOR',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ContactStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
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
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Contacts extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'contacts', 'contacts');
    this.singleKey = 'contact';
    this.listKey = 'contacts';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateContactData(data: ContactData): void {
    if (!data.entity_id) throw new ContactValidationError('Entity ID is required');
    if (!data.first_name || !data.last_name)
      throw new ContactValidationError('First and last name are required');
    if (!data.email && !data.phone)
      throw new ContactValidationError('At least one of email or phone is required');
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

  override async list(params?: {
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
    const response = await super.list(params as any);
    const contacts = (response as any).contacts ?? response;

    return {
      contacts,
      pagination: (response as any).pagination || {
        total: contacts.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(contactId: NonEmptyString<string>): Promise<ContactResponse> {
    return super.get(contactId);
  }

  override async create(data: ContactData): Promise<ContactResponse> {
    this.validateContactData(data);
    return super.create(data);
  }

  override async update(
    contactId: NonEmptyString<string>,
    data: Partial<ContactData>
  ): Promise<ContactResponse> {
    return super.update(contactId, data);
  }

  override async delete(contactId: NonEmptyString<string>): Promise<void> {
    await super.delete(contactId);
  }

  async setPrimary(contactId: NonEmptyString<string>): Promise<ContactResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `contacts/${contactId}/set_primary`,
        {}
      );
      return this.mapResponse((response as any).contact ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'setPrimary', contactId);
    }
  }

  private handleError(error: any, _operation: string, _contactId?: string): never {
    throw error;
  }
}
