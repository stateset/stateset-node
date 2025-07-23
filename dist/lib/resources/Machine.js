"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machines = exports.MachineValidationError = exports.MachineStateError = exports.MachineNotFoundError = exports.MachineError = exports.MalfunctionSeverity = exports.MaintenanceType = exports.MachineStatus = void 0;
// Enums
var MachineStatus;
(function (MachineStatus) {
    MachineStatus["OPERATIONAL"] = "OPERATIONAL";
    MachineStatus["MAINTENANCE"] = "MAINTENANCE";
    MachineStatus["OFFLINE"] = "OFFLINE";
    MachineStatus["MALFUNCTION"] = "MALFUNCTION";
    MachineStatus["STANDBY"] = "STANDBY";
    MachineStatus["SETUP"] = "SETUP";
})(MachineStatus || (exports.MachineStatus = MachineStatus = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["PREDICTIVE"] = "predictive";
    MaintenanceType["CONDITION_BASED"] = "condition_based";
    MaintenanceType["EMERGENCY"] = "emergency";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
var MalfunctionSeverity;
(function (MalfunctionSeverity) {
    MalfunctionSeverity["CRITICAL"] = "critical";
    MalfunctionSeverity["HIGH"] = "high";
    MalfunctionSeverity["MEDIUM"] = "medium";
    MalfunctionSeverity["LOW"] = "low";
})(MalfunctionSeverity || (exports.MalfunctionSeverity = MalfunctionSeverity = {}));
// Error Classes
class MachineError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.MachineError = MachineError;
class MachineNotFoundError extends MachineError {
    constructor(machineId) {
        super(`Machine with ID ${machineId} not found`, 'MachineNotFoundError');
    }
}
exports.MachineNotFoundError = MachineNotFoundError;
class MachineStateError extends MachineError {
    constructor(message) {
        super(message, 'MachineStateError');
    }
}
exports.MachineStateError = MachineStateError;
class MachineValidationError extends MachineError {
    constructor(message) {
        super(message, 'MachineValidationError');
    }
}
exports.MachineValidationError = MachineValidationError;
// Main Machines Class
class Machines {
    client;
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            const response = await this.client.request(method, path, data);
            return response.machine || response.machines || response;
        }
        catch (error) {
            if (error.status === 404) {
                throw new MachineNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new MachineValidationError(error.message);
            }
            if (error.status === 409) {
                throw new MachineStateError(error.message || 'Invalid state transition');
            }
            throw error;
        }
    }
    validateRuntimeData(data) {
        if (new Date(data.end_time) <= new Date(data.start_time)) {
            throw new MachineValidationError('End time must be after start time');
        }
        if (data.output_quantity < 0) {
            throw new MachineValidationError('Output quantity cannot be negative');
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });
        return this.request('GET', `machines?${queryParams.toString()}`);
    }
    async get(machineId) {
        return this.request('GET', `machines/${machineId}`);
    }
    async create(machineData) {
        return this.request('POST', 'machines', machineData);
    }
    async update(machineId, machineData) {
        return this.request('PUT', `machines/${machineId}`, machineData);
    }
    async delete(machineId) {
        await this.request('DELETE', `machines/${machineId}`);
    }
    async logRuntime(machineId, data) {
        this.validateRuntimeData(data);
        return this.request('POST', `machines/${machineId}/runtime`, data);
    }
    async scheduleMaintenance(machineId, data) {
        if (data.estimated_duration <= 0) {
            throw new MachineValidationError('Estimated duration must be positive');
        }
        return this.request('POST', `machines/${machineId}/maintenance`, data);
    }
    async getPerformanceMetrics(machineId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params.metrics)
            queryParams.append('metrics', params.metrics.join(','));
        return this.request('GET', `machines/${machineId}/performance?${queryParams.toString()}`);
    }
    async setStatus(machineId, status, details = {}) {
        return this.request('POST', `machines/${machineId}/set-status`, { status, ...details });
    }
    async reportMalfunction(machineId, report) {
        if (!report.symptoms.length) {
            throw new MachineValidationError('At least one symptom must be reported');
        }
        return this.request('POST', `machines/${machineId}/report-malfunction`, report);
    }
    async getMaintenanceHistory(machineId, params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `machines/${machineId}/maintenance-history?${queryParams.toString()}`);
    }
    async getAlerts(machineId, params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `machines/${machineId}/alerts?${queryParams.toString()}`);
    }
    async getUtilization(machineId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        return this.request('GET', `machines/${machineId}/utilization?${queryParams.toString()}`);
    }
    async completeMaintenance(machineId, maintenanceId, completionData) {
        if (completionData.actual_duration <= 0) {
            throw new MachineValidationError('Actual duration must be positive');
        }
        return this.request('POST', `machines/${machineId}/maintenance/${maintenanceId}/complete`, completionData);
    }
}
exports.Machines = Machines;
exports.default = Machines;
//# sourceMappingURL=Machine.js.map