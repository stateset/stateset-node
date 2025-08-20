import type { ApiClientLike } from '../../types';

// Enums for evaluation management
export enum EvalType {
  AGENT = 'agent',
  RESPONSE = 'response',
  RULE = 'rule',
  ATTRIBUTE = 'attribute'
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

class Evals {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List evaluations with optional filtering
   */
  async list(params?: {
    eval_type?: EvalType;
    subject_id?: string;
    agent_id?: string;
    org_id?: string;
  }): Promise<EvalRecord[]> {
    const queryParams = new URLSearchParams();

    if (params?.eval_type) queryParams.append('eval_type', params.eval_type);
    if (params?.subject_id) queryParams.append('subject_id', params.subject_id);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `evals?${queryParams.toString()}`);
    return response.evals;
  }

  /**
   * Get a specific evaluation
   */
  async get(evalId: string): Promise<EvalRecord> {
    try {
      const response = await this.stateset.request('GET', `evals/${evalId}`);
      return response.eval;
    } catch (error: any) {
      if (error.status === 404) {
        throw new EvalNotFoundError(evalId);
      }
      throw error;
    }
  }

  /**
   * Create evaluation
   */
  async create(data: EvalData): Promise<EvalRecord> {
    if (!data.subject_id) {
      throw new EvalValidationError('subject_id is required');
    }
    if (!data.metrics || data.metrics.length === 0) {
      throw new EvalValidationError('at least one metric is required');
    }

    const response = await this.stateset.request('POST', 'evals', data);
    return response.eval;
  }

  /**
   * Delete evaluation
   */
  async delete(evalId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `evals/${evalId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new EvalNotFoundError(evalId);
      }
      throw error;
    }
  }
}

export default Evals;
