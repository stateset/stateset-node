"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnApiError = exports.ReturnStateError = exports.ReturnValidationError = exports.ReturnNotFoundError = exports.DamageSeverity = exports.RecommendedAction = exports.RefundMethod = exports.ReturnCondition = exports.ReturnReason = exports.ReturnStatus = void 0;
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
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
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
})(ReturnReason || (exports.ReturnReason = ReturnReason = {}));
var ReturnCondition;
(function (ReturnCondition) {
    ReturnCondition["NEW"] = "new";
    ReturnCondition["LIKE_NEW"] = "like_new";
    ReturnCondition["USED"] = "used";
    ReturnCondition["DAMAGED"] = "damaged";
    ReturnCondition["UNSALVAGEABLE"] = "unsalvageable";
})(ReturnCondition || (exports.ReturnCondition = ReturnCondition = {}));
var RefundMethod;
(function (RefundMethod) {
    RefundMethod["ORIGINAL_PAYMENT"] = "original_payment";
    RefundMethod["STORE_CREDIT"] = "store_credit";
    RefundMethod["BANK_TRANSFER"] = "bank_transfer";
    RefundMethod["GIFT_CARD"] = "gift_card";
})(RefundMethod || (exports.RefundMethod = RefundMethod = {}));
var RecommendedAction;
(function (RecommendedAction) {
    RecommendedAction["REFURBISH"] = "refurbish";
    RecommendedAction["LIQUIDATE"] = "liquidate";
    RecommendedAction["DISPOSE"] = "dispose";
    RecommendedAction["RESTOCK"] = "restock";
})(RecommendedAction || (exports.RecommendedAction = RecommendedAction = {}));
var DamageSeverity;
(function (DamageSeverity) {
    DamageSeverity["MINOR"] = "minor";
    DamageSeverity["MODERATE"] = "moderate";
    DamageSeverity["SEVERE"] = "severe";
})(DamageSeverity || (exports.DamageSeverity = DamageSeverity = {}));
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
    constructor(currentState, requiredState) {
        const stateMessage = Array.isArray(requiredState)
            ? `one of [${requiredState.join(', ')}]`
            : requiredState;
        super(`Invalid state transition. Current state: ${currentState}, required state: ${stateMessage}`);
        this.name = 'ReturnStateError';
    }
}
exports.ReturnStateError = ReturnStateError;
class ReturnApiError extends Error {
    status;
    code;
    constructor(message, status, code) {
        super(message);
        this.name = 'ReturnApiError';
        this.status = status;
        this.code = code;
    }
}
exports.ReturnApiError = ReturnApiError;
// Default no-op logger
const defaultLogger = {
    debug: () => { },
    info: () => { },
    warn: () => { },
    error: () => { },
};
// Main Returns Class
class Returns {
    stateset;
    logger;
    constructor(stateset, options) {
        this.stateset = stateset;
        this.logger = options?.logger || defaultLogger;
    }
    /**
     * List returns with optional filtering
     * @param params - Filtering parameters
     * @returns Array of ReturnResponse objects and pagination data
     */
    async list(params) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status)
                queryParams.append('status', params.status);
            if (params?.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params?.order_id)
                queryParams.append('order_id', params.order_id);
            if (params?.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params?.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
            if (params?.org_id)
                queryParams.append('org_id', params.org_id);
            if (params?.limit)
                queryParams.append('limit', params.limit.toString());
            if (params?.offset)
                queryParams.append('offset', params.offset.toString());
            if (params?.sort_by)
                queryParams.append('sort_by', params.sort_by);
            if (params?.sort_order)
                queryParams.append('sort_order', params.sort_order);
            this.logger.debug('Listing returns', { params });
            const response = await this.stateset.request('GET', `returns?${queryParams.toString()}`);
            return {
                returns: response.returns,
                total_count: response.total_count,
                limit: response.limit,
                offset: response.offset,
            };
        }
        catch (error) {
            this.logger.error('Error listing returns', { error, params });
            this.handleApiError(error);
        }
    }
    /**
     * Get specific return by ID
     * @param returnId - Return ID
     * @returns ReturnResponse object
     */
    async get(returnId) {
        try {
            this.logger.debug('Getting return', { returnId });
            const response = await this.stateset.request('GET', `returns/${returnId}`);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error getting return', { error, returnId });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
        }
    }
    /**
     * Create new return request
     * @param returnData - ReturnData object
     * @returns ReturnResponse object
     */
    async create(returnData) {
        try {
            // Validate return items
            if (!returnData.items || !returnData.items.length) {
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
            this.logger.debug('Creating return', {
                order_id: returnData.order_id,
                customer_id: returnData.customer_id,
                item_count: returnData.items.length,
            });
            const response = await this.stateset.request('POST', 'returns', returnData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error creating return', {
                error,
                order_id: returnData.order_id,
                customer_id: returnData.customer_id,
            });
            this.handleApiError(error);
        }
    }
    /**
     * Update return request
     * @param returnId - Return ID
     * @param returnData - Partial<ReturnData> object
     * @returns ReturnResponse object
     */
    async update(returnId, returnData) {
        try {
            this.logger.debug('Updating return', { returnId });
            const response = await this.stateset.request('PUT', `returns/${returnId}`, returnData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error updating return', { error, returnId });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
        }
    }
    /**
     * Process return status changes
     * @param returnId - Return ID
     * @param approvalData - Approval data object
     * @returns ApprovedReturnResponse object
     */
    async approve(returnId, approvalData) {
        try {
            this.logger.debug('Approving return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/approve`, approvalData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error approving return', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Mark return as received
     * @param returnId - Return ID
     * @param receiptData - Receipt data object
     * @returns ReceivedReturnResponse object
     */
    async markReceived(returnId, receiptData) {
        try {
            this.logger.debug('Marking return as received', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/receive`, receiptData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error marking return as received', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Submit return inspection
     * @param returnId - Return ID
     * @param inspection - QualityInspection object
     * @returns InspectingReturnResponse object
     */
    async submitInspection(returnId, inspection) {
        try {
            this.logger.debug('Submitting inspection for return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/inspect`, inspection);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error submitting inspection', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Process return refund
     * @param returnId - Return ID
     * @param refundDetails - RefundDetails object
     * @returns CompletedReturnResponse object
     */
    async processRefund(returnId, refundDetails) {
        try {
            this.logger.debug('Processing refund for return', {
                returnId,
                method: refundDetails.method,
                amount: refundDetails.amount,
            });
            const response = await this.stateset.request('POST', `returns/${returnId}/refund`, refundDetails);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error processing refund', {
                error,
                returnId,
                method: refundDetails.method,
            });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Reject return
     * @param returnId - Return ID
     * @param rejectionData - Rejection data object
     * @returns RejectedReturnResponse object
     */
    async reject(returnId, rejectionData) {
        try {
            this.logger.debug('Rejecting return', { returnId, reason: rejectionData.reason });
            const response = await this.stateset.request('POST', `returns/${returnId}/reject`, rejectionData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error rejecting return', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Cancel a return
     * @param returnId - Return ID
     * @param cancellationData - Cancellation data object
     * @returns CancelledReturnResponse object
     */
    async cancel(returnId, cancellationData) {
        try {
            this.logger.debug('Cancelling return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/cancel`, cancellationData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error cancelling return', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Close a return
     * @param returnId - Return ID
     * @param closeData - Close data object
     * @returns ClosedReturnResponse object
     */
    async close(returnId, closeData) {
        try {
            this.logger.debug('Closing return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/close`, closeData || {});
            return response.return;
        }
        catch (error) {
            this.logger.error('Error closing return', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Reopen a closed or rejected return
     * @param returnId - Return ID
     * @param reopenData - Reopen data object
     * @returns ReopenedReturnResponse object
     */
    async reopen(returnId, reopenData) {
        try {
            this.logger.debug('Reopening return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/reopen`, reopenData);
            return response.return;
        }
        catch (error) {
            this.logger.error('Error reopening return', { error, returnId });
            this.handleStateTransitionError(error, returnId);
        }
    }
    /**
     * Generate shipping label
     * @param returnId - Return ID
     * @param shippingData - Shipping data object
     * @returns ShippingLabel object
     */
    async generateShippingLabel(returnId, shippingData) {
        try {
            this.logger.debug('Generating shipping label', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/generate-label`, shippingData || {});
            return response.shipping_label;
        }
        catch (error) {
            this.logger.error('Error generating shipping label', { error, returnId });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
        }
    }
    /**
     * Get return metrics
     * @param params - Filtering parameters
     * @returns ReturnMetrics object
     */
    async getMetrics(params) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.start_date)
                queryParams.append('start_date', params.start_date.toISOString());
            if (params?.end_date)
                queryParams.append('end_date', params.end_date.toISOString());
            if (params?.org_id)
                queryParams.append('org_id', params.org_id);
            if (params?.include_monthly_trends)
                queryParams.append('include_monthly_trends', params.include_monthly_trends.toString());
            if (params?.include_top_products)
                queryParams.append('include_top_products', params.include_top_products.toString());
            if (params?.product_limit)
                queryParams.append('product_limit', params.product_limit.toString());
            this.logger.debug('Getting return metrics', { params });
            const response = await this.stateset.request('GET', `returns/metrics?${queryParams.toString()}`);
            return response.metrics;
        }
        catch (error) {
            this.logger.error('Error getting metrics', { error });
            this.handleApiError(error);
        }
    }
    /**
     * Add a note to a return
     * @param returnId - Return ID
     * @param note - Note text
     * @returns ReturnResponse object
     */
    async addNote(returnId, note) {
        try {
            this.logger.debug('Adding note to return', { returnId });
            const response = await this.stateset.request('POST', `returns/${returnId}/notes`, { note });
            return response.return;
        }
        catch (error) {
            this.logger.error('Error adding note', { error, returnId });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
        }
    }
    /**
     * Export returns data
     * @param params - Filter parameters
     * @param format - Export format
     * @returns Buffer with export data
     */
    async exportData(params, format = 'csv') {
        try {
            const queryParams = new URLSearchParams();
            if (params?.status)
                queryParams.append('status', params.status);
            if (params?.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params?.order_id)
                queryParams.append('order_id', params.order_id);
            if (params?.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params?.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
            if (params?.org_id)
                queryParams.append('org_id', params.org_id);
            queryParams.append('format', format);
            this.logger.debug('Exporting returns data', { params, format });
            const response = await this.stateset.request('GET', `returns/export?${queryParams.toString()}`, { responseType: 'arraybuffer' });
            return Buffer.from(response);
        }
        catch (error) {
            this.logger.error('Error exporting data', { error });
            this.handleApiError(error);
        }
    }
    /**
     * Check if a transition to the target state is allowed
     * @param returnId - Return ID
     * @param targetState - Target state to check
     * @returns Boolean indicating if transition is allowed
     */
    async canTransitionTo(returnId, targetState) {
        try {
            this.logger.debug('Checking state transition', { returnId, targetState });
            const response = await this.stateset.request('GET', `returns/${returnId}/can-transition?target=${targetState}`);
            return response.can_transition;
        }
        catch (error) {
            this.logger.error('Error checking transition', { error, returnId, targetState });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
            return false;
        }
    }
    /**
     * Get return history
     * @param returnId - Return ID
     * @returns Array of history events
     */
    async getHistory(returnId) {
        try {
            this.logger.debug('Getting return history', { returnId });
            const response = await this.stateset.request('GET', `returns/${returnId}/history`);
            return response.history;
        }
        catch (error) {
            this.logger.error('Error getting history', { error, returnId });
            if (error.status === 404) {
                throw new ReturnNotFoundError(returnId);
            }
            this.handleApiError(error);
        }
    }
    // Helper method to handle API errors
    handleApiError(error) {
        if (error.status && error.message) {
            throw new ReturnApiError(error.message, error.status, error.code);
        }
        throw error;
    }
    // Helper method to handle state transition errors
    handleStateTransitionError(error, returnId) {
        if (error.status === 404) {
            throw new ReturnNotFoundError(returnId);
        }
        if (error.status === 400 && error.message?.includes('Invalid state transition')) {
            const currentState = error.data?.current_state;
            const requiredState = error.data?.required_state;
            if (currentState && requiredState) {
                throw new ReturnStateError(currentState, requiredState);
            }
        }
        this.handleApiError(error);
    }
}
exports.default = Returns;
//# sourceMappingURL=Return.js.map