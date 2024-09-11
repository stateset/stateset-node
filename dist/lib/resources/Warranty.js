"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Warranties {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'warranties');
    }
    async get(warrantyId) {
        return this.stateset.request('GET', `warranties/${warrantyId}`);
    }
    async create(warrantyData) {
        return this.stateset.request('POST', 'warranties', warrantyData);
    }
    async update(warrantyId, warrantyData) {
        return this.stateset.request('PUT', `warranties/${warrantyId}`, warrantyData);
    }
    async delete(warrantyId) {
        return this.stateset.request('DELETE', `warranties/${warrantyId}`);
    }
}
exports.default = Warranties;
