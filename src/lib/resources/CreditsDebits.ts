import type { ApiClientLike } from '../../types';

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

export default class CreditsDebits {
  constructor(private readonly stateset: ApiClientLike) {}

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

  async list(params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request(
        'GET',
        `credits_debits?${queryParams.toString()}`
      );
      return {
        credits_debits: response.credits_debits.map(this.mapResponse),
        pagination: {
          total: response.total || response.credits_debits.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(creditsDebitsId: NonEmptyString<string>): Promise<CreditsDebitsResponse> {
    try {
      const response = await this.stateset.request('GET', `credits_debits/${creditsDebitsId}`);
      return this.mapResponse(response.credit_debit);
    } catch (error: any) {
      throw this.handleError(error, 'get', creditsDebitsId);
    }
  }

  async create(data: CreditsDebitsData): Promise<CreditsDebitsResponse> {
    this.validateCreditsDebitsData(data);
    try {
      const response = await this.stateset.request('POST', 'credits_debits', data);
      return this.mapResponse(response.credit_debit);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    creditsDebitsId: NonEmptyString<string>,
    data: Partial<CreditsDebitsData>
  ): Promise<CreditsDebitsResponse> {
    try {
      const response = await this.stateset.request(
        'PUT',
        `credits_debits/${creditsDebitsId}`,
        data
      );
      return this.mapResponse(response.credit_debit);
    } catch (error: any) {
      throw this.handleError(error, 'update', creditsDebitsId);
    }
  }

  async delete(creditsDebitsId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `credits_debits/${creditsDebitsId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', creditsDebitsId);
    }
  }

  async applyCreditDebit(
    creditsDebitsId: NonEmptyString<string>,
    appliedDate: Timestamp
  ): Promise<CreditsDebitsResponse> {
    try {
      const response = await this.stateset.request(
        'POST',
        `credits_debits/${creditsDebitsId}/apply`,
        { applied_date: appliedDate }
      );
      return this.mapResponse(response.credit_debit);
    } catch (error: any) {
      throw this.handleError(error, 'applyCreditDebit', creditsDebitsId);
    }
  }

  private handleError(error: any, operation: string, creditsDebitsId?: string): never {
    if (error.status === 404) throw new CreditsDebitsNotFoundError(creditsDebitsId || 'unknown');
    if (error.status === 400) throw new CreditsDebitsValidationError(error.message, error.errors);
    throw new CreditsDebitsError(`Failed to ${operation} credit/debit: ${error.message}`, {
      operation,
      originalError: error,
    });
  }
}
