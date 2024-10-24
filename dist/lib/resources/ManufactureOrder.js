"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialRequirementError = exports.ManufacturerOrderStateError = exports.ManufacturerOrderNotFoundError = exports.QualityCheckStatus = exports.ProductionPriority = exports.ManufacturerOrderStatus = void 0;
// Enums for manufacturing management
var ManufacturerOrderStatus;
(function (ManufacturerOrderStatus) {
    ManufacturerOrderStatus["DRAFT"] = "DRAFT";
    ManufacturerOrderStatus["SUBMITTED"] = "SUBMITTED";
    ManufacturerOrderStatus["IN_PRODUCTION"] = "IN_PRODUCTION";
    ManufacturerOrderStatus["QUALITY_CHECK"] = "QUALITY_CHECK";
    ManufacturerOrderStatus["COMPLETED"] = "COMPLETED";
    ManufacturerOrderStatus["CANCELLED"] = "CANCELLED";
    ManufacturerOrderStatus["ON_HOLD"] = "ON_HOLD";
})(ManufacturerOrderStatus = exports.ManufacturerOrderStatus || (exports.ManufacturerOrderStatus = {}));
var ProductionPriority;
(function (ProductionPriority) {
    ProductionPriority["URGENT"] = "urgent";
    ProductionPriority["HIGH"] = "high";
    ProductionPriority["NORMAL"] = "normal";
    ProductionPriority["LOW"] = "low";
})(ProductionPriority = exports.ProductionPriority || (exports.ProductionPriority = {}));
var QualityCheckStatus;
(function (QualityCheckStatus) {
    QualityCheckStatus["PENDING"] = "pending";
    QualityCheckStatus["PASSED"] = "passed";
    QualityCheckStatus["FAILED"] = "failed";
    QualityCheckStatus["CONDITIONAL"] = "conditional";
})(QualityCheckStatus = exports.QualityCheckStatus || (exports.QualityCheckStatus = {}));
// Custom Error Classes
class ManufacturerOrderNotFoundError extends Error {
    constructor(orderId) {
        super(`Manufacturer order with ID ${orderId} not found`);
        this.name = 'ManufacturerOrderNotFoundError';
    }
}
exports.ManufacturerOrderNotFoundError = ManufacturerOrderNotFoundError;
class ManufacturerOrderStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ManufacturerOrderStateError';
    }
}
exports.ManufacturerOrderStateError = ManufacturerOrderStateError;
class MaterialRequirementError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MaterialRequirementError';
    }
}
exports.MaterialRequirementError = MaterialRequirementError;
// Main ManufacturerOrders Class
class ManufacturerOrders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List manufacturer orders with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.manufacturer_id)
            queryParams.append('manufacturer_id', params.manufacturer_id);
        if (params === null || params === void 0 ? void 0 : params.product_id)
            queryParams.append('product_id', params.product_id);
        if (params === null || params === void 0 ? void 0 : params.priority)
            queryParams.append('priority', params.priority);
        if (params === null || params === void 0 ? void 0 : params.from_date)
            queryParams.append('from_date', params.from_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.to_date)
            queryParams.append('to_date', params.to_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `manufacturerorders?${queryParams.toString()}`);
        return response.orders;
    }
    /**
     * Get specific manufacturer order by ID
     */
    async get(orderId) {
        try {
            const response = await this.stateset.request('GET', `manufacturerorders/${orderId}`);
            return response.order;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ManufacturerOrderNotFoundError(orderId);
            }
            throw error;
        }
    }
    /**
     * Create new manufacturer order
     */
    async create(orderData) {
        // Validate material requirements
        for (const material of orderData.material_requirements) {
            if (material.quantity <= 0) {
                throw new MaterialRequirementError(`Invalid quantity ${material.quantity} for material ${material.material_id}`);
            }
        }
        const response = await this.stateset.request('POST', 'manufacturerorders', orderData);
        return response.order;
    }
    /**
     * Update existing manufacturer order
     */
    async update(orderId, orderData) {
        try {
            const response = await this.stateset.request('PUT', `manufacturerorders/${orderId}`, orderData);
            return response.order;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ManufacturerOrderNotFoundError(orderId);
            }
            throw error;
        }
    }
    /**
     * Delete manufacturer order
     */
    async delete(orderId) {
        try {
            await this.stateset.request('DELETE', `manufacturerorders/${orderId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ManufacturerOrderNotFoundError(orderId);
            }
            throw error;
        }
    }
    /**
     * Status management methods
     */
    async submit(orderId) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/submit`);
        return response.order;
    }
    async startProduction(orderId, startData) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/start-production`, startData);
        return response.order;
    }
    async submitQualityCheck(orderId, qualityData) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/quality-check`, qualityData);
        return response.order;
    }
    async complete(orderId, completionData) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/complete`, completionData);
        return response.order;
    }
    async cancel(orderId, cancellationData) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/cancel`, cancellationData);
        return response.order;
    }
    /**
     * Production management methods
     */
    async updateProductionStatus(orderId, update) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/production-status`, update);
        return response.order;
    }
    async getProductionHistory(orderId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.from_date)
            queryParams.append('from_date', params.from_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.to_date)
            queryParams.append('to_date', params.to_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.stage)
            queryParams.append('stage', params.stage);
        const response = await this.stateset.request('GET', `manufacturerorders/${orderId}/production-history?${queryParams.toString()}`);
        return response.history;
    }
    /**
     * Cost tracking methods
     */
    async updateCosts(orderId, costs) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/costs`, costs);
        return response.order;
    }
    /**
     * Material management methods
     */
    async allocateMaterials(orderId, materialAllocations) {
        const response = await this.stateset.request('POST', `manufacturerorders/${orderId}/allocate-materials`, { allocations: materialAllocations });
        return response.order;
    }
}
exports.default = ManufacturerOrders;
