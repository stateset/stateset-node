"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class OpenAIIntegration {
    client;
    constructor(apiKey, baseUrl = 'https://api.openai.com/v1') {
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async createChatCompletion(messages, options = {}) {
        const data = {
            model: options.model || 'gpt-3.5-turbo',
            messages,
            ...options,
        };
        const resp = await this.client.post('/chat/completions', data);
        return resp.data;
    }
}
exports.default = OpenAIIntegration;
//# sourceMappingURL=OpenAIIntegration.js.map