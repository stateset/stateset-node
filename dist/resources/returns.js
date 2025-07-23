"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsResource = void 0;
const base_resource_1 = require("../core/base-resource");
class ReturnsResource extends base_resource_1.BaseResource {
    constructor(httpClient) {
        super(httpClient, 'returns');
    }
    /**
     * Update return status
     */
    async updateStatus(returnId, status, notes, options = {}) {
        const data = { status, notes };
        const response = await this.httpClient.patch(`${this.resourceName}/${returnId}/status`, data, options);
        return response.return;
    }
    /**
     * Approve or reject a return
     */
    async approve(returnId, params, options = {}) {
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/approve`, params, options);
        return response.return;
    }
    /**
     * Generate shipping label for return
     */
    async generateShippingLabel(returnId, params = {}, options = {}) {
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/shipping-label`, params, options);
        return response.shipping_label;
    }
    /**
     * Mark return as received
     */
    async markReceived(returnId, inspectionNotes, options = {}) {
        const data = { inspection_notes: inspectionNotes };
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/receive`, data, options);
        return response.return;
    }
    /**
     * Process refund for return
     */
    async processRefund(returnId, refundData, options = {}) {
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/refund`, refundData, options);
        return response.return;
    }
    /**
     * Cancel a return
     */
    async cancel(returnId, reason, options = {}) {
        const data = { reason };
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/cancel`, data, options);
        return response.return;
    }
    /**
     * Reopen a return
     */
    async reopen(returnId, reason, options = {}) {
        const data = { reason };
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/reopen`, data, options);
        return response.return;
    }
    /**
     * Add note to return
     */
    async addNote(returnId, content, isInternal = false, options = {}) {
        const data = { content, is_internal: isInternal };
        const response = await this.httpClient.post(`${this.resourceName}/${returnId}/notes`, data, options);
        return response.note;
    }
    /**
     * List return notes
     */
    async listNotes(returnId, includeInternal = false, options = {}) {
        const queryParams = { include_internal: includeInternal };
        const response = await this.httpClient.get(`${this.resourceName}/${returnId}/notes`, { ...options, params: queryParams });
        return response.notes;
    }
    /**
     * Get return by order ID
     */
    async getByOrderId(orderId, options = {}) {
        const response = await this.httpClient.get(`orders/${orderId}/returns`, options);
        return response.returns;
    }
    /**
     * Get return analytics
     */
    async getAnalytics(filters, options = {}) {
        const queryParams = filters || {};
        const response = await this.httpClient.get(`${this.resourceName}/analytics`, { ...options, params: queryParams });
        return response;
    }
    /**
     * Estimate return processing time
     */
    async estimateProcessingTime(returnData, options = {}) {
        const response = await this.httpClient.post(`${this.resourceName}/estimate-processing-time`, returnData, options);
        return response;
    }
    /**
     * Validate return eligibility
     */
    async validateEligibility(orderItemIds, options = {}) {
        const data = { order_item_ids: orderItemIds };
        const response = await this.httpClient.post(`${this.resourceName}/validate-eligibility`, data, options);
        return response;
    }
}
exports.ReturnsResource = ReturnsResource;
//# sourceMappingURL=returns.js.map