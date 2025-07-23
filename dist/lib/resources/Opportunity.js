"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityValidationError = exports.OpportunityNotFoundError = exports.OpportunityError = exports.OpportunityStage = exports.OpportunityStatus = void 0;
// Enums
var OpportunityStatus;
(function (OpportunityStatus) {
    OpportunityStatus["PROSPECTING"] = "PROSPECTING";
    OpportunityStatus["QUALIFIED"] = "QUALIFIED";
    OpportunityStatus["PROPOSAL_SENT"] = "PROPOSAL_SENT";
    OpportunityStatus["NEGOTIATION"] = "NEGOTIATION";
    OpportunityStatus["WON"] = "WON";
    OpportunityStatus["LOST"] = "LOST";
    OpportunityStatus["ON_HOLD"] = "ON_HOLD";
})(OpportunityStatus || (exports.OpportunityStatus = OpportunityStatus = {}));
var OpportunityStage;
(function (OpportunityStage) {
    OpportunityStage["LEAD"] = "LEAD";
    OpportunityStage["OPPORTUNITY"] = "OPPORTUNITY";
    OpportunityStage["CUSTOMER"] = "CUSTOMER";
})(OpportunityStage || (exports.OpportunityStage = OpportunityStage = {}));
// Error Classes
class OpportunityError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'OpportunityError';
    }
}
exports.OpportunityError = OpportunityError;
class OpportunityNotFoundError extends OpportunityError {
    constructor(opportunityId) {
        super(`Opportunity with ID ${opportunityId} not found`, { opportunityId });
    }
}
exports.OpportunityNotFoundError = OpportunityNotFoundError;
class OpportunityValidationError extends OpportunityError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.OpportunityValidationError = OpportunityValidationError;
class Opportunities {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateOpportunityData(data) {
        if (!data.lead_id)
            throw new OpportunityValidationError('Lead ID is required');
        if (!data.assigned_to)
            throw new OpportunityValidationError('Assigned user ID is required');
        if (data.amount < 0)
            throw new OpportunityValidationError('Amount cannot be negative');
        if (data.probability < 0 || data.probability > 100) {
            throw new OpportunityValidationError('Probability must be between 0 and 100');
        }
    }
    mapResponse(data) {
        if (!data?.id)
            throw new OpportunityError('Invalid response format');
        return {
            id: data.id,
            object: 'opportunity',
            data: {
                lead_id: data.lead_id,
                customer_id: data.customer_id,
                status: data.status,
                stage: data.stage,
                amount: data.amount,
                currency: data.currency,
                expected_close_date: data.expected_close_date,
                assigned_to: data.assigned_to,
                description: data.description,
                probability: data.probability,
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
            if (params.lead_id)
                queryParams.append('lead_id', params.lead_id);
            if (params.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.stage)
                queryParams.append('stage', params.stage);
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
            const response = await this.stateset.request('GET', `opportunities?${queryParams.toString()}`);
            return {
                opportunities: response.opportunities.map(this.mapResponse),
                pagination: {
                    total: response.total || response.opportunities.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(opportunityId) {
        try {
            const response = await this.stateset.request('GET', `opportunities/${opportunityId}`);
            return this.mapResponse(response.opportunity);
        }
        catch (error) {
            throw this.handleError(error, 'get', opportunityId);
        }
    }
    async create(data) {
        this.validateOpportunityData(data);
        try {
            const response = await this.stateset.request('POST', 'opportunities', data);
            return this.mapResponse(response.opportunity);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(opportunityId, data) {
        try {
            const response = await this.stateset.request('PUT', `opportunities/${opportunityId}`, data);
            return this.mapResponse(response.opportunity);
        }
        catch (error) {
            throw this.handleError(error, 'update', opportunityId);
        }
    }
    async delete(opportunityId) {
        try {
            await this.stateset.request('DELETE', `opportunities/${opportunityId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', opportunityId);
        }
    }
    async convertToCustomer(opportunityId, customerId) {
        try {
            const response = await this.stateset.request('POST', `opportunities/${opportunityId}/convert`, { customer_id: customerId });
            return this.mapResponse(response.opportunity);
        }
        catch (error) {
            throw this.handleError(error, 'convertToCustomer', opportunityId);
        }
    }
    handleError(error, operation, opportunityId) {
        if (error.status === 404)
            throw new OpportunityNotFoundError(opportunityId || 'unknown');
        if (error.status === 400)
            throw new OpportunityValidationError(error.message, error.errors);
        throw new OpportunityError(`Failed to ${operation} opportunity: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Opportunities;
//# sourceMappingURL=Opportunity.js.map