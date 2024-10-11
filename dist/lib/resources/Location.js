"use strict";
// lib/resources/Location.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Locations {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'locations', data);
    }
    async get(id) {
        return this.client.request('GET', `locations/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `locations/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'locations', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `locations/${id}`);
    }
    async getInventory(id) {
        return this.client.request('GET', `locations/${id}/inventory`);
    }
    async assignProduct(id, productId, data) {
        return this.client.request('POST', `locations/${id}/products/${productId}`, data);
    }
}
exports.default = Locations;
