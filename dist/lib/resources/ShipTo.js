"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ShipTo {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'ship_to');
    }
    async get(id) {
        return this.stateset.request('GET', `ship_to/${id}`);
    }
    async create(shipToData) {
        return this.stateset.request('POST', 'ship_to', shipToData);
    }
    async update(id, shipToData) {
        return this.stateset.request('PUT', `ship_to/${id}`, shipToData);
    }
    async delete(id) {
        return this.stateset.request('DELETE', `ship_to/${id}`);
    }
}
exports.default = ShipTo;
