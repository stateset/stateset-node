"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/integrations/BaseIntegration.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
class BaseIntegration {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    async request(method, path, data) {
        const url = `${this.baseUrl}/${path}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
        try {
            const response = await (0, node_fetch_1.default)(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error in integration request:', error);
            throw error;
        }
    }
}
exports.default = BaseIntegration;
