"use strict";
// lib/resources/Asset.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Assets {
    constructor(client) {
        this.client = client;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_assets_by_pk) {
            throw new Error('Unexpected response format');
        }
        const assetData = response.update_assets_by_pk;
        const baseResponse = {
            id: assetData.id,
            object: 'asset',
            status: assetData.status,
        };
        switch (assetData.status) {
            case 'ACTIVE':
                return { ...baseResponse, status: 'ACTIVE', active: true };
            case 'INACTIVE':
                return { ...baseResponse, status: 'INACTIVE', inactive: true };
            case 'MAINTENANCE':
                return { ...baseResponse, status: 'MAINTENANCE', maintenance: true };
            case 'RETIRED':
                return { ...baseResponse, status: 'RETIRED', retired: true };
            default:
                throw new Error(`Unexpected asset status: ${assetData.status}`);
        }
    }
    async create(data) {
        const response = await this.client.request('POST', 'assets', data);
        return this.handleCommandResponse(response);
    }
    async get(id) {
        const response = await this.client.request('GET', `assets/${id}`);
        return this.handleCommandResponse(response);
    }
    async update(id, data) {
        const response = await this.client.request('PUT', `assets/${id}`, data);
        return this.handleCommandResponse(response);
    }
    async list(params) {
        const response = await this.client.request('GET', 'assets', params);
        return response.map((asset) => this.handleCommandResponse({ update_assets_by_pk: asset }));
    }
    async delete(id) {
        await this.client.request('DELETE', `assets/${id}`);
    }
    async getInventory(id) {
        return this.client.request('GET', `assets/${id}/inventory`);
    }
    async updateInventory(id, data) {
        return this.client.request('PUT', `assets/${id}/inventory`, data);
    }
    async setActive(id) {
        const response = await this.client.request('POST', `assets/${id}/set-active`);
        return this.handleCommandResponse(response);
    }
    async setInactive(id) {
        const response = await this.client.request('POST', `assets/${id}/set-inactive`);
        return this.handleCommandResponse(response);
    }
    async setMaintenance(id) {
        const response = await this.client.request('POST', `assets/${id}/set-maintenance`);
        return this.handleCommandResponse(response);
    }
    async setRetired(id) {
        const response = await this.client.request('POST', `assets/${id}/set-retired`);
        return this.handleCommandResponse(response);
    }
}
exports.default = Assets;
