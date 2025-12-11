import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

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
  PURCHASE = 'PURCHASE',
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
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
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
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Ledger extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'ledger_entries', 'ledger_entries');
    this.singleKey = 'ledger_entry';
    this.listKey = 'ledger_entries';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

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

  override async list(params?: {
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
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const ledger_entries = (response as any).ledger_entries ?? response;
    return {
      ledger_entries,
      pagination: (response as any).pagination || {
        total: ledger_entries.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(ledgerId: NonEmptyString<string>): Promise<LedgerResponse> {
    return super.get(ledgerId);
  }

  override async create(data: LedgerData): Promise<LedgerResponse> {
    this.validateLedgerData(data);
    return super.create(data);
  }

  override async update(
    ledgerId: NonEmptyString<string>,
    data: Partial<LedgerData>
  ): Promise<LedgerResponse> {
    return super.update(ledgerId, data);
  }

  override async delete(ledgerId: NonEmptyString<string>): Promise<void> {
    await super.delete(ledgerId);
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
    const requestParams: Record<string, unknown> = {};
    if (params?.customer_id) requestParams.customer_id = params.customer_id;
    if (params?.org_id) requestParams.org_id = params.org_id;
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    try {
      const response = await this.client.request(
        'GET',
        `${this.resourcePath}/balance`,
        undefined,
        { params: requestParams }
      );
      return response;
    } catch (error: any) {
      throw this.handleError(error, 'getBalance');
    }
  }

  private handleError(error: any, _operation: string, _ledgerId?: string): never {
    throw error;
  }
}
