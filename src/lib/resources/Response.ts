import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums for response management
export enum ResponseType {
  TEXT = 'text',
  ACTION = 'action',
  ERROR = 'error',
  SYSTEM = 'system',
}

export enum ResponseStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
}

// Interfaces for response data structures
export interface ResponseData {
  content: string;
  type: ResponseType;
  status?: ResponseStatus;
  metadata?: Record<string, any>;
  agent_id?: string;
  user_id?: string;
  org_id?: string;
}

// Response interface
export interface AgentResponseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  data: ResponseData;
}

// Custom error classes
export class ResponseNotFoundError extends Error {
  constructor(responseId: string) {
    super(`Response with ID ${responseId} not found`);
    this.name = 'ResponseNotFoundError';
  }
}

export class ResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResponseValidationError';
  }
}

// Main Responses class
class Responses extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'responses', 'responses');
    this.singleKey = 'response';
    this.listKey = 'responses';
  }

  /**
   * List responses with optional filtering
   */
  override async list(params?: {
    agent_id?: string;
    user_id?: string;
    org_id?: string;
    status?: ResponseStatus;
    type?: ResponseType;
  }): Promise<AgentResponseRecord[]> {
    const response = await super.list(params as any);
    return (response as any).responses ?? response;
  }

  /**
   * Get a specific response
   */
  override async get(responseId: string): Promise<AgentResponseRecord> {
    return super.get(responseId);
  }

  /**
   * Create a new response
   */
  override async create(data: ResponseData): Promise<AgentResponseRecord> {
    if (!data.content) {
      throw new ResponseValidationError('Response content is required');
    }
    if (!data.type) {
      throw new ResponseValidationError('Response type is required');
    }

    return super.create(data);
  }

  /**
   * Update an existing response
   */
  override async update(responseId: string, data: Partial<ResponseData>): Promise<AgentResponseRecord> {
    return super.update(responseId, data);
  }

  /**
   * Delete a response
   */
  override async delete(responseId: string): Promise<void> {
    await super.delete(responseId);
  }
}

export default Responses;
