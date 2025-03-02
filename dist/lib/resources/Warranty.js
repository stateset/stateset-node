"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warranty = exports.WarrantyOperationError = exports.WarrantyValidationError = exports.WarrantyNotFoundError = exports.WarrantyError = exports.WarrantyType = exports.WarrantyStatus = void 0;
// Enums
var WarrantyStatus;
(function (WarrantyStatus) {
    WarrantyStatus["PENDING"] = "PENDING";
    WarrantyStatus["APPROVED"] = "APPROVED";
    WarrantyStatus["REJECTED"] = "REJECTED";
    WarrantyStatus["CANCELLED"] = "CANCELLED";
    WarrantyStatus["CLOSED"] = "CLOSED";
    WarrantyStatus["REOPENED"] = "REOPENED";
})(WarrantyStatus = exports.WarrantyStatus || (exports.WarrantyStatus = {}));
var WarrantyType;
(function (WarrantyType) {
    WarrantyType["MANUFACTURER"] = "MANUFACTURER";
    WarrantyType["EXTENDED"] = "EXTENDED";
    WarrantyType["THIRD_PARTY"] = "THIRD_PARTY";
})(WarrantyType = exports.WarrantyType || (exports.WarrantyType = {}));
// Error Classes
class WarrantyError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.WarrantyError = WarrantyError;
class WarrantyNotFoundError extends WarrantyError {
    constructor(warrantyId) {
        super(`Warranty with ID ${warrantyId} not found`, { warrantyId });
    }
}
exports.WarrantyNotFoundError = WarrantyNotFoundError;
class WarrantyValidationError extends WarrantyError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.WarrantyValidationError = WarrantyValidationError;
class WarrantyOperationError extends WarrantyError {
    constructor(message, operation) {
        super(message);
        this.operation = operation;
    }
}
exports.WarrantyOperationError = WarrantyOperationError;
// Main Warranty Class
class Warranty {
    constructor(client) {
        this.client = client;
    }
    validateWarrantyData(data) {
        var _a, _b;
        if (!data.customer_id)
            throw new WarrantyValidationError('Customer ID is required');
        if (!data.order_id)
            throw new WarrantyValidationError('Order ID is required');
        if (!((_a = data.items) === null || _a === void 0 ? void 0 : _a.length))
            throw new WarrantyValidationError('At least one item is required');
        if (!((_b = data.coverage) === null || _b === void 0 ? void 0 : _b.duration_months)) {
            throw new WarrantyValidationError('Warranty duration is required');
        }
        data.items.forEach((item, index) => {
            if (!item.warranty_start || !item.warranty_end) {
                throw new WarrantyValidationError(`Item[${index}] must have warranty dates`);
            }
        });
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id) || !data.status) {
            throw new WarrantyError('Invalid response format');
        }
        const baseResponse = {
            id: data.id,
            object: 'warranty',
            status: data.status,
            data: data.data || data,
        };
        switch (data.status) {
            case WarrantyStatus.PENDING:
                return { ...baseResponse, status: WarrantyStatus.PENDING, pending_details: { submitted_at: data.created_at } };
            case WarrantyStatus.APPROVED:
                return { ...baseResponse, status: WarrantyStatus.APPROVED, approved_at: data.updated_at };
            case WarrantyStatus.REJECTED:
                return { ...baseResponse, status: WarrantyStatus.REJECTED, rejection_reason: data.rejection_reason || 'Not specified' };
            case WarrantyStatus.CANCELLED:
                return { ...baseResponse, status: WarrantyStatus.CANCELLED, cancellation_reason: data.cancellation_reason };
            case WarrantyStatus.CLOSED:
                return { ...baseResponse, status: WarrantyStatus.CLOSED, closed_at: data.updated_at };
            case WarrantyStatus.REOPENED:
                return { ...baseResponse, status: WarrantyStatus.REOPENED, reopened_reason: data.reopened_reason || 'Not specified' };
            default:
                throw new WarrantyError(`Unexpected warranty status: ${data.status}`);
        }
    }
    async list(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.customer_id && { customer_id: params.customer_id }),
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        const response = await this.client.request('GET', `warranties?${query}`);
        return {
            warranties: response.warranties.map(this.mapResponse),
            pagination: response.pagination,
        };
    }
    async get(warrantyId) {
        try {
            const response = await this.client.request('GET', `warranties/${warrantyId}`);
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'get', warrantyId);
        }
    }
    async create(data) {
        this.validateWarrantyData(data);
        try {
            const response = await this.client.request('POST', 'warranties', data);
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async approve(warrantyId, reason) {
        try {
            const response = await this.client.request('POST', `warranties/approve/${warrantyId}`, { reason });
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'approve', warrantyId);
        }
    }
    async reject(warrantyId, reason) {
        try {
            const response = await this.client.request('POST', `warranties/reject/${warrantyId}`, { reason });
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'reject', warrantyId);
        }
    }
    async cancel(warrantyId, reason) {
        try {
            const response = await this.client.request('POST', `warranties/cancel/${warrantyId}`, { reason });
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'cancel', warrantyId);
        }
    }
    async close(warrantyId) {
        try {
            const response = await this.client.request('POST', `warranties/close/${warrantyId}`);
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'close', warrantyId);
        }
    }
    async reopen(warrantyId, reason) {
        try {
            const response = await this.client.request('POST', `warranties/reopen/${warrantyId}`, { reason });
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'reopen', warrantyId);
        }
    }
    async update(warrantyId, data) {
        try {
            const response = await this.client.request('PUT', `warranties/${warrantyId}`, data);
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'update', warrantyId);
        }
    }
    async delete(warrantyId) {
        try {
            await this.client.request('DELETE', `warranties/${warrantyId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', warrantyId);
        }
    }
    async addClaim(warrantyId, claimData) {
        try {
            const response = await this.client.request('POST', `warranties/${warrantyId}/claims`, claimData);
            return this.mapResponse(response.warranty);
        }
        catch (error) {
            throw this.handleError(error, 'addClaim', warrantyId);
        }
    }
    async getMetrics(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
        });
        const response = await this.client.request('GET', `warranties/metrics?${query}`);
        return response.metrics;
    }
    handleError(error, operation, warrantyId) {
        if (error.status === 404)
            throw new WarrantyNotFoundError(warrantyId || 'unknown');
        if (error.status === 400)
            throw new WarrantyValidationError(error.message, error.errors);
        throw new WarrantyOperationError(`Failed to ${operation} warranty: ${error.message}`, operation);
    }
}
exports.Warranty = Warranty;
exports.default = Warranty;
