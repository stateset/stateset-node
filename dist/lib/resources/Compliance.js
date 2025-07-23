"use strict";
// lib/resources/Compliance.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Compliance {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'compliance', data);
    }
    async get(id) {
        return this.client.request('GET', `compliance/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `compliance/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'compliance', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `compliance/${id}`);
    }
}
exports.default = Compliance;
//# sourceMappingURL=Compliance.js.map