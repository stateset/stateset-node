"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PackingList {
    stateset;
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
    /**
     * Get all packing lists
     * @returns Array of PackingListResponse objects
     */
    async list() {
        const response = await this.stateset.request('GET', 'packinglists');
        return response.map((packingList) => this.handleCommandResponse({ update_packinglists_by_pk: packingList }));
    }
    /**
     * Get a packing list by ID
     * @param packingListId - Packing list ID
     * @returns PackingListResponse object
     */
    async get(packingListId) {
        const response = await this.stateset.request('GET', `packinglists/${packingListId}`);
        return this.handleCommandResponse({ update_packinglists_by_pk: response });
    }
    /**
     * Create a new packing list
     * @param packingListData - PackingListData object
     * @returns PackingListResponse object
     */
    async create(packingListData) {
        const response = await this.stateset.request('POST', 'packinglists', packingListData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update a packing list
     * @param packingListId - Packing list ID
     * @param packingListData - Partial<PackingListData> object
     * @returns PackingListResponse object
     */
    async update(packingListId, packingListData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}`, packingListData);
        return this.handleCommandResponse(response);
    }
    /**
     * Delete a packing list
     * @param packingListId - Packing list ID
     */
    async delete(packingListId) {
        await this.stateset.request('DELETE', `packinglists/${packingListId}`);
    }
    /**
     * Submit a packing list
     * @param packingListId - Packing list ID
     * @returns SubmittedPackingListResponse object
     */
    async submit(packingListId) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/submit`);
        return this.handleCommandResponse(response);
    }
    /**
     * Verify a packing list
     * @param packingListId - Packing list ID
     * @param verificationDetails - Verification details object
     * @returns VerifiedPackingListResponse object
     */
    async verify(packingListId, verificationDetails) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/verify`, verificationDetails);
        return this.handleCommandResponse(response);
    }
    /**
     * Mark a packing list as shipped
     * @param packingListId - Packing list ID
     * @param shippingDetails - Shipping details object
     * @returns ShippedPackingListResponse object
     */
    async markShipped(packingListId, shippingDetails) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/ship`, shippingDetails);
        return this.handleCommandResponse(response);
    }
    /**
     * Cancel a packing list
     * @param packingListId - Packing list ID
     * @returns CancelledPackingListResponse object
     */
    async cancel(packingListId) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/cancel`);
        return this.handleCommandResponse(response);
    }
    /**
     * Add a package to a packing list
     * @param packingListId - Packing list ID
     * @param packageData - Package data object
     * @returns PackingListResponse object
     */
    async addPackage(packingListId, packageData) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages`, packageData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param packageData - Partial<Package> object
     * @returns PackingListResponse object
     */
    async updatePackage(packingListId, packageNumber, packageData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}/packages/${packageNumber}`, packageData);
        return this.handleCommandResponse(response);
    }
    /**
     * Remove a package from a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @returns PackingListResponse object
     */
    async removePackage(packingListId, packageNumber) {
        const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Add an item to a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param item - PackageItem object
     * @returns PackingListResponse object
     */
    async addItemToPackage(packingListId, packageNumber, item) {
        const response = await this.stateset.request('POST', `packinglists/${packingListId}/packages/${packageNumber}/items`, item);
        return this.handleCommandResponse(response);
    }
    /**
     * Remove an item from a package in a packing list
     * @param packingListId - Packing list ID
     * @param packageNumber - Package number
     * @param purchaseOrderItemId - Purchase order item ID
     * @returns PackingListResponse object
     */
    async removeItemFromPackage(packingListId, packageNumber, purchaseOrderItemId) {
        const response = await this.stateset.request('DELETE', `packinglists/${packingListId}/packages/${packageNumber}/items/${purchaseOrderItemId}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Update quality check for a packing list
     * @param packingListId - Packing list ID
     * @param qualityCheckData - Quality check data object
     * @returns PackingListResponse object
     */
    async updateQualityCheck(packingListId, qualityCheckData) {
        const response = await this.stateset.request('PUT', `packinglists/${packingListId}/quality-check`, qualityCheckData);
        return this.handleCommandResponse(response);
    }
}
exports.default = PackingList;
//# sourceMappingURL=PackingList.js.map