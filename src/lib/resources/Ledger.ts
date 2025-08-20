import type { ApiClientLike } from '../../types';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum LedgerEventType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ADJUSTMENT = 'ADJUSTMENT',
  SALE = 'SALE',
  PURCHASE = 'PURCHASE'
}

// Interfaces
export interface LedgerData {
  event_type: LedgerEventType;
  reference_id: NonEmptyString<string>; // e.g., payment_id, order_id
  customer_id?: NonEmptyString<string>;
  amount: number;
  currency: string;
  event_date: Timestamp;
  description: string;
  account_id?: NonEmptyString<string>;
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface LedgerResponse {
  id: NonEmptyString<string>;
  object: 'ledger';
  data: LedgerData;
}

// Error Classes
export class LedgerError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'LedgerError';
  }
}

export class LedgerNotFoundError extends LedgerError {
  constructor(ledgerId: string) {
    super(`Ledger entry with ID ${ledgerId} not found`, { ledgerId });
  }
}

export class LedgerValidationError extends LedgerError {
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Ledger {
  constructor(private readonly stateset: ApiClientLike) {}

  private validateLedgerData(data: LedgerData): void {
    if (!data.reference_id) throw new LedgerValidationError('Reference ID is required');
    if (!data.event_date) throw new LedgerValidationError('Event date is required');
  }

  private mapResponse(data: any): LedgerResponse {
    if (!data?.id) throw new LedgerError('Invalid response format');
    return {
      id: data.id,
      object: 'ledger',
      data: {
        event_type: data.event_type,
        reference_id: data.reference_id,
        customer_id: data.customer_id,
        amount: data.amount,
        currency: data.currency,
        event_date: data.event_date,
        description: data.description,
        account_id: data.account_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  async list(params?: {
    event_type?: LedgerEventType;
    reference_id?: string;
    customer_id?: string;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    ledger_entries: LedgerResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.event_type) queryParams.append('event_type', params.event_type);
      if (params.reference_id) queryParams.append('reference_id', params.reference_id);
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `ledger_entries?${queryParams.toString()}`);
      return {
        ledger_entries: response.ledger_entries.map(this.mapResponse),
        pagination: {
          total: response.total || response.ledger_entries.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(ledgerId: NonEmptyString<string>): Promise<LedgerResponse> {
    try {
      const response = await this.stateset.request('GET', `ledger_entries/${ledgerId}`);
      return this.mapResponse(response.ledger_entry);
    } catch (error: any) {
      throw this.handleError(error, 'get', ledgerId);
    }
  }

  async create(data: LedgerData): Promise<LedgerResponse> {
    this.validateLedgerData(data);
    try {
      const response = await this.stateset.request('POST', 'ledger_entries', data);
      return this.mapResponse(response.ledger_entry);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(ledgerId: NonEmptyString<string>, data: Partial<LedgerData>): Promise<LedgerResponse> {
    try {
      const response = await this.stateset.request('PUT', `ledger_entries/${ledgerId}`, data);
      return this.mapResponse(response.ledger_entry);
    } catch (error: any) {
      throw this.handleError(error, 'update', ledgerId);
    }
  }

  async delete(ledgerId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `ledger_entries/${ledgerId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', ledgerId);
    }
  }

  async getBalance(params?: {
    customer_id?: string;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
  }): Promise<{
    total_credits: number;
    total_debits: number;
    net_balance: number;
    currency: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
    }

    try {
      const response = await this.stateset.request('GET', `ledger_entries/balance?${queryParams.toString()}`);
      return response;
    } catch (error: any) {
      throw this.handleError(error, 'getBalance');
    }
  }

  private handleError(error: any, operation: string, ledgerId?: string): never {
    if (error.status === 404) throw new LedgerNotFoundError(ledgerId || 'unknown');
    if (error.status === 400) throw new LedgerValidationError(error.message, error.errors);
    throw new LedgerError(
      `Failed to ${operation} ledger entry: ${error.message}`,
      { operation, originalError: error }
    );
  }
}