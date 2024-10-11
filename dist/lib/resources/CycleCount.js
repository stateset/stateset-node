"use strict";
// lib/resources/CycleCount.ts
Object.defineProperty(exports, "__esModule", { value: true });
class CycleCounts {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'cycle-counts', data);
    }
    async get(id) {
        return this.client.request('GET', `cycle-counts/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `cycle-counts/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'cycle-counts', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `cycle-counts/${id}`);
    }
    async complete(id, data) {
        return this.client.request('POST', `cycle-counts/${id}/complete`, data);
    }
    async reconcile(id) {
        return this.client.request('POST', `cycle-counts/${id}/reconcile`);
    }
}
exports.default = CycleCounts;
