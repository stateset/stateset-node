"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidationError = exports.PaymentNotFoundError = exports.PaymentError = exports.PaymentMethod = exports.PaymentStatus = void 0;
// Enums
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["PAYPAL"] = "PAYPAL";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
// Error Classes
class PaymentError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'PaymentError';
    }
}
exports.PaymentError = PaymentError;
class PaymentNotFoundError extends PaymentError {
    constructor(paymentId) {
        super(`Payment with ID ${paymentId} not found`, { paymentId });
    }
}
exports.PaymentNotFoundError = PaymentNotFoundError;
class PaymentValidationError extends PaymentError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.PaymentValidationError = PaymentValidationError;
class Payments {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validatePaymentData(data) {
        if (!data.customer_id)
            throw new PaymentValidationError('Customer ID is required');
        if (!data.payment_date)
            throw new PaymentValidationError('Payment date is required');
        if (data.amount <= 0)
            throw new PaymentValidationError('Amount must be greater than 0');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new PaymentError('Invalid response format');
        return {
            id: data.id,
            object: 'payment',
            data: {
                customer_id: data.customer_id,
                order_id: data.order_id,
                invoice_id: data.invoice_id,
                status: data.status,
                method: data.method,
                amount: data.amount,
                currency: data.currency,
                transaction_id: data.transaction_id,
                payment_date: data.payment_date,
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
            if (params.order_id)
                queryParams.append('order_id', params.order_id);
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
            const response = await this.stateset.request('GET', `payments?${queryParams.toString()}`);
            return {
                payments: response.payments.map(this.mapResponse),
                pagination: {
                    total: response.total || response.payments.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(paymentId) {
        try {
            const response = await this.stateset.request('GET', `payments/${paymentId}`);
            return this.mapResponse(response.payment);
        }
        catch (error) {
            throw this.handleError(error, 'get', paymentId);
        }
    }
    async create(data) {
        this.validatePaymentData(data);
        try {
            const response = await this.stateset.request('POST', 'payments', data);
            return this.mapResponse(response.payment);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(paymentId, data) {
        try {
            const response = await this.stateset.request('PUT', `payments/${paymentId}`, data);
            return this.mapResponse(response.payment);
        }
        catch (error) {
            throw this.handleError(error, 'update', paymentId);
        }
    }
    async delete(paymentId) {
        try {
            await this.stateset.request('DELETE', `payments/${paymentId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', paymentId);
        }
    }
    async processPayment(paymentId, transactionId) {
        try {
            const response = await this.stateset.request('POST', `payments/${paymentId}/process`, { transaction_id: transactionId });
            return this.mapResponse(response.payment);
        }
        catch (error) {
            throw this.handleError(error, 'processPayment', paymentId);
        }
    }
    handleError(error, operation, paymentId) {
        if (error.status === 404)
            throw new PaymentNotFoundError(paymentId || 'unknown');
        if (error.status === 400)
            throw new PaymentValidationError(error.message, error.errors);
        throw new PaymentError(`Failed to ${operation} payment: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Payments;
//# sourceMappingURL=Payment.js.map