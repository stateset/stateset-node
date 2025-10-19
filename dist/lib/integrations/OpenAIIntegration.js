"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIIntegrationError = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenAIIntegrationError extends Error {
    status;
    cause;
    constructor(message, status, cause) {
        super(message);
        this.name = 'OpenAIIntegrationError';
        this.status = status;
        this.cause = cause;
        Error.captureStackTrace?.(this, new.target);
    }
}
exports.OpenAIIntegrationError = OpenAIIntegrationError;
class OpenAIIntegration {
    client;
    defaultModel;
    constructor(apiKey, options = {}) {
        const { baseUrl = 'https://api.openai.com/v1', defaultModel = 'gpt-4o-mini', timeoutMs = 60000, additionalHeaders = {}, } = options;
        this.defaultModel = defaultModel;
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: timeoutMs,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                ...additionalHeaders,
            },
        });
    }
    setDefaultModel(model) {
        this.defaultModel = model;
    }
    getDefaultModel() {
        return this.defaultModel;
    }
    async createChatCompletion(messages, options = {}) {
        const { signal, model, ...restOptions } = options;
        const payload = {
            model: model || this.defaultModel,
            messages,
            ...restOptions,
        };
        try {
            const resp = await this.client.post('/chat/completions', payload, { signal });
            return resp.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                const status = axiosError.response?.status;
                const details = axiosError.response?.data?.error?.message || axiosError.message || 'Unknown error';
                throw new OpenAIIntegrationError(`OpenAI chat completion failed: ${details}`, status, error);
            }
            throw new OpenAIIntegrationError('OpenAI chat completion failed', undefined, error);
        }
    }
}
exports.default = OpenAIIntegration;
//# sourceMappingURL=OpenAIIntegration.js.map