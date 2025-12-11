import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum OpportunityStatus {
  PROSPECTING = 'PROSPECTING',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  ON_HOLD = 'ON_HOLD',
}

export enum OpportunityStage {
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER',
}

// Interfaces
export interface OpportunityData {
  lead_id: NonEmptyString<string>;
  customer_id?: NonEmptyString<string>;
  status: OpportunityStatus;
  stage: OpportunityStage;
  amount: number;
  currency: string;
  expected_close_date?: Timestamp;
  assigned_to: NonEmptyString<string>; // User ID
  description: string;
  probability: number; // 0-100 percentage
  created_at: Timestamp;
  updated_at: Timestamp;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface OpportunityResponse {
  id: NonEmptyString<string>;
  object: 'opportunity';
  data: OpportunityData;
}

// Error Classes
export class OpportunityError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OpportunityError';
  }
}

export class OpportunityNotFoundError extends OpportunityError {
  constructor(opportunityId: string) {
    super(`Opportunity with ID ${opportunityId} not found`, { opportunityId });
  }
}

export class OpportunityValidationError extends OpportunityError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class Opportunities extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'opportunities', 'opportunities');
    this.singleKey = 'opportunity';
    this.listKey = 'opportunities';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateOpportunityData(data: OpportunityData): void {
    if (!data.lead_id) throw new OpportunityValidationError('Lead ID is required');
    if (!data.assigned_to) throw new OpportunityValidationError('Assigned user ID is required');
    if (data.amount < 0) throw new OpportunityValidationError('Amount cannot be negative');
    if (data.probability < 0 || data.probability > 100) {
      throw new OpportunityValidationError('Probability must be between 0 and 100');
    }
  }

  private mapResponse(data: any): OpportunityResponse {
    if (!data?.id) throw new OpportunityError('Invalid response format');
    return {
      id: data.id,
      object: 'opportunity',
      data: {
        lead_id: data.lead_id,
        customer_id: data.customer_id,
        status: data.status,
        stage: data.stage,
        amount: data.amount,
        currency: data.currency,
        expected_close_date: data.expected_close_date,
        assigned_to: data.assigned_to,
        description: data.description,
        probability: data.probability,
        created_at: data.created_at,
        updated_at: data.updated_at,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    lead_id?: string;
    customer_id?: string;
    status?: OpportunityStatus;
    stage?: OpportunityStage;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    opportunities: OpportunityResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const opportunities = (response as any).opportunities ?? response;

    return {
      opportunities,
      pagination: (response as any).pagination || {
        total: opportunities.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async get(opportunityId: NonEmptyString<string>): Promise<OpportunityResponse> {
    return super.get(opportunityId);
  }

  override async create(data: OpportunityData): Promise<OpportunityResponse> {
    this.validateOpportunityData(data);
    return super.create(data);
  }

  override async update(
    opportunityId: NonEmptyString<string>,
    data: Partial<OpportunityData>
  ): Promise<OpportunityResponse> {
    return super.update(opportunityId, data);
  }

  override async delete(opportunityId: NonEmptyString<string>): Promise<void> {
    await super.delete(opportunityId);
  }

  async convertToCustomer(
    opportunityId: NonEmptyString<string>,
    customerId: NonEmptyString<string>
  ): Promise<OpportunityResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `opportunities/${opportunityId}/convert`,
        { customer_id: customerId }
      );
      return this.mapResponse((response as any).opportunity ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'convertToCustomer', opportunityId);
    }
  }

  private handleError(error: any, _operation: string, _opportunityId?: string): never {
    throw error;
  }
}
