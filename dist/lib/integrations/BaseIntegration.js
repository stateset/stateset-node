"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/integrations/BaseIntegration.ts
const axios_1 = __importDefault(require("axios"));
class BaseIntegration {
    apiKey;
    baseUrl;
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    async request(method, path, data) {
        const url = `${this.baseUrl}/${path}`;
        const response = await axios_1.default.request({
            method,
            url,
            data,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
}
exports.default = BaseIntegration;
//# sourceMappingURL=BaseIntegration.js.map