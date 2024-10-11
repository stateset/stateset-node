"use strict";
// lib/resources/Invoice.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Invoices {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'invoices', data);
    }
    async get(id) {
        return this.client.request('GET', `invoices/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `invoices/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'invoices', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `invoices/${id}`);
    }
    async getLines(id) {
        return this.client.request('GET', `invoices/${id}/lines`);
    }
    async updateLines(id, data) {
        return this.client.request('PUT', `invoices/${id}/lines`, data);
    }
}
exports.default = Invoices;
