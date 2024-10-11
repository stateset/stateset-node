"use strict";
// lib/resources/Payout.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Payouts {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'payouts', data);
    }
    async get(id) {
        return this.client.request('GET', `payouts/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `payouts/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'payouts', params);
    }
    async delete(id) {
        return this.client.request('DELETE', `payouts/${id}`);
    }
    async fetchFromPlatform(platform, startDate, endDate) {
        return this.client.request('POST', `payouts/fetch/${platform}`, { startDate, endDate });
    }
}
exports.default = Payouts;
