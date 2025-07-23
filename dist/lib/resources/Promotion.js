"use strict";
// lib/resources/Promotion.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Promotions {
    client;
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'promotions', data);
    }
    async get(id) {
        return this.client.request('GET', `promotions/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `promotions/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'promotions', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `promotions/${id}`);
    }
    async getInventory(id) {
        return this.client.request('GET', `promotions/${id}/inventory`);
    }
    async updateInventory(id, data) {
        return this.client.request('PUT', `promotions/${id}/inventory`, data);
    }
}
exports.default = Promotions;
//# sourceMappingURL=Promotion.js.map