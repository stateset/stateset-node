"use strict";
// lib/resources/WasteAndScrap.ts
Object.defineProperty(exports, "__esModule", { value: true });
class WasteAndScrap {
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_waste_and_scrap_by_pk) {
            throw new Error('Unexpected response format');
        }
        const wasteAndScrapData = response.update_waste_and_scrap_by_pk;
        const baseResponse = {
            id: wasteAndScrapData.id,
            object: 'waste-and-scrap',
            status: wasteAndScrapData.status,
        };
        switch (wasteAndScrapData.status) {
            case 'PENDING':
                return { ...baseResponse, status: 'PENDING', pending: true };
            case 'PROCESSED':
                return { ...baseResponse, status: 'PROCESSED', processed: true };
            case 'DISPOSED':
                return { ...baseResponse, status: 'DISPOSED', disposed: true };
            case 'RECYCLED':
                return { ...baseResponse, status: 'RECYCLED', recycled: true };
            default:
                throw new Error(`Unexpected waste and scrap status: ${wasteAndScrapData.status}`);
        }
    }
    async create(data) {
        const response = await this.client.request('POST', 'waste-and-scrap', data);
        return this.handleCommandResponse(response);
    }
    async get(id) {
        const response = await this.client.request('GET', `waste-and-scrap/${id}`);
        return this.handleCommandResponse({ update_waste_and_scrap_by_pk: response });
    }
    async update(id, data) {
        const response = await this.client.request('PUT', `waste-and-scrap/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async list(params) {
        const response = await this.client.request('GET', 'waste-and-scrap', params);
        return response.map((item) => this.handleCommandResponse({ update_waste_and_scrap_by_pk: item }));
    }
    async delete(id) {
        await this.client.request('DELETE', `waste-and-scrap/${id}`);
    }
    async generateReport(params) {
        return this.client.request('GET', 'waste-and-scrap/report', params);
    }
    async recordDisposal(id, data) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/dispose`, data);
        return this.handleCommandResponse(response);
    }
    async markAsProcessed(id) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/process`);
        return this.handleCommandResponse(response);
    }
    async markAsRecycled(id) {
        const response = await this.client.request('POST', `waste-and-scrap/${id}/recycle`);
        return this.handleCommandResponse(response);
    }
    async getDisposalHistory(id) {
        return this.client.request('GET', `waste-and-scrap/${id}/disposal-history`);
    }
}
exports.default = WasteAndScrap;
