import { stateset } from '../../stateset-client';

// Enums for workflow management
export enum WorkflowType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  EVENT_DRIVEN = 'event_driven',
  CONDITIONAL = 'conditional',
  STATE_MACHINE = 'state_machine'
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  ERROR = 'error'
}

export enum TaskType {
  AI_PROCESSING = 'ai_processing',
  DATA_TRANSFORMATION = 'data_transformation',
  API_CALL = 'api_call',
  NOTIFICATION = 'notification',
  DECISION = 'decision',
  HUMAN_REVIEW = 'human_review',
  WAIT = 'wait'
}

export enum TriggerType {
  SCHEDULE = 'schedule',
  EVENT = 'event',
  API = 'api',
  CONDITION = 'condition',
  MANUAL = 'manual'
}

// Interfaces for workflow data structures
export interface WorkflowTask {
  id: string;
  name: string;
  type: TaskType;
  config: {
    input?: Record<string, any>;
    output?: Record<string, any>;
    parameters?: Record<string, any>;
    retry_config?: {
      max_attempts: number;
      backoff_rate: number;
      initial_delay: number;
    };
    timeout?: number;
    error_handling?: {
      fallback_task?: string;
      error_path?: string;
      retry_conditions?: Record<string, any>;
    };
  };
  dependencies?: string[];
  condition?: {
    operator: 'and' | 'or' | 'not';
    conditions: Array<{
      field: string;
      operation: string;
      value: any;
    }>;
  };
  metadata?: Record<string, any>;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: {
    schedule?: {
      cron?: string;
      rate?: string;
      timezone?: string;
    };
    event?: {
      source: string;
      type: string;
      conditions?: Record<string, any>;
    };
    api?: {
      endpoint: string;
      method: string;
      headers?: Record<string, any>;
    };
  };
}

export interface WorkflowState {
  name: string;
  tasks: WorkflowTask[];
  transitions: Array<{
    from: string;
    to: string;
    condition?: Record<string, any>;
  }>;
}

export interface WorkflowMonitoring {
  metrics_config?: {
    collect_performance_metrics: boolean;
    collect_custom_metrics: boolean;
    alert_thresholds?: Record<string, number>;
  };
  logging_config?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    include_input_output: boolean;
    retain_logs_days: number;
  };
  notification_config?: {
    events: string[];
    channels: string[];
    templates?: Record<string, string>;
  };
}

export interface WorkflowData {
  name: string;
  description?: string;
  type: WorkflowType;
  version: string;
  triggers: WorkflowTrigger[];
  states: WorkflowState[];
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  monitoring?: WorkflowMonitoring;
  timeout?: number;
  tags?: string[];
  org_id?: string;
  agent_id?: string;
}

export interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  start_time: string;
  end_time?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  current_state?: string;
  task_executions: Array<{
    task_id: string;
    status: string;
    start_time: string;
    end_time?: string;
    input: Record<string, any>;
    output?: Record<string, any>;
    error?: {
      code: string;
      message: string;
      stack?: string;
    };
    metrics?: {
      duration: number;
      retries: number;
      [key: string]: any;
    };
  }>;
  error?: {
    code: string;
    message: string;
    state: string;
    task_id?: string;
  };
}

// Response Interface
export interface WorkflowResponse {
  id: string;
  created_at: string;
  updated_at: string;
  status: WorkflowStatus;
  data: WorkflowData;
  stats?: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution?: string;
  };
}

// Custom Error Classes
export class WorkflowNotFoundError extends Error {
  constructor(workflowId: string) {
    super(`Workflow with ID ${workflowId} not found`);
    this.name = 'WorkflowNotFoundError';
  }
}

export class WorkflowValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkflowValidationError';
  }
}

export class WorkflowExecutionError extends Error {
  constructor(message: string, public readonly executionId: string) {
    super(message);
    this.name = 'WorkflowExecutionError';
  }
}

// Main Workflows Class
class Workflows {
  constructor(private readonly stateset: stateset) {}

