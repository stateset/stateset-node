"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleExecutionError = exports.RuleValidationError = exports.RuleNotFoundError = exports.ActionType = exports.TriggerType = exports.RulePriority = exports.RuleType = void 0;
// Enums for rule management
var RuleType;
(function (RuleType) {
    RuleType["AUTOMATION"] = "automation";
    RuleType["RESTRICTION"] = "restriction";
    RuleType["PERMISSION"] = "permission";
    RuleType["VALIDATION"] = "validation";
    RuleType["NOTIFICATION"] = "notification";
    RuleType["ROUTING"] = "routing";
    RuleType["ESCALATION"] = "escalation";
    RuleType["COMPLIANCE"] = "compliance";
    RuleType["SECURITY"] = "security";
})(RuleType = exports.RuleType || (exports.RuleType = {}));
var RulePriority;
(function (RulePriority) {
    RulePriority["CRITICAL"] = "critical";
    RulePriority["HIGH"] = "high";
    RulePriority["MEDIUM"] = "medium";
    RulePriority["LOW"] = "low";
})(RulePriority = exports.RulePriority || (exports.RulePriority = {}));
var TriggerType;
(function (TriggerType) {
    TriggerType["EVENT"] = "event";
    TriggerType["SCHEDULE"] = "schedule";
    TriggerType["CONDITION"] = "condition";
    TriggerType["THRESHOLD"] = "threshold";
    TriggerType["PATTERN"] = "pattern";
})(TriggerType = exports.TriggerType || (exports.TriggerType = {}));
var ActionType;
(function (ActionType) {
    ActionType["EXECUTE"] = "execute";
    ActionType["NOTIFY"] = "notify";
    ActionType["UPDATE"] = "update";
    ActionType["CREATE"] = "create";
    ActionType["DELETE"] = "delete";
    ActionType["ESCALATE"] = "escalate";
    ActionType["RESTRICT"] = "restrict";
    ActionType["LOG"] = "log";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
// Custom Error Classes
class RuleNotFoundError extends Error {
    constructor(ruleId) {
        super(`Rule with ID ${ruleId} not found`);
        this.name = 'RuleNotFoundError';
    }
}
exports.RuleNotFoundError = RuleNotFoundError;
class RuleValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RuleValidationError';
    }
}
exports.RuleValidationError = RuleValidationError;
class RuleExecutionError extends Error {
    constructor(message, ruleId) {
        super(message);
        this.ruleId = ruleId;
        this.name = 'RuleExecutionError';
    }
}
exports.RuleExecutionError = RuleExecutionError;
// Main Rules Class
class Rules {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List rules with optional filtering
     * @param params - Filtering parameters
     * @returns Array of RuleResponse objects
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.rule_type)
            queryParams.append('rule_type', params.rule_type);
        if ((params === null || params === void 0 ? void 0 : params.activated) !== undefined)
            queryParams.append('activated', params.activated.toString());
        if (params === null || params === void 0 ? void 0 : params.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params === null || params === void 0 ? void 0 : params.priority)
            queryParams.append('priority', params.priority);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `rules?${queryParams.toString()}`);
        return response.rules;
    }
    /**
     * Get specific rule by ID
     * @param ruleId - Rule ID
     * @returns RuleResponse object
      */
    async get(ruleId) {
        try {
            const response = await this.stateset.request('GET', `rules/${ruleId}`);
            return response.rule;
        }
        catch (error) {
            if (error.status === 404) {
                throw new RuleNotFoundError(ruleId);
            }
            throw error;
        }
    }
    /**
     * Create new rule
     * @param ruleData - RuleData object
     * @returns RuleResponse object
     */
    async create(ruleData) {
        // Validate rule conditions
        this.validateConditions(ruleData.conditions);
        // Validate rule actions
        this.validateActions(ruleData.actions);
        try {
            const response = await this.stateset.request('POST', 'rules', ruleData);
            return response.rule;
        }
        catch (error) {
            if (error.status === 400) {
                throw new RuleValidationError(error.message);
            }
            throw error;
        }
    }
    /**
     * Update existing rule
     * @param ruleId - Rule ID
     * @param ruleData - Partial<RuleData> object
     * @returns RuleResponse object
     */
    async update(ruleId, ruleData) {
        if (ruleData.conditions) {
            this.validateConditions(ruleData.conditions);
        }
        if (ruleData.actions) {
            this.validateActions(ruleData.actions);
        }
        try {
            const response = await this.stateset.request('PUT', `rules/${ruleId}`, ruleData);
            return response.rule;
        }
        catch (error) {
            if (error.status === 404) {
                throw new RuleNotFoundError(ruleId);
            }
            throw error;
        }
    }
    /**
     * Delete rule
     * @param ruleId - Rule ID
     */
    async delete(ruleId) {
        try {
            await this.stateset.request('DELETE', `rules/${ruleId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new RuleNotFoundError(ruleId);
            }
            throw error;
        }
    }
    /**
     * Activate/Deactivate rule
     * @param ruleId - Rule ID
     * @param activated - Boolean value
     * @returns RuleResponse object
     */
    async setActivation(ruleId, activated) {
        const response = await this.stateset.request('POST', `rules/${ruleId}/activation`, { activated });
        return response.rule;
    }
    /**
     * Test rule execution
     * @param ruleId - Rule ID
     * @param testData - Record<string, any> object
     * @returns RuleExecutionResult object
     */
    async testRule(ruleId, testData) {
        try {
            const response = await this.stateset.request('POST', `rules/${ruleId}/test`, testData);
            return response.result;
        }
        catch (error) {
            throw new RuleExecutionError(error.message, ruleId);
        }
    }
    /**
     * Get rule execution history
     * @param ruleId - Rule ID
     * @param params - Filtering parameters
     * @returns Array of RuleExecutionResult objects
     */
    async getExecutionHistory(ruleId, params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `rules/${ruleId}/execution-history?${queryParams.toString()}`);
        return response.history;
    }
    /**
     * Clone existing rule
     * @param ruleId - Rule ID
     * @param options - Options object
     * @returns RuleResponse object
     */
    async cloneRule(ruleId, options) {
        const response = await this.stateset.request('POST', `rules/${ruleId}/clone`, options);
        return response.rule;
    }
    /**
     * Validate rule conditions
     * @param conditions - Array of Condition objects
     */
    validateConditions(conditions) {
        for (const condition of conditions) {
            if (!condition.field || !condition.operator) {
                throw new RuleValidationError('Invalid condition: missing required fields');
            }
            if (['equals', 'not_equals', 'greater_than', 'less_than'].includes(condition.operator) && condition.value === undefined) {
                throw new RuleValidationError(`Invalid condition: ${condition.operator} operator requires a value`);
            }
        }
    }
    /**
     * Validate rule actions
     * @param actions - Array of Action objects
     */
    validateActions(actions) {
        if (!actions.length) {
            throw new RuleValidationError('At least one action is required');
        }
        for (const action of actions) {
            if (!action.type) {
                throw new RuleValidationError('Invalid action: missing type');
            }
            if (['execute', 'update', 'create', 'delete'].includes(action.type) && !action.target) {
                throw new RuleValidationError(`Invalid action: ${action.type} action requires a target`);
            }
        }
    }
}
exports.default = Rules;
