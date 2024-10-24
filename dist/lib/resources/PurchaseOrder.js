"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PurchaseOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_purchaseorders_by_pk) {
            throw new Error('Unexpected response format');
        }
        const purchaseOrderData = response.update_purchaseorders_by_pk;
        const baseResponse = {
            id: purchaseOrderData.id,
            object: 'purchaseorder',
            status: purchaseOrderData.status,
        };
        switch (purchaseOrderData.status) {
            case 'DRAFT':
                return { ...baseResponse, status: 'DRAFT', draft: true };
            case 'SUBMITTED':
                return { ...baseResponse, status: 'SUBMITTED', submitted: true };
            case 'APPROVED':
                return { ...baseResponse, status: 'APPROVED', approved: true };
            case 'RECEIVED':
                return { ...baseResponse, status: 'RECEIVED', received: true };
            case 'CANCELLED':
                return { ...baseResponse, status: 'CANCELLED', cancelled: true };
            default:
                throw new Error(`Unexpected purchase order status: ${purchaseOrderData.status}`);
        }
    }
    async list() {
        const response = await this.stateset.request('GET', 'purchaseorders');
        return response.map((purchaseOrder) => this.handleCommandResponse({ update_purchaseorders_by_pk: purchaseOrder }));
    }
    async get(purchaseOrderId) {
        const response = await this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
        return this.handleCommandResponse({ update_purchaseorders_by_pk: response });
    }
    async create(purchaseOrderData) {
        const response = await this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
        return this.handleCommandResponse(response);
    }
    async update(purchaseOrderId, purchaseOrderData) {
        const response = await this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
        return this.handleCommandResponse(response);
    }
    async delete(purchaseOrderId) {
        await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
    }
    async submit(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/submit`);
        return this.handleCommandResponse(response);
    }
    async approve(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/approve`);
        return this.handleCommandResponse(response);
    }
    async receive(purchaseOrderId, receivedItems) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/receive`, { received_items: receivedItems });
        return this.handleCommandResponse(response);
    }
    async cancel(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/cancel`);
        return this.handleCommandResponse(response);
    }
    async addItem(purchaseOrderId, item) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/items`, item);
        return this.handleCommandResponse(response);
    }
    async removeItem(purchaseOrderId, itemId) {
        const response = await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}/items/${itemId}`);
        return this.handleCommandResponse(response);
    }
}
exports.default = PurchaseOrders;
