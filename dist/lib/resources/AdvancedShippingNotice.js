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
    async list() {
        const response = await this.stateset.request('GET', 'asns');
        return response.map((asn) => this.handleCommandResponse({ update_asns_by_pk: asn }));
    }
    async get(asnId) {
        const response = await this.stateset.request('GET', `asns/${asnId}`);
        return this.handleCommandResponse({ update_asns_by_pk: response });
    }
    async create(asnData) {
        const response = await this.stateset.request('POST', 'asns', asnData);
        return this.handleCommandResponse(response);
    }
    async update(asnId, asnData) {
        const response = await this.stateset.request('PUT', `asns/${asnId}`, asnData);
        return this.handleCommandResponse(response);
    }
    async delete(asnId) {
        await this.stateset.request('DELETE', `asns/${asnId}`);
    }
    async submit(asnId) {
        const response = await this.stateset.request('POST', `asns/${asnId}/submit`);
        return this.handleCommandResponse(response);
    }
    async markInTransit(asnId, transitDetails) {
        const response = await this.stateset.request('POST', `asns/${asnId}/in-transit`, transitDetails);
        return this.handleCommandResponse(response);
    }
    async markDelivered(asnId, deliveryDetails) {
        const response = await this.stateset.request('POST', `asns/${asnId}/deliver`, deliveryDetails);
        return this.handleCommandResponse(response);
    }
    async cancel(asnId) {
        const response = await this.stateset.request('POST', `asns/${asnId}/cancel`);
        return this.handleCommandResponse(response);
    }
    async addItem(asnId, item) {
        const response = await this.stateset.request('POST', `asns/${asnId}/items`, item);
        return this.handleCommandResponse(response);
    }
    async removeItem(asnId, purchaseOrderItemId) {
        const response = await this.stateset.request('DELETE', `asns/${asnId}/items/${purchaseOrderItemId}`);
        return this.handleCommandResponse(response);
    }
    async updateShippingInfo(asnId, shippingInfo) {
        const response = await this.stateset.request('PUT', `asns/${asnId}/shipping-info`, shippingInfo);
        return this.handleCommandResponse(response);
    }
}
exports.default = ASN;
