import { stateset } from '../../stateset-client';

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
  ON_HOLD = 'ON_HOLD'
}

export enum OpportunityStage {
  LEAD = 'LEAD',
  OPPORTUNITY = 'OPPORTUNITY',
  CUSTOMER = 'CUSTOMER'
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
  constructor(message: string, public readonly details?: Record<string, unknown>) {
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
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class Opportunities {
  constructor(private readonly stateset: stateset) {}

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

  async list(params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.lead_id) queryParams.append('lead_id', params.lead_id);
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.stage) queryParams.append('stage', params.stage);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `opportunities?${queryParams.toString()}`);
      return {
        opportunities: response.opportunities.map(this.mapResponse),
        pagination: {
          total: response.total || response.opportunities.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(opportunityId: NonEmptyString<string>): Promise<OpportunityResponse> {
    try {
      const response = await this.stateset.request('GET', `opportunities/${opportunityId}`);
      return this.mapResponse(response.opportunity);
    } catch (error: any) {
      throw this.handleError(error, 'get', opportunityId);
    }
  }

  async create(data: OpportunityData): Promise<OpportunityResponse> {
    this.validateOpportunityData(data);
    try {
      const response = await this.stateset.request('POST', 'opportunities', data);
      return this.mapResponse(response.opportunity);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(
    opportunityId: NonEmptyString<string>,
    data: Partial<OpportunityData>
  ): Promise<OpportunityResponse> {
    try {
      const response = await this.stateset.request('PUT', `opportunities/${opportunityId}`, data);
      return this.mapResponse(response.opportunity);
    } catch (error: any) {
      throw this.handleError(error, 'update', opportunityId);
    }
  }

  async delete(opportunityId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `opportunities/${opportunityId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', opportunityId);
    }
  }

  async convertToCustomer(
    opportunityId: NonEmptyString<string>,
    customerId: NonEmptyString<string>
  ): Promise<OpportunityResponse> {
    try {
      const response = await this.stateset.request('POST', `opportunities/${opportunityId}/convert`, { customer_id: customerId });
      return this.mapResponse(response.opportunity);
    } catch (error: any) {
      throw this.handleError(error, 'convertToCustomer', opportunityId);
    }
  }

  private handleError(error: any, operation: string, opportunityId?: string): never {
    if (error.status === 404) throw new OpportunityNotFoundError(opportunityId || 'unknown');
    if (error.status === 400) throw new OpportunityValidationError(error.message, error.errors);
    throw new OpportunityError(
      `Failed to ${operation} opportunity: ${error.message}`,
      { operation, originalError: error }
    );
  }
}