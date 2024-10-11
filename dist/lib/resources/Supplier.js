"use strict";
// lib/resources/Supplier.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Suppliers {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'suppliers', data);
    }
    async get(id) {
        return this.client.request('GET', `suppliers/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `suppliers/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'suppliers', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `suppliers/${id}`);
    }
    async getPerformanceMetrics(id) {
        return this.client.request('GET', `suppliers/${id}/performance`);
    }
    async updatePaymentTerms(id, data) {
        return this.client.request('PUT', `suppliers/${id}/payment-terms`, data);
    }
    async listProducts(id) {
        return this.client.request('GET', `suppliers/${id}/products`);
    }
}
exports.default = Suppliers;
