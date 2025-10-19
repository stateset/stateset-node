"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceUtilizationValidationError = exports.ResourceUtilizationNotFoundError = exports.ResourceUtilizationError = exports.ResourceCategory = exports.ResourceUtilizationStatus = void 0;
// Enums
var ResourceUtilizationStatus;
(function (ResourceUtilizationStatus) {
    ResourceUtilizationStatus["AVAILABLE"] = "AVAILABLE";
    ResourceUtilizationStatus["IN_USE"] = "IN_USE";
    ResourceUtilizationStatus["MAINTENANCE"] = "MAINTENANCE";
    ResourceUtilizationStatus["RESERVED"] = "RESERVED";
})(ResourceUtilizationStatus || (exports.ResourceUtilizationStatus = ResourceUtilizationStatus = {}));
var ResourceCategory;
(function (ResourceCategory) {
    ResourceCategory["WAREHOUSE"] = "WAREHOUSE";
    ResourceCategory["MANUFACTURING"] = "MANUFACTURING";
    ResourceCategory["STAFFING"] = "STAFFING";
})(ResourceCategory || (exports.ResourceCategory = ResourceCategory = {}));
// Error Classes
class ResourceUtilizationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ResourceUtilizationError';
    }
}
exports.ResourceUtilizationError = ResourceUtilizationError;
class ResourceUtilizationNotFoundError extends ResourceUtilizationError {
    constructor(resourceUtilizationId) {
        super(`Resource utilization with ID ${resourceUtilizationId} not found`, {
            resourceUtilizationId,
        });
    }
}
exports.ResourceUtilizationNotFoundError = ResourceUtilizationNotFoundError;
class ResourceUtilizationValidationError extends ResourceUtilizationError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.ResourceUtilizationValidationError = ResourceUtilizationValidationError;
class ResourceUtilization {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateResourceUtilizationData(data) {
        if (!data.resource_id)
            throw new ResourceUtilizationValidationError('Resource ID is required');
        if (!data.utilization_start)
            throw new ResourceUtilizationValidationError('Utilization start date is required');
        if (data.capacity < 0)
            throw new ResourceUtilizationValidationError('Capacity cannot be negative');
        if (data.utilized_capacity < 0)
            throw new ResourceUtilizationValidationError('Utilized capacity cannot be negative');
        if (data.efficiency < 0 || data.efficiency > 100)
            throw new ResourceUtilizationValidationError('Efficiency must be between 0 and 100');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new ResourceUtilizationError('Invalid response format');
        return {
            id: data.id,
            object: 'resource_utilization',
            data: {
                resource_id: data.resource_id,
                category: data.category,
                status: data.status,
                utilization_start: data.utilization_start,
                utilization_end: data.utilization_end,
                warehouse_id: data.warehouse_id,
                manufacture_order_id: data.manufacture_order_id,
                employee_id: data.employee_id,
                capacity: data.capacity,
                utilized_capacity: data.utilized_capacity,
                efficiency: data.efficiency,
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
            if (params.resource_id)
                queryParams.append('resource_id', params.resource_id);
            if (params.category)
                queryParams.append('category', params.category);
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
            const response = await this.stateset.request('GET', `resource_utilizations?${queryParams.toString()}`);
            return {
                resource_utilizations: response.resource_utilizations.map(this.mapResponse),
                pagination: {
                    total: response.total || response.resource_utilizations.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(resourceUtilizationId) {
        try {
            const response = await this.stateset.request('GET', `resource_utilizations/${resourceUtilizationId}`);
            return this.mapResponse(response.resource_utilization);
        }
        catch (error) {
            throw this.handleError(error, 'get', resourceUtilizationId);
        }
    }
    async create(data) {
        this.validateResourceUtilizationData(data);
        try {
            const response = await this.stateset.request('POST', 'resource_utilizations', data);
            return this.mapResponse(response.resource_utilization);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(resourceUtilizationId, data) {
        try {
            const response = await this.stateset.request('PUT', `resource_utilizations/${resourceUtilizationId}`, data);
            return this.mapResponse(response.resource_utilization);
        }
        catch (error) {
            throw this.handleError(error, 'update', resourceUtilizationId);
        }
    }
    async delete(resourceUtilizationId) {
        try {
            await this.stateset.request('DELETE', `resource_utilizations/${resourceUtilizationId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', resourceUtilizationId);
        }
    }
    async updateUtilization(resourceUtilizationId, utilizationData) {
        try {
            const response = await this.stateset.request('POST', `resource_utilizations/${resourceUtilizationId}/utilization`, utilizationData);
            return this.mapResponse(response.resource_utilization);
        }
        catch (error) {
            throw this.handleError(error, 'updateUtilization', resourceUtilizationId);
        }
    }
    handleError(error, operation, resourceUtilizationId) {
        if (error.status === 404)
            throw new ResourceUtilizationNotFoundError(resourceUtilizationId || 'unknown');
        if (error.status === 400)
            throw new ResourceUtilizationValidationError(error.message, error.errors);
        throw new ResourceUtilizationError(`Failed to ${operation} resource utilization: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = ResourceUtilization;
//# sourceMappingURL=ResourceUtilization.js.map