"use strict";
// lib/resources/Warehouse.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Warehouses {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'warehouses', data);
    }
    async get(id) {
        return this.client.request('GET', `warehouses/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `warehouses/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'warehouses', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `warehouses/${id}`);
    }
    async getInventory(id) {
        return this.client.request('GET', `warehouses/${id}/inventory`);
    }
    async updateCapacity(id, data) {
        return this.client.request('PUT', `warehouses/${id}/capacity`, data);
    }
}
exports.default = Warehouses;
