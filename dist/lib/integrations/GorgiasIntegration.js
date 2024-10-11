"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class GorgiasIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.gorgias.com');
    }
    async getTickets() {
        return this.request('GET', 'tickets');
    }
    async createTicket(data) {
        return this.request('POST', 'tickets', data);
    }
    async getTicketMessages(ticketId) {
        return this.request('GET', `tickets/${ticketId}/messages`);
    }
    async createTicketMessage(ticketId, data) {
        return this.request('POST', `tickets/${ticketId}/messages`, data);
    }
}
exports.default = GorgiasIntegration;
