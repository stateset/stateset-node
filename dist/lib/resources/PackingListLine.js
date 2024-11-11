"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackingListLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list(packingListId) {
        const endpoint = packingListId
            ? `packing_lists/${packingListId}/line_items`
            : 'packing_list_line_items';
        return this.stateset.request('GET', endpoint);
    }
    async get(lineItemId) {
        return this.stateset.request('GET', `packing_list_line_items/${lineItemId}`);
    }
    async create(lineItemData) {
        return this.stateset.request('POST', 'packing_list_line_items', lineItemData);
    }
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}`, lineItemData);
    }
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `packing_list_line_items/${lineItemId}`);
    }
    async bulkCreate(packingListId, lineItems) {
        return this.stateset.request('POST', `packing_lists/${packingListId}/line_items/bulk`, { line_items: lineItems });
    }
    async verifyItem(lineItemId, verificationData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/verify`, verificationData);
    }
    async updateLocation(lineItemId, locationData) {
        return this.stateset.request('PUT', `packing_list_line_items/${lineItemId}/location`, locationData);
    }
}
exports.default = PackingListLines;
