"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackingListLines {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Get all packing list line items
     * @param packingListId - Optional packing list ID
     * @returns Array of PackingListLineItem objects
     */
    async list(packingListId) {
        const endpoint = packingListId
            ? `packing_lists/${packingListId}/line_items`
            : 'packing_list_line_items';
        return this.stateset.request('GET', endpoint);
    }
    /**
     * Get a packing list line item by ID
     * @param lineItemId - Packing list line item ID
     * @returns PackingListLineItem object
     */
    async get(lineItemId) {
        return this.stateset.request('GET', `packing_list_line_items/${lineItemId}`);
    }
    /**
     * Create a new packing list line item
     * @param lineItemData - PackingListLineItem object
     * @returns PackingListLineItem object
     */
    async create(lineItemData) {
        return this.stateset.request('POST', 'packing_list_line_items', lineItemData);
    }
    /**
     * Update a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param lineItemData - Partial<PackingListLineItem> object
     * @returns PackingListLineItem object
     */
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}`, lineItemData);
    }
    /**
     * Delete a packing list line item
     * @param lineItemId - Packing list line item ID
     */
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `packing_list_line_items/${lineItemId}`);
    }
    /**
     * Bulk create packing list line items
     * @param packingListId - Packing list ID
     * @param lineItems - Array of PackingListLineItem objects
     * @returns Array of PackingListLineItem objects
     */
    async bulkCreate(packingListId, lineItems) {
        return this.stateset.request('POST', `packing_lists/${packingListId}/line_items/bulk`, {
            line_items: lineItems,
        });
    }
    /**
     * Verify a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param verificationData - Verification data object
     * @returns PackingListLineItem object
     */
    async verifyItem(lineItemId, verificationData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/verify`, verificationData);
    }
    /**
     * Update the location of a packing list line item
     * @param lineItemId - Packing list line item ID
     * @param locationData - Location data object
     * @returns PackingListLineItem object
     */
    async updateLocation(lineItemId, locationData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/location`, locationData);
    }
}
exports.default = PackingListLines;
//# sourceMappingURL=PackingListLine.js.map