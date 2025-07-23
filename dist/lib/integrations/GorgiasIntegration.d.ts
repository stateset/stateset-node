import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum GorgiasTicketStatus {
    OPEN = "open",
    CLOSED = "closed",
    RESOLVED = "resolved",
    PENDING = "pending"
}
export declare enum GorgiasChannel {
    EMAIL = "email",
    PHONE = "phone",
    CHAT = "chat",
    SMS = "sms",
    SOCIAL = "social"
}
export declare enum GorgiasMessageSource {
    AGENT = "agent",
    CUSTOMER = "customer",
    SYSTEM = "system"
}
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
export declare class GorgiasIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class GorgiasIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getTickets(params?: {
        status?: GorgiasTicketStatus;
        channel?: GorgiasChannel;
        customer_id?: number;
        limit?: number;
        cursor?: string;
    }): Promise<{
        tickets: GorgiasTicket[];
        pagination: {
            limit: number;
            cursor?: string;
            has_more: boolean;
        };
    }>;
    createTicket(data: Omit<GorgiasTicket, 'id' | 'created_datetime' | 'updated_datetime'>): Promise<GorgiasTicket>;
    getTicketMessages(ticketId: NonEmptyString<string>, params?: {
        limit?: number;
        cursor?: string;
        source?: GorgiasMessageSource;
    }): Promise<{
        messages: GorgiasMessage[];
        pagination: {
            limit: number;
            cursor?: string;
            has_more: boolean;
        };
    }>;
    createTicketMessage(ticketId: NonEmptyString<string>, data: Omit<GorgiasMessage, 'id' | 'ticket_id' | 'created_datetime'>): Promise<GorgiasMessage>;
    updateTicket(ticketId: NonEmptyString<string>, data: Partial<GorgiasTicket>): Promise<GorgiasTicket>;
    closeTicket(ticketId: NonEmptyString<string>, reason?: string): Promise<GorgiasTicket>;
}
export {};
//# sourceMappingURL=GorgiasIntegration.d.ts.map