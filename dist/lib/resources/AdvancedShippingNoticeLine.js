"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ASNLines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List ASN line items
     * @param asnId - ASN ID
     * @returns Array of ASNLineItem objects
     */
    async list(asnId) {
        const endpoint = asnId
            ? `asns/${asnId}/line_items`
            : 'asn_line_items';
        return this.stateset.request('GET', endpoint);
    }
    /**
     * Get ASN line item
     * @param lineItemId - Line item ID
     * @returns ASNLineItem object
     */
    async get(lineItemId) {
        return this.stateset.request('GET', `asn_line_items/${lineItemId}`);
    }
    /**
     * Create ASN line item
     * @param lineItemData - ASNLineItem object
     * @returns ASNLineItem object
     */
    async create(lineItemData) {
        return this.stateset.request('POST', 'asn_line_items', lineItemData);
    }
    /**
     * Update ASN line item
     * @param lineItemId - Line item ID
     * @param lineItemData - Partial<ASNLineItem> object
     * @returns ASNLineItem object
     */
    async update(lineItemId, lineItemData) {
        return this.stateset.request('PUT', `asn_line_items/${lineItemId}`, lineItemData);
    }
    /**
     * Delete ASN line item
     * @param lineItemId - Line item ID
     */
    async delete(lineItemId) {
        return this.stateset.request('DELETE', `asn_line_items/${lineItemId}`);
    }
    /**
     * Bulk create ASN line items
     * @param asnId - ASN ID
     * @param lineItems - Array of ASNLineItem objects
     * @returns Array of ASNLineItem objects
     */
    async bulkCreate(asnId, lineItems) {
        return this.stateset.request('POST', `asns/${asnId}/line_items/bulk`, { line_items: lineItems });
    }
    /**
     * Update tracking information for ASN line item
     * @param lineItemId - Line item ID
     * @param trackingInfo - TrackingInfo object
     * @returns ASNLineItem object
     */
    async updateTrackingInfo(lineItemId, trackingInfo) {
        return this.stateset.request('PUT', `asn_line_items/${lineItemId}/tracking`, trackingInfo);
    }
}
exports.default = ASNLines;
