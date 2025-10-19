"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorValidationError = exports.VendorNotFoundError = exports.VendorError = exports.VendorType = exports.VendorStatus = void 0;
// Enums
var VendorStatus;
(function (VendorStatus) {
    VendorStatus["ACTIVE"] = "ACTIVE";
    VendorStatus["INACTIVE"] = "INACTIVE";
    VendorStatus["PENDING"] = "PENDING";
    VendorStatus["SUSPENDED"] = "SUSPENDED";
})(VendorStatus || (exports.VendorStatus = VendorStatus = {}));
var VendorType;
(function (VendorType) {
    VendorType["SUPPLIER"] = "SUPPLIER";
    VendorType["SERVICE_PROVIDER"] = "SERVICE_PROVIDER";
    VendorType["CONTRACTOR"] = "CONTRACTOR";
})(VendorType || (exports.VendorType = VendorType = {}));
// Error Classes
class VendorError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'VendorError';
    }
}
exports.VendorError = VendorError;
class VendorNotFoundError extends VendorError {
    constructor(vendorId) {
        super(`Vendor with ID ${vendorId} not found`, { vendorId });
    }
}
exports.VendorNotFoundError = VendorNotFoundError;
class VendorValidationError extends VendorError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.VendorValidationError = VendorValidationError;
class Vendors {
    client;
    constructor(client) {
        this.client = client;
    }
    validateVendorData(data) {
        if (!data.name)
            throw new VendorValidationError('Vendor name is required');
        if (!data.vendor_code)
            throw new VendorValidationError('Vendor code is required');
        if (!data.addresses?.length)
            throw new VendorValidationError('At least one address is required');
        if (!data.contacts?.length)
            throw new VendorValidationError('At least one contact is required');
        if (!data.payment_terms?.terms)
            throw new VendorValidationError('Payment terms are required');
        if (data.payment_terms?.credit_limit && data.payment_terms.credit_limit < 0) {
            throw new VendorValidationError('Credit limit cannot be negative');
        }
    }
    mapResponse(data) {
        if (!data?.id)
            throw new VendorError('Invalid response format');
        return {
            id: data.id,
            object: 'vendor',
            data: {
                name: data.name,
                vendor_code: data.vendor_code,
                status: data.status,
                type: data.type,
                addresses: data.addresses,
                contacts: data.contacts,
                payment_terms: data.payment_terms,
                performance: data.performance,
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
            if (params.status)
                queryParams.append('status', params.status);
            if (params.type)
                queryParams.append('type', params.type);
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.limit)
                queryParams.append('limit', params.limit.toString());
            if (params.offset)
                queryParams.append('offset', params.offset.toString());
        }
        try {
            const response = await this.client.request('GET', `vendors?${queryParams.toString()}`);
            return {
                vendors: response.vendors.map(this.mapResponse),
                pagination: {
                    total: response.total || response.vendors.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(vendorId) {
        try {
            const response = await this.client.request('GET', `vendors/${vendorId}`);
            return this.mapResponse(response.vendor);
        }
        catch (error) {
            throw this.handleError(error, 'get', vendorId);
        }
    }
    async create(data) {
        this.validateVendorData(data);
        try {
            const response = await this.client.request('POST', 'vendors', data);
            return this.mapResponse(response.vendor);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(vendorId, data) {
        try {
            const response = await this.client.request('PUT', `vendors/${vendorId}`, data);
            return this.mapResponse(response.vendor);
        }
        catch (error) {
            throw this.handleError(error, 'update', vendorId);
        }
    }
    async delete(vendorId) {
        try {
            await this.client.request('DELETE', `vendors/${vendorId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', vendorId);
        }
    }
    async getPerformanceMetrics(vendorId) {
        try {
            const response = await this.client.request('GET', `vendors/${vendorId}/performance`);
            return response.performance;
        }
        catch (error) {
            throw this.handleError(error, 'getPerformanceMetrics', vendorId);
        }
    }
    async updatePaymentTerms(vendorId, data) {
        if (data.credit_limit && data.credit_limit < 0) {
            throw new VendorValidationError('Credit limit cannot be negative');
        }
        try {
            const response = await this.client.request('PUT', `vendors/${vendorId}/payment-terms`, data);
            return this.mapResponse(response.vendor);
        }
        catch (error) {
            throw this.handleError(error, 'updatePaymentTerms', vendorId);
        }
    }
    async addContact(vendorId, contact) {
        if (!contact.first_name || !contact.last_name) {
            throw new VendorValidationError('Contact first and last names are required');
        }
        try {
            const response = await this.client.request('POST', `vendors/${vendorId}/contacts`, contact);
            return this.mapResponse(response.vendor);
        }
        catch (error) {
            throw this.handleError(error, 'addContact', vendorId);
        }
    }
    async getVendorMetrics(params) {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.org_id)
                queryParams.append('org_id', params.org_id);
            if (params.date_from)
                queryParams.append('date_from', params.date_from.toISOString());
            if (params.date_to)
                queryParams.append('date_to', params.date_to.toISOString());
        }
        try {
            const response = await this.client.request('GET', `vendors/metrics?${queryParams.toString()}`);
            return response.metrics;
        }
        catch (error) {
            throw this.handleError(error, 'getVendorMetrics');
        }
    }
    handleError(error, operation, vendorId) {
        if (error.status === 404)
            throw new VendorNotFoundError(vendorId || 'unknown');
        if (error.status === 400)
            throw new VendorValidationError(error.message, error.errors);
        throw new VendorError(`Failed to ${operation} vendor: ${error.message}`, {
            operation,
            originalError: error,
        });
    }
}
exports.default = Vendors;
//# sourceMappingURL=Vendor.js.map