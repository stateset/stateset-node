"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStateError = exports.ReturnValidationError = exports.ReturnNotFoundError = exports.RefundMethod = exports.ReturnCondition = exports.ReturnReason = exports.ReturnStatus = void 0;
// Enums for returns management
var ReturnStatus;
(function (ReturnStatus) {
    ReturnStatus["REQUESTED"] = "REQUESTED";
    ReturnStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ReturnStatus["APPROVED"] = "APPROVED";
    ReturnStatus["AWAITING_RECEIPT"] = "AWAITING_RECEIPT";
    ReturnStatus["RECEIVED"] = "RECEIVED";
    ReturnStatus["INSPECTING"] = "INSPECTING";
    ReturnStatus["PROCESSING_REFUND"] = "PROCESSING_REFUND";
    ReturnStatus["COMPLETED"] = "COMPLETED";
    ReturnStatus["REJECTED"] = "REJECTED";
    ReturnStatus["CANCELLED"] = "CANCELLED";
    ReturnStatus["CLOSED"] = "CLOSED";
    ReturnStatus["REOPENED"] = "REOPENED";
})(ReturnStatus = exports.ReturnStatus || (exports.ReturnStatus = {}));
var ReturnReason;
(function (ReturnReason) {
    ReturnReason["WRONG_ITEM"] = "wrong_item";
    ReturnReason["DEFECTIVE"] = "defective";
    ReturnReason["NOT_AS_DESCRIBED"] = "not_as_described";
    ReturnReason["DAMAGED_IN_SHIPPING"] = "damaged_in_shipping";
    ReturnReason["SIZE_FIT_ISSUE"] = "size_fit_issue";
    ReturnReason["QUALITY_ISSUE"] = "quality_issue";
    ReturnReason["ARRIVED_LATE"] = "arrived_late";
    ReturnReason["CHANGED_MIND"] = "changed_mind";
    ReturnReason["OTHER"] = "other";
})(ReturnReason = exports.ReturnReason || (exports.ReturnReason = {}));
var ReturnCondition;
(function (ReturnCondition) {
    ReturnCondition["NEW"] = "new";
    ReturnCondition["LIKE_NEW"] = "like_new";
    ReturnCondition["USED"] = "used";
    ReturnCondition["DAMAGED"] = "damaged";
    ReturnCondition["UNSALVAGEABLE"] = "unsalvageable";
})(ReturnCondition = exports.ReturnCondition || (exports.ReturnCondition = {}));
var RefundMethod;
(function (RefundMethod) {
    RefundMethod["ORIGINAL_PAYMENT"] = "original_payment";
    RefundMethod["STORE_CREDIT"] = "store_credit";
    RefundMethod["BANK_TRANSFER"] = "bank_transfer";
    RefundMethod["GIFT_CARD"] = "gift_card";
})(RefundMethod = exports.RefundMethod || (exports.RefundMethod = {}));
// Custom Error Classes
class ReturnNotFoundError extends Error {
    constructor(returnId) {
        super(`Return with ID ${returnId} not found`);
        this.name = 'ReturnNotFoundError';
    }
}
exports.ReturnNotFoundError = ReturnNotFoundError;
class ReturnValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ReturnValidationError';
    }
}
exports.ReturnValidationError = ReturnValidationError;
class ReturnStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ReturnStateError';
    }
}
exports.ReturnStateError = ReturnStateError;
// Main Returns Class
class Returns {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List returns with optional filtering
     * @param params - Filtering parameters
     * @returns Array of ReturnResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.customer_id)
            queryParams.append('customer_id', params.customer_id);
        if (params === null || params === void 0 ? void 0 : params.order_id)
            queryParams.append('order_id', params.order_id);
        if (params === null || params === void 0 ? void 0 : params.date_from)
            queryParams.append('date_from', params.date_from.toISOString());
        if (params === null || params === void 0 ? void 0 : params.date_to)
            queryParams.append('date_to', params.date_to.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `returns?${queryParams.toString()}`);
        return response.returns;
    }
    /**
     * Get specific return by ID
     * @param returnId - Return ID
     * @returns ReturnResponse object
     */
    async get(returnId) {
        try {
            const response = await this.stateset.request('GET', `returns/${returnId}`);
            return response.return;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            throw error;
        }
    }
    /**
     * Create new return request
     * @param returnData - ReturnData object
     * @returns ReturnResponse object
     */
    async create(returnData) {
        // Validate return items
        if (!returnData.items.length) {
            throw new ReturnValidationError('At least one return item is required');
        }
        for (const item of returnData.items) {
            if (item.quantity <= 0) {
                throw new ReturnValidationError('Item quantity must be greater than 0');
            }
            if (item.refund_amount < 0) {
                throw new ReturnValidationError('Refund amount cannot be negative');
            }
        }
        const response = await this.stateset.request('POST', 'returns', returnData);
        return response.return;
    }
    /**
     * Update return request
     * @param returnId - Return ID
     * @param returnData - Partial<ReturnData> object
     * @returns ReturnResponse object
     */
    async update(returnId, returnData) {
        try {
            const response = await this.stateset.request('PUT', `returns/${returnId}`, returnData);
            return response.return;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            throw error;
        }
    }
    /**
     * Process return status changes
     * @param returnId - Return ID
     * @param approvalData - Approval data object
     * @returns ApprovedReturnResponse object
     */
    async approve(returnId, approvalData) {
        const response = await this.stateset.request('POST', `returns/${returnId}/approve`, approvalData);
        return response.return;
    }
    /**
     * Mark return as received
     * @param returnId - Return ID
     * @param receiptData - Receipt data object
     * @returns ReceivedReturnResponse object
     */
    async markReceived(returnId, receiptData) {
        const response = await this.stateset.request('POST', `returns/${returnId}/receive`, receiptData);
        return response.return;
    }
    /**
     * Submit return inspection
     * @param returnId - Return ID
     * @param inspection - QualityInspection object
     * @returns InspectingReturnResponse object
     */
    async submitInspection(returnId, inspection) {
        const response = await this.stateset.request('POST', `returns/${returnId}/inspect`, inspection);
        return response.return;
    }
    /**
     * Process return refund
     * @param returnId - Return ID
     * @param refundDetails - RefundDetails object
     * @returns CompletedReturnResponse object
     */
    async processRefund(returnId, refundDetails) {
        const response = await this.stateset.request('POST', `returns/${returnId}/refund`, refundDetails);
        return response.return;
    }
    /**
     * Reject return
     * @param returnId - Return ID
     * @param rejectionData - Rejection data object
     * @returns RejectedReturnResponse object
     */
    async reject(returnId, rejectionData) {
        const response = await this.stateset.request('POST', `returns/${returnId}/reject`, rejectionData);
        return response.return;
    }
    /**
     * Generate shipping label
     * @param returnId - Return ID
     * @param shippingData - Shipping data object
     * @returns ShippingLabel object
     */
    async generateShippingLabel(returnId, shippingData) {
        const response = await this.stateset.request('POST', `returns/${returnId}/generate-label`, shippingData);
        return response.shipping_label;
    }
    /**
     * Get return metrics
     * @param params - Filtering parameters
     * @returns Metrics object
     */
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `returns/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
}
exports.default = Returns;
