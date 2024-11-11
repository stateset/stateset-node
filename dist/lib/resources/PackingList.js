"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackingList {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_packinglists_by_pk) {
            throw new Error('Unexpected response format');
        }
        const packingListData = response.update_packinglists_by_pk;
        const baseResponse = {
            id: packingListData.id,
            object: 'packinglist',
            status: packingListData.status,
        };
        switch (packingListData.status) {
            case 'DRAFT':
                return { ...baseResponse, status: 'DRAFT', draft: true };
            case 'SUBMITTED':
                return { ...baseResponse, status: 'SUBMITTED', submitted: true };
            case 'VERIFIED':
                return { ...baseResponse, status: 'VERIFIED', verified: true };
            case 'SHIPPED':
                return { ...baseResponse, status: 'SHIPPED', shipped: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected packing list status: ${packingListData.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'packinglists');
        return response.map((packingList) => this.handleCommandResponse({ update_packinglists_by_pk: packingList }));
    }
    async get(packingListId) {
        const response = await this.stateset.request('GET', `packinglists/${packingListId}`);
        return this.handleCommandResponse({ update_packinglists_by_pk: response });
    }
    async create(packingListData) {
        const response = await this.stateset.request('POST', 'packinglists', packingListData);
        return this.handleCommandResponse(response);
    }
    async update(packingListId, packingListData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}`, packingListData);
        return this.handleCommandResponse(response);
    }
    async delete(packingListId) {
        await this.stateset.request('DELETE', `packinglists/${packingListId}`);
    }
    async submit(packingListId) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/submit`);
        return this.handleCommandResponse(response);
    }
    async verify(packingListId, verificationDetails) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/verify`, verificationDetails);
        return this.handleCommandResponse(response);
    }
    async markShipped(packingListId, shippingDetails) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/ship`, shippingDetails);
        return this.handleCommandResponse(response);
    }
    async cancel(packingListId) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/cancel`);
        return this.handleCommandResponse(response);
    }
    async addPackage(packingListId, packageData) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages`, packageData);
        return this.handleCommandResponse(response);
    }
    async updatePackage(packingListId, packageNumber, packageData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}/packages/${packageNumber}`, packageData);
        return this.handleCommandResponse(response);
    }
    async removePackage(packingListId, packageNumber) {
        const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}`);
        return this.handleCommandResponse(response);
    }
    async addItemToPackage(packingListId, packageNumber, item) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages/${packageNumber}/items`, item);
        return this.handleCommandResponse(response);
    }
    async removeItemFromPackage(packingListId, packageNumber, purchaseOrderItemId) {
        const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}/items/${purchaseOrderItemId}`);
        return this.handleCommandResponse(response);
    }
    async updateQualityCheck(packingListId, qualityCheckData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}/quality-check`, qualityCheckData);
        return this.handleCommandResponse(response);
    }
}
exports.default = PackingList;
