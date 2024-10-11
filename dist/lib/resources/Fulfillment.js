"use strict";
// lib/resources/Fulfillment.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Fulfillment {
    constructor(client) {
        this.client = client;
    }
    async create(data) {
        return this.client.request('POST', 'fulfillments', data);
    }
    async get(id) {
        return this.client.request('GET', `fulfillments/${id}`);
    }
    async update(id, data) {
        return this.client.request('PUT', `fulfillments/${id}`, data);
    }
    async list(params) {
        return this.client.request('GET', 'fulfillments', params);
    }
    async cancel(id) {
        return this.client.request('POST', `fulfillments/${id}/cancel`);
    }
    async createShipment(id, data) {
        return this.client.request('POST', `fulfillments/${id}/shipments`, data);
    }
    async getShipments(id) {
        return this.client.request('GET', `fulfillments/${id}/shipments`);
    }
    async updateTracking(id, data) {
        return this.client.request('PUT', `fulfillments/${id}/tracking`, data);
    }
}
exports.default = Fulfillment;
