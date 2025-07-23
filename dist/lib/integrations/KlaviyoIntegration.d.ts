import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum KlaviyoCampaignStatus {
    DRAFT = "draft",
    QUEUED = "queued",
    RUNNING = "running",
    SENT = "sent",
    CANCELLED = "cancelled",
    PAUSED = "paused"
}
export declare enum KlaviyoEventType {
    PLACED_ORDER = "Placed Order",
    ORDERED_PRODUCT = "Ordered Product",
    VIEWED_PRODUCT = "Viewed Product",
    ADDED_TO_CART = "Added to Cart",
    CHECKOUT_STARTED = "Checkout Started",
    SUBSCRIBED = "Subscribed to List",
    UNSUBSCRIBED = "Unsubscribed from List"
}
export interface KlaviyoCampaign {
    id: NonEmptyString<string>;
    name: string;
    status: KlaviyoCampaignStatus;
    channel: 'email' | 'sms' | 'push';
    subject?: string;
    scheduled_for?: Timestamp;
    sent_at?: Timestamp;
    created_at: Timestamp;
    updated_at: Timestamp;
    statistics?: {
        sent: number;
        delivered: number;
        opened: number;
        clicked: number;
        bounced: number;
        unsubscribed: number;
    };
    list_id?: string;
}
export interface KlaviyoEvent {
    id: NonEmptyString<string>;
    type: KlaviyoEventType | string;
    timestamp: Timestamp;
    profile: {
        id: string;
        email?: string;
        phone_number?: string;
        first_name?: string;
        last_name?: string;
    };
    properties: Record<string, any>;
    value?: number;
    value_currency?: string;
}
export declare class KlaviyoIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class KlaviyoIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    getMarketingCampaigns(params?: {
        status?: KlaviyoCampaignStatus;
        channel?: KlaviyoCampaign['channel'];
        date_range?: {
            since: Date;
            until: Date;
        };
        limit?: number;
        page_cursor?: string;
        fields?: string[];
    }): Promise<{
        campaigns: KlaviyoCampaign[];
        pagination: {
            limit: number;
            next_cursor?: string;
            has_more: boolean;
        };
    }>;
    createCampaign(data: Omit<KlaviyoCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_at'> & {
        message: {
            template_id: string;
        };
    }): Promise<KlaviyoCampaign>;
    getMarketingEvents(params?: {
        type?: KlaviyoEventType | string;
        profile_id?: string;
        date_range?: {
            since: Date;
            until: Date;
        };
        limit?: number;
        page_cursor?: string;
    }): Promise<{
        events: KlaviyoEvent[];
        pagination: {
            limit: number;
            next_cursor?: string;
            has_more: boolean;
        };
    }>;
    createEvent(data: Omit<KlaviyoEvent, 'id'>): Promise<KlaviyoEvent>;
}
export {};
//# sourceMappingURL=KlaviyoIntegration.d.ts.map