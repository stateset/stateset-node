"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDeliveryError = exports.MessageValidationError = exports.MessageNotFoundError = exports.VoiceModelProvider = exports.MessagePriority = exports.MessageStatus = exports.MessageType = void 0;
// Enums for message management
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["CODE"] = "code";
    MessageType["CHART"] = "chart";
    MessageType["IMAGE"] = "image";
    MessageType["VOICE"] = "voice";
    MessageType["COMMERCE"] = "commerce";
    MessageType["SYSTEM"] = "system";
    MessageType["ERROR"] = "error";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["QUEUED"] = "queued";
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus = exports.MessageStatus || (exports.MessageStatus = {}));
var MessagePriority;
(function (MessagePriority) {
    MessagePriority["HIGH"] = "high";
    MessagePriority["NORMAL"] = "normal";
    MessagePriority["LOW"] = "low";
})(MessagePriority = exports.MessagePriority || (exports.MessagePriority = {}));
var VoiceModelProvider;
(function (VoiceModelProvider) {
    VoiceModelProvider["ELEVEN_LABS"] = "eleven_labs";
    VoiceModelProvider["AMAZON_POLLY"] = "amazon_polly";
    VoiceModelProvider["GOOGLE_CLOUD"] = "google_cloud";
    VoiceModelProvider["MICROSOFT_AZURE"] = "microsoft_azure";
})(VoiceModelProvider = exports.VoiceModelProvider || (exports.VoiceModelProvider = {}));
// Custom Error Classes
class MessageNotFoundError extends Error {
    constructor(messageId) {
        super(`Message with ID ${messageId} not found`);
        this.name = 'MessageNotFoundError';
    }
}
exports.MessageNotFoundError = MessageNotFoundError;
class MessageValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MessageValidationError';
    }
}
exports.MessageValidationError = MessageValidationError;
class MessageDeliveryError extends Error {
    constructor(message, messageId) {
        super(message);
        this.messageId = messageId;
        this.name = 'MessageDeliveryError';
    }
}
exports.MessageDeliveryError = MessageDeliveryError;
// Main Messages Class
class Messages {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List messages with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.from)
            queryParams.append('from', params.from);
        if (params === null || params === void 0 ? void 0 : params.to)
            queryParams.append('to', params.to);
        if (params === null || params === void 0 ? void 0 : params.chat_id)
            queryParams.append('chat_id', params.chat_id);
        if (params === null || params === void 0 ? void 0 : params.channel_id)
            queryParams.append('channel_id', params.channel_id.toString());
        if (params === null || params === void 0 ? void 0 : params.date_from)
            queryParams.append('date_from', params.date_from.toISOString());
        if (params === null || params === void 0 ? void 0 : params.date_to)
            queryParams.append('date_to', params.date_to.toISOString());
        if ((params === null || params === void 0 ? void 0 : params.fromAgent) !== undefined)
            queryParams.append('fromAgent', params.fromAgent.toString());
        if ((params === null || params === void 0 ? void 0 : params.is_public) !== undefined)
            queryParams.append('is_public', params.is_public.toString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `messages?${queryParams.toString()}`);
        return response.messages;
    }
    /**
     * Get specific message by ID
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    async get(messageId) {
        try {
            const response = await this.stateset.request('GET', `messages/${messageId}`);
            return response.message;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MessageNotFoundError(messageId);
            }
            throw error;
        }
    }
    /**
     * Create new message
     * @param messageData - MessageData object
     * @returns MessageResponse object
     */
    async create(messageData) {
        this.validateMessageData(messageData);
        try {
            const response = await this.stateset.request('POST', 'messages', messageData);
            return response.message;
        }
        catch (error) {
            if (error.status === 400) {
                throw new MessageValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing message
     * @param messageId - Message ID
     * @param messageData - Partial<MessageData> object
     * @returns MessageResponse object
     */
    async update(messageId, messageData) {
        try {
            const response = await this.stateset.request('PUT', `messages/${messageId}`, messageData);
            return response.message;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MessageNotFoundError(messageId);
            }
            throw error;
        }
    }
    /**
     * Delete message
     * @param messageId - Message ID
     */
    async delete(messageId) {
        try {
            await this.stateset.request('DELETE', `messages/${messageId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new MessageNotFoundError(messageId);
            }
            throw error;
        }
    }
    /**
     * Like message
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    async like(messageId) {
        const response = await this.stateset.request('POST', `messages/${messageId}/like`);
        return response.message;
    }
    /**
     * Unlike message
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    async unlike(messageId) {
        const response = await this.stateset.request('POST', `messages/${messageId}/unlike`);
        return response.message;
    }
    /**
     * Mark message as read
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    async markAsRead(messageId) {
        const response = await this.stateset.request('POST', `messages/${messageId}/read`);
        return response.message;
    }
    /**
     * Get message analytics
     * @param messageId - Message ID
     * @returns MessageAnalytics object
     */
    async getAnalytics(messageId) {
        const response = await this.stateset.request('GET', `messages/${messageId}/analytics`);
        return response.analytics;
    }
    /**
     * Search messages
     * @param query - Search query
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    async search(query, params) {
        const queryParams = new URLSearchParams({ query });
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.date_from)
            queryParams.append('date_from', params.date_from.toISOString());
        if (params === null || params === void 0 ? void 0 : params.date_to)
            queryParams.append('date_to', params.date_to.toISOString());
        if (params === null || params === void 0 ? void 0 : params.channel_id)
            queryParams.append('channel_id', params.channel_id.toString());
        if (params === null || params === void 0 ? void 0 : params.chat_id)
            queryParams.append('chat_id', params.chat_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `messages/search?${queryParams.toString()}`);
        return response.messages;
    }
    /**
     * Get conversation thread
     * @param messageId - Message ID
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    async getThread(messageId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.limit)
            queryParams.append('limit', params.limit.toString());
        if ((params === null || params === void 0 ? void 0 : params.include_context) !== undefined) {
            queryParams.append('include_context', params.include_context.toString());
        }
        const response = await this.stateset.request('GET', `messages/${messageId}/thread?${queryParams.toString()}`);
        return response.messages;
    }
    /**
     * Validate message data
     * @param data - MessageData object
     */
    validateMessageData(data) {
        if (!data.body) {
            throw new MessageValidationError('Message body is required');
        }
        if (!data.type) {
            throw new MessageValidationError('Message type is required');
        }
        if (!data.from || !data.to) {
            throw new MessageValidationError('Message must have from and to fields');
        }
        if (data.type === MessageType.CODE && !data.code_content) {
            throw new MessageValidationError('Code content is required for code messages');
        }
        if (data.type === MessageType.CHART && !data.chart_content) {
            throw new MessageValidationError('Chart content is required for chart messages');
        }
        if (data.type === MessageType.VOICE && !data.voice_content) {
            throw new MessageValidationError('Voice content is required for voice messages');
        }
    }
}
exports.default = Messages;
