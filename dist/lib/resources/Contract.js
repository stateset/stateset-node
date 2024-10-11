"use strict";
// lib/resources/Contract.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Contracts {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'contracts', data);
    }
    async get(id) {
        return this.client.request('GET', `contracts/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `contracts/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'contracts', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `contracts/${id}`);
    }
}
exports.default = Contracts;
