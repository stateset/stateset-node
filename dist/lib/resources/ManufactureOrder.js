"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ManufacturerOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'manufacturerorders');
    }
    async get(manufacturerOrderId) {
        return this.stateset.request('GET', `manufacturerorders/${manufacturerOrderId}`);
    }
    async create(manufacturerOrderData) {
        return this.stateset.request('POST', 'manufacturerorders', manufacturerOrderData);
    }
    async update(manufacturerOrderId, manufacturerOrderData) {
        return this.stateset.request('PUT', `manufacturerorders/${manufacturerOrderId}`, manufacturerOrderData);
    }
    async delete(manufacturerOrderId) {
        return this.stateset.request('DELETE', `manufacturerorders/${manufacturerOrderId}`);
    }
}
exports.default = ManufacturerOrders;
