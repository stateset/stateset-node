"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ASNLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    async list(asnId) {
        const endpoint = asnId
            ? `asns/${asnId}/line_items`
            : 'asn_line_items';
        return this.stateset.request('GET', endpoint);
    }
    async get(lineItemId) {
        return this.stateset.request('GET', `asn_line_items/${lineItemId}`);
    }
    async create(lineItemData) {
        return this.stateset.request('POST', 'asn_line_items', lineItemData);
    }
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `asn_line_items/${lineItemId}`, lineItemData);
    }
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `asn_line_items/${lineItemId}`);
    }
    async bulkCreate(asnId, lineItems) {
        return this.stateset.request('POST', `asns/${asnId}/line_items/bulk`, { line_items: lineItems });
    }
    async updateTrackingInfo(lineItemId, trackingInfo) {
        return this.stateset.request('PUT', `asn_line_items/${lineItemId}/tracking`, trackingInfo);
    }
}
exports.default = ASNLines;
