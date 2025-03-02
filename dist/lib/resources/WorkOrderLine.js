"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrderLines = exports.WorkOrderLineValidationError = exports.WorkOrderLineNotFoundError = exports.WorkOrderLineError = exports.WorkOrderLineType = exports.WorkOrderLineStatus = void 0;
// Enums
var WorkOrderLineStatus;
(function (WorkOrderLineStatus) {
    WorkOrderLineStatus["PENDING"] = "PENDING";
    WorkOrderLineStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WorkOrderLineStatus["COMPLETED"] = "COMPLETED";
    WorkOrderLineStatus["CANCELLED"] = "CANCELLED";
    WorkOrderLineStatus["ON_HOLD"] = "ON_HOLD";
    WorkOrderLineStatus["FAILED"] = "FAILED";
})(WorkOrderLineStatus = exports.WorkOrderLineStatus || (exports.WorkOrderLineStatus = {}));
var WorkOrderLineType;
(function (WorkOrderLineType) {
    WorkOrderLineType["PART"] = "PART";
    WorkOrderLineType["LABOR"] = "LABOR";
    WorkOrderLineType["MATERIAL"] = "MATERIAL";
    WorkOrderLineType["SERVICE"] = "SERVICE";
    WorkOrderLineType["TOOL"] = "TOOL";
})(WorkOrderLineType = exports.WorkOrderLineType || (exports.WorkOrderLineType = {}));
// Error Classes
class WorkOrderLineError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.WorkOrderLineError = WorkOrderLineError;
class WorkOrderLineNotFoundError extends WorkOrderLineError {
    constructor(workOrderLineId) {
        super(`Work order line with ID ${workOrderLineId} not found`, { workOrderLineId });
    }
}
exports.WorkOrderLineNotFoundError = WorkOrderLineNotFoundError;
class WorkOrderLineValidationError extends WorkOrderLineError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.WorkOrderLineValidationError = WorkOrderLineValidationError;
// Main WorkOrderLines Class
class WorkOrderLines {
    constructor(client) {
        this.client = client;
    }
    validateWorkOrderLineData(data) {
        var _a, _b;
        if (!data.work_order_id) {
            throw new WorkOrderLineValidationError('Work order ID is required');
        }
        if (!((_a = data.item) === null || _a === void 0 ? void 0 : _a.item_id)) {
            throw new WorkOrderLineValidationError('Item ID is required');
        }
        if (!((_b = data.item) === null || _b === void 0 ? void 0 : _b.quantity) || data.item.quantity <= 0) {
            throw new WorkOrderLineValidationError('Valid quantity is required');
        }
        if (data.cost_details.estimated_cost < 0) {
            throw new WorkOrderLineValidationError('Estimated cost cannot be negative');
        }
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id) || !data.work_order_id) {
            throw new WorkOrderLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'work_order_line',
            data: {
                work_order_id: data.work_order_id,
                type: data.type,
                status: data.status,
                item: data.item,
                task_id: data.task_id,
                resource_id: data.resource_id,
                execution: data.execution,
                cost_details: data.cost_details,
                quality_check: data.quality_check,
                created_at: data.created_at,
                updated_at: data.updated_at,
                status_history: data.status_history || [],
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.work_order_id && { work_order_id: params.work_order_id }),
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.task_id && { task_id: params.task_id }),
            ...(params.resource_id && { resource_id: params.resource_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.client.request('GET', `work_order_line_items?${query}`);
            return {
                work_order_lines: response.work_order_lines.map(this.mapResponse),
                pagination: response.pagination || { total: response.work_order_lines.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(workOrderLineId) {
        try {
            const response = await this.client.request('GET', `work_order_line_items/${workOrderLineId}`);
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', workOrderLineId);
        }
    }
    async create(data) {
        this.validateWorkOrderLineData(data);
        try {
            const response = await this.client.request('POST', 'work_order_line_items', data);
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(workOrderLineId, data) {
        try {
            const response = await this.client.request('PUT', `work_order_line_items/${workOrderLineId}`, data);
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', workOrderLineId);
        }
    }
    async delete(workOrderLineId) {
        try {
            await this.client.request('DELETE', `work_order_line_items/${workOrderLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', workOrderLineId);
        }
    }
    async updateStatus(workOrderLineId, status, reason) {
        try {
            const response = await this.client.request('POST', `work_order_line_items/${workOrderLineId}/status`, { status, reason });
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', workOrderLineId);
        }
    }
    async recordExecution(workOrderLineId, executionData) {
        try {
            const response = await this.client.request('POST', `work_order_line_items/${workOrderLineId}/execution`, executionData);
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'recordExecution', workOrderLineId);
        }
    }
    async submitQualityCheck(workOrderLineId, qualityCheck) {
        try {
            const response = await this.client.request('POST', `work_order_line_items/${workOrderLineId}/quality-check`, qualityCheck);
            return this.mapResponse(response.work_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'submitQualityCheck', workOrderLineId);
        }
    }
    async getMetrics(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.work_order_id && { work_order_id: params.work_order_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
        });
        try {
            const response = await this.client.request('GET', `work_order_line_items/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, workOrderLineId) {
        if (error.status === 404)
            throw new WorkOrderLineNotFoundError(workOrderLineId || 'unknown');
        if (error.status === 400)
            throw new WorkOrderLineValidationError(error.message, error.errors);
        throw new WorkOrderLineError(`Failed to ${operation} work order line: ${error.message}`, { operation, originalError: error });
    }
}
exports.WorkOrderLines = WorkOrderLines;
exports.default = WorkOrderLines;
