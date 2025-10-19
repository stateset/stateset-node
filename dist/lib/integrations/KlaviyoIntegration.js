"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KlaviyoIntegrationError = exports.KlaviyoEventType = exports.KlaviyoCampaignStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var KlaviyoCampaignStatus;
(function (KlaviyoCampaignStatus) {
    KlaviyoCampaignStatus["DRAFT"] = "draft";
    KlaviyoCampaignStatus["QUEUED"] = "queued";
    KlaviyoCampaignStatus["RUNNING"] = "running";
    KlaviyoCampaignStatus["SENT"] = "sent";
    KlaviyoCampaignStatus["CANCELLED"] = "cancelled";
    KlaviyoCampaignStatus["PAUSED"] = "paused";
})(KlaviyoCampaignStatus || (exports.KlaviyoCampaignStatus = KlaviyoCampaignStatus = {}));
var KlaviyoEventType;
(function (KlaviyoEventType) {
    KlaviyoEventType["PLACED_ORDER"] = "Placed Order";
    KlaviyoEventType["ORDERED_PRODUCT"] = "Ordered Product";
    KlaviyoEventType["VIEWED_PRODUCT"] = "Viewed Product";
    KlaviyoEventType["ADDED_TO_CART"] = "Added to Cart";
    KlaviyoEventType["CHECKOUT_STARTED"] = "Checkout Started";
    KlaviyoEventType["SUBSCRIBED"] = "Subscribed to List";
    KlaviyoEventType["UNSUBSCRIBED"] = "Unsubscribed from List";
})(KlaviyoEventType || (exports.KlaviyoEventType = KlaviyoEventType = {}));
// Error Classes
class KlaviyoIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'KlaviyoIntegrationError';
    }
}
exports.KlaviyoIntegrationError = KlaviyoIntegrationError;
class KlaviyoIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://a.klaviyo.com/api') {
        super(apiKey, baseUrl);
    }
    async getMarketingCampaigns(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { filter: `equals(status,${params.status})` }),
            ...(params.channel && { filter: `equals(channel,${params.channel})` }),
            ...(params.date_range?.since && {
                filter: `greater-than(updated_at,${params.date_range.since.toISOString()})`,
            }),
            ...(params.date_range?.until && {
                filter: `less-than(updated_at,${params.date_range.until.toISOString()})`,
            }),
            ...(params.limit && { 'page[size]': params.limit.toString() }),
            ...(params.page_cursor && { 'page[cursor]': params.page_cursor }),
            ...(params.fields && { fields: params.fields.join(',') }),
        });
        try {
            const response = await this.request('GET', `campaigns?${query}`);
            return {
                campaigns: response.data.map((item) => ({
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
        }
        catch (error) {
            throw new KlaviyoIntegrationError('Failed to fetch marketing campaigns', {
                originalError: error,
            });
        }
    }
    async createCampaign(data) {
        if (!data.name)
            throw new KlaviyoIntegrationError('Campaign name is required');
        if (!data.message?.template_id)
            throw new KlaviyoIntegrationError('Message template ID is required');
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
        }
        catch (error) {
            throw new KlaviyoIntegrationError('Failed to create campaign', { originalError: error });
        }
    }
    async getMarketingEvents(params = {}) {
        const query = new URLSearchParams({
            ...(params.type && { filter: `equals(type,${params.type})` }),
            ...(params.profile_id && { filter: `equals(profile_id,${params.profile_id})` }),
            ...(params.date_range?.since && {
                filter: `greater-than(timestamp,${params.date_range.since.toISOString()})`,
            }),
            ...(params.date_range?.until && {
                filter: `less-than(timestamp,${params.date_range.until.toISOString()})`,
            }),
            ...(params.limit && { page: params.limit.toString() }),
            ...(params.page_cursor && { page: params.page_cursor }),
        });
        try {
            const response = await this.request('GET', `events?${query}`);
            return {
                events: response.data.map((item) => ({
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
        }
        catch (error) {
            throw new KlaviyoIntegrationError('Failed to fetch marketing events', {
                originalError: error,
            });
        }
    }
    async createEvent(data) {
        if (!data.type)
            throw new KlaviyoIntegrationError('Event type is required');
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
        }
        catch (error) {
            throw new KlaviyoIntegrationError('Failed to create event', { originalError: error });
        }
    }
}
exports.default = KlaviyoIntegration;
//# sourceMappingURL=KlaviyoIntegration.js.map