"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvalValidationError = exports.EvalNotFoundError = exports.EvalType = void 0;
// Enums for evaluation management
var EvalType;
(function (EvalType) {
    EvalType["AGENT"] = "agent";
    EvalType["RESPONSE"] = "response";
    EvalType["RULE"] = "rule";
    EvalType["ATTRIBUTE"] = "attribute";
})(EvalType = exports.EvalType || (exports.EvalType = {}));
class EvalNotFoundError extends Error {
    constructor(evalId) {
        super(`Eval with ID ${evalId} not found`);
        this.name = 'EvalNotFoundError';
    }
}
exports.EvalNotFoundError = EvalNotFoundError;
class EvalValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EvalValidationError';
    }
}
exports.EvalValidationError = EvalValidationError;
class Evals {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * List evaluations with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.eval_type)
            queryParams.append('eval_type', params.eval_type);
        if (params === null || params === void 0 ? void 0 : params.subject_id)
            queryParams.append('subject_id', params.subject_id);
        if (params === null || params === void 0 ? void 0 : params.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        const response = await this.stateset.request('GET', `evals?${queryParams.toString()}`);
        return response.evals;
    }
    /**
     * Get a specific evaluation
     */
    async get(evalId) {
        try {
            const response = await this.stateset.request('GET', `evals/${evalId}`);
            return response.eval;
        }
        catch (error) {
            if (error.status === 404) {
                throw new EvalNotFoundError(evalId);
            }
            throw error;
        }
    }
    /**
     * Create evaluation
     */
    async create(data) {
        if (!data.subject_id) {
            throw new EvalValidationError('subject_id is required');
        }
        if (!data.metrics || data.metrics.length === 0) {
            throw new EvalValidationError('at least one metric is required');
        }
        const response = await this.stateset.request('POST', 'evals', data);
        return response.eval;
    }
    /**
     * Delete evaluation
     */
    async delete(evalId) {
        try {
            await this.stateset.request('DELETE', `evals/${evalId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new EvalNotFoundError(evalId);
            }
            throw error;
        }
    }
}
exports.default = Evals;
