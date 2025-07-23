"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeOperationError = exports.AttributeValidationError = exports.AttributeNotFoundError = exports.AttributeImpact = exports.AttributeCategory = exports.AttributeType = void 0;
// Enums for attribute types and categories
var AttributeType;
(function (AttributeType) {
    AttributeType["PERSONALITY"] = "personality";
    AttributeType["TONE"] = "tone";
    AttributeType["SKILL"] = "skill";
    AttributeType["KNOWLEDGE"] = "knowledge";
    AttributeType["STYLE"] = "style";
})(AttributeType || (exports.AttributeType = AttributeType = {}));
var AttributeCategory;
(function (AttributeCategory) {
    AttributeCategory["COMMUNICATION"] = "communication";
    AttributeCategory["BEHAVIOR"] = "behavior";
    AttributeCategory["EXPERTISE"] = "expertise";
    AttributeCategory["LANGUAGE"] = "language";
    AttributeCategory["PERFORMANCE"] = "performance";
})(AttributeCategory || (exports.AttributeCategory = AttributeCategory = {}));
var AttributeImpact;
(function (AttributeImpact) {
    AttributeImpact["HIGH"] = "high";
    AttributeImpact["MEDIUM"] = "medium";
    AttributeImpact["LOW"] = "low";
})(AttributeImpact || (exports.AttributeImpact = AttributeImpact = {}));
// Custom error classes
class AttributeNotFoundError extends Error {
    constructor(attributeId) {
        super(`Attribute with ID ${attributeId} not found`);
        this.name = 'AttributeNotFoundError';
    }
}
exports.AttributeNotFoundError = AttributeNotFoundError;
class AttributeValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AttributeValidationError';
    }
}
exports.AttributeValidationError = AttributeValidationError;
class AttributeOperationError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'AttributeOperationError';
    }
}
exports.AttributeOperationError = AttributeOperationError;
// Main Attributes class
class Attributes {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Validates attribute value against min/max constraints
     */
    validateAttributeValue(value, min, max) {
        if (value === undefined)
            return;
        if (min !== undefined && value < min) {
            throw new AttributeValidationError(`Value ${value} is below minimum allowed value of ${min}`);
        }
        if (max !== undefined && value > max) {
            throw new AttributeValidationError(`Value ${value} exceeds maximum allowed value of ${max}`);
        }
    }
    /**
     * List all attributes with optional filtering
     */
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.attribute_type)
            queryParams.append('attribute_type', params.attribute_type);
        if (params?.category)
            queryParams.append('category', params.category);
        if (params?.agent_id)
            queryParams.append('agent_id', params.agent_id);
        if (params?.org_id)
            queryParams.append('org_id', params.org_id);
        if (params?.activated !== undefined)
            queryParams.append('activated', params.activated.toString());
        const response = await this.stateset.request('GET', `attributes?${queryParams.toString()}`);
        return response.attributes;
    }
    /**
     * Get a specific attribute by ID
     */
    async get(attributeId) {
        try {
            const response = await this.stateset.request('GET', `attributes/${attributeId}`);
            return response.attribute;
        }
        catch (error) {
            if (error.status === 404) {
                throw new AttributeNotFoundError(attributeId);
            }
            throw error;
        }
    }
    /**
     * Create a new attribute
     */
    async create(params) {
        // Validate value constraints
        this.validateAttributeValue(params.value, params.min_value, params.max_value);
        try {
            const response = await this.stateset.request('POST', 'attributes', params);
            return response.attribute;
        }
        catch (error) {
            throw new AttributeOperationError(error.message || 'Failed to create attribute', error.code || 'CREATION_FAILED');
        }
    }
    /**
     * Update an existing attribute
     */
    async update(attributeId, params) {
        try {
            // Get current attribute to validate against existing constraints
            const currentAttribute = await this.get(attributeId);
            // Determine final min/max values for validation
            const minValue = params.min_value ?? currentAttribute.min_value;
            const maxValue = params.max_value ?? currentAttribute.max_value;
            // Validate new value against constraints
            this.validateAttributeValue(params.value, minValue, maxValue);
            const response = await this.stateset.request('PUT', `attributes/${attributeId}`, params);
            return response.attribute;
        }
        catch (error) {
            if (error instanceof AttributeNotFoundError) {
                throw error;
            }
            throw new AttributeOperationError(error.message || 'Failed to update attribute', error.code || 'UPDATE_FAILED');
        }
    }
    /**
     * Delete an attribute
     */
    async delete(attributeId) {
        try {
            await this.stateset.request('DELETE', `attributes/${attributeId}`);
        }
        catch (error) {
            if (error.status === 404) {
                throw new AttributeNotFoundError(attributeId);
            }
            throw error;
        }
    }
    /**
     * Bulk create attributes
     */
    async bulkCreate(attributes) {
        // Validate all attributes before sending request
        attributes.forEach(attr => {
            this.validateAttributeValue(attr.value, attr.min_value, attr.max_value);
        });
        const response = await this.stateset.request('POST', 'attributes/bulk', { attributes });
        return response.attributes;
    }
    /**
     * Copy attributes from one agent to another
     */
    async copyAttributes(sourceAgentId, targetAgentId) {
        const response = await this.stateset.request('POST', 'attributes/copy', {
            source_agent_id: sourceAgentId,
            target_agent_id: targetAgentId
        });
        return response.attributes;
    }
    /**
     * Get attribute history for an agent
     */
    async getHistory(attributeId, params) {
        const queryParams = new URLSearchParams();
        if (params?.start_date)
            queryParams.append('start_date', params.start_date.toISOString());
        if (params?.end_date)
            queryParams.append('end_date', params.end_date.toISOString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        const response = await this.stateset.request('GET', `attributes/${attributeId}/history?${queryParams.toString()}`);
        return response.history;
    }
}
exports.default = Attributes;
//# sourceMappingURL=Attribute.js.map