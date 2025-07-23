"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditsDebitsValidationError = exports.CreditsDebitsNotFoundError = exports.CreditsDebitsError = exports.CreditDebitStatus = exports.CreditDebitType = void 0;
// Enums
var CreditDebitType;
(function (CreditDebitType) {
    CreditDebitType["CREDIT"] = "CREDIT";
    CreditDebitType["DEBIT"] = "DEBIT";
})(CreditDebitType || (exports.CreditDebitType = CreditDebitType = {}));
var CreditDebitStatus;
(function (CreditDebitStatus) {
    CreditDebitStatus["PENDING"] = "PENDING";
    CreditDebitStatus["APPLIED"] = "APPLIED";
    CreditDebitStatus["EXPIRED"] = "EXPIRED";
    CreditDebitStatus["CANCELLED"] = "CANCELLED";
})(CreditDebitStatus || (exports.CreditDebitStatus = CreditDebitStatus = {}));
// Error Classes
class CreditsDebitsError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'CreditsDebitsError';
    }
}
exports.CreditsDebitsError = CreditsDebitsError;
class CreditsDebitsNotFoundError extends CreditsDebitsError {
    constructor(creditsDebitsId) {
        super(`Credit/Debit with ID ${creditsDebitsId} not found`, { creditsDebitsId });
    }
}
exports.CreditsDebitsNotFoundError = CreditsDebitsNotFoundError;
class CreditsDebitsValidationError extends CreditsDebitsError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.CreditsDebitsValidationError = CreditsDebitsValidationError;
class CreditsDebits {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateCreditsDebitsData(data) {
        if (!data.customer_id)
            throw new CreditsDebitsValidationError('Customer ID is required');
        if (data.amount <= 0)
            throw new CreditsDebitsValidationError('Amount must be greater than 0');
        if (!data.issued_date)
            throw new CreditsDebitsValidationError('Issued date is required');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new CreditsDebitsError('Invalid response format');
        return {
            id: data.id,
            object: 'credit_debit',
            data: {
                customer_id: data.customer_id,
                type: data.type,
                status: data.status,
                amount: data.amount,
                currency: data.currency,
                reason: data.reason,
                issued_date: data.issued_date,
                expiry_date: data.expiry_date,
                applied_date: data.applied_date,
                order_id: data.order_id,
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
            if (params.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params.type)
                queryParams.append('type', params.type);
            if (params.status)
                queryParams.append('status', params.status);
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
            const response = await this.stateset.request('GET', `credits_debits?${queryParams.toString()}`);
            return {
                credits_debits: response.credits_debits.map(this.mapResponse),
                pagination: {
                    total: response.total || response.credits_debits.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(creditsDebitsId) {
        try {
            const response = await this.stateset.request('GET', `credits_debits/${creditsDebitsId}`);
            return this.mapResponse(response.credit_debit);
        }
        catch (error) {
            throw this.handleError(error, 'get', creditsDebitsId);
        }
    }
    async create(data) {
        this.validateCreditsDebitsData(data);
        try {
            const response = await this.stateset.request('POST', 'credits_debits', data);
            return this.mapResponse(response.credit_debit);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(creditsDebitsId, data) {
        try {
            const response = await this.stateset.request('PUT', `credits_debits/${creditsDebitsId}`, data);
            return this.mapResponse(response.credit_debit);
        }
        catch (error) {
            throw this.handleError(error, 'update', creditsDebitsId);
        }
    }
    async delete(creditsDebitsId) {
        try {
            await this.stateset.request('DELETE', `credits_debits/${creditsDebitsId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', creditsDebitsId);
        }
    }
    async applyCreditDebit(creditsDebitsId, appliedDate) {
        try {
            const response = await this.stateset.request('POST', `credits_debits/${creditsDebitsId}/apply`, { applied_date: appliedDate });
            return this.mapResponse(response.credit_debit);
        }
        catch (error) {
            throw this.handleError(error, 'applyCreditDebit', creditsDebitsId);
        }
    }
    handleError(error, operation, creditsDebitsId) {
        if (error.status === 404)
            throw new CreditsDebitsNotFoundError(creditsDebitsId || 'unknown');
        if (error.status === 400)
            throw new CreditsDebitsValidationError(error.message, error.errors);
        throw new CreditsDebitsError(`Failed to ${operation} credit/debit: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = CreditsDebits;
//# sourceMappingURL=CreditsDebits.js.map