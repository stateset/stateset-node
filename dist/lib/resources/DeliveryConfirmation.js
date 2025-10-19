"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryConfirmationValidationError = exports.DeliveryConfirmationNotFoundError = exports.DeliveryConfirmationError = exports.DeliveryConfirmationStatus = void 0;
// Enums
var DeliveryConfirmationStatus;
(function (DeliveryConfirmationStatus) {
    DeliveryConfirmationStatus["PENDING"] = "PENDING";
    DeliveryConfirmationStatus["CONFIRMED"] = "CONFIRMED";
    DeliveryConfirmationStatus["DISPUTED"] = "DISPUTED";
    DeliveryConfirmationStatus["FAILED"] = "FAILED";
})(DeliveryConfirmationStatus || (exports.DeliveryConfirmationStatus = DeliveryConfirmationStatus = {}));
// Error Classes
class DeliveryConfirmationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'DeliveryConfirmationError';
    }
}
exports.DeliveryConfirmationError = DeliveryConfirmationError;
class DeliveryConfirmationNotFoundError extends DeliveryConfirmationError {
    constructor(deliveryConfirmationId) {
        super(`Delivery confirmation with ID ${deliveryConfirmationId} not found`, {
            deliveryConfirmationId,
        });
    }
}
exports.DeliveryConfirmationNotFoundError = DeliveryConfirmationNotFoundError;
class DeliveryConfirmationValidationError extends DeliveryConfirmationError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.DeliveryConfirmationValidationError = DeliveryConfirmationValidationError;
class DeliveryConfirmations {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateDeliveryConfirmationData(data) {
        if (!data.shipment_id)
            throw new DeliveryConfirmationValidationError('Shipment ID is required');
        if (!data.delivery_date)
            throw new DeliveryConfirmationValidationError('Delivery date is required');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new DeliveryConfirmationError('Invalid response format');
        return {
            id: data.id,
            object: 'delivery_confirmation',
            data: {
                shipment_id: data.shipment_id,
                status: data.status,
                delivery_date: data.delivery_date,
                recipient_name: data.recipient_name,
                proof_of_delivery: data.proof_of_delivery,
                confirmed_by: data.confirmed_by,
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
            if (params.shipment_id)
                queryParams.append('shipment_id', params.shipment_id);
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
            const response = await this.stateset.request('GET', `delivery_confirmations?${queryParams.toString()}`);
            return {
                delivery_confirmations: response.delivery_confirmations.map(this.mapResponse),
                pagination: {
                    total: response.total || response.delivery_confirmations.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(deliveryConfirmationId) {
        try {
            const response = await this.stateset.request('GET', `delivery_confirmations/${deliveryConfirmationId}`);
            return this.mapResponse(response.delivery_confirmation);
        }
        catch (error) {
            throw this.handleError(error, 'get', deliveryConfirmationId);
        }
    }
    async create(data) {
        this.validateDeliveryConfirmationData(data);
        try {
            const response = await this.stateset.request('POST', 'delivery_confirmations', data);
            return this.mapResponse(response.delivery_confirmation);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(deliveryConfirmationId, data) {
        try {
            const response = await this.stateset.request('PUT', `delivery_confirmations/${deliveryConfirmationId}`, data);
            return this.mapResponse(response.delivery_confirmation);
        }
        catch (error) {
            throw this.handleError(error, 'update', deliveryConfirmationId);
        }
    }
    async delete(deliveryConfirmationId) {
        try {
            await this.stateset.request('DELETE', `delivery_confirmations/${deliveryConfirmationId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', deliveryConfirmationId);
        }
    }
    async confirmDelivery(deliveryConfirmationId, confirmationData) {
        try {
            const response = await this.stateset.request('POST', `delivery_confirmations/${deliveryConfirmationId}/confirm`, confirmationData);
            return this.mapResponse(response.delivery_confirmation);
        }
        catch (error) {
            throw this.handleError(error, 'confirmDelivery', deliveryConfirmationId);
        }
    }
    handleError(error, operation, deliveryConfirmationId) {
        if (error.status === 404)
            throw new DeliveryConfirmationNotFoundError(deliveryConfirmationId || 'unknown');
        if (error.status === 400)
            throw new DeliveryConfirmationValidationError(error.message, error.errors);
        throw new DeliveryConfirmationError(`Failed to ${operation} delivery confirmation: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = DeliveryConfirmations;
//# sourceMappingURL=DeliveryConfirmation.js.map