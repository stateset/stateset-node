"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineValidationError = exports.MachineStateError = exports.MachineNotFoundError = exports.MalfunctionSeverity = exports.MaintenanceType = exports.MachineStatus = void 0;
// Enums for machine management
var MachineStatus;
(function (MachineStatus) {
    MachineStatus["OPERATIONAL"] = "OPERATIONAL";
    MachineStatus["MAINTENANCE"] = "MAINTENANCE";
    MachineStatus["OFFLINE"] = "OFFLINE";
    MachineStatus["MALFUNCTION"] = "MALFUNCTION";
    MachineStatus["STANDBY"] = "STANDBY";
    MachineStatus["SETUP"] = "SETUP";
})(MachineStatus = exports.MachineStatus || (exports.MachineStatus = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["PREDICTIVE"] = "predictive";
    MaintenanceType["CONDITION_BASED"] = "condition_based";
    MaintenanceType["EMERGENCY"] = "emergency";
})(MaintenanceType = exports.MaintenanceType || (exports.MaintenanceType = {}));
var MalfunctionSeverity;
(function (MalfunctionSeverity) {
    MalfunctionSeverity["CRITICAL"] = "critical";
    MalfunctionSeverity["HIGH"] = "high";
    MalfunctionSeverity["MEDIUM"] = "medium";
    MalfunctionSeverity["LOW"] = "low";
})(MalfunctionSeverity = exports.MalfunctionSeverity || (exports.MalfunctionSeverity = {}));
// Custom Error Classes
class MachineNotFoundError extends Error {
    constructor(machineId) {
        super(`Machine with ID ${machineId} not found`);
        this.name = 'MachineNotFoundError';
    }
}
exports.MachineNotFoundError = MachineNotFoundError;
class MachineStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MachineStateError';
    }
}
exports.MachineStateError = MachineStateError;
class MachineValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MachineValidationError';
    }
}
exports.MachineValidationError = MachineValidationError;
// Main Machines Class
class Machines {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List machines with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.facility_id)
            queryParams.append('facility_id', params.facility_id);
        if (params === null || params === void 0 ? void 0 : params.manufacturer)
            queryParams.append('manufacturer', params.manufacturer);
        if ((params === null || params === void 0 ? void 0 : params.maintenance_due) !== undefined)
            queryParams.append('maintenance_due', params.maintenance_due.toString());
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `machines?${queryParams.toString()}`);
        return response.machines;
    }
    /**
     * Get specific machine by ID
     */
    async get(machineId) {
        try {
            const response = await this.stateset.request('GET', `machines/${machineId}`);
            return response.machine;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MachineNotFoundError(machineId);
            }
            throw error;
        }
    }
    /**
     * Create new machine
     */
    async create(machineData) {
        try {
            const response = await this.stateset.request('POST', 'machines', machineData);
            return response.machine;
        }
        catch (error) {
            if (error.status === 400) {
                throw new MachineValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing machine
     */
    async update(machineId, machineData) {
        try {
            const response = await this.stateset.request('PUT', `machines/${machineId}`, machineData);
            return response.machine;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MachineNotFoundError(machineId);
            }
            throw error;
        }
    }
    /**
     * Delete machine
     */
    async delete(machineId) {
        try {
            await this.stateset.request('DELETE', `machines/${machineId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new MachineNotFoundError(machineId);
            }
            throw error;
        }
    }
    /**
     * Log machine runtime
     */
    async logRuntime(machineId, data) {
        if (new Date(data.end_time) <= new Date(data.start_time)) {
            throw new MachineValidationError('End time must be after start time');
        }
        try {
            const response = await this.stateset.request('POST', `machines/${machineId}/runtime`, data);
            return response.machine;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MachineNotFoundError(machineId);
            }
            throw error;
        }
    }
    /**
     * Schedule maintenance
     */
    async scheduleMaintenance(machineId, data) {
        try {
            const response = await this.stateset.request('POST', `machines/${machineId}/maintenance`, data);
            return response.machine;
        }
        catch (error) {
            if (error.status === 409) {
                throw new MachineStateError('Machine is not available for maintenance');
            }
            throw error;
        }
    }
    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(machineId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.metrics)
            queryParams.append('metrics', params.metrics.join(','));
        return this.stateset.request('GET', `machines/${machineId}/performance?${queryParams.toString()}`);
    }
    /**
     * Machine status management methods
     */
    async setOperational(machineId) {
        const response = await this.stateset.request('POST', `machines/${machineId}/set-operational`);
        return response.machine;
    }
    async setOffline(machineId, reason) {
        const response = await this.stateset.request('POST', `machines/${machineId}/set-offline`, { reason });
        return response.machine;
    }
    async reportMalfunction(machineId, report) {
        const response = await this.stateset.request('POST', `machines/${machineId}/report-malfunction`, report);
        return response.machine;
    }
    /**
     * Get maintenance history
     */
    async getMaintenanceHistory(machineId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `machines/${machineId}/maintenance-history?${queryParams.toString()}`);
        return response.history;
    }
    /**
     * Get machine alerts
     */
    async getAlerts(machineId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.severity)
            queryParams.append('severity', params.severity);
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if ((params === null || params === void 0 ? void 0 : params.resolved) !== undefined)
            queryParams.append('resolved', params.resolved.toString());
        const response = await this.stateset.request('GET', `machines/${machineId}/alerts?${queryParams.toString()}`);
        return response.alerts;
    }
}
exports.default = Machines;
