"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrderLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List all purchase order lines
     * @param purchaseOrderId - Purchase order ID
     * @returns Array of PurchaseOrderLineItem objects
     */
    async list(purchaseOrderId) {
        const endpoint = purchaseOrderId
            ? `purchase_orders/${purchaseOrderId}/line_items`
            : 'purchase_order_line_items';
        return this.stateset.request('GET', endpoint);
    }
    /**
     * Get a purchase order line by ID
     * @param lineItemId - Purchase order line ID
     * @returns PurchaseOrderLineItem object
     */
    async get(lineItemId) {
        return this.stateset.request('GET', `purchase_order_line_items/${lineItemId}`);
    }
    /**
     * Create a new purchase order line
     * @param lineItemData - PurchaseOrderLineItem object
     * @returns PurchaseOrderLineItem object
     */
    async create(lineItemData) {
        return this.stateset.request('POST', 'purchase_order_line_items', lineItemData);
    }
    /**
     * Update a purchase order line
     * @param lineItemId - Purchase order line ID
     * @param lineItemData - Partial<PurchaseOrderLineItem> object
     * @returns PurchaseOrderLineItem object
     */
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}`, lineItemData);
    }
    /**
     * Delete a purchase order line
     * @param lineItemId - Purchase order line ID
     */
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `purchase_order_line_items/${lineItemId}`);
    }
    /**
     * Bulk create purchase order lines
     * @param purchaseOrderId - Purchase order ID
     * @param lineItems - Array of PurchaseOrderLineItem objects
     * @returns Array of PurchaseOrderLineItem objects
     */
    async bulkCreate(purchaseOrderId, lineItems) {
        return this.stateset.request('POST', `purchase_orders/${purchaseOrderId}/line_items/bulk`, { line_items: lineItems });
    }
    /**
     * Update the quantity received for a purchase order line
     * @param lineItemId - Purchase order line ID
     * @param quantityReceived - Quantity received
     * @returns PurchaseOrderLineItem object
     */
    async updateQuantityReceived(lineItemId, quantityReceived) {
        return this.stateset.request('PUT', `purchase_order_line_items/${lineItemId}/receive`, { quantity_received: quantityReceived });
    }
}
exports.default = PurchaseOrderLines;
