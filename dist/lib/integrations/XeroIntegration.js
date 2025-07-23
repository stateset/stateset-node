"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class XeroIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.xero.com');
    }
    async getInvoices() {
        return this.request('GET', 'invoices');
    }
    async createInvoice(data) {
        return this.request('POST', 'invoices', data);
    }
    async getAccounts() {
        return this.request('GET', 'accounts');
    }
    async createAccount(data) {
        return this.request('POST', 'accounts', data);
    }
    async getContacts() {
        return this.request('GET', 'contacts');
    }
    async createContact(data) {
        return this.request('POST', 'contacts', data);
    }
    async getPayments() {
        return this.request('GET', 'payments');
    }
    async createPayment(data) {
        return this.request('POST', 'payments', data);
    }
}
exports.default = XeroIntegration;
//# sourceMappingURL=XeroIntegration.js.map