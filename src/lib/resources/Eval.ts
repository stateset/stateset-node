import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums for evaluation management
export enum EvalType {
  AGENT = 'agent',
  RESPONSE = 'response',
  RULE = 'rule',
  ATTRIBUTE = 'attribute',
}

export interface EvalMetric {
  name: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface EvalData {
  eval_type: EvalType;
  subject_id: string;
  metrics: EvalMetric[];
  summary?: string;
  agent_id?: string;
  org_id?: string;
  user_id?: string;
}

export interface EvalRecord {
  id: string;
  created_at: string;
  data: EvalData;
}

export class EvalNotFoundError extends Error {
  constructor(evalId: string) {
    super(`Eval with ID ${evalId} not found`);
    this.name = 'EvalNotFoundError';
  }
}

export class EvalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvalValidationError';
  }
}

class Evals extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'evals', 'evals');
    this.singleKey = 'eval';
    this.listKey = 'evals';
  }

  /**
   * List evaluations with optional filtering
   */
  override async list(params?: {
    eval_type?: EvalType;
    subject_id?: string;
    agent_id?: string;
    org_id?: string;
  }): Promise<EvalRecord[]> {
    const response = await super.list(params as any);
    return (response as any).evals ?? response;
  }

  /**
   * Get a specific evaluation
   */
  override async get(evalId: string): Promise<EvalRecord> {
    return super.get(evalId);
  }

  /**
   * Create evaluation
   */
  override async create(data: EvalData): Promise<EvalRecord> {
    if (!data.subject_id) {
      throw new EvalValidationError('subject_id is required');
    }
    if (!data.metrics || data.metrics.length === 0) {
      throw new EvalValidationError('at least one metric is required');
    }

    return super.create(data);
  }

  /**
   * Delete evaluation
   */
  override async delete(evalId: string): Promise<void> {
    await super.delete(evalId);
  }
}

export default Evals;
