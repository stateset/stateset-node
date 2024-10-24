"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityExecutionError = exports.ActivityValidationError = exports.ActivityNotFoundError = exports.ActivityPriority = exports.ActivityStatus = exports.ActivityType = void 0;
// Enums for activity management
var ActivityType;
(function (ActivityType) {
    // AI Activities
    ActivityType["AI_INFERENCE"] = "ai_inference";
    ActivityType["AI_TRAINING"] = "ai_training";
    ActivityType["AI_VALIDATION"] = "ai_validation";
    ActivityType["PROMPT_GENERATION"] = "prompt_generation";
    ActivityType["RESPONSE_PROCESSING"] = "response_processing";
    // Data Activities
    ActivityType["DATA_TRANSFORMATION"] = "data_transformation";
    ActivityType["DATA_VALIDATION"] = "data_validation";
    ActivityType["DATA_ENRICHMENT"] = "data_enrichment";
    ActivityType["DATA_AGGREGATION"] = "data_aggregation";
    // Integration Activities
    ActivityType["API_CALL"] = "api_call";
    ActivityType["WEBHOOK"] = "webhook";
    ActivityType["EVENT_EMISSION"] = "event_emission";
    ActivityType["MESSAGE_QUEUE"] = "message_queue";
    // Control Flow Activities
    ActivityType["CONDITION"] = "condition";
    ActivityType["SWITCH"] = "switch";
    ActivityType["LOOP"] = "loop";
    ActivityType["PARALLEL"] = "parallel";
    ActivityType["MAP"] = "map";
    // Human Activities
    ActivityType["HUMAN_REVIEW"] = "human_review";
    ActivityType["APPROVAL"] = "approval";
    ActivityType["MANUAL_TASK"] = "manual_task";
    // Utility Activities
    ActivityType["DELAY"] = "delay";
    ActivityType["NOTIFICATION"] = "notification";
    ActivityType["LOGGING"] = "logging";
    ActivityType["ERROR_HANDLING"] = "error_handling";
})(ActivityType = exports.ActivityType || (exports.ActivityType = {}));
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["PENDING"] = "pending";
    ActivityStatus["SCHEDULED"] = "scheduled";
    ActivityStatus["RUNNING"] = "running";
    ActivityStatus["COMPLETED"] = "completed";
    ActivityStatus["FAILED"] = "failed";
    ActivityStatus["CANCELLED"] = "cancelled";
    ActivityStatus["SKIPPED"] = "skipped";
    ActivityStatus["WAITING"] = "waiting";
})(ActivityStatus = exports.ActivityStatus || (exports.ActivityStatus = {}));
var ActivityPriority;
(function (ActivityPriority) {
    ActivityPriority["CRITICAL"] = "critical";
    ActivityPriority["HIGH"] = "high";
    ActivityPriority["NORMAL"] = "normal";
    ActivityPriority["LOW"] = "low";
})(ActivityPriority = exports.ActivityPriority || (exports.ActivityPriority = {}));
// Custom Error Classes
class ActivityNotFoundError extends Error {
    constructor(activityId) {
        super(`Activity with ID ${activityId} not found`);
        this.name = 'ActivityNotFoundError';
    }
}
exports.ActivityNotFoundError = ActivityNotFoundError;
class ActivityValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ActivityValidationError';
    }
}
exports.ActivityValidationError = ActivityValidationError;
class ActivityExecutionError extends Error {
    constructor(message, activityId) {
        super(message);
        this.activityId = activityId;
        this.name = 'ActivityExecutionError';
    }
}
exports.ActivityExecutionError = ActivityExecutionError;
// Main Activities Class
class Activities {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List activities with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.workflow_id)
            queryParams.append('workflow_id', params.workflow_id);
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
        const response = await this.stateset.request('GET', `activities?${queryParams.toString()}`);
        return response.activities;
    }
    /**
     * Get specific activity
     */
    async get(activityId) {
        try {
            const response = await this.stateset.request('GET', `activities/${activityId}`);
            return response.activity;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ActivityNotFoundError(activityId);
            }
            throw error;
        }
    }
    /**
     * Create new activity
     */
    async create(activityData) {
        this.validateActivityData(activityData);
        try {
            const response = await this.stateset.request('POST', 'activities', activityData);
            return response.activity;
        }
        catch (error) {
            if (error.status === 400) {
                throw new ActivityValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update activity
     */
    async update(activityId, activityData) {
        try {
            const response = await this.stateset.request('PUT', `activities/${activityId}`, activityData);
            return response.activity;
        }
        catch (error) {
            if (error.status === 404) {
                throw new ActivityNotFoundError(activityId);
            }
            throw error;
        }
    }
    /**
     * Delete activity
     */
    async delete(activityId) {
        try {
            await this.stateset.request('DELETE', `activities/${activityId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new ActivityNotFoundError(activityId);
            }
            throw error;
        }
    }
    /**
     * Start activity execution
     */
    async start(activityId, input) {
        try {
            const response = await this.stateset.request('POST', `activities/${activityId}/start`, { input });
            return response.activity;
        }
        catch (error) {
            throw new ActivityExecutionError(error.message, activityId);
        }
    }
    /**
     * Complete activity
     */
    async complete(activityId, output) {
        const response = await this.stateset.request('POST', `activities/${activityId}/complete`, { output });
        return response.activity;
    }
    /**
     * Fail activity
     */
    async fail(activityId, error) {
        const response = await this.stateset.request('POST', `activities/${activityId}/fail`, { error });
        return response.activity;
    }
    /**
     * Cancel activity
     */
    async cancel(activityId, reason) {
        const response = await this.stateset.request('POST', `activities/${activityId}/cancel`, { reason });
        return response.activity;
    }
    /**
     * Get activity metrics
     */
    async getMetrics(activityId) {
        const response = await this.stateset.request('GET', `activities/${activityId}/metrics`);
        return response.metrics;
    }
    /**
     * Retry failed activity
     */
    async retry(activityId) {
        const response = await this.stateset.request('POST', `activities/${activityId}/retry`);
        return response.activity;
    }
    /**
     * Validate activity data
     */
    validateActivityData(data) {
        if (!data.name) {
            throw new ActivityValidationError('Activity name is required');
        }
        if (!data.type) {
            throw new ActivityValidationError('Activity type is required');
        }
        if (!data.workflow_id) {
            throw new ActivityValidationError('Workflow ID is required');
        }
        if (!data.configuration) {
            throw new ActivityValidationError('Activity configuration is required');
        }
        // Validate type-specific configuration
        switch (data.type) {
            case ActivityType.AI_INFERENCE:
            case ActivityType.AI_TRAINING:
            case ActivityType.AI_VALIDATION:
            case ActivityType.PROMPT_GENERATION:
                const aiConfig = data.configuration;
                if (!aiConfig.model || !aiConfig.provider) {
                    throw new ActivityValidationError('AI activity requires model and provider');
                }
                break;
            case ActivityType.API_CALL:
            case ActivityType.WEBHOOK:
                const integrationConfig = data.configuration;
                if (!integrationConfig.endpoint) {
                    throw new ActivityValidationError('Integration activity requires endpoint');
                }
                break;
            case ActivityType.HUMAN_REVIEW:
            case ActivityType.APPROVAL:
                const humanConfig = data.configuration;
                if (!humanConfig.form_configuration) {
                    throw new ActivityValidationError('Human task requires form configuration');
                }
                break;
        }
    }
}
exports.default = Activities;