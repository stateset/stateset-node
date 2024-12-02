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
    /**
     * List all purchase orders
     * @returns Array of PurchaseOrderResponse objects
     */
    async list() {
        const response = await this.stateset.request('GET', 'purchaseorders');
        return response.map((purchaseOrder) => this.handleCommandResponse({ update_purchaseorders_by_pk: purchaseOrder }));
    }
    /**
     * Get a purchase order by ID
     * @param purchaseOrderId - Purchase order ID
     * @returns PurchaseOrderResponse object
     */
    async get(purchaseOrderId) {
        const response = await this.stateset.request('GET', `purchaseorders/${purchaseOrderId}`);
        return this.handleCommandResponse({ update_purchaseorders_by_pk: response });
    }
    /**
     * Create a new purchase order
     * @param purchaseOrderData - PurchaseOrderData object
     * @returns PurchaseOrderResponse object
     */
    async create(purchaseOrderData) {
        const response = await this.stateset.request('POST', 'purchaseorders', purchaseOrderData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param purchaseOrderData - Partial<PurchaseOrderData> object
     * @returns PurchaseOrderResponse object
     */
    async update(purchaseOrderId, purchaseOrderData) {
        const response = await this.stateset.request('PUT', `purchaseorders/${purchaseOrderId}`, purchaseOrderData);
        return this.handleCommandResponse(response);
    }
    /**
     * Delete a purchase order
     * @param purchaseOrderId - Purchase order ID
     */
    async delete(purchaseOrderId) {
        await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}`);
    }
    /**
     * Submit a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns SubmittedPurchaseOrderResponse object
     */
    async submit(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/submit`);
        return this.handleCommandResponse(response);
    }
    /**
     * Approve a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns ApprovedPurchaseOrderResponse object
     */
    async approve(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/approve`);
        return this.handleCommandResponse(response);
    }
    /**
     * Receive a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param receivedItems - Array of received items
     * @returns ReceivedPurchaseOrderResponse object
     */
    async receive(purchaseOrderId, receivedItems) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/receive`, { received_items: receivedItems });
        return this.handleCommandResponse(response);
    }
    /**
     * Cancel a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @returns CancelledPurchaseOrderResponse object
     */
    async cancel(purchaseOrderId) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/cancel`);
        return this.handleCommandResponse(response);
    }
    /**
     * Add an item to a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param item - Item object
     * @returns PurchaseOrderResponse object
     */
    async addItem(purchaseOrderId, item) {
        const response = await this.stateset.request('POST', `purchaseorders/${purchaseOrderId}/items`, item);
        return this.handleCommandResponse(response);
    }
    /**
     * Remove an item from a purchase order
     * @param purchaseOrderId - Purchase order ID
     * @param itemId - Item ID
     * @returns PurchaseOrderResponse object
     */
    async removeItem(purchaseOrderId, itemId) {
        const response = await this.stateset.request('DELETE', `purchaseorders/${purchaseOrderId}/items/${itemId}`);
        return this.handleCommandResponse(response);
    }
}
exports.default = PurchaseOrders;
