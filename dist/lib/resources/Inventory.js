"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Inventory {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'inventory');
    }
    async get(inventoryId) {
        return this.stateset.request('GET', `inventory/${inventoryId}`);
    }
    async create(inventoryData) {
        return this.stateset.request('POST', 'inventory', inventoryData);
    }
    async update(inventoryId, inventoryData) {
        return this.stateset.request('PUT', `inventory/${inventoryId}`, inventoryData);
    }
    async delete(inventoryId) {
        return this.stateset.request('DELETE', `inventory/${inventoryId}`);
    }
}
exports.default = Inventory;
