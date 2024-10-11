"use strict";
// lib/resources/Asset.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Assets {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'assets', data);
    }
    async get(id) {
        return this.client.request('GET', `assets/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `assets/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'assets', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `assets/${id}`);
    }
    async getInvenory(id) {
        return this.client.request('GET', `assets/${id}/inventory`);
    }
    async updateInventory(id, data) {
        return this.client.request('PUT', `assets/${id}/inventory`, data);
    }
}
exports.default = Assets;
