"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ManufactureOrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'manufacture_order_line_items');
    }
    async get(manufactureOrderLineId) {
        return this.stateset.request('GET', `manufacture_order_line_items/${manufactureOrderLineId}`);
    }
    async create(manufactureOrderLineData) {
        return this.stateset.request('POST', 'manufacture_order_line_items', manufactureOrderLineData);
    }
    async update(manufactureOrderLineId, manufactureOrderLineData) {
        return this.stateset.request('PUT', `manufacture_order_line_items/${manufactureOrderLineId}`, manufactureOrderLineData);
    }
    async delete(manufactureOrderLineId) {
        return this.stateset.request('DELETE', `manufacture_order_line_items/${manufactureOrderLineId}`);
    }
}
exports.default = ManufactureOrderLines;
