import type { ApiClientLike } from '../../types';

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
class Responses {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List responses with optional filtering
   */
  async list(params?: {
    agent_id?: string;
    user_id?: string;
    org_id?: string;
    status?: ResponseStatus;
    type?: ResponseType;
  }): Promise<AgentResponseRecord[]> {
    const queryParams = new URLSearchParams();

    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const response = await this.stateset.request('GET', `responses?${queryParams.toString()}`);
    return response.responses;
  }

  /**
   * Get a specific response
   */
  async get(responseId: string): Promise<AgentResponseRecord> {
    try {
      const response = await this.stateset.request('GET', `responses/${responseId}`);
      return response.response;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ResponseNotFoundError(responseId);
      }
      throw error;
    }
  }

  /**
   * Create a new response
   */
  async create(data: ResponseData): Promise<AgentResponseRecord> {
    if (!data.content) {
      throw new ResponseValidationError('Response content is required');
    }
    if (!data.type) {
      throw new ResponseValidationError('Response type is required');
    }

    const response = await this.stateset.request('POST', 'responses', data);
    return response.response;
  }

  /**
   * Update an existing response
   */
  async update(responseId: string, data: Partial<ResponseData>): Promise<AgentResponseRecord> {
    try {
      const response = await this.stateset.request('PUT', `responses/${responseId}`, data);
      return response.response;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ResponseNotFoundError(responseId);
      }
      throw error;
    }
  }

  /**
   * Delete a response
   */
  async delete(responseId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `responses/${responseId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ResponseNotFoundError(responseId);
      }
      throw error;
    }
  }
}

export default Responses;
