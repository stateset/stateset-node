"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list(purchaseOrderId) {
        const endpoint = purchaseOrderId
            ? `purchase_orders/${purchaseOrderId}/line_items`
            : 'purchase_order_line_items';
        return this.stateset.request('GET', endpoint);
    }
    async get(lineItemId) {
        return this.stateset.request('GET', `purchase_order_line_items/${lineItemId}`);
    }
    async create(lineItemData) {
        return this.stateset.request('POST', 'purchase_order_line_items', lineItemData);
    }
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}`, lineItemData);
    }
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `purchase_order_line_items/${lineItemId}`);
    }
    async bulkCreate(purchaseOrderId, lineItems) {
        return this.stateset.request('POST', `purchase_orders/${purchaseOrderId}/line_items/bulk`, { line_items: lineItems });
    }
    async updateQuantityReceived(lineItemId, quantityReceived) {
        return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}/receive`, { quantity_received: quantityReceived });
    }
}
exports.default = PurchaseOrderLines;
