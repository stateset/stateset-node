"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class KlaviyoIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.klaviyo.com');
    }
    async getMarketingCampaigns() {
        return this.request('GET', 'marketing-campaigns');
    }
    async getMarketingEvents() {
        return this.request('GET', 'marketing-events');
    }
}
exports.default = KlaviyoIntegration;
