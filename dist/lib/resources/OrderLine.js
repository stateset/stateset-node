"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'order_line_items');
    }
    async get(orderLineId) {
        return this.stateset.request('GET', `order_line_items/${orderLineId}`);
    }
    async create(orderLineData) {
        return this.stateset.request('POST', 'order_line_items', orderLineData);
    }
    async update(orderLineId, orderLineData) {
        return this.stateset.request('PUT', `order_line_items/${orderLineId}`, orderLineData);
    }
    async delete(orderLineId) {
        return this.stateset.request('DELETE', `order_line_items/${orderLineId}`);
    }
}
exports.default = OrderLines;
