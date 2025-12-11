import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CreditDebitType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum CreditDebitStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Interfaces
export interface CreditsDebitsData {
  customer_id: NonEmptyString<string>;
  type: CreditDebitType;
  status: CreditDebitStatus;
  amount: number;
  currency: string;
  reason: string;
  issued_date: Timestamp;
  expiry_date?: Timestamp;
  applied_date?: Timestamp;
  order_id?: NonEmptyString<string>;
  notes?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface CreditsDebitsResponse {
  id: NonEmptyString<string>;
  object: 'credit_debit';
  data: CreditsDebitsData;
}

// Error Classes
export class CreditsDebitsError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CreditsDebitsError';
  }
}

export class CreditsDebitsNotFoundError extends CreditsDebitsError {
  constructor(creditsDebitsId: string) {
    super(`Credit/Debit with ID ${creditsDebitsId} not found`, { creditsDebitsId });
  }
}

export class CreditsDebitsValidationError extends CreditsDebitsError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class CreditsDebits extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'credits_debits', 'credits_debits');
    this.singleKey = 'credit_debit';
    this.listKey = 'credits_debits';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateCreditsDebitsData(data: CreditsDebitsData): void {
    if (!data.customer_id) throw new CreditsDebitsValidationError('Customer ID is required');
    if (data.amount <= 0) throw new CreditsDebitsValidationError('Amount must be greater than 0');
    if (!data.issued_date) throw new CreditsDebitsValidationError('Issued date is required');
  }

  private mapResponse(data: any): CreditsDebitsResponse {
    if (!data?.id) throw new CreditsDebitsError('Invalid response format');
    return {
      id: data.id,
      object: 'credit_debit',
      data: {
        customer_id: data.customer_id,
        type: data.type,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        reason: data.reason,
        issued_date: data.issued_date,
        expiry_date: data.expiry_date,
        applied_date: data.applied_date,
        order_id: data.order_id,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    customer_id?: string;
    type?: CreditDebitType;
    status?: CreditDebitStatus;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    credits_debits: CreditsDebitsResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const credits_debits = (response as any).credits_debits ?? response;

    return {
      credits_debits,
      pagination: (response as any).pagination || {
        total: credits_debits.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(creditsDebitsId: NonEmptyString<string>): Promise<CreditsDebitsResponse> {
    return super.get(creditsDebitsId);
  }

  override async create(data: CreditsDebitsData): Promise<CreditsDebitsResponse> {
    this.validateCreditsDebitsData(data);
    return super.create(data);
  }

  override async update(
    creditsDebitsId: NonEmptyString<string>,
    data: Partial<CreditsDebitsData>
  ): Promise<CreditsDebitsResponse> {
    return super.update(creditsDebitsId, data);
  }

  override async delete(creditsDebitsId: NonEmptyString<string>): Promise<void> {
    await super.delete(creditsDebitsId);
  }

  async applyCreditDebit(
    creditsDebitsId: NonEmptyString<string>,
    appliedDate: Timestamp
  ): Promise<CreditsDebitsResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `credits_debits/${creditsDebitsId}/apply`,
        { applied_date: appliedDate }
      );
      return this.mapResponse((response as any).credit_debit ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'applyCreditDebit', creditsDebitsId);
    }
  }

  private handleError(error: any, _operation: string, _creditsDebitsId?: string): never {
    throw error;
  }
}
