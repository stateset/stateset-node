"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnLines = exports.ReturnLineValidationError = exports.ReturnLineNotFoundError = exports.ReturnLineError = exports.ReturnReason = exports.ReturnLineStatus = void 0;
// Enums
var ReturnLineStatus;
(function (ReturnLineStatus) {
    ReturnLineStatus["PENDING"] = "PENDING";
    ReturnLineStatus["RECEIVED"] = "RECEIVED";
    ReturnLineStatus["INSPECTED"] = "INSPECTED";
    ReturnLineStatus["APPROVED"] = "APPROVED";
    ReturnLineStatus["REJECTED"] = "REJECTED";
    ReturnLineStatus["PROCESSED"] = "PROCESSED";
    ReturnLineStatus["CANCELLED"] = "CANCELLED";
})(ReturnLineStatus || (exports.ReturnLineStatus = ReturnLineStatus = {}));
var ReturnReason;
(function (ReturnReason) {
    ReturnReason["DEFECTIVE"] = "DEFECTIVE";
    ReturnReason["WRONG_ITEM"] = "WRONG_ITEM";
    ReturnReason["NOT_AS_DESCRIBED"] = "NOT_AS_DESCRIBED";
    ReturnReason["CHANGED_MIND"] = "CHANGED_MIND";
    ReturnReason["DAMAGED"] = "DAMAGED";
    ReturnReason["OTHER"] = "OTHER";
})(ReturnReason || (exports.ReturnReason = ReturnReason = {}));
// Error Classes
class ReturnLineError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.ReturnLineError = ReturnLineError;
class ReturnLineNotFoundError extends ReturnLineError {
    constructor(returnLineId) {
        super(`Return line with ID ${returnLineId} not found`, { returnLineId });
    }
}
exports.ReturnLineNotFoundError = ReturnLineNotFoundError;
class ReturnLineValidationError extends ReturnLineError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ReturnLineValidationError = ReturnLineValidationError;
// Main ReturnLines Class
class ReturnLines {
    client;
    constructor(client) {
        this.client = client;
    }
    validateReturnLineData(data) {
        if (!data.return_id) {
            throw new ReturnLineValidationError('Return ID is required');
        }
        if (!data.order_id) {
            throw new ReturnLineValidationError('Order ID is required');
        }
        if (!data.item?.product_id) {
            throw new ReturnLineValidationError('Product ID is required');
        }
        if (!data.item?.quantity || data.item.quantity <= 0) {
            throw new ReturnLineValidationError('Valid quantity is required');
        }
        if (!data.reason) {
            throw new ReturnLineValidationError('Return reason is required');
        }
    }
    mapResponse(data) {
        if (!data?.id || !data.return_id) {
            throw new ReturnLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'return_line',
            data: {
                return_id: data.return_id,
                order_id: data.order_id,
                item: data.item,
                reason: data.reason,
                status: data.status,
                requested_action: data.requested_action,
                customer_notes: data.customer_notes,
                inspection: data.inspection,
                resolution: data.resolution,
                created_at: data.created_at,
                updated_at: data.updated_at,
                status_history: data.status_history || [],
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params = {}) {
        const query = new URLSearchParams({
            ...(params.return_id && { return_id: params.return_id }),
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.status && { status: params.status }),
            ...(params.reason && { reason: params.reason }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.client.request('GET', `return_line_items?${query}`);
            return {
                return_lines: response.return_lines.map(this.mapResponse),
                pagination: response.pagination || {
                    total: response.return_lines.length,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(returnLineId) {
        try {
            const response = await this.client.request('GET', `return_line_items/${returnLineId}`);
            return this.mapResponse(response.return_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', returnLineId);
        }
    }
    async create(data) {
        this.validateReturnLineData(data);
        try {
            const response = await this.client.request('POST', 'return_line_items', data);
            return this.mapResponse(response.return_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(returnLineId, data) {
        try {
            const response = await this.client.request('PUT', `return_line_items/${returnLineId}`, data);
            return this.mapResponse(response.return_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', returnLineId);
        }
    }
    async delete(returnLineId) {
        try {
            await this.client.request('DELETE', `return_line_items/${returnLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', returnLineId);
        }
    }
    async updateStatus(returnLineId, status, reason) {
        try {
            const response = await this.client.request('POST', `return_line_items/${returnLineId}/status`, { status, reason });
            return this.mapResponse(response.return_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', returnLineId);
        }
    }
    async recordInspection(returnLineId, inspectionData) {
        try {
            const response = await this.client.request('POST', `return_line_items/${returnLineId}/inspection`, inspectionData);
            return this.mapResponse(response.return_line);
        }
        catch (error) {
            throw this.handleError(error, 'recordInspection', returnLineId);
        }
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.return_id && { return_id: params.return_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
        });
        try {
            const response = await this.client.request('GET', `return_line_items/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, returnLineId) {
        if (error.status === 404)
            throw new ReturnLineNotFoundError(returnLineId || 'unknown');
        if (error.status === 400)
            throw new ReturnLineValidationError(error.message, error.errors);
        throw new ReturnLineError(`Failed to ${operation} return line: ${error.message}`, {
            operation,
            originalError: error,
        });
    }
}
exports.ReturnLines = ReturnLines;
exports.default = ReturnLines;
//# sourceMappingURL=ReturnLine.js.map