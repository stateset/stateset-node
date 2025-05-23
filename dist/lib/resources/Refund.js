"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundValidationError = exports.RefundNotFoundError = exports.RefundError = exports.RefundReason = exports.RefundStatus = void 0;
// Enums
var RefundStatus;
(function (RefundStatus) {
    RefundStatus["PENDING"] = "PENDING";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["PROCESSED"] = "PROCESSED";
    RefundStatus["REJECTED"] = "REJECTED";
    RefundStatus["CANCELLED"] = "CANCELLED";
})(RefundStatus = exports.RefundStatus || (exports.RefundStatus = {}));
var RefundReason;
(function (RefundReason) {
    RefundReason["RETURN"] = "RETURN";
    RefundReason["CANCELLATION"] = "CANCELLATION";
    RefundReason["DEFECTIVE"] = "DEFECTIVE";
    RefundReason["OTHER"] = "OTHER";
})(RefundReason = exports.RefundReason || (exports.RefundReason = {}));
// Error Classes
class RefundError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'RefundError';
    }
}
exports.RefundError = RefundError;
class RefundNotFoundError extends RefundError {
    constructor(refundId) {
        super(`Refund with ID ${refundId} not found`, { refundId });
    }
}
exports.RefundNotFoundError = RefundNotFoundError;
class RefundValidationError extends RefundError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.RefundValidationError = RefundValidationError;
class Refunds {
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateRefundData(data) {
        if (!data.payment_id)
            throw new RefundValidationError('Payment ID is required');
        if (data.amount <= 0)
            throw new RefundValidationError('Amount must be greater than 0');
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new RefundError('Invalid response format');
        return {
            id: data.id,
            object: 'refund',
            data: {
                payment_id: data.payment_id,
                return_id: data.return_id,
                order_id: data.order_id,
                status: data.status,
                reason: data.reason,
                amount: data.amount,
                currency: data.currency,
                refund_date: data.refund_date,
                notes: data.notes,
                created_at: data.created_at,
                updated_at: data.updated_at,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.payment_id)
                queryParams.append('payment_id', params.payment_id);
            if (params.return_id)
                queryParams.append('return_id', params.return_id);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
        }
        try {
            const response = await this.stateset.request('GET', `refunds?${queryParams.toString()}`);
            return {
                refunds: response.refunds.map(this.mapResponse),
                pagination: {
                    total: response.total || response.refunds.length,
                    limit: (params === null || params === void 0 ? void 0 : params.limit) || 100,
                    offset: (params === null || params === void 0 ? void 0 : params.offset) || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(refundId) {
        try {
            const response = await this.stateset.request('GET', `refunds/${refundId}`);
            return this.mapResponse(response.refund);
        }
        catch (error) {
            throw this.handleError(error, 'get', refundId);
        }
    }
    async create(data) {
        this.validateRefundData(data);
        try {
            const response = await this.stateset.request('POST', 'refunds', data);
            return this.mapResponse(response.refund);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(refundId, data) {
        try {
            const response = await this.stateset.request('PUT', `refunds/${refundId}`, data);
            return this.mapResponse(response.refund);
        }
        catch (error) {
            throw this.handleError(error, 'update', refundId);
        }
    }
    async delete(refundId) {
        try {
            await this.stateset.request('DELETE', `refunds/${refundId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', refundId);
        }
    }
    async processRefund(refundId, refundDate) {
        try {
            const response = await this.stateset.request('POST', `refunds/${refundId}/process`, { refund_date: refundDate });
            return this.mapResponse(response.refund);
        }
        catch (error) {
            throw this.handleError(error, 'processRefund', refundId);
        }
    }
    handleError(error, operation, refundId) {
        if (error.status === 404)
            throw new RefundNotFoundError(refundId || 'unknown');
        if (error.status === 400)
            throw new RefundValidationError(error.message, error.errors);
        throw new RefundError(`Failed to ${operation} refund: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Refunds;
