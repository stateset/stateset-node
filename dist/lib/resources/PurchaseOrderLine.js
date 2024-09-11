"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list() {
        return this.stateset.request('GET', 'purchase_order_line_items');
    }
    async get(purchaseOrderLineId) {
        return this.stateset.request('GET', `purchase_order_line_items/${purchaseOrderLineId}`);
    }
    async create(purchaseOrderLineData) {
        return this.stateset.request('POST', 'purchase_order_line_items', purchaseOrderLineData);
    }
    async update(purchaseOrderLineId, purchaseOrderLineData) {
        return this.stateset.request('PUT', `purchase_order_line_items/${purchaseOrderLineId}`, purchaseOrderLineData);
    }
    async delete(purchaseOrderLineId) {
        return this.stateset.request('DELETE', `purchase_order_line_items/${purchaseOrderLineId}`);
    }
}
exports.default = PurchaseOrderLines;
