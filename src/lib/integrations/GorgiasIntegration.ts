import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum GorgiasTicketStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  RESOLVED = 'resolved',
  PENDING = 'pending',
}

export enum GorgiasChannel {
  EMAIL = 'email',
  PHONE = 'phone',
  CHAT = 'chat',
  SMS = 'sms',
  SOCIAL = 'social',
}

export enum GorgiasMessageSource {
  AGENT = 'agent',
  CUSTOMER = 'customer',
  SYSTEM = 'system',
}

// Core Interfaces
export interface GorgiasTicket {
  id: number;
  external_id?: string;
  subject: string;
  status: GorgiasTicketStatus;
  channel: GorgiasChannel;
  customer: {
    id: number;
    name: string;
    email: NonEmptyString<string>;
  };
  assignee_user?: {
    id: number;
    name: string;
    email: string;
  };
  created_datetime: Timestamp;
  updated_datetime: Timestamp;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface GorgiasMessage {
  id: number;
  ticket_id: number;
  sender: {
    id: number;
    name: string;
    email?: string;
  };
  source: GorgiasMessageSource;
  channel: GorgiasChannel;
  body_text: string;
  body_html?: string;
  created_datetime: Timestamp;
  attachments?: Array<{
    url: NonEmptyString<string>;
    filename: string;
    content_type: string;
  }>;
}

// Error Classes
export class GorgiasIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GorgiasIntegrationError';
  }
}

export default class GorgiasIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://api.gorgias.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new GorgiasIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getTickets(
    params: {
      status?: GorgiasTicketStatus;
      channel?: GorgiasChannel;
      customer_id?: number;
      limit?: number; // Gorgias typically caps at 100
      cursor?: string; // For cursor-based pagination
    } = {}
  ): Promise<{
    tickets: GorgiasTicket[];
    pagination: { limit: number; cursor?: string; has_more: boolean };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { status: params.status }),
      ...(params.channel && { channel: params.channel }),
      ...(params.customer_id && { customer_id: params.customer_id.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.cursor && { cursor: params.cursor }),
    });

    try {
      const response = await this.request('GET', `tickets?${query}`);
      return {
        tickets: response.data,
        pagination: {
          limit: params.limit || 50,
          cursor: response.meta?.next_cursor,
          has_more: !!response.meta?.next_cursor,
        },
      };
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to fetch tickets', { originalError: error });
    }
  }

  public async createTicket(
    data: Omit<GorgiasTicket, 'id' | 'created_datetime' | 'updated_datetime'>
  ): Promise<GorgiasTicket> {
    this.validateRequestData(data, ['subject', 'customer']);
    try {
      const response = await this.request('POST', 'tickets', data);
      return response.data;
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to create ticket', { originalError: error });
    }
  }

  public async getTicketMessages(
    ticketId: NonEmptyString<string>,
    params: {
      limit?: number;
      cursor?: string;
      source?: GorgiasMessageSource;
    } = {}
  ): Promise<{
    messages: GorgiasMessage[];
    pagination: { limit: number; cursor?: string; has_more: boolean };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.source && { source: params.source }),
    });

    try {
      const response = await this.request('GET', `tickets/${ticketId}/messages?${query}`);
      return {
        messages: response.data,
        pagination: {
          limit: params.limit || 50,
          cursor: response.meta?.next_cursor,
          has_more: !!response.meta?.next_cursor,
        },
      };
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to fetch ticket messages', {
        originalError: error,
        ticketId,
      });
    }
  }

  public async createTicketMessage(
    ticketId: NonEmptyString<string>,
    data: Omit<GorgiasMessage, 'id' | 'ticket_id' | 'created_datetime'>
  ): Promise<GorgiasMessage> {
    this.validateRequestData(data, ['sender', 'body_text']);
    try {
      const response = await this.request('POST', `tickets/${ticketId}/messages`, data);
      return response.data;
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to create ticket message', {
        originalError: error,
        ticketId,
      });
    }
  }

  public async updateTicket(
    ticketId: NonEmptyString<string>,
    data: Partial<GorgiasTicket>
  ): Promise<GorgiasTicket> {
    try {
      const response = await this.request('PUT', `tickets/${ticketId}`, data);
      return response.data;
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to update ticket', {
        originalError: error,
        ticketId,
      });
    }
  }

  public async closeTicket(
    ticketId: NonEmptyString<string>,
    reason?: string
  ): Promise<GorgiasTicket> {
    try {
      const response = await this.request('PUT', `tickets/${ticketId}`, {
        status: GorgiasTicketStatus.CLOSED,
        ...(reason && { close_reason: reason }),
      });
      return response.data;
    } catch (error: any) {
      throw new GorgiasIntegrationError('Failed to close ticket', {
        originalError: error,
        ticketId,
      });
    }
  }
}
