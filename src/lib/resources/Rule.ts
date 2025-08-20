import type { ApiClientLike } from '../../types';

// Enums for rule management
export enum RuleType {
  AUTOMATION = 'automation',
  RESTRICTION = 'restriction',
  PERMISSION = 'permission',
  VALIDATION = 'validation',
  NOTIFICATION = 'notification',
  ROUTING = 'routing',
  ESCALATION = 'escalation',
  COMPLIANCE = 'compliance',
  SECURITY = 'security'
}

export enum RulePriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TriggerType {
  EVENT = 'event',
  SCHEDULE = 'schedule',
  CONDITION = 'condition',
  THRESHOLD = 'threshold',
  PATTERN = 'pattern'
}

export enum ActionType {
  EXECUTE = 'execute',
  NOTIFY = 'notify',
  UPDATE = 'update',
  CREATE = 'create',
  DELETE = 'delete',
  ESCALATE = 'escalate',
  RESTRICT = 'restrict',
  LOG = 'log'
}

// Interfaces for rule data structures
export interface Condition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface Action {
  type: ActionType;
  target?: string;
  parameters?: Record<string, any>;
  retry_config?: {
    max_attempts: number;
    backoff_rate: number;
    initial_delay: number;
  };
  fallback_action?: Omit<Action, 'fallback_action'>;
}

export interface Trigger {
  type: TriggerType;
  source: string;
  conditions: Condition[];
  schedule?: {
    cron?: string;
    rate?: string;
    timezone?: string;
  };
  cooldown_period?: number;
}

export interface RuleMetadata {
  version: string;
  tags?: string[];
  categories?: string[];
  owner?: string;
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  compliance_requirements?: string[];
  documentation_url?: string;
}

export interface RuleData {
  rule_name: string;
  rule_type: RuleType;
  description: string;
  priority: RulePriority;
  triggers: Trigger[];
  conditions: Condition[];
  actions: Action[];
  activated: boolean;
  metadata?: RuleMetadata;
  agent_id?: string;
  user_id?: string;
  org_id: string;
}

export interface RuleExecutionResult {
  executed_at: string;
  success: boolean;
  trigger_matched: boolean;
  conditions_evaluated: Array<{
    condition: Condition;
    result: boolean;
    actual_value?: any;
  }>;
  actions_executed: Array<{
    action: Action;
    success: boolean;
    error?: string;
    result?: any;
  }>;
}

// Response Interfaces
export interface RuleResponse {
  id: string;
  created_at: string;
  updated_at: string;
  data: RuleData;
  last_execution?: RuleExecutionResult;
  execution_stats?: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    last_success?: string;
    last_failure?: string;
    average_execution_time: number;
  };
}

// Custom Error Classes
export class RuleNotFoundError extends Error {
  constructor(ruleId: string) {
    super(`Rule with ID ${ruleId} not found`);
    this.name = 'RuleNotFoundError';
  }
}

export class RuleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleValidationError';
  }
}

export class RuleExecutionError extends Error {
  constructor(message: string, public readonly ruleId: string) {
    super(message);
    this.name = 'RuleExecutionError';
  }
}

