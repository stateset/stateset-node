"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarrantyLines = exports.WarrantyLineValidationError = exports.WarrantyLineNotFoundError = exports.WarrantyLineError = exports.WarrantyLineType = exports.WarrantyLineStatus = void 0;
// Enums
var WarrantyLineStatus;
(function (WarrantyLineStatus) {
    WarrantyLineStatus["PENDING"] = "PENDING";
    WarrantyLineStatus["APPROVED"] = "APPROVED";
    WarrantyLineStatus["REJECTED"] = "REJECTED";
    WarrantyLineStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WarrantyLineStatus["COMPLETED"] = "COMPLETED";
    WarrantyLineStatus["CANCELLED"] = "CANCELLED";
})(WarrantyLineStatus || (exports.WarrantyLineStatus = WarrantyLineStatus = {}));
var WarrantyLineType;
(function (WarrantyLineType) {
    WarrantyLineType["REPAIR"] = "REPAIR";
    WarrantyLineType["REPLACEMENT"] = "REPLACEMENT";
    WarrantyLineType["REFUND"] = "REFUND";
    WarrantyLineType["SERVICE"] = "SERVICE";
})(WarrantyLineType || (exports.WarrantyLineType = WarrantyLineType = {}));
// Error Classes
class WarrantyLineError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.WarrantyLineError = WarrantyLineError;
class WarrantyLineNotFoundError extends WarrantyLineError {
    constructor(warrantyLineId) {
        super(`Warranty line with ID ${warrantyLineId} not found`, { warrantyLineId });
    }
}
exports.WarrantyLineNotFoundError = WarrantyLineNotFoundError;
class WarrantyLineValidationError extends WarrantyLineError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.WarrantyLineValidationError = WarrantyLineValidationError;
// Main WarrantyLines Class
class WarrantyLines {
    client;
    constructor(client) {
        this.client = client;
    }
    validateWarrantyLineData(data) {
        if (!data.warranty_id) {
            throw new WarrantyLineValidationError('Warranty ID is required');
        }
        if (!data.item?.product_id) {
            throw new WarrantyLineValidationError('Product ID is required');
        }
        if (!data.item?.quantity || data.item.quantity <= 0) {
            throw new WarrantyLineValidationError('Valid quantity is required');
        }
        if (!data.claim_description) {
            throw new WarrantyLineValidationError('Claim description is required');
        }
    }
    mapResponse(data) {
        if (!data?.id || !data.warranty_id) {
            throw new WarrantyLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'warranty_line',
            data: {
                warranty_id: data.warranty_id,
                type: data.type,
                status: data.status,
                item: data.item,
                claim_description: data.claim_description,
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
            ...(params.warranty_id && { warranty_id: params.warranty_id }),
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.client.request('GET', `warranty_line_items?${query}`);
            return {
                warranty_lines: response.warranty_lines.map(this.mapResponse),
                pagination: response.pagination || { total: response.warranty_lines.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(warrantyLineId) {
        try {
            const response = await this.client.request('GET', `warranty_line_items/${warrantyLineId}`);
            return this.mapResponse(response.warranty_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', warrantyLineId);
        }
    }
    async create(data) {
        this.validateWarrantyLineData(data);
        try {
            const response = await this.client.request('POST', 'warranty_line_items', data);
            return this.mapResponse(response.warranty_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(warrantyLineId, data) {
        try {
            const response = await this.client.request('PUT', `warranty_line_items/${warrantyLineId}`, data);
            return this.mapResponse(response.warranty_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', warrantyLineId);
        }
    }
    async delete(warrantyLineId) {
        try {
            await this.client.request('DELETE', `warranty_line_items/${warrantyLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', warrantyLineId);
        }
    }
    async updateStatus(warrantyLineId, status, reason) {
        try {
            const response = await this.client.request('POST', `warranty_line_items/${warrantyLineId}/status`, { status, reason });
            return this.mapResponse(response.warranty_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', warrantyLineId);
        }
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.warranty_id && { warranty_id: params.warranty_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
        });
        try {
            const response = await this.client.request('GET', `warranty_line_items/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, warrantyLineId) {
        if (error.status === 404)
            throw new WarrantyLineNotFoundError(warrantyLineId || 'unknown');
        if (error.status === 400)
            throw new WarrantyLineValidationError(error.message, error.errors);
        throw new WarrantyLineError(`Failed to ${operation} warranty line: ${error.message}`, { operation, originalError: error });
    }
}
exports.WarrantyLines = WarrantyLines;
exports.default = WarrantyLines;
//# sourceMappingURL=WarrantyLine.js.map