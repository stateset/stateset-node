"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceConflictError = exports.WorkorderValidationError = exports.WorkorderNotFoundError = exports.MaintenanceType = exports.WorkorderPriority = exports.WorkorderType = exports.WorkorderStatus = void 0;
// Enums for work order management
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
    WorkorderType["MAINTENANCE"] = "maintenance";
    WorkorderType["REPAIR"] = "repair";
    WorkorderType["INSPECTION"] = "inspection";
    WorkorderType["INSTALLATION"] = "installation";
    WorkorderType["UPGRADE"] = "upgrade";
    WorkorderType["CLEANING"] = "cleaning";
    WorkorderType["CALIBRATION"] = "calibration";
    WorkorderType["QUALITY_CHECK"] = "quality_check";
})(WorkorderType = exports.WorkorderType || (exports.WorkorderType = {}));
var WorkorderPriority;
(function (WorkorderPriority) {
    WorkorderPriority["CRITICAL"] = "critical";
    WorkorderPriority["HIGH"] = "high";
    WorkorderPriority["MEDIUM"] = "medium";
    WorkorderPriority["LOW"] = "low";
    WorkorderPriority["ROUTINE"] = "routine";
})(WorkorderPriority = exports.WorkorderPriority || (exports.WorkorderPriority = {}));
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["PREVENTIVE"] = "preventive";
    MaintenanceType["CORRECTIVE"] = "corrective";
    MaintenanceType["PREDICTIVE"] = "predictive";
    MaintenanceType["CONDITION_BASED"] = "condition_based";
    MaintenanceType["EMERGENCY"] = "emergency";
})(MaintenanceType = exports.MaintenanceType || (exports.MaintenanceType = {}));
// Custom Error Classes
class WorkorderNotFoundError extends Error {
    constructor(workorderId) {
        super(`Work order with ID ${workorderId} not found`);
        this.name = 'WorkorderNotFoundError';
    }
}
exports.WorkorderNotFoundError = WorkorderNotFoundError;
class WorkorderValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WorkorderValidationError';
    }
}
exports.WorkorderValidationError = WorkorderValidationError;
class ResourceConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ResourceConflictError';
    }
}
exports.ResourceConflictError = ResourceConflictError;
// Main Workorders Class
class Workorders {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * @param params - Filtering parameters
     * @returns Array of WorkorderResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }
        const response = await this.stateset.request('GET', `workorders?${queryParams.toString()}`);
        return response.workorders;
    }
    /**
     * @param workorderId - Workorder ID
     * @returns WorkorderResponse object
     */
    async get(workorderId) {
        try {
            const response = await this.stateset.request('GET', `workorders/${workorderId}`);
            return response.workorder;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkorderNotFoundError(workorderId);
            }
            throw error;
        }
    }
    /**
     * @param workorderData - WorkorderData object
     * @returns WorkorderResponse object
     */
    async create(workorderData) {
        try {
            const response = await this.stateset.request('POST', 'workorders', workorderData);
            return response.workorder;
        }
        catch (error) {
            if (error.status === 400) {
                throw new WorkorderValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * @param workorderId - Workorder ID
     * @param workorderData - Partial<WorkorderData> object
     * @returns WorkorderResponse object
     */
    async update(workorderId, workorderData) {
        try {
            const response = await this.stateset.request('PUT', `workorders/${workorderId}`, workorderData);
            return response.workorder;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkorderNotFoundError(workorderId);
            }
            throw error;
        }
    }
    /**
     * @param workorderId - Workorder ID
     */
    async delete(workorderId) {
        try {
            await this.stateset.request('DELETE', `workorders/${workorderId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkorderNotFoundError(workorderId);
            }
            throw error;
        }
    }
    /**
     * @param workorderId - Workorder ID
     * @returns InProgressWorkorderResponse object
     */
    async startWork(workorderId) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/start`);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param completionData - Completion data
     * @returns CompletedWorkorderResponse object
     */
    async completeWork(workorderId, completionData) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/complete`, completionData);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param cancellationData - Cancellation data
     * @returns WorkorderResponse object
     */
    async cancelWork(workorderId, cancellationData) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/cancel`, cancellationData);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param holdData - Hold data
     * @returns WorkorderResponse object
     */
    async putOnHold(workorderId, holdData) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/hold`, holdData);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @returns InProgressWorkorderResponse object
     */
    async resumeWork(workorderId) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/resume`);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param workerId - Worker ID
     * @returns WorkorderResponse object
     */
    async assignWorker(workorderId, workerId) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/assign`, {
            worker_id: workerId
        });
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param note - Note
     * @returns WorkorderResponse object
     */
    async addNote(workorderId, note) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/notes`, {
            note
        });
        return response.workorder;
    }
    /**
     * Task management methods
     */
    async updateTask(workorderId, taskId, taskData) {
        const response = await this.stateset.request('PUT', `workorders/${workorderId}/tasks/${taskId}`, taskData);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param taskId - Task ID
     * @param completionData - Completion data
     * @returns WorkorderResponse object
     */
    async completeTask(workorderId, taskId, completionData) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/tasks/${taskId}/complete`, completionData);
        return response.workorder;
    }
    /**
     * @param workorderId - Workorder ID
     * @param resourceData - ResourceData object
     * @returns WorkorderResponse object
     */
    async assignResource(workorderId, resourceData) {
        try {
            const response = await this.stateset.request('POST', `workorders/${workorderId}/resources`, resourceData);
            return response.workorder;
        }
        catch (error) {
            if (error.status === 409) {
                throw new ResourceConflictError(error.message);
            }
            throw error;
        }
    }
    /**
     * @param workorderId - Workorder ID
     * @param qualityChecks - QualityCheck[] object
     * @returns WorkorderResponse object
     */
    async submitQualityCheck(workorderId, qualityChecks) {
        const response = await this.stateset.request('POST', `workorders/${workorderId}/quality-checks`, { quality_checks: qualityChecks });
        return response.workorder;
    }
    /**
     * @param params - Filtering parameters
     * @returns Metrics object
     */
    async getMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.facility_id)
            queryParams.append('facility_id', params.facility_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `workorders/metrics?${queryParams.toString()}`);
        return response.metrics;
    }
}
exports.default = Workorders;
