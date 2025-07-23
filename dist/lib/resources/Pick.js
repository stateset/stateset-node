"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Picks = exports.PickOperationError = exports.PickValidationError = exports.PickNotFoundError = exports.PickError = exports.PickMethod = exports.PickPriority = exports.PickType = exports.PickStatus = void 0;
// Enums with consistent naming
var PickStatus;
(function (PickStatus) {
    PickStatus["DRAFT"] = "DRAFT";
    PickStatus["PENDING"] = "PENDING";
    PickStatus["ASSIGNED"] = "ASSIGNED";
    PickStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PickStatus["ON_HOLD"] = "ON_HOLD";
    PickStatus["QUALITY_CHECK"] = "QUALITY_CHECK";
    PickStatus["COMPLETED"] = "COMPLETED";
    PickStatus["CANCELLED"] = "CANCELLED";
})(PickStatus || (exports.PickStatus = PickStatus = {}));
var PickType;
(function (PickType) {
    PickType["SINGLE_ORDER"] = "SINGLE_ORDER";
    PickType["BATCH"] = "BATCH";
    PickType["ZONE"] = "ZONE";
    PickType["WAVE"] = "WAVE";
    PickType["CLUSTER"] = "CLUSTER";
})(PickType || (exports.PickType = PickType = {}));
var PickPriority;
(function (PickPriority) {
    PickPriority["URGENT"] = "URGENT";
    PickPriority["HIGH"] = "HIGH";
    PickPriority["NORMAL"] = "NORMAL";
    PickPriority["LOW"] = "LOW";
})(PickPriority || (exports.PickPriority = PickPriority = {}));
var PickMethod;
(function (PickMethod) {
    PickMethod["DISCRETE"] = "DISCRETE";
    PickMethod["BATCH"] = "BATCH";
    PickMethod["ZONE"] = "ZONE";
    PickMethod["WAVE"] = "WAVE";
    PickMethod["CLUSTER"] = "CLUSTER";
})(PickMethod || (exports.PickMethod = PickMethod = {}));
// Error Classes
class PickError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.PickError = PickError;
class PickNotFoundError extends PickError {
    constructor(pickId) {
        super(`Pick with ID ${pickId} not found`, { pickId });
    }
}
exports.PickNotFoundError = PickNotFoundError;
class PickValidationError extends PickError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.PickValidationError = PickValidationError;
class PickOperationError extends PickError {
    operation;
    constructor(message, operation) {
        super(message);
        this.operation = operation;
    }
}
exports.PickOperationError = PickOperationError;
// Main Picks Class
class Picks {
    client;
    constructor(client) {
        this.client = client;
    }
    validatePickData(data) {
        if (!data.warehouse_id)
            throw new PickValidationError('Warehouse ID is required');
        if (!data.items?.length)
            throw new PickValidationError('At least one pick item is required');
        if (data.type === PickType.BATCH && !data.grouping?.batch_id) {
            throw new PickValidationError('Batch ID required for batch picks');
        }
        if (data.type === PickType.WAVE && !data.grouping?.wave_id) {
            throw new PickValidationError('Wave ID required for wave picks');
        }
        data.items.forEach((item, index) => {
            if (item.quantity.requested <= 0) {
                throw new PickValidationError(`Item[${index}] quantity must be greater than 0`);
            }
            if (!item.location) {
                throw new PickValidationError(`Item[${index}] location is required`);
            }
        });
    }
    async list(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.priority && { priority: params.priority }),
            ...(params.warehouse_id && { warehouse_id: params.warehouse_id }),
            ...(params.picker_id && { picker_id: params.picker_id }),
            ...(params.batch_id && { batch_id: params.batch_id }),
            ...(params.wave_id && { wave_id: params.wave_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        const response = await this.client.request('GET', `picks?${query}`);
        return response;
    }
    async get(pickId) {
        try {
            const response = await this.client.request('GET', `picks/${pickId}`);
            return response.pick;
        }
        catch (error) {
            throw this.handleError(error, 'get', pickId);
        }
    }
    async create(data) {
        this.validatePickData(data);
        try {
            const response = await this.client.request('POST', 'picks', data);
            return response.pick;
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(pickId, data) {
        try {
            const response = await this.client.request('PUT', `picks/${pickId}`, data);
            return response.pick;
        }
        catch (error) {
            throw this.handleError(error, 'update', pickId);
        }
    }
    async delete(pickId) {
        try {
            await this.client.request('DELETE', `picks/${pickId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', pickId);
        }
    }
    async optimizeRoute(pickId, params = {}) {
        const response = await this.client.request('POST', `picks/${pickId}/optimize-route`, params);
        return response.route;
    }
    async start(pickId, data) {
        const response = await this.client.request('POST', `picks/${pickId}/start`, data);
        return response.pick;
    }
    async recordItemPick(pickId, itemData) {
        const response = await this.client.request('POST', `picks/${pickId}/items/${itemData.item_id}/pick`, itemData);
        return response.pick;
    }
    async completeQualityCheck(pickId, checkData) {
        const response = await this.client.request('POST', `picks/${pickId}/quality-check`, checkData);
        return response.pick;
    }
    async complete(pickId, data) {
        const response = await this.client.request('POST', `picks/${pickId}/complete`, data);
        return response.pick;
    }
    async getMetrics(pickId) {
        const response = await this.client.request('GET', `picks/${pickId}/metrics`);
        return response.metrics;
    }
    handleError(error, operation, pickId) {
        if (error.status === 404)
            throw new PickNotFoundError(pickId || 'unknown');
        if (error.status === 400)
            throw new PickValidationError(error.message, error.errors);
        throw new PickOperationError(`Failed to ${operation} pick: ${error.message}`, operation);
    }
}
exports.Picks = Picks;
exports.default = Picks;
//# sourceMappingURL=Pick.js.map