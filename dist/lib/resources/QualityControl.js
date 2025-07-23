"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityControlValidationError = exports.QualityControlNotFoundError = exports.QualityControlError = exports.QualityControlStatus = void 0;
// Enums
var QualityControlStatus;
(function (QualityControlStatus) {
    QualityControlStatus["PENDING"] = "PENDING";
    QualityControlStatus["IN_PROGRESS"] = "IN_PROGRESS";
    QualityControlStatus["PASSED"] = "PASSED";
    QualityControlStatus["FAILED"] = "FAILED";
    QualityControlStatus["ON_HOLD"] = "ON_HOLD";
})(QualityControlStatus || (exports.QualityControlStatus = QualityControlStatus = {}));
// Error Classes
class QualityControlError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'QualityControlError';
    }
}
exports.QualityControlError = QualityControlError;
class QualityControlNotFoundError extends QualityControlError {
    constructor(qualityControlId) {
        super(`Quality control with ID ${qualityControlId} not found`, { qualityControlId });
    }
}
exports.QualityControlNotFoundError = QualityControlNotFoundError;
class QualityControlValidationError extends QualityControlError {
    errors;
    constructor(message, errors) {
        super(message);
        this.errors = errors;
    }
}
exports.QualityControlValidationError = QualityControlValidationError;
class QualityControl {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    validateQualityControlData(data) {
        if (!data.inspector_id)
            throw new QualityControlValidationError('Inspector ID is required');
        if (!data.inspection_date)
            throw new QualityControlValidationError('Inspection date is required');
        if (!data.standards?.length)
            throw new QualityControlValidationError('At least one quality standard is required');
    }
    mapResponse(data) {
        if (!data?.id)
            throw new QualityControlError('Invalid response format');
        return {
            id: data.id,
            object: 'quality_control',
            data: {
                order_id: data.order_id,
                product_id: data.product_id,
                status: data.status,
                inspection_date: data.inspection_date,
                inspector_id: data.inspector_id,
                standards: data.standards,
                results: data.results,
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
            if (params.order_id)
                queryParams.append('order_id', params.order_id);
            if (params.product_id)
                queryParams.append('product_id', params.product_id);
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
            const response = await this.stateset.request('GET', `quality_controls?${queryParams.toString()}`);
            return {
                quality_controls: response.quality_controls.map(this.mapResponse),
                pagination: {
                    total: response.total || response.quality_controls.length,
                    limit: params?.limit || 100,
                    offset: params?.offset || 0,
                },
            };
        }
        catch (error) {
            throw this.handleError(error, 'list');
        }
    }
    async get(qualityControlId) {
        try {
            const response = await this.stateset.request('GET', `quality_controls/${qualityControlId}`);
            return this.mapResponse(response.quality_control);
        }
        catch (error) {
            throw this.handleError(error, 'get', qualityControlId);
        }
    }
    async create(data) {
        this.validateQualityControlData(data);
        try {
            const response = await this.stateset.request('POST', 'quality_controls', data);
            return this.mapResponse(response.quality_control);
        }
        catch (error) {
            throw this.handleError(error, 'create');
        }
    }
    async update(qualityControlId, data) {
        try {
            const response = await this.stateset.request('PUT', `quality_controls/${qualityControlId}`, data);
            return this.mapResponse(response.quality_control);
        }
        catch (error) {
            throw this.handleError(error, 'update', qualityControlId);
        }
    }
    async delete(qualityControlId) {
        try {
            await this.stateset.request('DELETE', `quality_controls/${qualityControlId}`);
        }
        catch (error) {
            throw this.handleError(error, 'delete', qualityControlId);
        }
    }
    async recordResults(qualityControlId, results) {
        try {
            const response = await this.stateset.request('POST', `quality_controls/${qualityControlId}/results`, { results });
            return this.mapResponse(response.quality_control);
        }
        catch (error) {
            throw this.handleError(error, 'recordResults', qualityControlId);
        }
    }
    handleError(error, operation, qualityControlId) {
        if (error.status === 404)
            throw new QualityControlNotFoundError(qualityControlId || 'unknown');
        if (error.status === 400)
            throw new QualityControlValidationError(error.message, error.errors);
        throw new QualityControlError(`Failed to ${operation} quality control: ${error.message}`, { operation, originalError: error });
    }
}
exports.default = QualityControl;
//# sourceMappingURL=QualityControl.js.map