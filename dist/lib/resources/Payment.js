"use strict";
// lib/resources/Payment.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Payments {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'payments', data);
    }
    async get(id) {
        return this.client.request('GET', `payments/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `payments/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'payments', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `payments/${id}`);
    }
    async getPayouts(id) {
        return this.client.request('GET', `payments/${id}/payouts`);
    }
    async updatePayouts(id, data) {
        return this.client.request('PUT', `payments/${id}/payouts`, data);
    }
}
exports.default = Payments;
