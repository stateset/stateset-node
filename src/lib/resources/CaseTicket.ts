import { stateset } from '../../stateset-client';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum CaseTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD'
}

export enum CaseTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum EscalationLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
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
  constructor(message: string, public readonly details?: Record<string, unknown>) {
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
  constructor(message: string, public readonly errors?: Record<string, string>) {
    super(message);
  }
}

export default class CasesTickets {
  constructor(private readonly stateset: stateset) {}

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

  async list(params?: {
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
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.customer_id) queryParams.append('customer_id', params.customer_id);
      if (params.order_id) queryParams.append('order_id', params.order_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.org_id) queryParams.append('org_id', params.org_id);
      if (params.date_from) queryParams.append('date_from', params.date_from.toISOString());
      if (params.date_to) queryParams.append('date_to', params.date_to.toISOString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());
    }

    try {
      const response = await this.stateset.request('GET', `cases_tickets?${queryParams.toString()}`);
      return {
        cases_tickets: response.cases_tickets.map(this.mapResponse),
        pagination: {
          total: response.total || response.cases_tickets.length,
          limit: params?.limit || 100,
          offset: params?.offset || 0,
        },
      };
    } catch (error: any) {
      throw this.handleError(error, 'list');
    }
  }

  async get(caseTicketId: NonEmptyString<string>): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('GET', `cases_tickets/${caseTicketId}`);
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'get', caseTicketId);
    }
  }

  async create(data: CaseTicketData): Promise<CaseTicketResponse> {
    this.validateCaseTicketData(data);
    try {
      const response = await this.stateset.request('POST', 'cases_tickets', data);
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'create');
    }
  }

  async update(caseTicketId: NonEmptyString<string>, data: Partial<CaseTicketData>): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('PUT', `cases_tickets/${caseTicketId}`, data);
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'update', caseTicketId);
    }
  }

  async delete(caseTicketId: NonEmptyString<string>): Promise<void> {
    try {
      await this.stateset.request('DELETE', `cases_tickets/${caseTicketId}`);
    } catch (error: any) {
      throw this.handleError(error, 'delete', caseTicketId);
    }
  }

  async resolve(caseTicketId: NonEmptyString<string>, resolutionNotes: string): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/resolve`, { notes: resolutionNotes });
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'resolve', caseTicketId);
    }
  }

  async assign(caseTicketId: NonEmptyString<string>, agentId: NonEmptyString<string>): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/assign`, { agent_id: agentId });
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'assign', caseTicketId);
    }
  }

  async addNote(caseTicketId: NonEmptyString<string>, note: string): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/notes`, { note });
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'addNote', caseTicketId);
    }
  }

  async escalate(caseTicketId: NonEmptyString<string>, level: EscalationLevel): Promise<CaseTicketResponse> {
    try {
      const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/escalate`, { level });
      return this.mapResponse(response.case_ticket);
    } catch (error: any) {
      throw this.handleError(error, 'escalate', caseTicketId);
    }
  }

  private handleError(error: any, operation: string, caseTicketId?: string): never {
    if (error.status === 404) throw new CaseTicketNotFoundError(caseTicketId || 'unknown');
    if (error.status === 400) throw new CaseTicketValidationError(error.message, error.errors);
    throw new CaseTicketError(
      `Failed to ${operation} case/ticket: ${error.message}`,
      { operation, originalError: error }
    );
  }
}