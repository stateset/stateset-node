"use strict";
// lib/resources/InvoiceLine.ts
Object.defineProperty(exports, "__esModule", { value: true });
class InvoiceLines {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'invoice-lines', data);
    }
    async get(id) {
        return this.client.request('GET', `invoice-lines/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `invoice-lines/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'invoice-lines', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `invoice-lines/${id}`);
    }
    async getPayouts(id) {
        return this.client.request('GET', `invoice-lines/${id}/payouts`);
    }
    async updatePayouts(id, data) {
        return this.client.request('PUT', `invoice-lines/${id}/payouts`, data);
    }
}
exports.default = InvoiceLines;
