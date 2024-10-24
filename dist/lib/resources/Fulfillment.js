"use strict";
// lib/resources/Fulfillment.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Fulfillment {
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_fulfillments_by_pk) {
            throw new Error('Unexpected response format');
        }
        const fulfillmentData = response.update_fulfillments_by_pk;
        const baseResponse = {
            id: fulfillmentData.id,
            object: 'fulfillment',
            status: fulfillmentData.status,
        };
        switch (fulfillmentData.status) {
            case 'PENDING':
                return { ...baseResponse, status: 'PENDING', pending: true };
            case 'PROCESSING':
                return { ...baseResponse, status: 'PROCESSING', processing: true };
            case 'SHIPPED':
                return { ...baseResponse, status: 'SHIPPED', shipped: true };
            case 'DELIVERED':
                return { ...baseResponse, status: 'DELIVERED', delivered: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected fulfillment status: ${fulfillmentData.status}`);
        }
    }
    async create(data) {
        const response = await this.client.request('POST', 'fulfillments', data);
        return this.handleCommandResponse(response);
    }
    async get(id) {
        const response = await this.client.request('GET', `fulfillments/${id}`);
        return this.handleCommandResponse({ update_fulfillments_by_pk: response });
    }
    async update(id, data) {
        const response = await this.client.request('PUT', `fulfillments/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async list(params) {
        const response = await this.client.request('GET', 'fulfillments', params);
        return response.map((fulfillment) => this.handleCommandResponse({ update_fulfillments_by_pk: fulfillment }));
    }
    async cancel(id) {
        const response = await this.client.request('POST', `fulfillments/${id}/cancel`);
        return this.handleCommandResponse(response);
    }
    async createShipment(id, data) {
        const response = await this.client.request('POST', `fulfillments/${id}/shipments`, data);
        return this.handleCommandResponse(response);
    }
    async getShipments(id) {
        return this.client.request('GET', `fulfillments/${id}/shipments`);
    }
    async updateTracking(id, data) {
        const response = await this.client.request('PUT', `fulfillments/${id}/tracking`, data);
        return this.handleCommandResponse(response);
    }
    async process(id) {
        const response = await this.client.request('POST', `fulfillments/${id}/process`);
        return this.handleCommandResponse(response);
    }
    async markAsDelivered(id) {
        const response = await this.client.request('POST', `fulfillments/${id}/deliver`);
        return this.handleCommandResponse(response);
    }
}
exports.default = Fulfillment;
