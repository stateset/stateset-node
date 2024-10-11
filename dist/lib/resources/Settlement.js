"use strict";
// lib/resources/Settlement.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Settlements {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'settlements', data);
    }
    async get(id) {
        return this.client.request('GET', `settlements/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `settlements/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'settlements', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `settlements/${id}`);
    }
    async consolidate(startDate, endDate) {
        return this.client.request('POST', 'settlements/consolidate', { startDate, endDate });
    }
    async reconcile(startDate, endDate) {
        return this.client.request('POST', 'settlements/reconcile', { startDate, endDate });
    }
}
exports.default = Settlements;
