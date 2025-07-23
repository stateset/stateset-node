"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseValidationError = exports.ResponseNotFoundError = exports.ResponseStatus = exports.ResponseType = void 0;
// Enums for response management
var ResponseType;
(function (ResponseType) {
    ResponseType["TEXT"] = "text";
    ResponseType["ACTION"] = "action";
    ResponseType["ERROR"] = "error";
    ResponseType["SYSTEM"] = "system";
})(ResponseType || (exports.ResponseType = ResponseType = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["PENDING"] = "pending";
    ResponseStatus["SENT"] = "sent";
    ResponseStatus["FAILED"] = "failed";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
// Custom error classes
class ResponseNotFoundError extends Error {
    constructor(responseId) {
        super(`Response with ID ${responseId} not found`);
        this.name = 'ResponseNotFoundError';
    }
}
exports.ResponseNotFoundError = ResponseNotFoundError;
class ResponseValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ResponseValidationError';
    }
}
exports.ResponseValidationError = ResponseValidationError;
// Main Responses class
class Responses {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List responses with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params?.user_id)
            queryParams.append('user_id', params.user_id);
        if (params?.org_id)
            queryParams.append('org_id', params.org_id);
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.type)
            queryParams.append('type', params.type);
        const response = await this.stateset.request('GET', `responses?${queryParams.toString()}`);
        return response.responses;
    }
    /**
     * Get a specific response
     */
    async get(responseId) {
        try {
            const response = await this.stateset.request('GET', `responses/${responseId}`);
            return response.response;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ResponseNotFoundError(responseId);
            }
            throw error;
        }
    }
    /**
     * Create a new response
     */
    async create(data) {
        if (!data.content) {
            throw new ResponseValidationError('Response content is required');
        }
        if (!data.type) {
            throw new ResponseValidationError('Response type is required');
        }
        const response = await this.stateset.request('POST', 'responses', data);
        return response.response;
    }
    /**
     * Update an existing response
     */
    async update(responseId, data) {
        try {
            const response = await this.stateset.request('PUT', `responses/${responseId}`, data);
            return response.response;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ResponseNotFoundError(responseId);
            }
            throw error;
        }
    }
    /**
     * Delete a response
     */
    async delete(responseId) {
        try {
            await this.stateset.request('DELETE', `responses/${responseId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ResponseNotFoundError(responseId);
            }
            throw error;
        }
    }
}
exports.default = Responses;
//# sourceMappingURL=Response.js.map