  /**
   * List workflows with optional filtering
   */
  async list(params?: {
    type?: WorkflowType;
    status?: WorkflowStatus;
    agent_id?: string;
    org_id?: string;
    tags?: string[];
  }): Promise<WorkflowResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.tags) queryParams.append('tags', JSON.stringify(params.tags));

    const response = await this.stateset.request('GET', `workflows?${queryParams.toString()}`);
    return response.workflows;
  }

  /**
   * Get specific workflow
   */
  async get(workflowId: string): Promise<WorkflowResponse> {
    try {
      const response = await this.stateset.request('GET', `workflows/${workflowId}`);
      return response.workflow;
    } catch (error: any) {
      if (error.status === 404) {
        throw new WorkflowNotFoundError(workflowId);
      }
      throw error;
    }
  }

  /**
   * Create new workflow
   */
  async create(workflowData: WorkflowData): Promise<WorkflowResponse> {
    this.validateWorkflowData(workflowData);

    try {
      const response = await this.stateset.request('POST', 'workflows', workflowData);
      return response.workflow;
    } catch (error: any) {
      if (error.status === 400) {
        throw new WorkflowValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update workflow
   */
  async update(
    workflowId: string,
    workflowData: Partial<WorkflowData>
  ): Promise<WorkflowResponse> {
    try {
      const response = await this.stateset.request('PUT', `workflows/${workflowId}`, workflowData);
      return response.workflow;
    } catch (error: any) {
      if (error.status === 404) {
        throw new WorkflowNotFoundError(workflowId);
      }
      throw error;
    }
  }

  /**
   * Delete workflow
   */
  async delete(workflowId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `workflows/${workflowId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new WorkflowNotFoundError(workflowId);
      }
      throw error;
    }
  }

  /**
   * Execute workflow
   */
  async execute(
    workflowId: string,
    input: Record<string, any>
  ): Promise<WorkflowExecution> {
    try {
      const response = await this.stateset.request(
        'POST',
        `workflows/${workflowId}/execute`,
        { input }
      );
      return response.execution;
    } catch (error: any) {
      throw new WorkflowExecutionError(error.message, error.execution_id);
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(
    workflowId: string,
    executionId: string
  ): Promise<WorkflowExecution> {
    const response = await this.stateset.request(
      'GET',
      `workflows/${workflowId}/executions/${executionId}`
    );
    return response.execution;
  }

  /**
   * Get workflow execution history
   */
  async getExecutionHistory(
    workflowId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      status?: 'completed' | 'failed' | 'cancelled';
      limit?: number;
    }
  ): Promise<WorkflowExecution[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `workflows/${workflowId}/executions?${queryParams.toString()}`
    );
    return response.executions;
  }

  /**
   * Clone workflow
   */
  async cloneWorkflow(
    workflowId: string,
    options?: {
      new_name?: string;
      new_version?: string;
    }
  ): Promise<WorkflowResponse> {
    const response = await this.stateset.request(
      'POST',
      `workflows/${workflowId}/clone`,
      options
    );
    return response.workflow;
  }

  /**
   * Validate workflow data
   */
  private validateWorkflowData(data: WorkflowData): void {
    if (!data.name) {
      throw new WorkflowValidationError('Workflow name is required');
    }

    if (!data.type) {
      throw new WorkflowValidationError('Workflow type is required');
    }

    if (!data.version) {
      throw new WorkflowValidationError('Workflow version is required');
    }

    if (!data.states || data.states.length === 0) {
      throw new WorkflowValidationError('Workflow must have at least one state');
    }

    // Validate state transitions
    const stateNames = new Set(data.states.map(state => state.name));
    data.states.forEach(state => {
      state.transitions?.forEach(transition => {
        if (!stateNames.has(transition.from) || !stateNames.has(transition.to)) {
          throw new WorkflowValidationError(
            `Invalid state transition: ${transition.from} -> ${transition.to}`
          );
        }
      });
    });

    // Validate task dependencies
    data.states.forEach(state => {
      state.tasks.forEach(task => {
        if (task.dependencies) {
          task.dependencies.forEach(depId => {
            if (!state.tasks.some(t => t.id === depId)) {
              throw new WorkflowValidationError(
                `Invalid task dependency: ${depId} in task ${task.id}`
              );
            }
          });
        }
      });
    });
  }
}

export default Workflows;