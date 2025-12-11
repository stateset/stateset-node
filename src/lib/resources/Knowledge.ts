import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums for knowledge management
export enum KnowledgeType {
  DOCUMENT = 'document',
  FAQ = 'faq',
  ARTICLE = 'article',
  CODE_SNIPPET = 'code_snippet',
  LINK = 'link',
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
class Knowledge extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'knowledge', 'knowledge');
    this.singleKey = 'knowledge';
    this.listKey = 'knowledge';
  }

  /**
   * List knowledge items with optional filtering
   */
  override async list(params?: {
    type?: KnowledgeType;
    agent_id?: string;
    org_id?: string;
    user_id?: string;
    tag?: string;
  }): Promise<KnowledgeRecord[]> {
    const response = await super.list(params as any);
    return (response as any).knowledge ?? response;
  }

  /**
   * Get specific knowledge item
   */
  override async get(knowledgeId: string): Promise<KnowledgeRecord> {
    return super.get(knowledgeId);
  }

  /**
   * Create knowledge
   */
  override async create(data: KnowledgeData): Promise<KnowledgeRecord> {
    if (!data.title || !data.content) {
      throw new KnowledgeValidationError('Title and content are required');
    }
    return super.create(data);
  }

  /**
   * Update knowledge
   */
  override async update(knowledgeId: string, data: Partial<KnowledgeData>): Promise<KnowledgeRecord> {
    return super.update(knowledgeId, data);
  }

  /**
   * Delete knowledge
   */
  override async delete(knowledgeId: string): Promise<void> {
    await super.delete(knowledgeId);
  }
}

export default Knowledge;
