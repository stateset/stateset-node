"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ASN {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_asns_by_pk) {
            throw new Error('Unexpected response format');
        }
        const asnData = response.update_asns_by_pk;
        const baseResponse = {
            id: asnData.id,
            object: 'asn',
            status: asnData.status,
        };
        switch (asnData.status) {
            case 'DRAFT':
                return { ...baseResponse, status: 'DRAFT', draft: true };
            case 'SUBMITTED':
                return { ...baseResponse, status: 'SUBMITTED', submitted: true };
            case 'IN_TRANSIT':
                return { ...baseResponse, status: 'IN_TRANSIT', in_transit: true };
            case 'DELIVERED':
                return { ...baseResponse, status: 'DELIVERED', delivered: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected ASN status: ${asnData.status}`);
        }
    }
    /**
     * List ASNs
     * @returns Array of ASNResponse objects
     */
    async list() {
        const response = await this.stateset.request('GET', 'asns');
        return response.map((asn) => this.handleCommandResponse({ update_asns_by_pk: asn }));
    }
    /**
     * Get ASN
     * @param asnId - ASN ID
     * @returns ASNResponse object
     */
    async get(asnId) {
        const response = await this.stateset.request('GET', `asns/${asnId}`);
        return this.handleCommandResponse({ update_asns_by_pk: response });
    }
    /**
     * Create ASN
     * @param asnData - ASNData object
     * @returns ASNResponse object
     */
    async create(asnData) {
        const response = await this.stateset.request('POST', 'asns', asnData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update ASN
     * @param asnId - ASN ID
     * @param asnData - Partial<ASNData> object
     * @returns ASNResponse object
     */
    async update(asnId, asnData) {
        const response = await this.stateset.request('PUT', `asns/${asnId}`, asnData);
        return this.handleCommandResponse(response);
    }
    /**
     * Delete ASN
     * @param asnId - ASN ID
     */
    async delete(asnId) {
        await this.stateset.request('DELETE', `asns/${asnId}`);
    }
    /**
     * Submit ASN
     * @param asnId - ASN ID
     * @returns SubmittedASNResponse object
     */
    async submit(asnId) {
        const response = await this.stateset.request('POST', `asns/${asnId}/submit`);
        return this.handleCommandResponse(response);
    }
    /**
     * Mark ASN as in transit
     * @param asnId - ASN ID
     * @param transitDetails - TransitDetails object
     * @returns InTransitASNResponse object
     */
    async markInTransit(asnId, transitDetails) {
        const response = await this.stateset.request('POST', `asns/${asnId}/in-transit`, transitDetails);
        return this.handleCommandResponse(response);
    }
    /**
     * Mark ASN as delivered
     * @param asnId - ASN ID
     * @param deliveryDetails - DeliveryDetails object
     * @returns DeliveredASNResponse object
     */
    async markDelivered(asnId, deliveryDetails) {
        const response = await this.stateset.request('POST', `asns/${asnId}/deliver`, deliveryDetails);
        return this.handleCommandResponse(response);
    }
    /**
     * Cancel ASN
     * @param asnId - ASN ID
     * @returns CancelledASNResponse object
     */
    async cancel(asnId) {
        const response = await this.stateset.request('POST', `asns/${asnId}/cancel`);
        return this.handleCommandResponse(response);
    }
    /**
     * Add item to ASN
     * @param asnId - ASN ID
     * @param item - ASNData['items'][0] object
     * @returns ASNResponse object
     */
    async addItem(asnId, item) {
        const response = await this.stateset.request('POST', `asns/${asnId}/items`, item);
        return this.handleCommandResponse(response);
    }
    /**
     * Remove item from ASN
     * @param asnId - ASN ID
     * @param purchaseOrderItemId - Purchase order item ID
     * @returns ASNResponse object
     */
    async removeItem(asnId, purchaseOrderItemId) {
        const response = await this.stateset.request('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Update shipping information for ASN
     * @param asnId - ASN ID
     * @param shippingInfo - ShippingInfo object
     * @returns ASNResponse object
     */
    async updateShippingInfo(asnId, shippingInfo) {
        const response = await this.stateset.request('PUT', `asns/${asnId}/shipping-info`, shippingInfo);
        return this.handleCommandResponse(response);
    }
}
exports.default = ASN;
