import type { ApiClientLike } from '../../types';

// Enums for knowledge management
export enum KnowledgeType {
  DOCUMENT = 'document',
  FAQ = 'faq',
  ARTICLE = 'article',
  CODE_SNIPPET = 'code_snippet',
  LINK = 'link'
}

// Interfaces for knowledge data structures
export interface KnowledgeData {
  title: string;
  content: string;
  type: KnowledgeType;
  tags?: string[];
  metadata?: Record<string, any>;
  agent_id?: string;
  org_id?: string;
  user_id?: string;
}

export interface KnowledgeRecord {
  id: string;
  created_at: string;
  updated_at: string;
  data: KnowledgeData;
}

// Custom error classes
export class KnowledgeNotFoundError extends Error {
  constructor(knowledgeId: string) {
    super(`Knowledge with ID ${knowledgeId} not found`);
    this.name = 'KnowledgeNotFoundError';
  }
}

export class KnowledgeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeValidationError';
  }
}

// Main Knowledge class
class Knowledge {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List knowledge items with optional filtering
   */
  async list(params?: {
    type?: KnowledgeType;
    agent_id?: string;
    org_id?: string;
    user_id?: string;
    tag?: string;
  }): Promise<KnowledgeRecord[]> {
    const queryParams = new URLSearchParams();

    if (params?.type) queryParams.append('type', params.type);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.tag) queryParams.append('tag', params.tag);

    const response = await this.stateset.request(
      'GET',
      `knowledge?${queryParams.toString()}`
    );
    return response.knowledge;
  }

  /**
   * Get specific knowledge item
   */
  async get(knowledgeId: string): Promise<KnowledgeRecord> {
    try {
      const response = await this.stateset.request('GET', `knowledge/${knowledgeId}`);
      return response.knowledge;
    } catch (error: any) {
      if (error.status === 404) {
        throw new KnowledgeNotFoundError(knowledgeId);
      }
      throw error;
    }
  }

  /**
   * Create knowledge
   */
  async create(data: KnowledgeData): Promise<KnowledgeRecord> {
    if (!data.title || !data.content) {
      throw new KnowledgeValidationError('Title and content are required');
    }
    const response = await this.stateset.request('POST', 'knowledge', data);
    return response.knowledge;
  }

  /**
   * Update knowledge
   */
  async update(knowledgeId: string, data: Partial<KnowledgeData>): Promise<KnowledgeRecord> {
    try {
      const response = await this.stateset.request('PUT', `knowledge/${knowledgeId}`, data);
      return response.knowledge;
    } catch (error: any) {
      if (error.status === 404) {
        throw new KnowledgeNotFoundError(knowledgeId);
      }
      throw error;
    }
  }

  /**
   * Delete knowledge
   */
  async delete(knowledgeId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `knowledge/${knowledgeId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new KnowledgeNotFoundError(knowledgeId);
      }
      throw error;
    }
  }
}

export default Knowledge;
