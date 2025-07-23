"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class PayPalIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.paypal.com');
    }
    async getPayments() {
        return this.request('GET', 'payments');
    }
    async createPayment(data) {
        return this.request('POST', 'payments', data);
    }
    async getPayment(paymentId) {
        return this.request('GET', `payments/${paymentId}`);
    }
    async updatePayment(paymentId, data) {
        return this.request('PUT', `payments/${paymentId}`, data);
    }
    async deletePayment(paymentId) {
        return this.request('DELETE', `payments/${paymentId}`);
    }
    async getPaymentDetails(paymentId) {
        return this.request('GET', `payments/${paymentId}/details`);
    }
    async getPaymentTransactions(paymentId) {
        return this.request('GET', `payments/${paymentId}/transactions`);
    }
    async getPaymentRefunds(paymentId) {
        return this.request('GET', `payments/${paymentId}/refunds`);
    }
    async createPaymentRefund(paymentId, data) {
        return this.request('POST', `payments/${paymentId}/refunds`, data);
    }
    async getPaymentCapture(paymentId) {
        return this.request('GET', `payments/${paymentId}/capture`);
    }
    async createPaymentCapture(paymentId, data) {
        return this.request('POST', `payments/${paymentId}/capture`, data);
    }
    async getPaymentAuthorization(paymentId) {
        return this.request('GET', `payments/${paymentId}/authorization`);
    }
}
exports.default = PayPalIntegration;
//# sourceMappingURL=PayPalIntegration.js.map