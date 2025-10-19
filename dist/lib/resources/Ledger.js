"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerValidationError = exports.LedgerNotFoundError = exports.LedgerError = exports.LedgerEventType = void 0;
// Enums
var LedgerEventType;
(function (LedgerEventType) {
    LedgerEventType["PAYMENT"] = "PAYMENT";
    LedgerEventType["REFUND"] = "REFUND";
    LedgerEventType["CREDIT"] = "CREDIT";
    LedgerEventType["DEBIT"] = "DEBIT";
    LedgerEventType["ADJUSTMENT"] = "ADJUSTMENT";
    LedgerEventType["SALE"] = "SALE";
    LedgerEventType["PURCHASE"] = "PURCHASE";
})(LedgerEventType || (exports.LedgerEventType = LedgerEventType = {}));
// Error Classes
class LedgerError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'LedgerError';
    }
}
exports.LedgerError = LedgerError;
class LedgerNotFoundError extends LedgerError {
    constructor(ledgerId) {
        super(`Ledger entry with ID ${ledgerId} not found`, { ledgerId });
    }
}
exports.LedgerNotFoundError = LedgerNotFoundError;
class LedgerValidationError extends LedgerError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.LedgerValidationError = LedgerValidationError;
class Ledger {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateLedgerData(data) {
        if (!data.reference_id)
            throw new LedgerValidationError('Reference ID is required');
        if (!data.event_date)
            throw new LedgerValidationError('Event date is required');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new LedgerError('Invalid response format');
        return {
            id: data.id,
            object: 'ledger',
            data: {
                event_type: data.event_type,
                reference_id: data.reference_id,
                customer_id: data.customer_id,
                amount: data.amount,
                currency: data.currency,
                event_date: data.event_date,
                description: data.description,
                account_id: data.account_id,
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
            if (params.event_type)
                queryParams.append('event_type', params.event_type);
            if (params.reference_id)
                queryParams.append('reference_id', params.reference_id);
            if (params.customer_id)
                queryParams.append('customer_id', params.customer_id);
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
            const response = await this.stateset.request('GET', `ledger_entries?${queryParams.toString()}`);
            return {
                ledger_entries: response.ledger_entries.map(this.mapResponse),
                pagination: {
                    total: response.total || response.ledger_entries.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(ledgerId) {
        try {
            const response = await this.stateset.request('GET', `ledger_entries/${ledgerId}`);
            return this.mapResponse(response.ledger_entry);
        }
        catch (error) {
            throw this.handleError(error, 'get', ledgerId);
        }
    }
    async create(data) {
        this.validateLedgerData(data);
        try {
            const response = await this.stateset.request('POST', 'ledger_entries', data);
            return this.mapResponse(response.ledger_entry);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(ledgerId, data) {
        try {
            const response = await this.stateset.request('PUT', `ledger_entries/${ledgerId}`, data);
            return this.mapResponse(response.ledger_entry);
        }
        catch (error) {
            throw this.handleError(error, 'update', ledgerId);
        }
    }
    async delete(ledgerId) {
        try {
            await this.stateset.request('DELETE', `ledger_entries/${ledgerId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', ledgerId);
        }
    }
    async getBalance(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.customer_id)
                queryParams.append('customer_id', params.customer_id);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
        }
        try {
            const response = await this.stateset.request('GET', `ledger_entries/balance?${queryParams.toString()}`);
            return response;
        }
        catch (error) {
            throw this.handleError(error, 'getBalance');
        }
    }
    handleError(error, operation, ledgerId) {
        if (error.status === 404)
            throw new LedgerNotFoundError(ledgerId || 'unknown');
        if (error.status === 400)
            throw new LedgerValidationError(error.message, error.errors);
        throw new LedgerError(`Failed to ${operation} ledger entry: ${error.message}`, {
            operation,
            originalError: error,
        });
    }
}
exports.default = Ledger;
//# sourceMappingURL=Ledger.js.map