"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentLine = exports.ShipmentLineValidationError = exports.ShipmentLineNotFoundError = exports.ShipmentLineError = exports.ShipmentLineType = exports.ShipmentLineStatus = void 0;
// Enums
var ShipmentLineStatus;
(function (ShipmentLineStatus) {
    ShipmentLineStatus["PENDING"] = "PENDING";
    ShipmentLineStatus["PACKED"] = "PACKED";
    ShipmentLineStatus["SHIPPED"] = "SHIPPED";
    ShipmentLineStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentLineStatus["DELIVERED"] = "DELIVERED";
    ShipmentLineStatus["CANCELLED"] = "CANCELLED";
    ShipmentLineStatus["RETURNED"] = "RETURNED";
})(ShipmentLineStatus || (exports.ShipmentLineStatus = ShipmentLineStatus = {}));
var ShipmentLineType;
(function (ShipmentLineType) {
    ShipmentLineType["PRODUCT"] = "PRODUCT";
    ShipmentLineType["SERVICE"] = "SERVICE";
    ShipmentLineType["DOCUMENT"] = "DOCUMENT";
    ShipmentLineType["SAMPLE"] = "SAMPLE";
})(ShipmentLineType || (exports.ShipmentLineType = ShipmentLineType = {}));
// Error Classes
class ShipmentLineError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.ShipmentLineError = ShipmentLineError;
class ShipmentLineNotFoundError extends ShipmentLineError {
    constructor(shipmentLineId) {
        super(`Shipment line with ID ${shipmentLineId} not found`, { shipmentLineId });
    }
}
exports.ShipmentLineNotFoundError = ShipmentLineNotFoundError;
class ShipmentLineValidationError extends ShipmentLineError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ShipmentLineValidationError = ShipmentLineValidationError;
// Main ShipmentLine Class
class ShipmentLine {
    client;
    constructor(client) {
        this.client = client;
    }
    validateShipmentLineData(data) {
        if (!data.shipment_id) {
            throw new ShipmentLineValidationError('Shipment ID is required');
        }
        if (!data.item?.item_id) {
            throw new ShipmentLineValidationError('Item ID is required');
        }
        if (!data.item?.quantity || data.item.quantity <= 0) {
            throw new ShipmentLineValidationError('Valid quantity is required');
        }
        if (data.item.weight.value < 0) {
            throw new ShipmentLineValidationError('Weight cannot be negative');
        }
    }
    mapResponse(data) {
        if (!data?.id || !data.shipment_id) {
            throw new ShipmentLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'shipment_line',
            data: {
                shipment_id: data.shipment_id,
                order_line_id: data.order_line_id,
                type: data.type,
                status: data.status,
                item: data.item,
                tracking: data.tracking,
                package_id: data.package_id,
                customs_info: data.customs_info,
                status_history: data.status_history || [],
                created_at: data.created_at,
                updated_at: data.updated_at,
                delivered_at: data.delivered_at,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params = {}) {
        const query = new URLSearchParams({
            ...(params.shipment_id && { shipment_id: params.shipment_id }),
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.order_line_id && { order_line_id: params.order_line_id }),
            ...(params.package_id && { package_id: params.package_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.client.request('GET', `shipment_line_items?${query}`);
            return {
                shipment_lines: response.shipment_lines.map(this.mapResponse),
                pagination: response.pagination || {
                    total: response.shipment_lines.length,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(shipmentLineId) {
        try {
            const response = await this.client.request('GET', `shipment_line_items/${shipmentLineId}`);
            return this.mapResponse(response.shipment_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', shipmentLineId);
        }
    }
    async create(data) {
        this.validateShipmentLineData(data);
        try {
            const response = await this.client.request('POST', 'shipment_line_items', data);
            return this.mapResponse(response.shipment_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(shipmentLineId, data) {
        try {
            const response = await this.client.request('PUT', `shipment_line_items/${shipmentLineId}`, data);
            return this.mapResponse(response.shipment_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', shipmentLineId);
        }
    }
    async delete(shipmentLineId) {
        try {
            await this.client.request('DELETE', `shipment_line_items/${shipmentLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', shipmentLineId);
        }
    }
    async updateStatus(shipmentLineId, status, reason) {
        try {
            const response = await this.client.request('POST', `shipment_line_items/${shipmentLineId}/status`, { status, reason });
            return this.mapResponse(response.shipment_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', shipmentLineId);
        }
    }
    async updateTracking(shipmentLineId, trackingData) {
        try {
            const response = await this.client.request('POST', `shipment_line_items/${shipmentLineId}/tracking`, trackingData);
            return this.mapResponse(response.shipment_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateTracking', shipmentLineId);
        }
    }
    async getMetrics(params = {}) {
        const query = new URLSearchParams({
            ...(params.shipment_id && { shipment_id: params.shipment_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
        });
        try {
            const response = await this.client.request('GET', `shipment_line_items/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, shipmentLineId) {
        if (error.status === 404)
            throw new ShipmentLineNotFoundError(shipmentLineId || 'unknown');
        if (error.status === 400)
            throw new ShipmentLineValidationError(error.message, error.errors);
        throw new ShipmentLineError(`Failed to ${operation} shipment line: ${error.message}`, {
            operation,
            originalError: error,
        });
    }
}
exports.ShipmentLine = ShipmentLine;
exports.default = ShipmentLine;
//# sourceMappingURL=ShipmentLine.js.map