"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customers = exports.CustomerValidationError = exports.CustomerNotFoundError = exports.CustomerError = exports.CustomerType = exports.CustomerStatus = void 0;
// Enums
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["PROSPECT"] = "PROSPECT";
    CustomerStatus["SUSPENDED"] = "SUSPENDED";
})(CustomerStatus = exports.CustomerStatus || (exports.CustomerStatus = {}));
var CustomerType;
(function (CustomerType) {
    CustomerType["INDIVIDUAL"] = "INDIVIDUAL";
    CustomerType["BUSINESS"] = "BUSINESS";
    CustomerType["GOVERNMENT"] = "GOVERNMENT";
    CustomerType["NONPROFIT"] = "NONPROFIT";
})(CustomerType = exports.CustomerType || (exports.CustomerType = {}));
// Error Classes
class CustomerError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.CustomerError = CustomerError;
class CustomerNotFoundError extends CustomerError {
    constructor(customerId) {
        super(`Customer with ID ${customerId} not found`, { customerId });
    }
}
exports.CustomerNotFoundError = CustomerNotFoundError;
class CustomerValidationError extends CustomerError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.CustomerValidationError = CustomerValidationError;
// Main Customers Class
class Customers {
    constructor(client) {
        this.client = client;
    }
    validateCustomerData(data) {
        var _a, _b;
        if (!data.name)
            throw new CustomerValidationError('Customer name is required');
        if (!data.email)
            throw new CustomerValidationError('Email is required');
        if (!((_a = data.addresses) === null || _a === void 0 ? void 0 : _a.length))
            throw new CustomerValidationError('At least one address is required');
        if (((_b = data.billing_info) === null || _b === void 0 ? void 0 : _b.credit_limit) && data.billing_info.credit_limit < 0) {
            throw new CustomerValidationError('Credit limit cannot be negative');
        }
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new CustomerError('Invalid response format');
        return {
            id: data.id,
            object: 'customer',
            data: {
                name: data.name,
                type: data.type,
                status: data.status,
                email: data.email,
                phone: data.phone,
                addresses: data.addresses,
                contacts: data.contacts,
                billing_info: data.billing_info,
                preferences: data.preferences,
                created_at: data.created_at,
                updated_at: data.updated_at,
                last_activity: data.last_activity,
                org_id: data.org_id,
                metadata: data.metadata,
                tags: data.tags,
            },
        };
    }
    async list(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.search && { search: params.search }),
        });
        try {
            const response = await this.client.request('GET', `customers?${query.toString()}`);
            return {
                customers: response.customers.map(this.mapResponse),
                pagination: response.pagination || { total: response.customers.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(customerId) {
        try {
            const response = await this.client.request('GET', `customers/${customerId}`);
            return this.mapResponse(response.customer);
        }
        catch (error) {
            throw this.handleError(error, 'get', customerId);
        }
    }
    async create(data) {
        this.validateCustomerData(data);
        try {
            const response = await this.client.request('POST', 'customers', data);
            return this.mapResponse(response.customer);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(customerId, data) {
        try {
            const response = await this.client.request('PUT', `customers/${customerId}`, data);
            return this.mapResponse(response.customer);
        }
        catch (error) {
            throw this.handleError(error, 'update', customerId);
        }
    }
    async delete(customerId) {
        try {
            await this.client.request('DELETE', `customers/${customerId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', customerId);
        }
    }
    async addAddress(customerId, address) {
        try {
            const response = await this.client.request('POST', `customers/${customerId}/addresses`, address);
            return this.mapResponse(response.customer);
        }
        catch (error) {
            throw this.handleError(error, 'addAddress', customerId);
        }
    }
    async addContact(customerId, contact) {
        try {
            const response = await this.client.request('POST', `customers/${customerId}/contacts`, contact);
            return this.mapResponse(response.customer);
        }
        catch (error) {
            throw this.handleError(error, 'addContact', customerId);
        }
    }
    async getMetrics(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.type && { type: params.type }),
        });
        try {
            const response = await this.client.request('GET', `customers/metrics?${query.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, customerId) {
        if (error.status === 404)
            throw new CustomerNotFoundError(customerId || 'unknown');
        if (error.status === 400)
            throw new CustomerValidationError(error.message, error.errors);
        throw new CustomerError(`Failed to ${operation} customer: ${error.message}`, { operation, originalError: error });
    }
}
exports.Customers = Customers;
exports.default = Customers;
