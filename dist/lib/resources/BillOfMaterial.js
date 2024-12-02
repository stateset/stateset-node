"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOMStateError = exports.BOMValidationError = exports.BOMNotFoundError = exports.ComponentType = exports.BOMStatus = void 0;
// Enums and Types
var BOMStatus;
(function (BOMStatus) {
    BOMStatus["DRAFT"] = "DRAFT";
    BOMStatus["ACTIVE"] = "ACTIVE";
    BOMStatus["OBSOLETE"] = "OBSOLETE";
    BOMStatus["REVISION"] = "REVISION";
})(BOMStatus = exports.BOMStatus || (exports.BOMStatus = {}));
var ComponentType;
(function (ComponentType) {
    ComponentType["RAW_MATERIAL"] = "raw_material";
    ComponentType["SUB_ASSEMBLY"] = "sub_assembly";
    ComponentType["FINISHED_GOOD"] = "finished_good";
    ComponentType["PACKAGING"] = "packaging";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
// Custom Error Classes
class BOMNotFoundError extends Error {
    constructor(bomId) {
        super(`Bill of Materials with ID ${bomId} not found`);
        this.name = 'BOMNotFoundError';
    }
}
exports.BOMNotFoundError = BOMNotFoundError;
class BOMValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BOMValidationError';
    }
}
exports.BOMValidationError = BOMValidationError;
class BOMStateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BOMStateError';
    }
}
exports.BOMStateError = BOMStateError;
// Main BillOfMaterials Class
class BillOfMaterials {
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Validates a BOM component
     */
    validateComponent(component) {
        if (component.quantity <= 0) {
            throw new BOMValidationError('Component quantity must be greater than 0');
        }
        if (component.minimum_order_quantity && component.minimum_order_quantity < 0) {
            throw new BOMValidationError('Minimum order quantity cannot be negative');
        }
        if (component.unit_cost && component.unit_cost < 0) {
            throw new BOMValidationError('Unit cost cannot be negative');
        }
    }
    /**
     * Processes API response into typed BOMResponse
     */
    handleCommandResponse(response) {
        if (response.error) {
            throw new Error(response.error);
        }
        if (!response.update_billofmaterials_by_pk) {
            throw new Error('Unexpected response format');
        }
        const bomData = response.update_billofmaterials_by_pk;
        const baseResponse = {
            id: bomData.id,
            object: 'billofmaterials',
            created_at: bomData.created_at,
            updated_at: bomData.updated_at,
            status: bomData.status,
            data: bomData.data
        };
        switch (bomData.status) {
            case BOMStatus.DRAFT:
                return { ...baseResponse, status: BOMStatus.DRAFT, draft: true };
            case BOMStatus.ACTIVE:
                return { ...baseResponse, status: BOMStatus.ACTIVE, active: true };
            case BOMStatus.OBSOLETE:
                return { ...baseResponse, status: BOMStatus.OBSOLETE, obsolete: true };
            case BOMStatus.REVISION:
                return {
                    ...baseResponse,
                    status: BOMStatus.REVISION,
                    revision: true,
                    previous_version_id: bomData.previous_version_id
                };
            default:
                throw new Error(`Unexpected BOM status: ${bomData.status}`);
        }
    }
    /**
     * List all BOMs with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params === null || params === void 0 ? void 0 : params.status)
            queryParams.append('status', params.status);
        if (params === null || params === void 0 ? void 0 : params.product_id)
            queryParams.append('product_id', params.product_id);
        if (params === null || params === void 0 ? void 0 : params.org_id)
            queryParams.append('org_id', params.org_id);
        if (params === null || params === void 0 ? void 0 : params.effective_after)
            queryParams.append('effective_after', params.effective_after.toISOString());
        if (params === null || params === void 0 ? void 0 : params.effective_before)
            queryParams.append('effective_before', params.effective_before.toISOString());
        const response = await this.stateset.request('GET', `billofmaterials?${queryParams.toString()}`);
        return response.map((bom) => this.handleCommandResponse({ update_billofmaterials_by_pk: bom }));
    }
    /**
     * Get a specific BOM by ID
     */
    async get(bomId) {
        try {
            const response = await this.stateset.request('GET', `billofmaterials/${bomId}`);
            return this.handleCommandResponse({ update_billofmaterials_by_pk: response });
        }
        catch (error) {
            if (error.status === 404) {
                throw new BOMNotFoundError(bomId);
            }
            throw error;
        }
    }
    /**
     * Create a new BOM
     * @param bomData - BOMData object
     * @returns BOMResponse object
     */
    async create(bomData) {
        // Validate all components
        bomData.components.forEach(this.validateComponent);
        const response = await this.stateset.request('POST', 'billofmaterials', bomData);
        return this.handleCommandResponse(response);
    }
    /**
     * Update an existing BOM
     * @param bomId - BOM ID
     * @param bomData - Partial<BOMData> object
     * @returns BOMResponse object
     */
    async update(bomId, bomData) {
        if (bomData.components) {
            bomData.components.forEach(this.validateComponent);
        }
        try {
            const response = await this.stateset.request('PUT', `billofmaterials/${bomId}`, bomData);
            return this.handleCommandResponse(response);
        }
        catch (error) {
            if (error.status === 404) {
                throw new BOMNotFoundError(bomId);
            }
            throw error;
        }
    }
    /**
     * Delete a BOM
     */
    async delete(bomId) {
        try {
            await this.stateset.request('DELETE', `billofmaterials/${bomId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new BOMNotFoundError(bomId);
            }
            throw error;
        }
    }
    /**
     * Status management methods
     */
    async setActive(bomId) {
        const response = await this.stateset.request('POST', `billofmaterials/${bomId}/set-active`);
        return this.handleCommandResponse(response);
    }
    async setObsolete(bomId) {
        const response = await this.stateset.request('POST', `billofmaterials/${bomId}/set-obsolete`);
        return this.handleCommandResponse(response);
    }
    async startRevision(bomId, revisionNotes) {
        const response = await this.stateset.request('POST', `billofmaterials/${bomId}/start-revision`, { revision_notes: revisionNotes });
        return this.handleCommandResponse(response);
    }
    async completeRevision(bomId) {
        const response = await this.stateset.request('POST', `billofmaterials/${bomId}/complete-revision`);
        return this.handleCommandResponse(response);
    }
    /**
     * Component management methods
     */
    async addComponent(bomId, component) {
        this.validateComponent(component);
        const response = await this.stateset.request('POST', `billofmaterials/${bomId}/add-component`, component);
        return this.handleCommandResponse(response);
    }
    async updateComponent(bomId, componentId, updates) {
        const response = await this.stateset.request('PUT', `billofmaterials/${bomId}/components/${componentId}`, updates);
        return this.handleCommandResponse(response);
    }
    async removeComponent(bomId, componentId) {
        const response = await this.stateset.request('DELETE', `billofmaterials/${bomId}/components/${componentId}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Cost calculation methods
     */
    async calculateTotalCost(bomId) {
        const response = await this.stateset.request('GET', `billofmaterials/${bomId}/cost-analysis`);
        return response;
    }
    /**
     * Version management methods
     */
    async getVersionHistory(bomId) {
        const response = await this.stateset.request('GET', `billofmaterials/${bomId}/versions`);
        return response.versions;
    }
    /**
     * Export methods
     */
    async export(bomId, format) {
        const response = await this.stateset.request('GET', `billofmaterials/${bomId}/export?format=${format}`);
        return response.url;
    }
}
exports.default = BillOfMaterials;
