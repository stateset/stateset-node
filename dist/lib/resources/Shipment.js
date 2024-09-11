"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shipments {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'shipments');
    }
    async get(shipmentId) {
        return this.stateset.request('GET', `shipments/${shipmentId}`);
    }
    async create(shipmentData) {
        return this.stateset.request('POST', 'shipments', shipmentData);
    }
    async update(shipmentId, shipmentData) {
        return this.stateset.request('PUT', `shipments/${shipmentId}`, shipmentData);
    }
    async delete(shipmentId) {
        return this.stateset.request('DELETE', `shipments/${shipmentId}`);
    }
}
exports.default = Shipments;
