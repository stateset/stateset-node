"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WarrantyLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'warranty_line_items');
    }
    async get(warrantyLineId) {
        return this.stateset.request('GET', `warranty_line_items/${warrantyLineId}`);
    }
    async create(warrantyLineData) {
        return this.stateset.request('POST', 'warranty_line_items', warrantyLineData);
    }
    async update(warrantyLineId, warrantyLineData) {
        return this.stateset.request('PUT', `warranty_line_items/${warrantyLineId}`, warrantyLineData);
    }
    async delete(warrantyLineId) {
        return this.stateset.request('DELETE', `warranty_line_items/${warrantyLineId}`);
    }
}
exports.default = WarrantyLines;
