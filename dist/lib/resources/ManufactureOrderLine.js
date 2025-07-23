"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManufactureOrderLineValidationError = exports.ManufactureOrderLineNotFoundError = exports.ManufactureOrderLineError = exports.ManufactureOrderLineType = exports.ManufactureOrderLineStatus = void 0;
// Enums
var ManufactureOrderLineStatus;
(function (ManufactureOrderLineStatus) {
    ManufactureOrderLineStatus["PLANNED"] = "PLANNED";
    ManufactureOrderLineStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ManufactureOrderLineStatus["COMPLETED"] = "COMPLETED";
    ManufactureOrderLineStatus["ON_HOLD"] = "ON_HOLD";
    ManufactureOrderLineStatus["CANCELLED"] = "CANCELLED";
    ManufactureOrderLineStatus["FAILED"] = "FAILED";
})(ManufactureOrderLineStatus || (exports.ManufactureOrderLineStatus = ManufactureOrderLineStatus = {}));
var ManufactureOrderLineType;
(function (ManufactureOrderLineType) {
    ManufactureOrderLineType["RAW_MATERIAL"] = "RAW_MATERIAL";
    ManufactureOrderLineType["COMPONENT"] = "COMPONENT";
    ManufactureOrderLineType["FINISHED_GOOD"] = "FINISHED_GOOD";
    ManufactureOrderLineType["BYPRODUCT"] = "BYPRODUCT";
    ManufactureOrderLineType["SCRAP"] = "SCRAP";
})(ManufactureOrderLineType || (exports.ManufactureOrderLineType = ManufactureOrderLineType = {}));
// Custom Error Classes
class ManufactureOrderLineError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ManufactureOrderLineError';
    }
}
exports.ManufactureOrderLineError = ManufactureOrderLineError;
class ManufactureOrderLineNotFoundError extends ManufactureOrderLineError {
    constructor(manufactureOrderLineId) {
        super(`Manufacture order line with ID ${manufactureOrderLineId} not found`, { manufactureOrderLineId });
    }
}
exports.ManufactureOrderLineNotFoundError = ManufactureOrderLineNotFoundError;
class ManufactureOrderLineValidationError extends ManufactureOrderLineError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ManufactureOrderLineValidationError = ManufactureOrderLineValidationError;
// Main ManufactureOrderLines Class
class ManufactureOrderLines {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateManufactureOrderLineData(data) {
        if (!data.manufacture_order_id) {
            throw new ManufactureOrderLineValidationError('Manufacture order ID is required');
        }
        if (!data.item?.item_id) {
            throw new ManufactureOrderLineValidationError('Item ID is required');
        }
        if (!data.item?.quantity || data.item.quantity <= 0) {
            throw new ManufactureOrderLineValidationError('Quantity must be greater than 0');
        }
        if (data.cost_details.estimated_cost < 0) {
            throw new ManufactureOrderLineValidationError('Estimated cost cannot be negative');
        }
    }
    mapResponse(data) {
        if (!data?.id || !data.manufacture_order_id) {
            throw new ManufactureOrderLineError('Invalid response format');
        }
        return {
            id: data.id,
            object: 'manufacture_order_line',
            data: {
                manufacture_order_id: data.manufacture_order_id,
                type: data.type,
                status: data.status,
                item: data.item,
                work_center_id: data.work_center_id,
                production: data.production,
                material_requirements: data.material_requirements,
                quality_check: data.quality_check,
                cost_details: data.cost_details,
                created_at: data.created_at,
                updated_at: data.updated_at,
                status_history: data.status_history || [],
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.manufacture_order_id)
                queryParams.append('manufacture_order_id', params.manufacture_order_id);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.type)
                queryParams.append('type', params.type);
            if (params.work_center_id)
                queryParams.append('work_center_id', params.work_center_id);
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
            const response = await this.stateset.request('GET', `manufacture_order_line_items?${queryParams.toString()}`);
            return {
                manufacture_order_lines: response.manufacture_order_lines.map(this.mapResponse),
                pagination: {
                    total: response.total || response.manufacture_order_lines.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(manufactureOrderLineId) {
        try {
            const response = await this.stateset.request('GET', `manufacture_order_line_items/${manufactureOrderLineId}`);
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'get', manufactureOrderLineId);
        }
    }
    async create(data) {
        this.validateManufactureOrderLineData(data);
        try {
            const response = await this.stateset.request('POST', 'manufacture_order_line_items', data);
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(manufactureOrderLineId, data) {
        try {
            const response = await this.stateset.request('PUT', `manufacture_order_line_items/${manufactureOrderLineId}`, data);
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'update', manufactureOrderLineId);
        }
    }
    async delete(manufactureOrderLineId) {
        try {
            await this.stateset.request('DELETE', `manufacture_order_line_items/${manufactureOrderLineId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', manufactureOrderLineId);
        }
    }
    async updateStatus(manufactureOrderLineId, status, reason) {
        try {
            const response = await this.stateset.request('PUT', `manufacture_order_line_items/${manufactureOrderLineId}/status`, { status, reason });
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'updateStatus', manufactureOrderLineId);
        }
    }
    async recordProduction(manufactureOrderLineId, productionData) {
        try {
            const response = await this.stateset.request('POST', `manufacture_order_line_items/${manufactureOrderLineId}/production`, productionData);
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'recordProduction', manufactureOrderLineId);
        }
    }
    async submitQualityCheck(manufactureOrderLineId, qualityCheckData) {
        try {
            const response = await this.stateset.request('POST', `manufacture_order_line_items/${manufactureOrderLineId}/quality-check`, qualityCheckData);
            return this.mapResponse(response.manufacture_order_line);
        }
        catch (error) {
            throw this.handleError(error, 'submitQualityCheck', manufactureOrderLineId);
        }
    }
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.manufacture_order_id)
                queryParams.append('manufacture_order_id', params.manufacture_order_id);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
        }
        try {
            const response = await this.stateset.request('GET', `manufacture_order_line_items/metrics?${queryParams.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, manufactureOrderLineId) {
        if (error.status === 404)
            throw new ManufactureOrderLineNotFoundError(manufactureOrderLineId || 'unknown');
        if (error.status === 400)
            throw new ManufactureOrderLineValidationError(error.message, error.errors);
        throw new ManufactureOrderLineError(`Failed to ${operation} manufacture order line: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = ManufactureOrderLines;
//# sourceMappingURL=ManufactureOrderLine.js.map