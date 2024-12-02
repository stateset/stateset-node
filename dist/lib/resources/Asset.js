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
    /**
     * Create asset
     * @param data - AssetData object
     * @returns AssetResponse object
     */
    async create(data) {
        const response = await this.client.request('POST', 'assets', data);
        return this.handleCommandResponse(response);
    }
    /**
     * Get asset
     * @param id - Asset ID
     * @returns AssetResponse object
     */
    async get(id) {
        const response = await this.client.request('GET', `assets/${id}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Update asset
     * @param id - Asset ID
     * @param data - Partial<AssetData> object
     * @returns AssetResponse object
     */
    async update(id, data) {
        const response = await this.client.request('PUT', `assets/${id}`, data);
        return this.handleCommandResponse(response);
    }
    /**
     * List assets
     * @param params - Optional filtering parameters
     * @returns Array of AssetResponse objects
     */
    async list(params) {
        const response = await this.client.request('GET', 'assets', params);
        return response.map((asset) => this.handleCommandResponse({ update_assets_by_pk: asset }));
    }
    /**
     * Delete asset
     * @param id - Asset ID
     */
    async delete(id) {
        await this.client.request('DELETE', `assets/${id}`);
    }
    /**
     * Get inventory
     * @param id - Asset ID
     * @returns InventoryData object
     */
    async getInventory(id) {
        return this.client.request('GET', `assets/${id}/inventory`);
    }
    /**
     * Update inventory
     * @param id - Asset ID
     * @param data - InventoryData object
     * @returns InventoryData object
     */
    async updateInventory(id, data) {
        return this.client.request('PUT', `assets/${id}/inventory`, data);
    }
    /**
     * Set asset to active
     * @param id - Asset ID
     * @returns ActiveAssetResponse object
     */
    async setActive(id) {
        const response = await this.client.request('POST', `assets/${id}/set-active`);
        return this.handleCommandResponse(response);
    }
    /**
     * Set asset to inactive
     * @param id - Asset ID
     * @returns InactiveAssetResponse object
     */
    async setInactive(id) {
        const response = await this.client.request('POST', `assets/${id}/set-inactive`);
        return this.handleCommandResponse(response);
    }
    /**
     * Set asset to maintenance
     * @param id - Asset ID
     * @returns MaintenanceAssetResponse object
     */
    async setMaintenance(id) {
        const response = await this.client.request('POST', `assets/${id}/set-maintenance`);
        return this.handleCommandResponse(response);
    }
    /**
     * Set asset to retired
     * @param id - Asset ID
     * @returns RetiredAssetResponse object
     */
    async setRetired(id) {
        const response = await this.client.request('POST', `assets/${id}/set-retired`);
        return this.handleCommandResponse(response);
    }
}
exports.default = Assets;
