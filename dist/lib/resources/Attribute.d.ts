import type { ApiClientLike } from '../../types';
export declare enum AttributeType {
    PERSONALITY = "personality",
    TONE = "tone",
    SKILL = "skill",
    KNOWLEDGE = "knowledge",
    STYLE = "style"
}
export declare enum AttributeCategory {
    COMMUNICATION = "communication",
    BEHAVIOR = "behavior",
    EXPERTISE = "expertise",
    LANGUAGE = "language",
    PERFORMANCE = "performance"
}
export declare enum AttributeImpact {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface AttributeResponse {
    attributes: AttributeData[];
}
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
export declare class AttributeNotFoundError extends Error {
    constructor(attributeId: string);
}
export declare class AttributeValidationError extends Error {
    constructor(message: string);
}
export declare class AttributeOperationError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
declare class Attributes {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * Validates attribute value against min/max constraints
     */
    private validateAttributeValue;
    /**
     * List all attributes with optional filtering
     */
    list(params?: {
        attribute_type?: AttributeType;
        category?: AttributeCategory;
        agent_id?: string;
        org_id?: string;
        activated?: boolean;
    }): Promise<AttributeData[]>;
    /**
     * Get a specific attribute by ID
     */
    get(attributeId: string): Promise<AttributeData>;
    /**
     * Create a new attribute
     */
    create(params: CreateAttributeParams): Promise<AttributeData>;
    /**
     * Update an existing attribute
     */
    update(attributeId: string, params: UpdateAttributeParams): Promise<AttributeData>;
    /**
     * Delete an attribute
     */
    delete(attributeId: string): Promise<void>;
    /**
     * Bulk create attributes
     */
    bulkCreate(attributes: CreateAttributeParams[]): Promise<AttributeData[]>;
    /**
     * Copy attributes from one agent to another
     */
    copyAttributes(sourceAgentId: string, targetAgentId: string): Promise<AttributeData[]>;
    /**
     * Get attribute history for an agent
     */
    getHistory(attributeId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        limit?: number;
    }): Promise<Array<AttributeData & {
        timestamp: string;
    }>>;
}
export default Attributes;
//# sourceMappingURL=Attribute.d.ts.map