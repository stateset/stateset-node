"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReturnLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'return_line_items');
    }
    async get(returnLineId) {
        return this.stateset.request('GET', `return_line_items/${returnLineId}`);
    }
    async create(returnLineData) {
        return this.stateset.request('POST', 'return_line_items', returnLineData);
    }
    async update(returnLineId, returnLineData) {
        return this.stateset.request('PUT', `return_line_items/${returnLineId}`, returnLineData);
    }
    async delete(returnLineId) {
        return this.stateset.request('DELETE', `return_line_items/${returnLineId}`);
    }
}
exports.default = ReturnLines;
