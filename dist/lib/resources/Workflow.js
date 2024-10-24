"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionError = exports.WorkflowValidationError = exports.WorkflowNotFoundError = exports.TriggerType = exports.TaskType = exports.WorkflowStatus = exports.WorkflowType = void 0;
// Enums for workflow management
var WorkflowType;
(function (WorkflowType) {
    WorkflowType["SEQUENTIAL"] = "sequential";
    WorkflowType["PARALLEL"] = "parallel";
    WorkflowType["EVENT_DRIVEN"] = "event_driven";
    WorkflowType["CONDITIONAL"] = "conditional";
    WorkflowType["STATE_MACHINE"] = "state_machine";
})(WorkflowType = exports.WorkflowType || (exports.WorkflowType = {}));
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["DRAFT"] = "draft";
    WorkflowStatus["ACTIVE"] = "active";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["ARCHIVED"] = "archived";
    WorkflowStatus["ERROR"] = "error";
})(WorkflowStatus = exports.WorkflowStatus || (exports.WorkflowStatus = {}));
var TaskType;
(function (TaskType) {
    TaskType["AI_PROCESSING"] = "ai_processing";
    TaskType["DATA_TRANSFORMATION"] = "data_transformation";
    TaskType["API_CALL"] = "api_call";
    TaskType["NOTIFICATION"] = "notification";
    TaskType["DECISION"] = "decision";
    TaskType["HUMAN_REVIEW"] = "human_review";
    TaskType["WAIT"] = "wait";
})(TaskType = exports.TaskType || (exports.TaskType = {}));
var TriggerType;
(function (TriggerType) {
    TriggerType["SCHEDULE"] = "schedule";
    TriggerType["EVENT"] = "event";
    TriggerType["API"] = "api";
    TriggerType["CONDITION"] = "condition";
    TriggerType["MANUAL"] = "manual";
})(TriggerType = exports.TriggerType || (exports.TriggerType = {}));
// Custom Error Classes
class WorkflowNotFoundError extends Error {
    constructor(workflowId) {
        super(`Workflow with ID ${workflowId} not found`);
        this.name = 'WorkflowNotFoundError';
    }
}
exports.WorkflowNotFoundError = WorkflowNotFoundError;
class WorkflowValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WorkflowValidationError';
    }
}
exports.WorkflowValidationError = WorkflowValidationError;
class WorkflowExecutionError extends Error {
    constructor(message, executionId) {
        super(message);
        this.executionId = executionId;
        this.name = 'WorkflowExecutionError';
    }
}
exports.WorkflowExecutionError = WorkflowExecutionError;
// Main Workflows Class
class Workflows {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List workflows with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.type)
            queryParams.append('type', params.type);
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params === null || params === void 0 ? void 0 : params.tags)
            queryParams.append('tags', JSON.stringify(params.tags));
        const response = await this.stateset.request('GET', `workflows?${queryParams.toString()}`);
        return response.workflows;
    }
    /**
     * Get specific workflow
     */
    async get(workflowId) {
        try {
            const response = await this.stateset.request('GET', `workflows/${workflowId}`);
            return response.workflow;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkflowNotFoundError(workflowId);
            }
            throw error;
        }
    }
    /**
     * Create new workflow
     */
    async create(workflowData) {
        this.validateWorkflowData(workflowData);
        try {
            const response = await this.stateset.request('POST', 'workflows', workflowData);
            return response.workflow;
        }
        catch (error) {
            if (error.status === 400) {
                throw new WorkflowValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update workflow
     */
    async update(workflowId, workflowData) {
        try {
            const response = await this.stateset.request('PUT', `workflows/${workflowId}`, workflowData);
            return response.workflow;
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkflowNotFoundError(workflowId);
            }
            throw error;
        }
    }
    /**
     * Delete workflow
     */
    async delete(workflowId) {
        try {
            await this.stateset.request('DELETE', `workflows/${workflowId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new WorkflowNotFoundError(workflowId);
            }
            throw error;
        }
    }
    /**
     * Execute workflow
     */
    async execute(workflowId, input) {
        try {
            const response = await this.stateset.request('POST', `workflows/${workflowId}/execute`, { input });
            return response.execution;
        }
        catch (error) {
            throw new WorkflowExecutionError(error.message, error.execution_id);
        }
    }
    /**
     * Get workflow execution status
     */
    async getExecutionStatus(workflowId, executionId) {
        const response = await this.stateset.request('GET', `workflows/${workflowId}/executions/${executionId}`);
        return response.execution;
    }
    /**
     * Get workflow execution history
     */
    async getExecutionHistory(workflowId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `workflows/${workflowId}/executions?${queryParams.toString()}`);
        return response.executions;
    }
    /**
     * Clone workflow
     */
    async cloneWorkflow(workflowId, options) {
        const response = await this.stateset.request('POST', `workflows/${workflowId}/clone`, options);
        return response.workflow;
    }
    /**
     * Validate workflow data
     */
    validateWorkflowData(data) {
        if (!data.name) {
            throw new WorkflowValidationError('Workflow name is required');
        }
        if (!data.type) {
            throw new WorkflowValidationError('Workflow type is required');
        }
        if (!data.version) {
            throw new WorkflowValidationError('Workflow version is required');
        }
        if (!data.states || data.states.length === 0) {
            throw new WorkflowValidationError('Workflow must have at least one state');
        }
        // Validate state transitions
        const stateNames = new Set(data.states.map(state => state.name));
        data.states.forEach(state => {
            var _a;
            (_a = state.transitions) === null || _a === void 0 ? void 0 : _a.forEach(transition => {
                if (!stateNames.has(transition.from) || !stateNames.has(transition.to)) {
                    throw new WorkflowValidationError(`Invalid state transition: ${transition.from} -> ${transition.to}`);
                }
            });
        });
        // Validate task dependencies
        data.states.forEach(state => {
            state.tasks.forEach(task => {
                if (task.dependencies) {
                    task.dependencies.forEach(depId => {
                        if (!state.tasks.some(t => t.id === depId)) {
                            throw new WorkflowValidationError(`Invalid task dependency: ${depId} in task ${task.id}`);
                        }
                    });
                }
            });
        });
    }
}
exports.default = Workflows;
