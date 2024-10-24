"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryValidationError = exports.InsufficientInventoryError = exports.InventoryNotFoundError = exports.AdjustmentType = exports.LocationType = exports.InventoryStatus = void 0;
// Enums for inventory management
var InventoryStatus;
(function (InventoryStatus) {
    InventoryStatus["IN_STOCK"] = "in_stock";
    InventoryStatus["LOW_STOCK"] = "low_stock";
    InventoryStatus["OUT_OF_STOCK"] = "out_of_stock";
    InventoryStatus["RESERVED"] = "reserved";
    InventoryStatus["DAMAGED"] = "damaged";
})(InventoryStatus = exports.InventoryStatus || (exports.InventoryStatus = {}));
var LocationType;
(function (LocationType) {
    LocationType["WAREHOUSE"] = "warehouse";
    LocationType["STORE"] = "store";
    LocationType["TRANSIT"] = "transit";
    LocationType["SUPPLIER"] = "supplier";
    LocationType["CUSTOMER"] = "customer";
})(LocationType = exports.LocationType || (exports.LocationType = {}));
var AdjustmentType;
(function (AdjustmentType) {
    AdjustmentType["RECEIPT"] = "receipt";
    AdjustmentType["SHIPMENT"] = "shipment";
    AdjustmentType["RETURN"] = "return";
    AdjustmentType["DAMAGE"] = "damage";
    AdjustmentType["LOSS"] = "loss";
    AdjustmentType["ADJUSTMENT"] = "adjustment";
    AdjustmentType["CYCLE_COUNT"] = "cycle_count";
})(AdjustmentType = exports.AdjustmentType || (exports.AdjustmentType = {}));
// Custom Error Classes
class InventoryNotFoundError extends Error {
    constructor(inventoryId) {
        super(`Inventory with ID ${inventoryId} not found`);
        this.name = 'InventoryNotFoundError';
    }
}
exports.InventoryNotFoundError = InventoryNotFoundError;
class InsufficientInventoryError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InsufficientInventoryError';
    }
}
exports.InsufficientInventoryError = InsufficientInventoryError;
class InventoryValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InventoryValidationError';
    }
}
exports.InventoryValidationError = InventoryValidationError;
// Main Inventory Class
class Inventory {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Validates inventory quantities and thresholds
     */
    validateInventoryData(data) {
        if (data.quantity !== undefined && data.quantity < 0) {
            throw new InventoryValidationError('Quantity cannot be negative');
        }
        if (data.minimum_quantity !== undefined && data.maximum_quantity !== undefined) {
            if (data.minimum_quantity > data.maximum_quantity) {
                throw new InventoryValidationError('Minimum quantity cannot be greater than maximum quantity');
            }
        }
        if (data.reorder_point !== undefined && data.reorder_quantity !== undefined) {
            if (data.reorder_point > data.reorder_quantity) {
                throw new InventoryValidationError('Reorder point cannot be greater than reorder quantity');
            }
        }
    }
    /**
     * List inventory with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.location_type)
            queryParams.append('location_type', params.location_type);
        if ((params === null || params === void 0 ? void 0 : params.low_stock) !== undefined)
            queryParams.append('low_stock', params.low_stock.toString());
        if (params === null || params === void 0 ? void 0 : params.expiring_before)
            queryParams.append('expiring_before', params.expiring_before.toISOString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `inventory?${queryParams.toString()}`);
        return response.inventory;
    }
    /**
     * Get specific inventory by ID
     */
    async get(inventoryId) {
        try {
            const response = await this.stateset.request('GET', `inventory/${inventoryId}`);
            return response.inventory;
        }
        catch (error) {
            if (error.status === 404) {
                throw new InventoryNotFoundError(inventoryId);
            }
            throw error;
        }
    }
    /**
     * Create new inventory
     */
    async create(inventoryData) {
        this.validateInventoryData(inventoryData);
        const response = await this.stateset.request('POST', 'inventory', inventoryData);
        return response.inventory;
    }
    /**
     * Update existing inventory
     */
    async update(inventoryId, inventoryData) {
        this.validateInventoryData(inventoryData);
        try {
            const response = await this.stateset.request('PUT', `inventory/${inventoryId}`, inventoryData);
            return response.inventory;
        }
        catch (error) {
            if (error.status === 404) {
                throw new InventoryNotFoundError(inventoryId);
            }
            throw error;
        }
    }
    /**
     * Delete inventory
     */
    async delete(inventoryId) {
        try {
            await this.stateset.request('DELETE', `inventory/${inventoryId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new InventoryNotFoundError(inventoryId);
            }
            throw error;
        }
    }
    /**
     * Adjust inventory quantity
     */
    async adjustQuantity(inventoryId, adjustment) {
        if (adjustment.quantity === 0) {
            throw new InventoryValidationError('Adjustment quantity cannot be zero');
        }
        try {
            const response = await this.stateset.request('POST', `inventory/${inventoryId}/adjust`, adjustment);
            return response.inventory;
        }
        catch (error) {
            if (error.status === 400 && error.code === 'INSUFFICIENT_QUANTITY') {
                throw new InsufficientInventoryError(error.message);
            }
            throw error;
        }
    }
    /**
     * Transfer inventory between locations
     */
    async transfer(transfer) {
        if (transfer.quantity <= 0) {
            throw new InventoryValidationError('Transfer quantity must be positive');
        }
        const response = await this.stateset.request('POST', 'inventory/transfer', transfer);
        return {
            source: response.source_inventory,
            destination: response.destination_inventory,
            transfer_id: response.transfer_id
        };
    }
    /**
     * Get inventory history
     */
    async getHistory(inventoryId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.action_type)
            queryParams.append('action_type', params.action_type);
        if (params === null || params === void 0 ? void 0 : params.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `inventory/${inventoryId}/history?${queryParams.toString()}`);
        return response.history;
    }
    /**
     * Reserve inventory
     */
    async reserve(inventoryId, quantity, params = {}) {
        const response = await this.stateset.request('POST', `inventory/${inventoryId}/reserve`, {
            quantity,
            ...params
        });
        return response.inventory;
    }
    /**
     * Release reserved inventory
     */
    async releaseReservation(inventoryId, reservationId) {
        const response = await this.stateset.request('POST', `inventory/${inventoryId}/release-reservation/${reservationId}`);
        return response.inventory;
    }
    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params === null || params === void 0 ? void 0 : params.location_type)
            queryParams.append('location_type', params.location_type);
        const response = await this.stateset.request('GET', `inventory/low-stock-alerts?${queryParams.toString()}`);
        return response.alerts;
    }
}
exports.default = Inventory;
