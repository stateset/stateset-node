"use strict";
// lib/resources/Product.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Products {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'products', data);
    }
    async get(id) {
        return this.client.request('GET', `products/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `products/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'products', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `products/${id}`);
    }
    async getInventory(id) {
        return this.client.request('GET', `products/${id}/inventory`);
    }
    async updateInventory(id, data) {
        return this.client.request('PUT', `products/${id}/inventory`, data);
    }
}
exports.default = Products;
