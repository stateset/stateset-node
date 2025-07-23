"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleExecutionError = exports.ScheduleValidationError = exports.ScheduleNotFoundError = exports.ExecutionStrategy = exports.RecurrencePattern = exports.TaskPriority = exports.ScheduleStatus = exports.ScheduleType = void 0;
// Enums for schedule management
var ScheduleType;
(function (ScheduleType) {
    ScheduleType["RECURRING"] = "recurring";
    ScheduleType["ONE_TIME"] = "one_time";
    ScheduleType["ADAPTIVE"] = "adaptive";
    ScheduleType["CONDITIONAL"] = "conditional";
})(ScheduleType || (exports.ScheduleType = ScheduleType = {}));
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["ACTIVE"] = "active";
    ScheduleStatus["PAUSED"] = "paused";
    ScheduleStatus["COMPLETED"] = "completed";
    ScheduleStatus["FAILED"] = "failed";
    ScheduleStatus["PENDING"] = "pending";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["CRITICAL"] = "critical";
    TaskPriority["HIGH"] = "high";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["LOW"] = "low";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["HOURLY"] = "hourly";
    RecurrencePattern["DAILY"] = "daily";
    RecurrencePattern["WEEKLY"] = "weekly";
    RecurrencePattern["MONTHLY"] = "monthly";
    RecurrencePattern["CUSTOM"] = "custom";
})(RecurrencePattern || (exports.RecurrencePattern = RecurrencePattern = {}));
var ExecutionStrategy;
(function (ExecutionStrategy) {
    ExecutionStrategy["SEQUENTIAL"] = "sequential";
    ExecutionStrategy["PARALLEL"] = "parallel";
    ExecutionStrategy["ROUND_ROBIN"] = "round_robin";
})(ExecutionStrategy || (exports.ExecutionStrategy = ExecutionStrategy = {}));
// Custom Error Classes
class ScheduleNotFoundError extends Error {
    constructor(scheduleId) {
        super(`Schedule with ID ${scheduleId} not found`);
        this.name = 'ScheduleNotFoundError';
    }
}
exports.ScheduleNotFoundError = ScheduleNotFoundError;
class ScheduleValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ScheduleValidationError';
    }
}
exports.ScheduleValidationError = ScheduleValidationError;
class ScheduleExecutionError extends Error {
    scheduleId;
    constructor(message, scheduleId) {
        super(message);
        this.scheduleId = scheduleId;
        this.name = 'ScheduleExecutionError';
    }
}
exports.ScheduleExecutionError = ScheduleExecutionError;
// Main Schedule Class
class Schedule {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List schedules with optional filtering
     * @param params - Filtering parameters
     * @returns Array of ScheduleResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.schedule_type)
            queryParams.append('schedule_type', params.schedule_type);
        if (params?.priority)
            queryParams.append('priority', params.priority);
        if (params?.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params?.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `schedules?${queryParams.toString()}`);
        return response.schedules;
    }
    /**
     * Get specific schedule by ID
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    async get(scheduleId) {
        try {
            const response = await this.stateset.request('GET', `schedules/${scheduleId}`);
            return response.schedule;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ScheduleNotFoundError(scheduleId);
            }
            throw error;
        }
    }
    /**
     * Create new schedule
     * @param scheduleData - ScheduleData object
     * @returns ScheduleResponse object
     */
    async create(scheduleData) {
        this.validateScheduleData(scheduleData);
        try {
            const response = await this.stateset.request('POST', 'schedules', scheduleData);
            return response.schedule;
        }
        catch (error) {
            if (error.status === 400) {
                throw new ScheduleValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing schedule
     * @param scheduleId - Schedule ID
     * @param scheduleData - Partial<ScheduleData> object
     * @returns ScheduleResponse object
     */
    async update(scheduleId, scheduleData) {
        if (Object.keys(scheduleData).length > 0) {
            this.validateScheduleData(scheduleData, true);
        }
        try {
            const response = await this.stateset.request('PUT', `schedules/${scheduleId}`, scheduleData);
            return response.schedule;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ScheduleNotFoundError(scheduleId);
            }
            throw error;
        }
    }
    /**
     * Delete schedule
     * @param scheduleId - Schedule ID
     */
    async delete(scheduleId) {
        try {
            await this.stateset.request('DELETE', `schedules/${scheduleId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ScheduleNotFoundError(scheduleId);
            }
            throw error;
        }
    }
    /**
     * Pause schedule
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    async pause(scheduleId) {
        const response = await this.stateset.request('POST', `schedules/${scheduleId}/pause`);
        return response.schedule;
    }
    /**
     * Resume schedule
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    async resume(scheduleId) {
        const response = await this.stateset.request('POST', `schedules/${scheduleId}/resume`);
        return response.schedule;
    }
    /**
     * Trigger immediate execution
     * @param scheduleId - Schedule ID
     * @param params - Parameters object
     * @returns ExecutionResult object
     */
    async triggerExecution(scheduleId, params) {
        try {
            const response = await this.stateset.request('POST', `schedules/${scheduleId}/trigger`, params);
            return response.execution;
        }
        catch (error) {
            throw new ScheduleExecutionError(error.message, scheduleId);
        }
    }
    /**
     * Get execution history
     * @param scheduleId - Schedule ID
     * @param params - Filtering parameters
     * @returns Array of ExecutionResult objects
     */
    async getExecutionHistory(scheduleId, params) {
        const queryParams = new URLSearchParams();
        if (params?.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params?.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `schedules/${scheduleId}/execution-history?${queryParams.toString()}`);
        return response.executions;
    }
    /**
     * Get next scheduled executions
     * @param scheduleId - Schedule ID
     * @param limit - Number of executions to return
     * @returns Array of objects with scheduled_time and estimation_basis
     */
    async getNextExecutions(scheduleId, limit = 10) {
        const response = await this.stateset.request('GET', `schedules/${scheduleId}/next-executions?limit=${limit}`);
        return response.executions;
    }
    /**
     * Validate schedule data
     * @param data - ScheduleData object
     * @param isUpdate - Boolean value
     */
    validateScheduleData(data, isUpdate = false) {
        if (!isUpdate) {
            if (!data.name) {
                throw new ScheduleValidationError('Schedule name is required');
            }
            if (!data.schedule_type) {
                throw new ScheduleValidationError('Schedule type is required');
            }
            if (!data.time_window) {
                throw new ScheduleValidationError('Time window is required');
            }
            if (!data.tasks || !data.tasks.length) {
                throw new ScheduleValidationError('At least one task is required');
            }
        }
        if (data.schedule_type === ScheduleType.RECURRING && !data.recurrence_config) {
            throw new ScheduleValidationError('Recurrence configuration is required for recurring schedules');
        }
        if (data.schedule_type === ScheduleType.ADAPTIVE && !data.adaptive_config) {
            throw new ScheduleValidationError('Adaptive configuration is required for adaptive schedules');
        }
        if (data.schedule_type === ScheduleType.CONDITIONAL && !data.conditional_config) {
            throw new ScheduleValidationError('Conditional configuration is required for conditional schedules');
        }
        if (data.time_window) {
            const { start_time, end_time } = data.time_window;
            if (new Date(start_time) >= new Date(end_time)) {
                throw new ScheduleValidationError('Time window start must be before end');
            }
        }
    }
}
exports.default = Schedule;
//# sourceMappingURL=Schedule.js.map