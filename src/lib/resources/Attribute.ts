import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums for attribute types and categories
export enum AttributeType {
  PERSONALITY = 'personality',
  TONE = 'tone',
  SKILL = 'skill',
  KNOWLEDGE = 'knowledge',
  STYLE = 'style',
}

export enum AttributeCategory {
  COMMUNICATION = 'communication',
  BEHAVIOR = 'behavior',
  EXPERTISE = 'expertise',
  LANGUAGE = 'language',
  PERFORMANCE = 'performance',
}

export enum AttributeImpact {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Response Interfaces
export interface AttributeResponse {
  attributes: AttributeData[];
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
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AttributeOperationError';
  }
}

// Main Attributes class
class Attributes extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'attributes', 'attributes');
    this.singleKey = 'attribute';
    this.listKey = 'attributes';
  }

  /**
   * Validates attribute value against min/max constraints
   */
  private validateAttributeValue(value?: number, min?: number, max?: number): void {
    if (value === undefined) return;

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
  override async list(params?: {
    attribute_type?: AttributeType;
    category?: AttributeCategory;
    agent_id?: string;
    org_id?: string;
    activated?: boolean;
  }): Promise<AttributeData[]> {
    const response = await super.list(params as any);
    return (response as any).attributes ?? response;
  }

  /**
   * Get a specific attribute by ID
   */
  override async get(attributeId: string): Promise<AttributeData> {
    return super.get(attributeId);
  }

  /**
   * Create a new attribute
   */
  override async create(params: CreateAttributeParams): Promise<AttributeData> {
    // Validate value constraints
    this.validateAttributeValue(params.value, params.min_value, params.max_value);
    return super.create(params);
  }

  /**
   * Update an existing attribute
   */
  override async update(attributeId: string, params: UpdateAttributeParams): Promise<AttributeData> {
    try {
      // Get current attribute to validate against existing constraints
      const currentAttribute = await this.get(attributeId);

      // Determine final min/max values for validation
      const minValue = params.min_value ?? currentAttribute.min_value;
      const maxValue = params.max_value ?? currentAttribute.max_value;

      // Validate new value against constraints
      this.validateAttributeValue(params.value, minValue, maxValue);
      return await super.update(attributeId, params);
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
  override async delete(attributeId: string): Promise<void> {
    await super.delete(attributeId);
  }

  /**
   * Bulk create attributes
   */
  override async bulkCreate(attributes: CreateAttributeParams[]): Promise<AttributeData[]> {
    // Validate all attributes before sending request
    attributes.forEach(attr => {
      this.validateAttributeValue(attr.value, attr.min_value, attr.max_value);
    });

    const response = await this.client.request('POST', 'attributes/bulk', { attributes });
    return (response as any).attributes ?? response;
  }

  /**
   * Copy attributes from one agent to another
   */
  async copyAttributes(sourceAgentId: string, targetAgentId: string): Promise<AttributeData[]> {
    const response = await this.client.request('POST', 'attributes/copy', {
      source_agent_id: sourceAgentId,
      target_agent_id: targetAgentId,
    });
    return (response as any).attributes ?? response;
  }

  /**
   * Get attribute history for an agent
   */
  async getHistory(
    attributeId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      limit?: number;
    }
  ): Promise<Array<AttributeData & { timestamp: string }>> {
    const requestParams: Record<string, unknown> = {};
    if (params?.start_date) requestParams.start_date = params.start_date.toISOString();
    if (params?.end_date) requestParams.end_date = params.end_date.toISOString();
    if (params?.limit) requestParams.limit = params.limit;

    const response = await this.client.request(
      'GET',
      `attributes/${attributeId}/history`,
      undefined,
      { params: requestParams }
    );
    return (response as any).history ?? response;
  }
}

export default Attributes;
