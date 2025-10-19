"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GorgiasIntegrationError = exports.GorgiasMessageSource = exports.GorgiasChannel = exports.GorgiasTicketStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var GorgiasTicketStatus;
(function (GorgiasTicketStatus) {
    GorgiasTicketStatus["OPEN"] = "open";
    GorgiasTicketStatus["CLOSED"] = "closed";
    GorgiasTicketStatus["RESOLVED"] = "resolved";
    GorgiasTicketStatus["PENDING"] = "pending";
})(GorgiasTicketStatus || (exports.GorgiasTicketStatus = GorgiasTicketStatus = {}));
var GorgiasChannel;
(function (GorgiasChannel) {
    GorgiasChannel["EMAIL"] = "email";
    GorgiasChannel["PHONE"] = "phone";
    GorgiasChannel["CHAT"] = "chat";
    GorgiasChannel["SMS"] = "sms";
    GorgiasChannel["SOCIAL"] = "social";
})(GorgiasChannel || (exports.GorgiasChannel = GorgiasChannel = {}));
var GorgiasMessageSource;
(function (GorgiasMessageSource) {
    GorgiasMessageSource["AGENT"] = "agent";
    GorgiasMessageSource["CUSTOMER"] = "customer";
    GorgiasMessageSource["SYSTEM"] = "system";
})(GorgiasMessageSource || (exports.GorgiasMessageSource = GorgiasMessageSource = {}));
// Error Classes
class GorgiasIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'GorgiasIntegrationError';
    }
}
exports.GorgiasIntegrationError = GorgiasIntegrationError;
class GorgiasIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.gorgias.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!field || !data[field]) {
                throw new GorgiasIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getTickets(params = {}) {
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
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to fetch tickets', { originalError: error });
        }
    }
    async createTicket(data) {
        this.validateRequestData(data, ['subject', 'customer']);
        try {
            const response = await this.request('POST', 'tickets', data);
            return response.data;
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to create ticket', { originalError: error });
        }
    }
    async getTicketMessages(ticketId, params = {}) {
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
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to fetch ticket messages', {
                originalError: error,
                ticketId,
            });
        }
    }
    async createTicketMessage(ticketId, data) {
        this.validateRequestData(data, ['sender', 'body_text']);
        try {
            const response = await this.request('POST', `tickets/${ticketId}/messages`, data);
            return response.data;
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to create ticket message', {
                originalError: error,
                ticketId,
            });
        }
    }
    async updateTicket(ticketId, data) {
        try {
            const response = await this.request('PUT', `tickets/${ticketId}`, data);
            return response.data;
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to update ticket', {
                originalError: error,
                ticketId,
            });
        }
    }
    async closeTicket(ticketId, reason) {
        try {
            const response = await this.request('PUT', `tickets/${ticketId}`, {
                status: GorgiasTicketStatus.CLOSED,
                ...(reason && { close_reason: reason }),
            });
            return response.data;
        }
        catch (error) {
            throw new GorgiasIntegrationError('Failed to close ticket', {
                originalError: error,
                ticketId,
            });
        }
    }
}
exports.default = GorgiasIntegration;
//# sourceMappingURL=GorgiasIntegration.js.map