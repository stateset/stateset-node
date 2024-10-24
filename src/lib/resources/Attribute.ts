import { stateset } from '../../stateset-client';

// Enums for attribute types and categories
export enum AttributeType {
  PERSONALITY = 'personality',
  TONE = 'tone',
  SKILL = 'skill',
  KNOWLEDGE = 'knowledge',
  STYLE = 'style'
}

export enum AttributeCategory {
  COMMUNICATION = 'communication',
  BEHAVIOR = 'behavior',
  EXPERTISE = 'expertise',
  LANGUAGE = 'language',
  PERFORMANCE = 'performance'
}

export enum AttributeImpact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// Interface for attribute data
export interface AttributeData {
  id: string;
  attribute_name: string;
  attribute_type: AttributeType;
  value?: number;
  max_value?: number;
  min_value?: number;
  category: AttributeCategory;
  description?: string;
  modifiable?: boolean;
  impact?: AttributeImpact;
  created_at?: string;
  updated_at?: string;
  org_id?: string;
  activated?: boolean;
  agent_id?: string;
  user_id?: string;
}

// Interface for creating new attributes
export interface CreateAttributeParams {
  attribute_name: string;
  attribute_type: AttributeType;
  category: AttributeCategory;
  value?: number;
  max_value?: number;
  min_value?: number;
  description?: string;
  modifiable?: boolean;
  impact?: AttributeImpact;
  org_id?: string;
  agent_id?: string;
  user_id?: string;
}

// Interface for updating attributes
export interface UpdateAttributeParams {
  attribute_name?: string;
  attribute_type?: AttributeType;
  value?: number;
  max_value?: number;
  min_value?: number;
  category?: AttributeCategory;
  description?: string;
  modifiable?: boolean;
  impact?: AttributeImpact;
  activated?: boolean;
}

// Custom error classes
export class AttributeNotFoundError extends Error {
  constructor(attributeId: string) {
    super(`Attribute with ID ${attributeId} not found`);
    this.name = 'AttributeNotFoundError';
  }
}

export class AttributeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AttributeValidationError';
  }
}

export class AttributeOperationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AttributeOperationError';
  }
}

// Main Attributes class
class Attributes {
  constructor(private readonly stateset: stateset) {}

  /**
   * Validates attribute value against min/max constraints
   */
  private validateAttributeValue(value?: number, min?: number, max?: number): void {
    if (value === undefined) return;
    
    if (min !== undefined && value < min) {
      throw new AttributeValidationError(
        `Value ${value} is below minimum allowed value of ${min}`
      );
    }
    
    if (max !== undefined && value > max) {
      throw new AttributeValidationError(
        `Value ${value} exceeds maximum allowed value of ${max}`
      );
    }
  }

  /**
   * List all attributes with optional filtering
   */
  async list(params?: {
    attribute_type?: AttributeType;
    category?: AttributeCategory;
    agent_id?: string;
    org_id?: string;
    activated?: boolean;
  }): Promise<AttributeData[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.attribute_type) queryParams.append('attribute_type', params.attribute_type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.activated !== undefined) queryParams.append('activated', params.activated.toString());

    const response = await this.stateset.request('GET', `attributes?${queryParams.toString()}`);
    return response.attributes;
  }

  /**
   * Get a specific attribute by ID
   */
  async get(attributeId: string): Promise<AttributeData> {
    try {
      const response = await this.stateset.request('GET', `attributes/${attributeId}`);
      return response.attribute;
    } catch (error: any) {
      if (error.status === 404) {
        throw new AttributeNotFoundError(attributeId);
      }
      throw error;
    }
  }

  /**
   * Create a new attribute
   */
  async create(params: CreateAttributeParams): Promise<AttributeData> {
    // Validate value constraints
    this.validateAttributeValue(params.value, params.min_value, params.max_value);

    try {
      const response = await this.stateset.request('POST', 'attributes', params);
      return response.attribute;
    } catch (error: any) {
      throw new AttributeOperationError(
        error.message || 'Failed to create attribute',
        error.code || 'CREATION_FAILED'
      );
    }
  }

  /**
   * Update an existing attribute
   */
  async update(attributeId: string, params: UpdateAttributeParams): Promise<AttributeData> {
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
    } catch (error: any) {
      if (error instanceof AttributeNotFoundError) {
        throw error;
      }
      throw new AttributeOperationError(
        error.message || 'Failed to update attribute',
        error.code || 'UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete an attribute
   */
  async delete(attributeId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `attributes/${attributeId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new AttributeNotFoundError(attributeId);
      }
      throw error;
    }
  }

  /**
   * Bulk create attributes
   */
  async bulkCreate(attributes: CreateAttributeParams[]): Promise<AttributeData[]> {
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
  async copyAttributes(sourceAgentId: string, targetAgentId: string): Promise<AttributeData[]> {
    const response = await this.stateset.request('POST', 'attributes/copy', {
      source_agent_id: sourceAgentId,
      target_agent_id: targetAgentId
    });
    return response.attributes;
  }

  /**
   * Get attribute history for an agent
   */
  async getHistory(attributeId: string, params?: {
    start_date?: Date;
    end_date?: Date;
    limit?: number;
  }): Promise<Array<AttributeData & { timestamp: string }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `attributes/${attributeId}/history?${queryParams.toString()}`
    );
    return response.history;
  }
}

export default Attributes;