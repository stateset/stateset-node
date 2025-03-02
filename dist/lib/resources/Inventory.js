"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = exports.InventoryValidationError = exports.InsufficientInventoryError = exports.InventoryNotFoundError = exports.InventoryError = exports.AdjustmentType = exports.LocationType = exports.InventoryStatus = void 0;
// Enums
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
// Error Classes
class InventoryError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.InventoryError = InventoryError;
class InventoryNotFoundError extends InventoryError {
    constructor(inventoryId) {
        super(`Inventory with ID ${inventoryId} not found`, 'InventoryNotFoundError');
    }
}
exports.InventoryNotFoundError = InventoryNotFoundError;
class InsufficientInventoryError extends InventoryError {
    constructor(message) {
        super(message, 'InsufficientInventoryError');
    }
}
exports.InsufficientInventoryError = InsufficientInventoryError;
class InventoryValidationError extends InventoryError {
    constructor(message) {
        super(message, 'InventoryValidationError');
    }
}
exports.InventoryValidationError = InventoryValidationError;
// Main Inventory Class
class Inventory {
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            const response = await this.client.request(method, path, data);
            return response.inventory || response;
        }
        catch (error) {
            if (error.status === 404) {
                throw new InventoryNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                if (error.code === 'INSUFFICIENT_QUANTITY') {
                    throw new InsufficientInventoryError(error.message);
                }
                throw new InventoryValidationError(error.message);
            }
            throw error;
        }
    }
    validateInventoryData(data) {
        if (data.quantity !== undefined && data.quantity < 0) {
            throw new InventoryValidationError('Quantity cannot be negative');
        }
        if (data.minimum_quantity !== undefined && data.minimum_quantity < 0) {
            throw new InventoryValidationError('Minimum quantity cannot be negative');
        }
        if (data.maximum_quantity !== undefined && data.maximum_quantity < 0) {
            throw new InventoryValidationError('Maximum quantity cannot be negative');
        }
        if (data.reorder_point !== undefined && data.reorder_point < 0) {
            throw new InventoryValidationError('Reorder point cannot be negative');
        }
        if (data.reorder_quantity !== undefined && data.reorder_quantity < 0) {
            throw new InventoryValidationError('Reorder quantity cannot be negative');
        }
        if (data.unit_cost !== undefined && data.unit_cost < 0) {
            throw new InventoryValidationError('Unit cost cannot be negative');
        }
        if (data.unit_price !== undefined && data.unit_price < 0) {
            throw new InventoryValidationError('Unit price cannot be negative');
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `inventory?${queryParams.toString()}`);
    }
    async get(inventoryId) {
        return this.request('GET', `inventory/${inventoryId}`);
    }
    async create(inventoryData) {
        this.validateInventoryData(inventoryData);
        return this.request('POST', 'inventory', inventoryData);
    }
    async update(inventoryId, inventoryData) {
        this.validateInventoryData(inventoryData);
        return this.request('PUT', `inventory/${inventoryId}`, inventoryData);
    }
    async delete(inventoryId) {
        await this.request('DELETE', `inventory/${inventoryId}`);
    }
    async adjustQuantity(inventoryId, adjustment) {
        if (adjustment.quantity === 0) {
            throw new InventoryValidationError('Adjustment quantity cannot be zero');
        }
        return this.request('POST', `inventory/${inventoryId}/adjust`, adjustment);
    }
    async transfer(transfer) {
        if (transfer.quantity <= 0) {
            throw new InventoryValidationError('Transfer quantity must be positive');
        }
        return this.request('POST', 'inventory/transfer', transfer);
    }
    async getHistory(inventoryId, params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `inventory/${inventoryId}/history?${queryParams.toString()}`);
    }
    async reserve(inventoryId, quantity, params = {}) {
        if (quantity <= 0) {
            throw new InventoryValidationError('Reservation quantity must be positive');
        }
        return this.request('POST', `inventory/${inventoryId}/reserve`, { quantity, ...params });
    }
    async releaseReservation(inventoryId, reservationId) {
        return this.request('POST', `inventory/${inventoryId}/release-reservation/${reservationId}`);
    }
    async getLowStockAlerts(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined)
                queryParams.append(key, String(value));
        });
        return this.request('GET', `inventory/low-stock-alerts?${queryParams.toString()}`);
    }
    async getInventoryValue(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined)
                queryParams.append(key, String(value));
        });
        return this.request('GET', `inventory/value?${queryParams.toString()}`);
    }
    async bulkAdjust(adjustments) {
        if (!adjustments.length) {
            throw new InventoryValidationError('At least one adjustment is required');
        }
        adjustments.forEach(({ adjustment }) => {
            if (adjustment.quantity === 0) {
                throw new InventoryValidationError('Adjustment quantity cannot be zero');
            }
        });
        return this.request('POST', 'inventory/bulk-adjust', { adjustments });
    }
}
exports.Inventory = Inventory;
exports.default = Inventory;
