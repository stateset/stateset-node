"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierValidationError = exports.SupplierNotFoundError = exports.SupplierError = exports.SupplierType = exports.SupplierStatus = void 0;
// Enums
var SupplierStatus;
(function (SupplierStatus) {
    SupplierStatus["ACTIVE"] = "ACTIVE";
    SupplierStatus["INACTIVE"] = "INACTIVE";
    SupplierStatus["PENDING"] = "PENDING";
    SupplierStatus["SUSPENDED"] = "SUSPENDED";
})(SupplierStatus = exports.SupplierStatus || (exports.SupplierStatus = {}));
var SupplierType;
(function (SupplierType) {
    SupplierType["MANUFACTURER"] = "MANUFACTURER";
    SupplierType["DISTRIBUTOR"] = "DISTRIBUTOR";
    SupplierType["WHOLESALER"] = "WHOLESALER";
    SupplierType["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
})(SupplierType = exports.SupplierType || (exports.SupplierType = {}));
// Error Classes
class SupplierError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.SupplierError = SupplierError;
class SupplierNotFoundError extends SupplierError {
    constructor(supplierId) {
        super(`Supplier with ID ${supplierId} not found`, { supplierId });
    }
}
exports.SupplierNotFoundError = SupplierNotFoundError;
class SupplierValidationError extends SupplierError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.SupplierValidationError = SupplierValidationError;
class Suppliers {
    constructor(client) {
        this.client = client;
    }
    validateSupplierData(data) {
        var _a, _b;
        if (!data.name)
            throw new SupplierValidationError('Supplier name is required');
        if (!data.supplier_code)
            throw new SupplierValidationError('Supplier code is required');
        if (!data.email)
            throw new SupplierValidationError('Email is required');
        if (!((_a = data.addresses) === null || _a === void 0 ? void 0 : _a.length))
            throw new SupplierValidationError('At least one address is required');
        if (!((_b = data.payment_terms) === null || _b === void 0 ? void 0 : _b.terms))
            throw new SupplierValidationError('Payment terms are required');
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new SupplierError('Invalid response format');
        return {
            id: data.id,
            object: 'supplier',
            data: {
                name: data.name,
                type: data.type,
                status: data.status,
                supplier_code: data.supplier_code,
                email: data.email,
                phone: data.phone,
                addresses: data.addresses,
                contacts: data.contacts,
                payment_terms: data.payment_terms,
                performance: data.performance,
                categories: data.categories,
                created_at: data.created_at,
                updated_at: data.updated_at,
                org_id: data.org_id,
                metadata: data.metadata,
                tags: data.tags,
            },
        };
    }
    async create(data) {
        this.validateSupplierData(data);
        try {
            const response = await this.client.request('POST', 'suppliers', data);
            return this.mapResponse(response.supplier);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async get(id) {
        try {
            const response = await this.client.request('GET', `suppliers/${id}`);
            return this.mapResponse(response.supplier);
        }
        catch (error) {
            throw this.handleError(error, 'get', id);
        }
    }
    async update(id, data) {
        try {
            const response = await this.client.request('PUT', `suppliers/${id}`, data);
            return this.mapResponse(response.supplier);
        }
        catch (error) {
            throw this.handleError(error, 'update', id);
        }
    }
    async list(params = {}) {
        var _a, _b;
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.category && { category: params.category }),
            ...(params.org_id && { org_id: params.org_id }),
            ...(((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.from) && { from: params.date_range.from.toISOString() }),
            ...(((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.to) && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.search && { search: params.search }),
        });
        try {
            const response = await this.client.request('GET', `suppliers?${query.toString()}`);
            return {
                suppliers: response.suppliers.map(this.mapResponse),
                pagination: response.pagination || { total: response.suppliers.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async delete(id) {
        try {
            await this.client.request('DELETE', `suppliers/${id}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', id);
        }
    }
    async getPerformanceMetrics(id) {
        try {
            const response = await this.client.request('GET', `suppliers/${id}/performance`);
            return response.performance;
        }
        catch (error) {
            throw this.handleError(error, 'getPerformanceMetrics', id);
        }
    }
    async updatePaymentTerms(id, data) {
        if (data.credit_limit && data.credit_limit < 0) {
            throw new SupplierValidationError('Credit limit cannot be negative');
        }
        try {
            const response = await this.client.request('PUT', `suppliers/${id}/payment-terms`, data);
            return this.mapResponse(response.supplier);
        }
        catch (error) {
            throw this.handleError(error, 'updatePaymentTerms', id);
        }
    }
    async listProducts(id, params = {}) {
        const query = new URLSearchParams({
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.category && { category: params.category }),
        });
        try {
            const response = await this.client.request('GET', `suppliers/${id}/products?${query.toString()}`);
            return {
                products: response.products,
                pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw this.handleError(error, 'listProducts', id);
        }
    }
    async addContact(id, contact) {
        try {
            const response = await this.client.request('POST', `suppliers/${id}/contacts`, contact);
            return this.mapResponse(response.supplier);
        }
        catch (error) {
            throw this.handleError(error, 'addContact', id);
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
            const response = await this.client.request('GET', `suppliers/metrics?${query.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getMetrics');
        }
    }
    handleError(error, operation, supplierId) {
        if (error.status === 404)
            throw new SupplierNotFoundError(supplierId || 'unknown');
        if (error.status === 400)
            throw new SupplierValidationError(error.message, error.errors);
        throw new SupplierError(`Failed to ${operation} supplier: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Suppliers;
