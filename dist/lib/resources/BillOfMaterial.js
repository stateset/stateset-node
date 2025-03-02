"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillOfMaterials = exports.BOMStateError = exports.BOMValidationError = exports.BOMNotFoundError = exports.BOMError = exports.ComponentType = exports.BOMStatus = void 0;
// Enums
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
// Error Classes
class BOMError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
exports.BOMError = BOMError;
class BOMNotFoundError extends BOMError {
    constructor(bomId) {
        super(`Bill of Materials with ID ${bomId} not found`, 'BOMNotFoundError');
    }
}
exports.BOMNotFoundError = BOMNotFoundError;
class BOMValidationError extends BOMError {
    constructor(message) {
        super(message, 'BOMValidationError');
    }
}
exports.BOMValidationError = BOMValidationError;
class BOMStateError extends BOMError {
    constructor(message) {
        super(message, 'BOMStateError');
    }
}
exports.BOMStateError = BOMStateError;
// Main BillOfMaterials Class
class BillOfMaterials {
    constructor(client) {
        this.client = client;
    }
    async request(method, path, data) {
        try {
            const response = await this.client.request(method, path, data);
            return response.update_billofmaterials_by_pk || response;
        }
        catch (error) {
            if (error === null || error === void 0 ? void 0 : error.error) {
                throw new BOMValidationError(error.error);
            }
            if (error.status === 404) {
                throw new BOMNotFoundError(path.split('/')[2] || 'unknown');
            }
            if (error.status === 400) {
                throw new BOMStateError(error.message);
            }
            throw error;
        }
    }
    validateComponent(component) {
        if (component.quantity <= 0) {
            throw new BOMValidationError(`Invalid quantity ${component.quantity} for component ${component.item_id}`);
        }
        if (component.unit_cost && component.unit_cost < 0) {
            throw new BOMValidationError(`Invalid unit cost ${component.unit_cost} for component ${component.item_id}`);
        }
        if (component.minimum_order_quantity && component.minimum_order_quantity < 0) {
            throw new BOMValidationError(`Invalid MOQ ${component.minimum_order_quantity} for component ${component.item_id}`);
        }
        if (component.lead_time && component.lead_time < 0) {
            throw new BOMValidationError(`Invalid lead time ${component.lead_time} for component ${component.item_id}`);
        }
    }
    async list(params = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value instanceof Date ? value.toISOString() : String(value));
            }
        });
        return this.request('GET', `billofmaterials?${queryParams.toString()}`);
    }
    async get(bomId) {
        return this.request('GET', `billofmaterials/${bomId}`);
    }
    async create(bomData) {
        if (!bomData.components.length) {
            throw new BOMValidationError('BOM must contain at least one component');
        }
        bomData.components.forEach(this.validateComponent);
        return this.request('POST', 'billofmaterials', bomData);
    }
    async update(bomId, bomData) {
        if (bomData.components) {
            bomData.components.forEach(this.validateComponent);
        }
        return this.request('PUT', `billofmaterials/${bomId}`, bomData);
    }
    async delete(bomId) {
        await this.request('DELETE', `billofmaterials/${bomId}`);
    }
    // Status Management
    async setActive(bomId) {
        return this.request('POST', `billofmaterials/${bomId}/set-active`);
    }
    async setObsolete(bomId) {
        return this.request('POST', `billofmaterials/${bomId}/set-obsolete`);
    }
    async startRevision(bomId, revisionNotes) {
        return this.request('POST', `billofmaterials/${bomId}/start-revision`, { revision_notes: revisionNotes });
    }
    async completeRevision(bomId) {
        return this.request('POST', `billofmaterials/${bomId}/complete-revision`);
    }
    // Component Management
    async addComponent(bomId, component) {
        this.validateComponent({ ...component, id: 'temp' }); // Temporary ID for validation
        return this.request('POST', `billofmaterials/${bomId}/add-component`, component);
    }
    async updateComponent(bomId, componentId, updates) {
        this.validateComponent({ ...updates, id: componentId, item_id: 'temp', quantity: updates.quantity || 1, type: ComponentType.RAW_MATERIAL });
        return this.request('PUT', `billofmaterials/${bomId}/components/${componentId}`, updates);
    }
    async removeComponent(bomId, componentId) {
        return this.request('DELETE', `billofmaterials/${bomId}/components/${componentId}`);
    }
    // Cost Management
    async calculateTotalCost(bomId) {
        return this.request('GET', `billofmaterials/${bomId}/cost-analysis`);
    }
    // Version Management
    async getVersionHistory(bomId) {
        return this.request('GET', `billofmaterials/${bomId}/versions`);
    }
    // Export
    async export(bomId, format) {
        return this.request('GET', `billofmaterials/${bomId}/export?format=${format}`);
    }
    // Validation
    async validateBOM(bomId) {
        return this.request('GET', `billofmaterials/${bomId}/validate`);
    }
}
exports.BillOfMaterials = BillOfMaterials;
exports.default = BillOfMaterials;