// Main Rules Class
class Rules {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List rules with optional filtering
   * @param params - Filtering parameters
   * @returns Array of RuleResponse objects
   */
  async list(params?: {
    rule_type?: RuleType;
    activated?: boolean;
    agent_id?: string;
    priority?: RulePriority;
    org_id?: string;
  }): Promise<RuleResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.rule_type) queryParams.append('rule_type', params.rule_type);
    if (params?.activated !== undefined) queryParams.append('activated', params.activated.toString());
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `rules?${queryParams.toString()}`);
    return response.rules;
  }

  /**
   * Get specific rule by ID
   * @param ruleId - Rule ID
   * @returns RuleResponse object
    */
  async get(ruleId: string): Promise<RuleResponse> {
    try {
      const response = await this.stateset.request('GET', `rules/${ruleId}`);
      return response.rule;
    } catch (error: any) {
      if (error.status === 404) {
        throw new RuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Create new rule
   * @param ruleData - RuleData object
   * @returns RuleResponse object
   */
  async create(ruleData: RuleData): Promise<RuleResponse> {
    // Validate rule conditions
    this.validateConditions(ruleData.conditions);
    
    // Validate rule actions
    this.validateActions(ruleData.actions);

    try {
      const response = await this.stateset.request('POST', 'rules', ruleData);
      return response.rule;
    } catch (error: any) {
      if (error.status === 400) {
        throw new RuleValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update existing rule
   * @param ruleId - Rule ID
   * @param ruleData - Partial<RuleData> object
   * @returns RuleResponse object
   */
  async update(ruleId: string, ruleData: Partial<RuleData>): Promise<RuleResponse> {
    if (ruleData.conditions) {
      this.validateConditions(ruleData.conditions);
    }
    
    if (ruleData.actions) {
      this.validateActions(ruleData.actions);
    }

    try {
      const response = await this.stateset.request('PUT', `rules/${ruleId}`, ruleData);
      return response.rule;
    } catch (error: any) {
      if (error.status === 404) {
        throw new RuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Delete rule
   * @param ruleId - Rule ID
   */
  async delete(ruleId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `rules/${ruleId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new RuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Activate/Deactivate rule
   * @param ruleId - Rule ID
   * @param activated - Boolean value
   * @returns RuleResponse object
   */
  async setActivation(ruleId: string, activated: boolean): Promise<RuleResponse> {
    const response = await this.stateset.request(
      'POST',
      `rules/${ruleId}/activation`,
      { activated }
    );
    return response.rule;
  }

  /**
   * Test rule execution
   * @param ruleId - Rule ID
   * @param testData - Record<string, any> object
   * @returns RuleExecutionResult object
   */
  async testRule(
    ruleId: string,
    testData: Record<string, any>
  ): Promise<RuleExecutionResult> {
    try {
      const response = await this.stateset.request(
        'POST',
        `rules/${ruleId}/test`,
        testData
      );
      return response.result;
    } catch (error: any) {
      throw new RuleExecutionError(error.message, ruleId);
    }
  }

  /**
   * Get rule execution history
   * @param ruleId - Rule ID
   * @param params - Filtering parameters
   * @returns Array of RuleExecutionResult objects
   */
  async getExecutionHistory(
    ruleId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      status?: 'success' | 'failure';
      limit?: number;
    }
  ): Promise<RuleExecutionResult[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `rules/${ruleId}/execution-history?${queryParams.toString()}`
    );
    return response.history;
  }

  /**
   * Clone existing rule
   * @param ruleId - Rule ID
   * @param options - Options object
   * @returns RuleResponse object
   */
  async cloneRule(
    ruleId: string,
    options?: {
      new_name?: string;
      activate?: boolean;
    }
  ): Promise<RuleResponse> {
    const response = await this.stateset.request(
      'POST',
      `rules/${ruleId}/clone`,
      options
    );
    return response.rule;
  }

  /**
   * Validate rule conditions
   * @param conditions - Array of Condition objects
   */
  private validateConditions(conditions: Condition[]): void {
    for (const condition of conditions) {
      if (!condition.field || !condition.operator) {
        throw new RuleValidationError('Invalid condition: missing required fields');
      }

      if (['equals', 'not_equals', 'greater_than', 'less_than'].includes(condition.operator) && condition.value === undefined) {
        throw new RuleValidationError(`Invalid condition: ${condition.operator} operator requires a value`);
      }
    }
  }

  /**
   * Validate rule actions
   * @param actions - Array of Action objects
   */
  private validateActions(actions: Action[]): void {
    if (!actions.length) {
      throw new RuleValidationError('At least one action is required');
    }

    for (const action of actions) {
      if (!action.type) {
        throw new RuleValidationError('Invalid action: missing type');
      }

      if (['execute', 'update', 'create', 'delete'].includes(action.type) && !action.target) {
        throw new RuleValidationError(`Invalid action: ${action.type} action requires a target`);
      }
    }
  }
}

export default Rules;