"use strict";
// lib/resources/Vendor.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Vendors {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'vendors', data);
    }
    async get(id) {
        return this.client.request('GET', `vendors/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `vendors/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'vendors', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `vendors/${id}`);
    }
    async getPerformanceMetrics(id) {
        return this.client.request('GET', `vendors/${id}/performance`);
    }
    async updatePaymentTerms(id, data) {
        return this.client.request('PUT', `vendors/${id}/payment-terms`, data);
    }
}
exports.default = Vendors;
