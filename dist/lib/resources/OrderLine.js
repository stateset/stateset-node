"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLines = exports.OrderLineValidationError = exports.OrderLineNotFoundError = exports.OrderLineError = exports.OrderLineType = exports.OrderLineStatus = void 0;
// Enums
var OrderLineStatus;
(function (OrderLineStatus) {
    OrderLineStatus["PENDING"] = "PENDING";
    OrderLineStatus["CONFIRMED"] = "CONFIRMED";
    OrderLineStatus["PROCESSING"] = "PROCESSING";
    OrderLineStatus["SHIPPED"] = "SHIPPED";
    OrderLineStatus["DELIVERED"] = "DELIVERED";
    OrderLineStatus["CANCELLED"] = "CANCELLED";
    OrderLineStatus["BACKORDERED"] = "BACKORDERED";
    OrderLineStatus["RETURNED"] = "RETURNED";
})(OrderLineStatus || (exports.OrderLineStatus = OrderLineStatus = {}));
var OrderLineType;
(function (OrderLineType) {
    OrderLineType["PRODUCT"] = "PRODUCT";
    OrderLineType["SERVICE"] = "SERVICE";
    OrderLineType["DIGITAL"] = "DIGITAL";
    OrderLineType["BUNDLE"] = "BUNDLE";
})(OrderLineType || (exports.OrderLineType = OrderLineType = {}));
// Error Classes
class OrderLineError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.OrderLineError = OrderLineError;
class OrderLineNotFoundError extends OrderLineError {
    constructor(orderLineId) {
        super(`Order line with ID ${orderLineId} not found`, { orderLineId });
    }
}
exports.OrderLineNotFoundError = OrderLineNotFoundError;
class OrderLineValidationError extends OrderLineError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.OrderLineValidationError = OrderLineValidationError;
// Main OrderLines Class
class OrderLines {
    client;
    constructor(client) {
        this.client = client;
    }
    validateOrderLineData(data) {
        if (!data.order_id) {
            throw new OrderLineValidationError('Order ID is required');
        }
        if (!data.item?.product_id) {
            throw new OrderLineValidationError('Product ID is required');
        }
        if (!data.item?.quantity || data.item.quantity <= 0) {
            throw new OrderLineValidationError('Valid quantity is required');
        }
        if (data.pricing.subtotal < 0 || data.pricing.total < 0) {
            throw new OrderLineValidationError('Pricing amounts cannot be negative');
        }
    }
    mapResponse(data) {
        if (!data?.id || !data.order_id) {
            throw new OrderLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'order_line',
            data: {
                order_id: data.order_id,
                type: data.type,
                status: data.status,
                item: data.item,
                fulfillment: data.fulfillment,
                pricing: data.pricing,
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
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.client.request('GET', `order_line_items?${query}`);
            return {
                order_lines: response.order_lines.map(this.mapResponse),
                pagination: response.pagination || { total: response.order_lines.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(orderLineId) {
        try {
            const response = await this.client.request('GET', `order_line_items/${orderLineId}`);
            return this.mapResponse(response.order_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', orderLineId);
        }
    }
    async create(data) {
        this.validateOrderLineData(data);
        try {
            const response = await this.client.request('POST', 'order_line_items', data);
            return this.mapResponse(response.order_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(orderLineId, data) {
        try {
            const response = await this.client.request('PUT', `order_line_items/${orderLineId}`, data);
            return this.mapResponse(response.order_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', orderLineId);
        }
    }
    async delete(orderLineId) {
        try {
            await this.client.request('DELETE', `order_line_items/${orderLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', orderLineId);
        }
    }
    async updateStatus(orderLineId, status, reason) {
        try {
            const response = await this.client.request('POST', `order_line_items/${orderLineId}/status`, { status, reason });
            return this.mapResponse(response.order_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', orderLineId);
        }
    }
    async updateFulfillment(orderLineId, fulfillmentData) {
        try {
            const response = await this.client.request('POST', `order_line_items/${orderLineId}/fulfillment`, fulfillmentData);
            return this.mapResponse(response.order_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateFulfillment', orderLineId);
        }
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
        });
        try {
            const response = await this.client.request('GET', `order_line_items/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, orderLineId) {
        if (error.status === 404)
            throw new OrderLineNotFoundError(orderLineId || 'unknown');
        if (error.status === 400)
            throw new OrderLineValidationError(error.message, error.errors);
        throw new OrderLineError(`Failed to ${operation} order line: ${error.message}`, { operation, originalError: error });
    }
}
exports.OrderLines = OrderLines;
exports.default = OrderLines;
//# sourceMappingURL=OrderLine.js.map