"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteValidationError = exports.RouteNotFoundError = exports.RouteError = exports.RouteStatus = void 0;
// Enums
var RouteStatus;
(function (RouteStatus) {
    RouteStatus["PLANNED"] = "PLANNED";
    RouteStatus["IN_PROGRESS"] = "IN_PROGRESS";
    RouteStatus["COMPLETED"] = "COMPLETED";
    RouteStatus["CANCELLED"] = "CANCELLED";
})(RouteStatus = exports.RouteStatus || (exports.RouteStatus = {}));
// Error Classes
class RouteError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'RouteError';
    }
}
exports.RouteError = RouteError;
class RouteNotFoundError extends RouteError {
    constructor(routeId) {
        super(`Route with ID ${routeId} not found`, { routeId });
    }
}
exports.RouteNotFoundError = RouteNotFoundError;
class RouteValidationError extends RouteError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.RouteValidationError = RouteValidationError;
class Routes {
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateRouteData(data) {
        var _a;
        if (!data.carrier_id)
            throw new RouteValidationError('Carrier ID is required');
        if (!data.start_location.address.line1)
            throw new RouteValidationError('Start location address is required');
        if (!data.end_location.address.line1)
            throw new RouteValidationError('End location address is required');
        if (!((_a = data.shipment_ids) === null || _a === void 0 ? void 0 : _a.length))
            throw new RouteValidationError('At least one shipment ID is required');
        if (data.estimated_distance < 0)
            throw new RouteValidationError('Estimated distance cannot be negative');
        if (data.estimated_duration < 0)
            throw new RouteValidationError('Estimated duration cannot be negative');
        if (data.cost_estimate < 0)
            throw new RouteValidationError('Cost estimate cannot be negative');
    }
    mapResponse(data) {
        if (!(data === null || data === void 0 ? void 0 : data.id))
            throw new RouteError('Invalid response format');
        return {
            id: data.id,
            object: 'route',
            data: {
                carrier_id: data.carrier_id,
                status: data.status,
                start_location: data.start_location,
                end_location: data.end_location,
                shipment_ids: data.shipment_ids,
                estimated_distance: data.estimated_distance,
                actual_distance: data.actual_distance,
                estimated_duration: data.estimated_duration,
                actual_duration: data.actual_duration,
                cost_estimate: data.cost_estimate,
                actual_cost: data.actual_cost,
                currency: data.currency,
                start_time: data.start_time,
                end_time: data.end_time,
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
            if (params.carrier_id)
                queryParams.append('carrier_id', params.carrier_id);
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
            const response = await this.stateset.request('GET', `routes?${queryParams.toString()}`);
            return {
                routes: response.routes.map(this.mapResponse),
                pagination: {
                    total: response.total || response.routes.length,
                    limit: (params === null || params === void 0 ? void 0 : params.limit) || 100,
                    offset: (params === null || params === void 0 ? void 0 : params.offset) || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(routeId) {
        try {
            const response = await this.stateset.request('GET', `routes/${routeId}`);
            return this.mapResponse(response.route);
        }
        catch (error) {
            throw this.handleError(error, 'get', routeId);
        }
    }
    async create(data) {
        this.validateRouteData(data);
        try {
            const response = await this.stateset.request('POST', 'routes', data);
            return this.mapResponse(response.route);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(routeId, data) {
        try {
            const response = await this.stateset.request('PUT', `routes/${routeId}`, data);
            return this.mapResponse(response.route);
        }
        catch (error) {
            throw this.handleError(error, 'update', routeId);
        }
    }
    async delete(routeId) {
        try {
            await this.stateset.request('DELETE', `routes/${routeId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', routeId);
        }
    }
    async optimizeRoute(routeId) {
        try {
            const response = await this.stateset.request('POST', `routes/${routeId}/optimize`, {});
            return this.mapResponse(response.route);
        }
        catch (error) {
            throw this.handleError(error, 'optimizeRoute', routeId);
        }
    }
    handleError(error, operation, routeId) {
        if (error.status === 404)
            throw new RouteNotFoundError(routeId || 'unknown');
        if (error.status === 400)
            throw new RouteValidationError(error.message, error.errors);
        throw new RouteError(`Failed to ${operation} route: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = Routes;
