"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManufacturerOrders = exports.MaterialRequirementError = exports.ManufacturerOrderStateError = exports.ManufacturerOrderNotFoundError = exports.ManufacturerOrderError = exports.QualityCheckStatus = exports.ProductionPriority = exports.ManufacturerOrderStatus = void 0;
// Constants
const DEFAULT_CURRENCY = 'USD';
// Enums
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
class ManufacturerOrderError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.ManufacturerOrderError = ManufacturerOrderError;
class ManufacturerOrderNotFoundError extends ManufacturerOrderError {
    constructor(orderId) {
        super(`Manufacturer order with ID ${orderId} not found`, 'ManufacturerOrderNotFoundError');
    }
}
exports.ManufacturerOrderNotFoundError = ManufacturerOrderNotFoundError;
class ManufacturerOrderStateError extends ManufacturerOrderError {
    constructor(message) {
        super(message, 'ManufacturerOrderStateError');
    }
}
exports.ManufacturerOrderStateError = ManufacturerOrderStateError;
class MaterialRequirementError extends ManufacturerOrderError {
    constructor(message) {
        super(message, 'MaterialRequirementError');
    }
}
exports.MaterialRequirementError = MaterialRequirementError;
// Utility Functions
const validateMaterials = (materials) => {
    materials.forEach(material => {
        if (material.quantity <= 0) {
            throw new MaterialRequirementError(`Invalid quantity ${material.quantity} for material ${material.material_id}`);
        }
    });
};
// Main ManufacturerOrders Class
class ManufacturerOrders {
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            return await this.client.request(method, path, data);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ManufacturerOrderNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new MaterialRequirementError(error.message);
            }
            throw error;
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `manufacturerorders?${queryParams.toString()}`);
    }
    async get(orderId) {
        return this.request('GET', `manufacturerorders/${orderId}`);
    }
    async create(orderData) {
        validateMaterials(orderData.material_requirements);
        return this.request('POST', 'manufacturerorders', {
            ...orderData,
            estimated_costs: orderData.estimated_costs && {
                ...orderData.estimated_costs,
                currency: orderData.estimated_costs.currency || DEFAULT_CURRENCY
            }
        });
    }
    async update(orderId, orderData) {
        if (orderData.material_requirements) {
            validateMaterials(orderData.material_requirements);
        }
        return this.request('PUT', `manufacturerorders/${orderId}`, orderData);
    }
    async delete(orderId) {
        await this.request('DELETE', `manufacturerorders/${orderId}`);
    }
    // Status Management
    async submit(orderId) {
        return this.request('POST', `manufacturerorders/${orderId}/submit`);
    }
    async startProduction(orderId, startData = {}) {
        return this.request('POST', `manufacturerorders/${orderId}/start-production`, startData);
    }
    async submitQualityCheck(orderId, qualityData) {
        return this.request('POST', `manufacturerorders/${orderId}/quality-check`, qualityData);
    }
    async complete(orderId, completionData) {
        return this.request('POST', `manufacturerorders/${orderId}/complete`, completionData);
    }
    async cancel(orderId, cancellationData) {
        return this.request('POST', `manufacturerorders/${orderId}/cancel`, cancellationData);
    }
    // Production Management
    async updateProductionStatus(orderId, update) {
        return this.request('POST', `manufacturerorders/${orderId}/production-status`, update);
    }
    async getProductionHistory(orderId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.from_date)
            queryParams.append('from_date', params.from_date.toISOString());
        if (params.to_date)
            queryParams.append('to_date', params.to_date.toISOString());
        if (params.stage)
            queryParams.append('stage', params.stage);
        return this.request('GET', `manufacturerorders/${orderId}/production-history?${queryParams.toString()}`);
    }
    // Cost Management
    async updateCosts(orderId, costs) {
        return this.request('POST', `manufacturerorders/${orderId}/costs`, {
            ...costs,
            currency: costs.currency || DEFAULT_CURRENCY
        });
    }
    // Material Management
    async allocateMaterials(orderId, materialAllocations) {
        return this.request('POST', `manufacturerorders/${orderId}/allocate-materials`, { allocations: materialAllocations });
    }
    // Metrics
    async getManufacturingMetrics(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.from_date)
            queryParams.append('from_date', params.from_date.toISOString());
        if (params.to_date)
            queryParams.append('to_date', params.to_date.toISOString());
        if (params.manufacturer_id)
            queryParams.append('manufacturer_id', params.manufacturer_id);
        if (params.org_id)
            queryParams.append('org_id', params.org_id);
        return this.request('GET', `manufacturerorders/metrics?${queryParams.toString()}`);
    }
}
exports.ManufacturerOrders = ManufacturerOrders;
exports.default = ManufacturerOrders;
