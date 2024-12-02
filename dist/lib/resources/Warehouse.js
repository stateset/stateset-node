"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryOperationError = exports.WarehouseValidationError = exports.WarehouseNotFoundError = exports.StorageType = exports.ZoneType = exports.WarehouseStatus = void 0;
// Enums for warehouse management
var WarehouseStatus;
(function (WarehouseStatus) {
    WarehouseStatus["ACTIVE"] = "ACTIVE";
    WarehouseStatus["INACTIVE"] = "INACTIVE";
    WarehouseStatus["MAINTENANCE"] = "MAINTENANCE";
    WarehouseStatus["CLOSED"] = "CLOSED";
    WarehouseStatus["OVER_CAPACITY"] = "OVER_CAPACITY";
    WarehouseStatus["RESTRICTED"] = "RESTRICTED";
})(WarehouseStatus = exports.WarehouseStatus || (exports.WarehouseStatus = {}));
var ZoneType;
(function (ZoneType) {
    ZoneType["RECEIVING"] = "receiving";
    ZoneType["STORAGE"] = "storage";
    ZoneType["PICKING"] = "picking";
    ZoneType["PACKING"] = "packing";
    ZoneType["SHIPPING"] = "shipping";
    ZoneType["RETURNS"] = "returns";
    ZoneType["HAZMAT"] = "hazmat";
    ZoneType["TEMPERATURE_CONTROLLED"] = "temperature_controlled";
    ZoneType["QUARANTINE"] = "quarantine";
})(ZoneType = exports.ZoneType || (exports.ZoneType = {}));
var StorageType;
(function (StorageType) {
    StorageType["PALLET_RACK"] = "pallet_rack";
    StorageType["FLOW_RACK"] = "flow_rack";
    StorageType["BULK_STORAGE"] = "bulk_storage";
    StorageType["BIN_SHELVING"] = "bin_shelving";
    StorageType["DRIVE_IN_RACK"] = "drive_in_rack";
    StorageType["AUTOMATED_STORAGE"] = "automated_storage";
})(StorageType = exports.StorageType || (exports.StorageType = {}));
// Custom Error Classes
class WarehouseNotFoundError extends Error {
    constructor(warehouseId) {
        super(`Warehouse with ID ${warehouseId} not found`);
        this.name = 'WarehouseNotFoundError';
    }
}
exports.WarehouseNotFoundError = WarehouseNotFoundError;
class WarehouseValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WarehouseValidationError';
    }
}
exports.WarehouseValidationError = WarehouseValidationError;
class InventoryOperationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InventoryOperationError';
    }
}
exports.InventoryOperationError = InventoryOperationError;
// Main Warehouses Class
class Warehouses {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List warehouses with optional filtering
     * @param params - Filtering parameters
     * @returns Array of WarehouseResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.country)
            queryParams.append('country', params.country);
        if (params === null || params === void 0 ? void 0 : params.state)
            queryParams.append('state', params.state);
        if (params === null || params === void 0 ? void 0 : params.specialization)
            queryParams.append('specialization', params.specialization);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `warehouses?${queryParams.toString()}`);
        return response.warehouses;
    }
    /**
     * Get specific warehouse
     * @param warehouseId - Warehouse ID
     * @returns WarehouseResponse object
     */
    async get(warehouseId) {
        try {
            const response = await this.stateset.request('GET', `warehouses/${warehouseId}`);
            return response.warehouse;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WarehouseNotFoundError(warehouseId);
            }
            throw error;
        }
    }
    /**
     * Create new warehouse
     * @param warehouseData - WarehouseData object
     * @returns WarehouseResponse object
     */
    async create(warehouseData) {
        this.validateWarehouseData(warehouseData);
        try {
            const response = await this.stateset.request('POST', 'warehouses', warehouseData);
            return response.warehouse;
        }
        catch (error) {
            if (error.status === 400) {
                throw new WarehouseValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update warehouse
     * @param warehouseId - Warehouse ID
     * @param warehouseData - Partial<WarehouseData> object
     * @returns WarehouseResponse object
     */
    async update(warehouseId, warehouseData) {
        try {
            const response = await this.stateset.request('PUT', `warehouses/${warehouseId}`, warehouseData);
            return response.warehouse;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WarehouseNotFoundError(warehouseId);
            }
            throw error;
        }
    }
    /**
     * Delete warehouse
     * @param warehouseId - Warehouse ID
     */
    async delete(warehouseId) {
        try {
            await this.stateset.request('DELETE', `warehouses/${warehouseId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new WarehouseNotFoundError(warehouseId);
            }
            throw error;
        }
    }
    /**
     * Inventory management methods
     * @param warehouseId - Warehouse ID
     * @param params - Filtering parameters
     * @returns Array of InventoryItem objects
     */
    async getInventory(warehouseId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.zone_id)
            queryParams.append('zone_id', params.zone_id);
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if ((params === null || params === void 0 ? void 0 : params.below_reorder_point) !== undefined) {
            queryParams.append('below_reorder_point', params.below_reorder_point.toString());
        }
        const response = await this.stateset.request('GET', `warehouses/${warehouseId}/inventory?${queryParams.toString()}`);
        return response.inventory;
    }
    /**
     * Zone management methods
     * @param warehouseId - Warehouse ID
     * @param zoneData - Zone object
     * @returns WarehouseResponse object
     */
    async addZone(warehouseId, zoneData) {
        const response = await this.stateset.request('POST', `warehouses/${warehouseId}/zones`, zoneData);
        return response.warehouse;
    }
    /**
     * Equipment management methods
     * @param warehouseId - Warehouse ID
     * @param equipmentId - Equipment ID
     * @param status - Equipment status
     * @returns Equipment object
     */
    async updateEquipmentStatus(warehouseId, equipmentId, status) {
        const response = await this.stateset.request('PUT', `warehouses/${warehouseId}/equipment/${equipmentId}/status`, { status });
        return response.equipment;
    }
    /**
     * Staff management methods
     * @param warehouseId - Warehouse ID
     * @param staffId - Staff ID
     * @param zoneId - Zone ID
     * @returns StaffMember object
     */
    async assignStaffToZone(warehouseId, staffId, zoneId) {
        const response = await this.stateset.request('POST', `warehouses/${warehouseId}/staff/${staffId}/assign`, { zone_id: zoneId });
        return response.staff_member;
    }
    /**
     * Metrics and reporting
     * @param warehouseId - Warehouse ID
     * @param params - Filtering parameters
     * @returns WarehouseMetrics object
     */
    async getMetrics(warehouseId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        const response = await this.stateset.request('GET', `warehouses/${warehouseId}/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
    /**
     * Validate warehouse data
     * @param data - WarehouseData object
     */
    validateWarehouseData(data) {
        if (!data.name) {
            throw new WarehouseValidationError('Warehouse name is required');
        }
        if (!data.location || !data.location.address) {
            throw new WarehouseValidationError('Warehouse location is required');
        }
        if (!data.total_capacity || !data.total_capacity.value) {
            throw new WarehouseValidationError('Warehouse capacity is required');
        }
        if (data.zones) {
            const zoneIds = new Set();
            for (const zone of data.zones) {
                if (zoneIds.has(zone.id)) {
                    throw new WarehouseValidationError(`Duplicate zone ID: ${zone.id}`);
                }
                zoneIds.add(zone.id);
            }
        }
    }
}
exports.default = Warehouses;
