"use strict";
// lib/resources/Location.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Locations {
    constructor(client) {
        this.client = client;
    }
    /**
     * Create a new location
     * @param data - LocationData object
     * @returns LocationResponse object
     */
    async create(data) {
        return this.client.request('POST', 'locations', data);
    }
    /**
     * Get a location by ID
     * @param id - Location ID
     * @returns LocationResponse object
     */
    async get(id) {
        return this.client.request('GET', `locations/${id}`);
    }
    /**
     * Update a location
     * @param id - Location ID
     * @param data - Partial<LocationData> object
     * @returns LocationResponse object
     */
    async update(id, data) {
        return this.client.request('PUT', `locations/${id}`, data);
    }
    /**
     * List locations
     * @param params - Optional filtering parameters
     * @returns Array of LocationResponse objects
     */
    async list(params) {
        return this.client.request('GET', 'locations', params);
    }
    /**
     * Delete a location
     * @param id - Location ID
     */
    async delete(id) {
        return this.client.request('DELETE', `locations/${id}`);
    }
    /**
     * Get inventory for a location
     * @param id - Location ID
     * @returns Array of InventoryResponse objects
     */
    async getInventory(id) {
        return this.client.request('GET', `locations/${id}/inventory`);
    }
    /**
     * Assign a product to a location
     * @param id - Location ID
     * @param productId - Product ID
     * @param data - Partial<InventoryData> object
     * @returns InventoryResponse object
     */
    async assignProduct(id, productId, data) {
        return this.client.request('POST', `locations/${id}/products/${productId}`, data);
    }
}
exports.default = Locations;
