"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelOperationError = exports.ChannelValidationError = exports.ChannelNotFoundError = exports.ChannelRating = exports.ChannelPriority = exports.VoiceModel = exports.AIModel = exports.ChannelStatus = exports.ChannelType = void 0;
// Enums for channel management
var ChannelType;
(function (ChannelType) {
    ChannelType["TEXT"] = "text";
    ChannelType["VOICE"] = "voice";
    ChannelType["EMAIL"] = "email";
    ChannelType["CHAT"] = "chat";
    ChannelType["SMS"] = "sms";
    ChannelType["WHATSAPP"] = "whatsapp";
    ChannelType["MESSENGER"] = "messenger";
    ChannelType["API"] = "api";
    ChannelType["WEBHOOK"] = "webhook";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
var ChannelStatus;
(function (ChannelStatus) {
    ChannelStatus["ACTIVE"] = "active";
    ChannelStatus["INACTIVE"] = "inactive";
    ChannelStatus["MAINTENANCE"] = "maintenance";
    ChannelStatus["ERROR"] = "error";
    ChannelStatus["RATE_LIMITED"] = "rate_limited";
})(ChannelStatus = exports.ChannelStatus || (exports.ChannelStatus = {}));
var AIModel;
(function (AIModel) {
    AIModel["GPT_4"] = "gpt-4";
    AIModel["GPT_3_5_TURBO"] = "gpt-3.5-turbo";
    AIModel["CLAUDE_2"] = "claude-2";
    AIModel["CLAUDE_INSTANT"] = "claude-instant";
    AIModel["CUSTOM"] = "custom";
})(AIModel = exports.AIModel || (exports.AIModel = {}));
var VoiceModel;
(function (VoiceModel) {
    VoiceModel["ELEVEN_LABS"] = "eleven_labs";
    VoiceModel["AMAZON_POLLY"] = "amazon_polly";
    VoiceModel["GOOGLE_CLOUD"] = "google_cloud";
    VoiceModel["AZURE_COGNITIVE"] = "azure_cognitive";
})(VoiceModel = exports.VoiceModel || (exports.VoiceModel = {}));
var ChannelPriority;
(function (ChannelPriority) {
    ChannelPriority["HIGH"] = "high";
    ChannelPriority["MEDIUM"] = "medium";
    ChannelPriority["LOW"] = "low";
})(ChannelPriority = exports.ChannelPriority || (exports.ChannelPriority = {}));
var ChannelRating;
(function (ChannelRating) {
    ChannelRating["EXCELLENT"] = "excellent";
    ChannelRating["GOOD"] = "good";
    ChannelRating["FAIR"] = "fair";
    ChannelRating["POOR"] = "poor";
})(ChannelRating = exports.ChannelRating || (exports.ChannelRating = {}));
// Custom Error Classes
class ChannelNotFoundError extends Error {
    constructor(channelId) {
        super(`Channel with ID ${channelId} not found`);
        this.name = 'ChannelNotFoundError';
    }
}
exports.ChannelNotFoundError = ChannelNotFoundError;
class ChannelValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ChannelValidationError';
    }
}
exports.ChannelValidationError = ChannelValidationError;
class ChannelOperationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ChannelOperationError';
    }
}
exports.ChannelOperationError = ChannelOperationError;
// Main Channels Class
class Channels {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List channels with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of ChannelResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params === null || params === void 0 ? void 0 : params.tags)
            queryParams.append('tags', JSON.stringify(params.tags));
        const response = await this.stateset.request('GET', `channels?${queryParams.toString()}`);
        return response.channels;
    }
    /**
     * Get specific channel
     * @param channelId - Channel ID
     * @returns ChannelResponse object
     */
    async get(channelId) {
        try {
            const response = await this.stateset.request('GET', `channels/${channelId}`);
            return response.channel;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ChannelNotFoundError(channelId);
            }
            throw error;
        }
    }
    /**
     * Create new channel
     * @param channelData - ChannelData object
     * @returns ChannelResponse object
     */
    async create(channelData) {
        this.validateChannelData(channelData);
        try {
            const response = await this.stateset.request('POST', 'channels', channelData);
            return response.channel;
        }
        catch (error) {
            if (error.status === 400) {
                throw new ChannelValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update channel
     * @param channelId - Channel ID
     * @param channelData - Partial<ChannelData> object
     * @returns ChannelResponse object
     */
    async update(channelId, channelData) {
        try {
            const response = await this.stateset.request('PUT', `channels/${channelId}`, channelData);
            return response.channel;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ChannelNotFoundError(channelId);
            }
            throw error;
        }
    }
    /**
     * Delete channel
     * @param channelId - Channel ID
     */
    async delete(channelId) {
        try {
            await this.stateset.request('DELETE', `channels/${channelId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ChannelNotFoundError(channelId);
            }
            throw error;
        }
    }
    /**
     * Update channel status
     * @param channelId - Channel ID
     * @param status - ChannelStatus
     * @param reason - Optional reason for status change
     * @returns ChannelResponse object
     */
    async updateStatus(channelId, status, reason) {
        const response = await this.stateset.request('POST', `channels/${channelId}/status`, { status, reason });
        return response.channel;
    }
    /**
     * Get channel metrics
     * @param channelId - Channel ID
     * @param params - Optional filtering parameters
     * @returns ChannelMetrics object
     */
    async getMetrics(channelId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        const response = await this.stateset.request('GET', `channels/${channelId}/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
    /**
     * Test channel configuration
     * @param channelId - Channel ID
     * @param testData - Optional test data
     * @returns Object containing success, latency, and error (if any)
     */
    async testChannel(channelId, testData) {
        const response = await this.stateset.request('POST', `channels/${channelId}/test`, testData);
        return response.result;
    }
    /**
     * Update channel voice configuration
     * @param channelId - Channel ID
     * @param voiceConfig - VoiceConfig object
     * @returns ChannelResponse object
     */
    async updateVoiceConfig(channelId, voiceConfig) {
        const response = await this.stateset.request('PUT', `channels/${channelId}/voice-config`, voiceConfig);
        return response.channel;
    }
    /**
     * Update channel response configuration
     * @param channelId - Channel ID
     * @param responseConfig - ResponseConfig object
     * @returns ChannelResponse object
     */
    async updateResponseConfig(channelId, responseConfig) {
        const response = await this.stateset.request('PUT', `channels/${channelId}/response-config`, responseConfig);
        return response.channel;
    }
    /**
     * Validate channel data
     * @param data - ChannelData object
     */
    validateChannelData(data) {
        var _a;
        if (!data.name) {
            throw new ChannelValidationError('Channel name is required');
        }
        if (!data.type) {
            throw new ChannelValidationError('Channel type is required');
        }
        if (!data.model) {
            throw new ChannelValidationError('AI model is required');
        }
        if (data.type === ChannelType.VOICE && !data.voice_config) {
            throw new ChannelValidationError('Voice configuration is required for voice channels');
        }
        if (!((_a = data.response_config) === null || _a === void 0 ? void 0 : _a.system_prompt)) {
            throw new ChannelValidationError('Response system prompt is required');
        }
    }
}
exports.default = Channels;
