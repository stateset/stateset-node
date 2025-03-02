import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum KlaviyoCampaignStatus {
  DRAFT = 'draft',
  QUEUED = 'queued',
  RUNNING = 'running',
  SENT = 'sent',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum KlaviyoEventType {
  PLACED_ORDER = 'Placed Order',
  ORDERED_PRODUCT = 'Ordered Product',
  VIEWED_PRODUCT = 'Viewed Product',
  ADDED_TO_CART = 'Added to Cart',
  CHECKOUT_STARTED = 'Checkout Started',
  SUBSCRIBED = 'Subscribed to List',
  UNSUBSCRIBED = 'Unsubscribed from List'
}

// Core Interfaces
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
  list_id?: string; // Target list/segment ID
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
  value?: number; // Monetary value (e.g., for orders)
  value_currency?: string;
}

// Error Classes
export class KlaviyoIntegrationError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'KlaviyoIntegrationError';
  }
}

export default class KlaviyoIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://a.klaviyo.com/api') {
    super(apiKey, baseUrl);
  }

  public async getMarketingCampaigns(params: {
    status?: KlaviyoCampaignStatus;
    channel?: KlaviyoCampaign['channel'];
    date_range?: { since: Date; until: Date };
    limit?: number; // Klaviyo caps at 100
    page_cursor?: string; // For cursor-based pagination
    fields?: string[]; // Specific fields to return
  } = {}): Promise<{
    campaigns: KlaviyoCampaign[];
    pagination: { limit: number; next_cursor?: string; has_more: boolean };
  }> {
    const query = new URLSearchParams({
      ...(params.status && { filter: `equals(status,${params.status})` }),
      ...(params.channel && { filter: `equals(channel,${params.channel})` }),
      ...(params.date_range?.since && { filter: `greater-than(updated_at,${params.date_range.since.toISOString()})` }),
      ...(params.date_range?.until && { filter: `less-than(updated_at,${params.date_range.until.toISOString()})` }),
      ...(params.limit && { 'page[size]': params.limit.toString() }),
      ...(params.page_cursor && { 'page[cursor]': params.page_cursor }),
      ...(params.fields && { fields: params.fields.join(',') }),
    });

    try {
      const response = await this.request('GET', `campaigns?${query}`);
      return {
        campaigns: response.data.map((item: any) => ({
          id: item.id,
          name: item.attributes.name,
          status: item.attributes.status,
          channel: item.attributes.channel,
          subject: item.attributes.subject,
          scheduled_for: item.attributes.scheduled_for,
          sent_at: item.attributes.sent_at,
          created_at: item.attributes.created_at,
          updated_at: item.attributes.updated_at,
          statistics: item.attributes.statistics,
          list_id: item.relationships?.lists?.data?.id,
        })),
        pagination: {
          limit: params.limit || 50,
          next_cursor: response.links?.next,
          has_more: !!response.links?.next,
        },
      };
    } catch (error: any) {
      throw new KlaviyoIntegrationError('Failed to fetch marketing campaigns', { originalError: error });
    }
  }

  public async createCampaign(data: Omit<KlaviyoCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_at'> & { message: { template_id: string } }): Promise<KlaviyoCampaign> {
    if (!data.name) throw new KlaviyoIntegrationError('Campaign name is required');
    if (!data.message?.template_id) throw new KlaviyoIntegrationError('Message template ID is required');

    try {
      const payload = {
        data: {
          type: 'campaign',
          attributes: {
            name: data.name,
            status: data.status || KlaviyoCampaignStatus.DRAFT,
            channel: data.channel,
            subject: data.subject,
            scheduled_for: data.scheduled_for,
          },
          relationships: {
            ...(data.list_id && {
              lists: { data: { type: 'list', id: data.list_id } },
            }),
            messages: { data: { type: 'message', id: data.message.template_id } },
          },
        },
      };
      const response = await this.request('POST', 'campaigns', payload);
      return {
        id: response.data.id,
        name: response.data.attributes.name,
        status: response.data.attributes.status,
        channel: response.data.attributes.channel,
        subject: response.data.attributes.subject,
        scheduled_for: response.data.attributes.scheduled_for,
        sent_at: response.data.attributes.sent_at,
        created_at: response.data.attributes.created_at,
        updated_at: response.data.attributes.updated_at,
        statistics: response.data.attributes.statistics,
        list_id: response.data.relationships?.lists?.data?.id,
      };
    } catch (error: any) {
      throw new KlaviyoIntegrationError('Failed to create campaign', { originalError: error });
    }
  }

  public async getMarketingEvents(params: {
    type?: KlaviyoEventType | string;
    profile_id?: string;
    date_range?: { since: Date; until: Date };
    limit?: number;
    page_cursor?: string;
  } = {}): Promise<{
    events: KlaviyoEvent[];
    pagination: { limit: number; next_cursor?: string; has_more: boolean };
  }> {
    const query = new URLSearchParams({
      ...(params.type && { filter: `equals(type,${params.type})` }),
      ...(params.profile_id && { filter: `equals(profile_id,${params.profile_id})` }),
      ...(params.date_range?.since && { filter: `greater-than(timestamp,${params.date_range.since.toISOString()})` }),
      ...(params.date_range?.until && { filter: `less-than(timestamp,${params.date_range.until.toISOString()})` }),
      ...(params.limit && { page: params.limit.toString() }),
      ...(params.page_cursor && { page: params.page_cursor }),
    });

    try {
      const response = await this.request('GET', `events?${query}`);
      return {
        events: response.data.map((item: any) => ({
          id: item.id,
          type: item.attributes.type,
          timestamp: item.attributes.timestamp,
          profile: item.attributes.profile,
          properties: item.attributes.properties,
          value: item.attributes.value,
          value_currency: item.attributes.value_currency,
        })),
        pagination: {
          limit: params.limit || 50,
          next_cursor: response.links?.next,
          has_more: !!response.links?.next,
        },
      };
    } catch (error: any) {
      throw new KlaviyoIntegrationError('Failed to fetch marketing events', { originalError: error });
    }
  }

  public async createEvent(data: Omit<KlaviyoEvent, 'id'>): Promise<KlaviyoEvent> {
    if (!data.type) throw new KlaviyoIntegrationError('Event type is required');
    if (!data.profile?.id && !data.profile?.email && !data.profile?.phone_number) {
      throw new KlaviyoIntegrationError('Profile identifier (id, email, or phone_number) is required');
    }

    try {
      const payload = {
        data: {
          type: 'event',
          attributes: {
            type: data.type,
            timestamp: data.timestamp || new Date().toISOString(),
            profile: data.profile,
            properties: data.properties || {},
            ...(data.value && { value: data.value }),
            ...(data.value_currency && { value_currency: data.value_currency }),
          },
        },
      };
      const response = await this.request('POST', 'events', payload);
      return {
        id: response.data.id,
        type: response.data.attributes.type,
        timestamp: response.data.attributes.timestamp,
        profile: response.data.attributes.profile,
        properties: response.data.attributes.properties,
        value: response.data.attributes.value,
        value_currency: response.data.attributes.value_currency,
      };
    } catch (error: any) {
      throw new KlaviyoIntegrationError('Failed to create event', { originalError: error });
    }
  }
}