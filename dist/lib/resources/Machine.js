"use strict";
// lib/resources/Machine.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Machines {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'machines', data);
    }
    async get(id) {
        return this.client.request('GET', `machines/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `machines/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'machines', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `machines/${id}`);
    }
    async logRuntime(id, data) {
        return this.client.request('POST', `machines/${id}/runtime`, data);
    }
    async scheduleMaintenance(id, data) {
        return this.client.request('POST', `machines/${id}/maintenance`, data);
    }
    async getPerformanceMetrics(id, params) {
        return this.client.request('GET', `machines/${id}/performance`, params);
    }
}
exports.default = Machines;
