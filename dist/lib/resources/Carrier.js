"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrierValidationError = exports.CarrierNotFoundError = exports.CarrierError = exports.CarrierType = exports.CarrierStatus = void 0;
// Enums
var CarrierStatus;
(function (CarrierStatus) {
    CarrierStatus["ACTIVE"] = "ACTIVE";
    CarrierStatus["INACTIVE"] = "INACTIVE";
    CarrierStatus["SUSPENDED"] = "SUSPENDED";
})(CarrierStatus || (exports.CarrierStatus = CarrierStatus = {}));
var CarrierType;
(function (CarrierType) {
    CarrierType["FREIGHT"] = "FREIGHT";
    CarrierType["PARCEL"] = "PARCEL";
    CarrierType["COURIER"] = "COURIER";
})(CarrierType || (exports.CarrierType = CarrierType = {}));
// Error Classes
class CarrierError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'CarrierError';
    }
}
exports.CarrierError = CarrierError;
class CarrierNotFoundError extends CarrierError {
    constructor(carrierId) {
        super(`Carrier with ID ${carrierId} not found`, { carrierId });
    }
}
exports.CarrierNotFoundError = CarrierNotFoundError;
class CarrierValidationError extends CarrierError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.CarrierValidationError = CarrierValidationError;
class Carriers {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateCarrierData(data) {
        if (!data.name)
            throw new CarrierValidationError('Carrier name is required');
        if (!data.carrier_code)
            throw new CarrierValidationError('Carrier code is required');
        if (data.rates?.some(rate => rate.base_rate < 0)) {
            throw new CarrierValidationError('Base rate cannot be negative');
        }
    }
    mapResponse(data) {
        if (!data?.id)
            throw new CarrierError('Invalid response format');
        return {
            id: data.id,
            object: 'carrier',
            data: {
                name: data.name,
                carrier_code: data.carrier_code,
                status: data.status,
                type: data.type,
                contact_email: data.contact_email,
                contact_phone: data.contact_phone,
                rates: data.rates,
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
            const response = await this.stateset.request('GET', `carriers?${queryParams.toString()}`);
            return {
                carriers: response.carriers.map(this.mapResponse),
                pagination: {
                    total: response.total || response.carriers.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(carrierId) {
        try {
            const response = await this.stateset.request('GET', `carriers/${carrierId}`);
            return this.mapResponse(response.carrier);
        }
        catch (error) {
            throw this.handleError(error, 'get', carrierId);
        }
    }
    async create(data) {
        this.validateCarrierData(data);
        try {
            const response = await this.stateset.request('POST', 'carriers', data);
            return this.mapResponse(response.carrier);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(carrierId, data) {
        try {
            const response = await this.stateset.request('PUT', `carriers/${carrierId}`, data);
            return this.mapResponse(response.carrier);
        }
        catch (error) {
            throw this.handleError(error, 'update', carrierId);
        }
    }
    async delete(carrierId) {
        try {
            await this.stateset.request('DELETE', `carriers/${carrierId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', carrierId);
        }
    }
    async updatePerformance(carrierId, performance) {
        try {
            const response = await this.stateset.request('POST', `carriers/${carrierId}/performance`, { performance });
            return this.mapResponse(response.carrier);
        }
        catch (error) {
            throw this.handleError(error, 'updatePerformance', carrierId);
        }
    }
    handleError(error, operation, carrierId) {
        if (error.status === 404)
            throw new CarrierNotFoundError(carrierId || 'unknown');
        if (error.status === 400)
            throw new CarrierValidationError(error.message, error.errors);
        throw new CarrierError(`Failed to ${operation} carrier: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Carriers;
//# sourceMappingURL=Carrier.js.map