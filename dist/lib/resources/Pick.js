"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickOperationError = exports.PickValidationError = exports.PickNotFoundError = exports.PickMethod = exports.PickPriority = exports.PickType = exports.PickStatus = void 0;
// Enums for pick management
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
})(PickStatus = exports.PickStatus || (exports.PickStatus = {}));
var PickType;
(function (PickType) {
    PickType["SINGLE_ORDER"] = "single_order";
    PickType["BATCH"] = "batch";
    PickType["ZONE"] = "zone";
    PickType["WAVE"] = "wave";
    PickType["CLUSTER"] = "cluster";
})(PickType = exports.PickType || (exports.PickType = {}));
var PickPriority;
(function (PickPriority) {
    PickPriority["URGENT"] = "urgent";
    PickPriority["HIGH"] = "high";
    PickPriority["NORMAL"] = "normal";
    PickPriority["LOW"] = "low";
})(PickPriority = exports.PickPriority || (exports.PickPriority = {}));
var PickMethod;
(function (PickMethod) {
    PickMethod["DISCRETE"] = "discrete";
    PickMethod["BATCH"] = "batch";
    PickMethod["ZONE"] = "zone";
    PickMethod["WAVE"] = "wave";
    PickMethod["CLUSTER"] = "cluster";
})(PickMethod = exports.PickMethod || (exports.PickMethod = {}));
// Custom Error Classes
class PickNotFoundError extends Error {
    constructor(pickId) {
        super(`Pick with ID ${pickId} not found`);
        this.name = 'PickNotFoundError';
    }
}
exports.PickNotFoundError = PickNotFoundError;
class PickValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PickValidationError';
    }
}
exports.PickValidationError = PickValidationError;
class PickOperationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PickOperationError';
    }
}
exports.PickOperationError = PickOperationError;
// Main Picks Class
class Picks {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List picks with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.priority)
            queryParams.append('priority', params.priority);
        if (params === null || params === void 0 ? void 0 : params.warehouse_id)
            queryParams.append('warehouse_id', params.warehouse_id);
        if (params === null || params === void 0 ? void 0 : params.picker_id)
            queryParams.append('picker_id', params.picker_id);
        if (params === null || params === void 0 ? void 0 : params.batch_id)
            queryParams.append('batch_id', params.batch_id);
        if (params === null || params === void 0 ? void 0 : params.wave_id)
            queryParams.append('wave_id', params.wave_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `picks?${queryParams.toString()}`);
        return response.picks;
    }
    /**
     * Get specific pick
     * @param pickId - Pick ID
     * @returns PickResponse object
     */
    async get(pickId) {
        try {
            const response = await this.stateset.request('GET', `picks/${pickId}`);
            return response.pick;
        }
        catch (error) {
            if (error.status === 404) {
                throw new PickNotFoundError(pickId);
            }
            throw error;
        }
    }
    /**
     * Create new pick
     * @param pickData - PickData object
     * @returns PickResponse object
     */
    async create(pickData) {
        this.validatePickData(pickData);
        try {
            const response = await this.stateset.request('POST', 'picks', pickData);
            return response.pick;
        }
        catch (error) {
            if (error.status === 400) {
                throw new PickValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update pick
     * @param pickId - Pick ID
     * @param pickData - Partial<PickData> object
     * @returns PickResponse object
     */
    async update(pickId, pickData) {
        try {
            const response = await this.stateset.request('PUT', `picks/${pickId}`, pickData);
            return response.pick;
        }
        catch (error) {
            if (error.status === 404) {
                throw new PickNotFoundError(pickId);
            }
            throw error;
        }
    }
    /**
     * Delete pick
     * @param pickId - Pick ID
     */
    async delete(pickId) {
        try {
            await this.stateset.request('DELETE', `picks/${pickId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new PickNotFoundError(pickId);
            }
            throw error;
        }
    }
    /**
     * Optimize pick route
     * @param pickId - Pick ID
     * @param params - Optional parameters
     * @returns PickRoute object
     */
    async optimizeRoute(pickId, params) {
        const response = await this.stateset.request('POST', `picks/${pickId}/optimize-route`, params);
        return response.route;
    }
    /**
     * Start pick operation
     * @param pickId - Pick ID
     * @param startData - Start data object
     * @returns PickResponse object
     */
    async start(pickId, startData) {
        const response = await this.stateset.request('POST', `picks/${pickId}/start`, startData);
        return response.pick;
    }
    /**
     * Record item pick
     * @param pickId - Pick ID
     * @param itemData - Item data object
     * @returns PickResponse object
     */
    async recordItemPick(pickId, itemData) {
        const response = await this.stateset.request('POST', `picks/${pickId}/items/${itemData.item_id}/pick`, itemData);
        return response.pick;
    }
    /**
     * Complete quality check
     * @param pickId - Pick ID
     * @param checkData - Quality check data object
     * @returns PickResponse object
     */
    async completeQualityCheck(pickId, checkData) {
        const response = await this.stateset.request('POST', `picks/${pickId}/quality-check`, checkData);
        return response.pick;
    }
    /**
     * Complete pick
     * @param pickId - Pick ID
     * @param completionData - Completion data object
     * @returns PickResponse object
     */
    async complete(pickId, completionData) {
        const response = await this.stateset.request('POST', `picks/${pickId}/complete`, completionData);
        return response.pick;
    }
    /**
     * Get pick metrics
     * @param pickId - Pick ID
     * @returns PickMetrics object
     */
    async getMetrics(pickId) {
        const response = await this.stateset.request('GET', `picks/${pickId}/metrics`);
        return response.metrics;
    }
    /**
     * Validate pick data
     * @param data - PickData object
     */
    validatePickData(data) {
        if (!data.warehouse_id) {
            throw new PickValidationError('Warehouse ID is required');
        }
        if (!data.items || data.items.length === 0) {
            throw new PickValidationError('At least one pick item is required');
        }
        if (data.type === PickType.BATCH && !data.batch_id) {
            throw new PickValidationError('Batch ID is required for batch picks');
        }
        if (data.type === PickType.WAVE && !data.wave_id) {
            throw new PickValidationError('Wave ID is required for wave picks');
        }
        for (const item of data.items) {
            if (item.quantity_requested <= 0) {
                throw new PickValidationError('Item quantity must be greater than 0');
            }
            if (!item.location) {
                throw new PickValidationError('Item location is required');
            }
        }
    }
}
exports.default = Picks;
