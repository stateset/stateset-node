"use strict";
// lib/resources/WasteAndScrap.ts
Object.defineProperty(exports, "__esModule", { value: true });
class WasteAndScrap {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'waste-and-scrap', data);
    }
    async get(id) {
        return this.client.request('GET', `waste-and-scrap/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `waste-and-scrap/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'waste-and-scrap', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `waste-and-scrap/${id}`);
    }
    async generateReport(params) {
        return this.client.request('GET', 'waste-and-scrap/report', params);
    }
    async recordDisposal(id, data) {
        return this.client.request('POST', `waste-and-scrap/${id}/dispose`, data);
    }
}
exports.default = WasteAndScrap;
