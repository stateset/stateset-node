"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workorders = exports.ResourceConflictError = exports.WorkorderValidationError = exports.WorkorderNotFoundError = exports.WorkorderError = exports.MaintenanceType = exports.WorkorderPriority = exports.WorkorderType = exports.WorkorderStatus = void 0;
// Enums
var WorkorderStatus;
(function (WorkorderStatus) {
    WorkorderStatus["DRAFT"] = "DRAFT";
    WorkorderStatus["SCHEDULED"] = "SCHEDULED";
    WorkorderStatus["PENDING"] = "PENDING";
    WorkorderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    WorkorderStatus["PAUSED"] = "PAUSED";
    WorkorderStatus["ON_HOLD"] = "ON_HOLD";
    WorkorderStatus["REVIEW"] = "REVIEW";
    WorkorderStatus["COMPLETED"] = "COMPLETED";
    WorkorderStatus["CANCELLED"] = "CANCELLED";
    WorkorderStatus["FAILED"] = "FAILED";
})(WorkorderStatus = exports.WorkorderStatus || (exports.WorkorderStatus = {}));
var WorkorderType;
(function (WorkorderType) {
    WorkorderType["MAINTENANCE"] = "MAINTENANCE";
    WorkorderType["REPAIR"] = "REPAIR";
    WorkorderType["INSPECTION"] = "INSPECTION";
    WorkorderType["INSTALLATION"] = "INSTALLATION";
    WorkorderType["UPGRADE"] = "UPGRADE";
    WorkorderType["CLEANING"] = "CLEANING";
    WorkorderType["CALIBRATION"] = "CALIBRATION";
    WorkorderType["QUALITY_CHECK"] = "QUALITY_CHECK";
})(WorkorderType = exports.WorkorderType || (exports.WorkorderType = {}));
var WorkorderPriority;
(function (WorkorderPriority) {
    WorkorderPriority["CRITICAL"] = "CRITICAL";
    WorkorderPriority["HIGH"] = "HIGH";
    WorkorderPriority["MEDIUM"] = "MEDIUM";
    WorkorderPriority["LOW"] = "LOW";
    WorkorderPriority["ROUTINE"] = "ROUTINE";
})(WorkorderPriority = exports.WorkorderPriority || (exports.WorkorderPriority = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "PREVENTIVE";
    MaintenanceType["CORRECTIVE"] = "CORRECTIVE";
    MaintenanceType["PREDICTIVE"] = "PREDICTIVE";
    MaintenanceType["CONDITION_BASED"] = "CONDITION_BASED";
    MaintenanceType["EMERGENCY"] = "EMERGENCY";
})(MaintenanceType = exports.MaintenanceType || (exports.MaintenanceType = {}));
// Error Classes
class WorkorderError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.WorkorderError = WorkorderError;
class WorkorderNotFoundError extends WorkorderError {
    constructor(workorderId) {
        super(`Work order with ID ${workorderId} not found`, { workorderId });
    }
}
exports.WorkorderNotFoundError = WorkorderNotFoundError;
class WorkorderValidationError extends WorkorderError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.WorkorderValidationError = WorkorderValidationError;
class ResourceConflictError extends WorkorderError {
    constructor(message, resourceId) {
        super(message, { resourceId });
        this.resourceId = resourceId;
    }
}
exports.ResourceConflictError = ResourceConflictError;
// Main Workorders Class
class Workorders {
    constructor(client) {
        this.client = client;
    }
    validateWorkorderData(data) {
        var _a;
        if (!data.description)
            throw new WorkorderValidationError('Description is required');
        if (!data.asset_id)
            throw new WorkorderValidationError('Asset ID is required');
        if (!data.location.facility_id)
            throw new WorkorderValidationError('Facility ID is required');
        if (!((_a = data.tasks) === null || _a === void 0 ? void 0 : _a.length))
            throw new WorkorderValidationError('At least one task is required');
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id) || !data.status)
            throw new WorkorderError('Invalid response format');
        const baseResponse = {
            id: data.id,
            object: 'workorder',
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
            data: data.data || data,
        };
        switch (data.status) {
            case WorkorderStatus.DRAFT:
                return { ...baseResponse, status: WorkorderStatus.DRAFT, draft_details: { created_by: data.created_by || 'unknown' } };
            case WorkorderStatus.SCHEDULED:
                return { ...baseResponse, status: WorkorderStatus.SCHEDULED, schedule_details: data.schedule_details };
            case WorkorderStatus.IN_PROGRESS:
                return { ...baseResponse, status: WorkorderStatus.IN_PROGRESS, progress: data.progress };
            case WorkorderStatus.COMPLETED:
                return { ...baseResponse, status: WorkorderStatus.COMPLETED, completion_details: data.completion_details };
            case WorkorderStatus.FAILED:
                return { ...baseResponse, status: WorkorderStatus.FAILED, failure_details: data.failure_details };
            default:
                return baseResponse;
        }
    }
    async list(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.priority && { priority: params.priority }),
            ...(params.asset_id && { asset_id: params.asset_id }),
            ...(params.facility_id && { facility_id: params.facility_id }),
            ...(params.assigned_to && { assigned_to: params.assigned_to }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        const response = await this.client.request('GET', `workorders?${query}`);
        return {
            workorders: response.workorders.map(this.mapResponse),
            pagination: response.pagination || { total: response.workorders.length, limit: params.limit || 100, offset: params.offset || 0 },
        };
    }
    async get(workorderId) {
        try {
            const response = await this.client.request('GET', `workorders/${workorderId}`);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'get', workorderId);
        }
    }
    async create(data) {
        this.validateWorkorderData(data);
        try {
            const response = await this.client.request('POST', 'workorders', data);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(workorderId, data) {
        try {
            const response = await this.client.request('PUT', `workorders/${workorderId}`, data);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'update', workorderId);
        }
    }
    async delete(workorderId) {
        try {
            await this.client.request('DELETE', `workorders/${workorderId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', workorderId);
        }
    }
    async startWork(workorderId) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/start`);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'startWork', workorderId);
        }
    }
    async completeWork(workorderId, completionData = {}) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/complete`, completionData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'completeWork', workorderId);
        }
    }
    async cancelWork(workorderId, cancellationData) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/cancel`, cancellationData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'cancelWork', workorderId);
        }
    }
    async putOnHold(workorderId, holdData) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/hold`, holdData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'putOnHold', workorderId);
        }
    }
    async resumeWork(workorderId) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/resume`);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'resumeWork', workorderId);
        }
    }
    async assignWorker(workorderId, workerId) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/assign`, { worker_id: workerId });
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'assignWorker', workorderId);
        }
    }
    async addNote(workorderId, note) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/notes`, { note });
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'addNote', workorderId);
        }
    }
    async updateTask(workorderId, taskId, taskData) {
        try {
            const response = await this.client.request('PUT', `workorders/${workorderId}/tasks/${taskId}`, taskData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'updateTask', workorderId);
        }
    }
    async completeTask(workorderId, taskId, completionData) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/tasks/${taskId}/complete`, completionData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'completeTask', workorderId);
        }
    }
    async assignResource(workorderId, resourceData) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/resources`, resourceData);
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            if (error.status === 409)
                throw new ResourceConflictError(error.message, resourceData.id);
            throw this.handleError(error, 'assignResource', workorderId);
        }
    }
    async submitQualityCheck(workorderId, qualityChecks) {
        try {
            const response = await this.client.request('POST', `workorders/${workorderId}/quality-checks`, { quality_checks: qualityChecks });
            return this.mapResponse(response.workorder);
        }
        catch (error) {
            throw this.handleError(error, 'submitQualityCheck', workorderId);
        }
    }
    async getMetrics(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.start) && { start_date: params.date_range.start.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.end) && { end_date: params.date_range.end.toISOString() }),
            ...(params.type && { type: params.type }),
            ...(params.facility_id && { facility_id: params.facility_id }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(params.group_by && { group_by: params.group_by }),
        });
        try {
            const response = await this.client.request('GET', `workorders/metrics?${query}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, workorderId) {
        if (error.status === 404)
            throw new WorkorderNotFoundError(workorderId || 'unknown');
        if (error.status === 400)
            throw new WorkorderValidationError(error.message, error.errors);
        throw new WorkorderError(`Failed to ${operation} work order: ${error.message}`, { operation, originalError: error });
    }
}
exports.Workorders = Workorders;
exports.default = Workorders;
