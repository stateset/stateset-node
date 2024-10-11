"use strict";
// lib/resources/Pick.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Picks {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'picks', data);
    }
    async get(id) {
        return this.client.request('GET', `picks/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `picks/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'picks', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `picks/${id}`);
    }
    async complete(id, data) {
        return this.client.request('POST', `picks/${id}/complete`, data);
    }
    async optimizeRoute(id) {
        return this.client.request('GET', `picks/${id}/optimize-route`);
    }
}
exports.default = Picks;
