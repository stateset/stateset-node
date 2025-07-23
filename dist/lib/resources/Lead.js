"use strict";
// lib/resources/Lead.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Leads {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'leads', data);
    }
    async get(id) {
        return this.client.request('GET', `leads/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `leads/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'leads', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `leads/${id}`);
    }
}
exports.default = Leads;
//# sourceMappingURL=Lead.js.map