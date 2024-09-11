"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Returns {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'returns');
    }
    async get(returnId) {
        return this.stateset.request('GET', `returns/${returnId}`);
    }
    async create(returnData) {
        return this.stateset.request('POST', 'returns', returnData);
    }
    async update(returnId, returnData) {
        return this.stateset.request('PUT', `returns/${returnId}`, returnData);
    }
    async delete(returnId) {
        return this.stateset.request('DELETE', `returns/${returnId}`);
    }
}
exports.default = Returns;
