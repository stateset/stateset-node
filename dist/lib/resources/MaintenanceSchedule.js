"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceScheduleValidationError = exports.MaintenanceScheduleNotFoundError = exports.MaintenanceScheduleError = exports.MaintenanceType = exports.MaintenanceScheduleStatus = void 0;
// Enums
var MaintenanceScheduleStatus;
(function (MaintenanceScheduleStatus) {
    MaintenanceScheduleStatus["SCHEDULED"] = "SCHEDULED";
    MaintenanceScheduleStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MaintenanceScheduleStatus["COMPLETED"] = "COMPLETED";
    MaintenanceScheduleStatus["CANCELLED"] = "CANCELLED";
    MaintenanceScheduleStatus["OVERDUE"] = "OVERDUE";
})(MaintenanceScheduleStatus || (exports.MaintenanceScheduleStatus = MaintenanceScheduleStatus = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "PREVENTIVE";
    MaintenanceType["CORRECTIVE"] = "CORRECTIVE";
    MaintenanceType["PREDICTIVE"] = "PREDICTIVE";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
// Error Classes
class MaintenanceScheduleError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'MaintenanceScheduleError';
    }
}
exports.MaintenanceScheduleError = MaintenanceScheduleError;
class MaintenanceScheduleNotFoundError extends MaintenanceScheduleError {
    constructor(maintenanceScheduleId) {
        super(`Maintenance schedule with ID ${maintenanceScheduleId} not found`, { maintenanceScheduleId });
    }
}
exports.MaintenanceScheduleNotFoundError = MaintenanceScheduleNotFoundError;
class MaintenanceScheduleValidationError extends MaintenanceScheduleError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.MaintenanceScheduleValidationError = MaintenanceScheduleValidationError;
class MaintenanceSchedules {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateMaintenanceScheduleData(data) {
        if (!data.asset_id)
            throw new MaintenanceScheduleValidationError('Asset ID is required');
        if (!data.scheduled_date)
            throw new MaintenanceScheduleValidationError('Scheduled date is required');
        if (!data.due_date)
            throw new MaintenanceScheduleValidationError('Due date is required');
        if (data.duration_estimate < 0)
            throw new MaintenanceScheduleValidationError('Duration estimate cannot be negative');
        if (data.cost_estimate < 0)
            throw new MaintenanceScheduleValidationError('Cost estimate cannot be negative');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new MaintenanceScheduleError('Invalid response format');
        return {
            id: data.id,
            object: 'maintenance_schedule',
            data: {
                asset_id: data.asset_id,
                machine_id: data.machine_id,
                status: data.status,
                type: data.type,
                scheduled_date: data.scheduled_date,
                due_date: data.due_date,
                completed_date: data.completed_date,
                technician_id: data.technician_id,
                description: data.description,
                duration_estimate: data.duration_estimate,
                actual_duration: data.actual_duration,
                cost_estimate: data.cost_estimate,
                actual_cost: data.actual_cost,
                currency: data.currency,
                notes: data.notes,
                created_at: data.created_at,
                updated_at: data.updated_at,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.asset_id)
                queryParams.append('asset_id', params.asset_id);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.type)
                queryParams.append('type', params.type);
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
            const response = await this.stateset.request('GET', `maintenance_schedules?${queryParams.toString()}`);
            return {
                maintenance_schedules: response.maintenance_schedules.map(this.mapResponse),
                pagination: {
                    total: response.total || response.maintenance_schedules.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(maintenanceScheduleId) {
        try {
            const response = await this.stateset.request('GET', `maintenance_schedules/${maintenanceScheduleId}`);
            return this.mapResponse(response.maintenance_schedule);
        }
        catch (error) {
            throw this.handleError(error, 'get', maintenanceScheduleId);
        }
    }
    async create(data) {
        this.validateMaintenanceScheduleData(data);
        try {
            const response = await this.stateset.request('POST', 'maintenance_schedules', data);
            return this.mapResponse(response.maintenance_schedule);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(maintenanceScheduleId, data) {
        try {
            const response = await this.stateset.request('PUT', `maintenance_schedules/${maintenanceScheduleId}`, data);
            return this.mapResponse(response.maintenance_schedule);
        }
        catch (error) {
            throw this.handleError(error, 'update', maintenanceScheduleId);
        }
    }
    async delete(maintenanceScheduleId) {
        try {
            await this.stateset.request('DELETE', `maintenance_schedules/${maintenanceScheduleId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', maintenanceScheduleId);
        }
    }
    async complete(maintenanceScheduleId, completionData) {
        try {
            const response = await this.stateset.request('POST', `maintenance_schedules/${maintenanceScheduleId}/complete`, completionData);
            return this.mapResponse(response.maintenance_schedule);
        }
        catch (error) {
            throw this.handleError(error, 'complete', maintenanceScheduleId);
        }
    }
    handleError(error, operation, maintenanceScheduleId) {
        if (error.status === 404)
            throw new MaintenanceScheduleNotFoundError(maintenanceScheduleId || 'unknown');
        if (error.status === 400)
            throw new MaintenanceScheduleValidationError(error.message, error.errors);
        throw new MaintenanceScheduleError(`Failed to ${operation} maintenance schedule: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = MaintenanceSchedules;
//# sourceMappingURL=MaintenanceSchedule.js.map