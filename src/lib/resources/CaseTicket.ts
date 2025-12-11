import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CaseTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
}

export enum CaseTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum EscalationLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Interfaces
export interface CaseTicketData {
  customer_id: NonEmptyString<string>;
  order_id?: NonEmptyString<string>;
  product_id?: NonEmptyString<string>;
  status: CaseTicketStatus;
  priority: CaseTicketPriority;
  subject: string;
  description: string;
  assigned_to?: NonEmptyString<string>; // Agent or User ID
  created_at: Timestamp;
  updated_at: Timestamp;
  resolved_at?: Timestamp;
  notes?: string[];
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Type
export interface CaseTicketResponse {
  id: NonEmptyString<string>;
  object: 'case_ticket';
  data: CaseTicketData;
}

// Error Classes
export class CaseTicketError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CaseTicketError';
  }
}

export class CaseTicketNotFoundError extends CaseTicketError {
  constructor(caseTicketId: string) {
    super(`Case/Ticket with ID ${caseTicketId} not found`, { caseTicketId });
  }
}

export class CaseTicketValidationError extends CaseTicketError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string>
  ) {
    super(message);
  }
}

export default class CasesTickets extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'cases_tickets', 'cases_tickets');
    this.singleKey = 'case_ticket';
    this.listKey = 'cases_tickets';
  }

  protected override mapSingle(data: any): any {
    return this.mapResponse(data);
  }

  protected override mapListItem(item: any): any {
    return this.mapResponse(item);
  }

  private validateCaseTicketData(data: CaseTicketData): void {
    if (!data.customer_id) throw new CaseTicketValidationError('Customer ID is required');
    if (!data.subject) throw new CaseTicketValidationError('Subject is required');
    if (!data.description) throw new CaseTicketValidationError('Description is required');
  }

  private mapResponse(data: any): CaseTicketResponse {
    if (!data?.id) throw new CaseTicketError('Invalid response format');
    return {
      id: data.id,
      object: 'case_ticket',
      data: {
        customer_id: data.customer_id,
        order_id: data.order_id,
        product_id: data.product_id,
        status: data.status,
        priority: data.priority,
        subject: data.subject,
        description: data.description,
        assigned_to: data.assigned_to,
        created_at: data.created_at,
        updated_at: data.updated_at,
        resolved_at: data.resolved_at,
        notes: data.notes,
        org_id: data.org_id,
        metadata: data.metadata,
      },
    };
  }

  override async list(params?: {
    customer_id?: string;
    order_id?: string;
    status?: CaseTicketStatus;
    priority?: CaseTicketPriority;
    org_id?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    cases_tickets: CaseTicketResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    const cases_tickets = (response as any).cases_tickets ?? response;

    return {
      cases_tickets,
      pagination: (response as any).pagination || {
        total: cases_tickets.length,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
      },
    };
  }

  override async search(
    query: string,
    params: {
      status?: CaseTicketStatus;
      priority?: CaseTicketPriority;
      org_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    cases_tickets: CaseTicketResponse[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await super.search(query, params as any);
    const cases_tickets = (response as any).cases_tickets ?? response;

    return {
      cases_tickets,
      pagination: (response as any).pagination || {
        total: cases_tickets.length,
        limit: params.limit || 100,
        offset: params.offset || 0,
      },
    };
  }

  override async get(caseTicketId: NonEmptyString<string>): Promise<CaseTicketResponse> {
    return super.get(caseTicketId);
  }

  override async create(data: CaseTicketData): Promise<CaseTicketResponse> {
    this.validateCaseTicketData(data);
    return super.create(data);
  }

  override async update(
    caseTicketId: NonEmptyString<string>,
    data: Partial<CaseTicketData>
  ): Promise<CaseTicketResponse> {
    return super.update(caseTicketId, data);
  }

  override async delete(caseTicketId: NonEmptyString<string>): Promise<void> {
    await super.delete(caseTicketId);
  }

  async resolve(
    caseTicketId: NonEmptyString<string>,
    resolutionNotes: string
  ): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `cases_tickets/${caseTicketId}/resolve`,
        { notes: resolutionNotes }
      );
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'resolve', caseTicketId);
    }
  }

  async assign(
    caseTicketId: NonEmptyString<string>,
    agentId: NonEmptyString<string>
  ): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request('POST', `cases_tickets/${caseTicketId}/assign`, {
        agent_id: agentId,
      });
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'assign', caseTicketId);
    }
  }

  async addNote(caseTicketId: NonEmptyString<string>, note: string): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request('POST', `cases_tickets/${caseTicketId}/notes`, {
        note,
      });
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'addNote', caseTicketId);
    }
  }

  async listNotes(caseTicketId: NonEmptyString<string>): Promise<string[]> {
    try {
      const response = await this.client.request('GET', `cases_tickets/${caseTicketId}/notes`);
      return (response as any).notes || [];
    } catch (error: any) {
      throw this.handleError(error, 'listNotes', caseTicketId);
    }
  }

  async escalate(
    caseTicketId: NonEmptyString<string>,
    level: EscalationLevel
  ): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request(
        'POST',
        `cases_tickets/${caseTicketId}/escalate`,
        { level }
      );
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'escalate', caseTicketId);
    }
  }

  async close(caseTicketId: NonEmptyString<string>): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request('POST', `cases_tickets/${caseTicketId}/close`);
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'close', caseTicketId);
    }
  }

  async reopen(caseTicketId: NonEmptyString<string>, note: string): Promise<CaseTicketResponse> {
    try {
      const response = await this.client.request('POST', `cases_tickets/${caseTicketId}/reopen`, {
        note,
      });
      return this.mapResponse((response as any).case_ticket ?? response);
    } catch (error: any) {
      throw this.handleError(error, 'reopen', caseTicketId);
    }
  }

  private handleError(error: any, _operation: string, _caseTicketId?: string): never {
    throw error;
  }
}
