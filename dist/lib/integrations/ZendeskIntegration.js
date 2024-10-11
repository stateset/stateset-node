"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class ZendeskIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.zendesk.com');
    }
    async getTickets() {
        return this.request('GET', 'tickets');
    }
    async createTicket(data) {
        return this.request('POST', 'tickets', data);
    }
}
exports.default = ZendeskIntegration;
