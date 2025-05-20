"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseTicketValidationError = exports.CaseTicketNotFoundError = exports.CaseTicketError = exports.EscalationLevel = exports.CaseTicketPriority = exports.CaseTicketStatus = void 0;
// Enums
var CaseTicketStatus;
(function (CaseTicketStatus) {
    CaseTicketStatus["OPEN"] = "OPEN";
    CaseTicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    CaseTicketStatus["RESOLVED"] = "RESOLVED";
    CaseTicketStatus["CLOSED"] = "CLOSED";
    CaseTicketStatus["ON_HOLD"] = "ON_HOLD";
})(CaseTicketStatus = exports.CaseTicketStatus || (exports.CaseTicketStatus = {}));
var CaseTicketPriority;
(function (CaseTicketPriority) {
    CaseTicketPriority["LOW"] = "LOW";
    CaseTicketPriority["MEDIUM"] = "MEDIUM";
    CaseTicketPriority["HIGH"] = "HIGH";
    CaseTicketPriority["URGENT"] = "URGENT";
})(CaseTicketPriority = exports.CaseTicketPriority || (exports.CaseTicketPriority = {}));
var EscalationLevel;
(function (EscalationLevel) {
    EscalationLevel["LOW"] = "LOW";
    EscalationLevel["MEDIUM"] = "MEDIUM";
    EscalationLevel["HIGH"] = "HIGH";
    EscalationLevel["CRITICAL"] = "CRITICAL";
})(EscalationLevel = exports.EscalationLevel || (exports.EscalationLevel = {}));
// Error Classes
class CaseTicketError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'CaseTicketError';
    }
}
exports.CaseTicketError = CaseTicketError;
class CaseTicketNotFoundError extends CaseTicketError {
    constructor(caseTicketId) {
        super(`Case/Ticket with ID ${caseTicketId} not found`, { caseTicketId });
    }
}
exports.CaseTicketNotFoundError = CaseTicketNotFoundError;
class CaseTicketValidationError extends CaseTicketError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.CaseTicketValidationError = CaseTicketValidationError;
class CasesTickets {
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateCaseTicketData(data) {
        if (!data.customer_id)
            throw new CaseTicketValidationError('Customer ID is required');
        if (!data.subject)
            throw new CaseTicketValidationError('Subject is required');
        if (!data.description)
            throw new CaseTicketValidationError('Description is required');
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new CaseTicketError('Invalid response format');
        return {
            id: data.id,
            object: 'case_ticket',
            data: {
                customer_id: data.customer_id,
                order_id: data.order_id,
                product_id: data.product_id,
                status: data.status,
                priority: data.priority,
                subject: data.subject,
                description: data.description,
                assigned_to: data.assigned_to,
                created_at: data.created_at,
                updated_at: data.updated_at,
                resolved_at: data.resolved_at,
                notes: data.notes,
                org_id: data.org_id,
                metadata: data.metadata,
            },
        };
    }
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params.order_id)
                queryParams.append('order_id', params.order_id);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.priority)
                queryParams.append('priority', params.priority);
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
            const response = await this.stateset.request('GET', `cases_tickets?${queryParams.toString()}`);
            return {
                cases_tickets: response.cases_tickets.map(this.mapResponse),
                pagination: {
                    total: response.total || response.cases_tickets.length,
                    limit: (params === null || params === void 0 ? void 0 : params.limit) || 100,
                    offset: (params === null || params === void 0 ? void 0 : params.offset) || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async search(query, params = {}) {
        const queryParams = new URLSearchParams({ query });
        if (params.status)
            queryParams.append('status', params.status);
        if (params.priority)
            queryParams.append('priority', params.priority);
        if (params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params.limit)
            queryParams.append('limit', params.limit.toString());
        if (params.offset)
            queryParams.append('offset', params.offset.toString());
        try {
            const response = await this.stateset.request('GET', `cases_tickets/search?${queryParams.toString()}`);
            return {
                cases_tickets: response.cases_tickets.map(this.mapResponse),
                pagination: {
                    total: response.total || response.cases_tickets.length,
                    limit: params.limit || 100,
                    offset: params.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'search');
        }
    }
    async get(caseTicketId) {
        try {
            const response = await this.stateset.request('GET', `cases_tickets/${caseTicketId}`);
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'get', caseTicketId);
        }
    }
    async create(data) {
        this.validateCaseTicketData(data);
        try {
            const response = await this.stateset.request('POST', 'cases_tickets', data);
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(caseTicketId, data) {
        try {
            const response = await this.stateset.request('PUT', `cases_tickets/${caseTicketId}`, data);
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'update', caseTicketId);
        }
    }
    async delete(caseTicketId) {
        try {
            await this.stateset.request('DELETE', `cases_tickets/${caseTicketId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', caseTicketId);
        }
    }
    async resolve(caseTicketId, resolutionNotes) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/resolve`, { notes: resolutionNotes });
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'resolve', caseTicketId);
        }
    }
    async assign(caseTicketId, agentId) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/assign`, { agent_id: agentId });
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'assign', caseTicketId);
        }
    }
    async addNote(caseTicketId, note) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/notes`, { note });
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'addNote', caseTicketId);
        }
    }
    async listNotes(caseTicketId) {
        try {
            const response = await this.stateset.request('GET', `cases_tickets/${caseTicketId}/notes`);
            return response.notes || [];
        }
        catch (error) {
            throw this.handleError(error, 'listNotes', caseTicketId);
        }
    }
    async escalate(caseTicketId, level) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/escalate`, { level });
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'escalate', caseTicketId);
        }
    }
    async close(caseTicketId) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/close`);
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'close', caseTicketId);
        }
    }
    async reopen(caseTicketId, note) {
        try {
            const response = await this.stateset.request('POST', `cases_tickets/${caseTicketId}/reopen`, { note });
            return this.mapResponse(response.case_ticket);
        }
        catch (error) {
            throw this.handleError(error, 'reopen', caseTicketId);
        }
    }
    handleError(error, operation, caseTicketId) {
        if (error.status === 404)
            throw new CaseTicketNotFoundError(caseTicketId || 'unknown');
        if (error.status === 400)
            throw new CaseTicketValidationError(error.message, error.errors);
        throw new CaseTicketError(`Failed to ${operation} case/ticket: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = CasesTickets;
