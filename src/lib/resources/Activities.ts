import type { ApiClientLike } from '../../types';

// Enums for activity management
export enum ActivityType {
  // AI Activities
  AI_INFERENCE = 'ai_inference',
  AI_TRAINING = 'ai_training',
  AI_VALIDATION = 'ai_validation',
  PROMPT_GENERATION = 'prompt_generation',
  RESPONSE_PROCESSING = 'response_processing',
  
  // Data Activities
  DATA_TRANSFORMATION = 'data_transformation',
  DATA_VALIDATION = 'data_validation',
  DATA_ENRICHMENT = 'data_enrichment',
  DATA_AGGREGATION = 'data_aggregation',
  
  // Integration Activities
  API_CALL = 'api_call',
  WEBHOOK = 'webhook',
  EVENT_EMISSION = 'event_emission',
  MESSAGE_QUEUE = 'message_queue',
  
  // Control Flow Activities
  CONDITION = 'condition',
  SWITCH = 'switch',
  LOOP = 'loop',
  PARALLEL = 'parallel',
  MAP = 'map',
  
  // Human Activities
  HUMAN_REVIEW = 'human_review',
  APPROVAL = 'approval',
  MANUAL_TASK = 'manual_task',
  
  // Utility Activities
  DELAY = 'delay',
  NOTIFICATION = 'notification',
  LOGGING = 'logging',
  ERROR_HANDLING = 'error_handling'
}

export enum ActivityStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
  WAITING = 'waiting'
}

export enum ActivityPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

// Interfaces for activity data structures
export interface ActivityConfig {
  input_schema?: Record<string, any>;
  output_schema?: Record<string, any>;
  timeout?: number;
  retry_policy?: {
    max_attempts: number;
    initial_interval: number;
    max_interval: number;
    backoff_coefficient: number;
    non_retryable_errors?: string[];
  };
  error_handling?: {
    fallback_activity?: string;
    continue_on_failure?: boolean;
    error_path?: string[];
  };
}

export interface AIConfig extends ActivityConfig {
  model: string;
  provider: string;
  parameters: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    stop_sequences?: string[];
  };
  prompt_template?: string;
  response_mapping?: Record<string, string>;
}

export interface DataConfig extends ActivityConfig {
  transformation_rules?: Array<{
    source_field: string;
    target_field: string;
    transformation: string;
    parameters?: Record<string, any>;
  }>;
  validation_rules?: Array<{
    field: string;
    rule: string;
    parameters?: Record<string, any>;
  }>;
  aggregation_rules?: Array<{
    group_by?: string[];
    operations: Array<{
      operation: string;
      field: string;
      alias?: string;
    }>;
  }>;
}

export interface IntegrationConfig extends ActivityConfig {
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  auth_config?: {
    type: string;
    credentials: Record<string, any>;
  };
  request_mapping?: Record<string, string>;
  response_mapping?: Record<string, string>;
}

export interface HumanTaskConfig extends ActivityConfig {
  assignee?: string;
  assignment_rules?: Array<{
    condition: Record<string, any>;
    assign_to: string;
  }>;
  form_configuration?: {
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: any[];
    }>;
    validation_rules?: Record<string, any>;
  };
  due_date?: string;
  escalation_rules?: Array<{
    condition: string;
    action: string;
    parameters?: Record<string, any>;
  }>;
}

export interface ActivityDependency {
  activity_id: string;
  type: 'success' | 'failure' | 'completion';
  condition?: Record<string, any>;
}

export interface ActivityMetrics {
  execution_time: number;
  start_time: string;
  end_time?: string;
  retries: number;
  input_size?: number;
  output_size?: number;
  error_count?: number;
  custom_metrics?: Record<string, number>;
}

export interface ActivityData {
  name: string;
  description?: string;
  type: ActivityType;
  workflow_id: string;
  status: ActivityStatus;
  priority: ActivityPriority;
  dependencies?: ActivityDependency[];
  configuration: ActivityConfig | AIConfig | DataConfig | IntegrationConfig | HumanTaskConfig;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
  metrics?: ActivityMetrics;
  tags?: string[];
  metadata?: Record<string, any>;
  org_id?: string;
  agent_id?: string;
}

// Response Interface
export interface ActivityResponse {
  id: string;
  created_at: string;
  updated_at: string;
  data: ActivityData;
}

// Custom Error Classes
export class ActivityNotFoundError extends Error {
  constructor(activityId: string) {
    super(`Activity with ID ${activityId} not found`);
    this.name = 'ActivityNotFoundError';
  }
}

export class ActivityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityValidationError';
  }
}

export class ActivityExecutionError extends Error {
  constructor(message: string, public readonly activityId: string) {
    super(message);
    this.name = 'ActivityExecutionError';
  }
}

// Main Activities Class
class Activities {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List activities with optional filtering
   * @param params - Optional filtering parameters
   * @returns Array of ActivityResponse objects
   */
  async list(params?: {
    workflow_id?: string;
    type?: ActivityType;
    status?: ActivityStatus;
    agent_id?: string;
    org_id?: string;
    tags?: string[];
  }): Promise<ActivityResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.workflow_id) queryParams.append('workflow_id', params.workflow_id);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.tags) queryParams.append('tags', JSON.stringify(params.tags));

    const response = await this.stateset.request('GET', `activities?${queryParams.toString()}`);
    return response.activities;
  }

  /**
   * Get specific activity
   * @param activityId - Activity ID
   * @returns ActivityResponse object
   */
  async get(activityId: string): Promise<ActivityResponse> {
    try {
      const response = await this.stateset.request('GET', `activities/${activityId}`);
      return response.activity;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ActivityNotFoundError(activityId);
      }
      throw error;
    }
  }

  /**
   * Create new activity
   * @param activityData - ActivityData object
   * @returns ActivityResponse object
   */
  async create(activityData: ActivityData): Promise<ActivityResponse> {
    this.validateActivityData(activityData);

    try {
      const response = await this.stateset.request('POST', 'activities', activityData);
      return response.activity;
    } catch (error: any) {
      if (error.status === 400) {
        throw new ActivityValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update activity
   * @param activityId - Activity ID
   * @param activityData - Partial<ActivityData> object
   * @returns ActivityResponse object
   */
  async update(
    activityId: string,
    activityData: Partial<ActivityData>
  ): Promise<ActivityResponse> {
    try {
      const response = await this.stateset.request('PUT', `activities/${activityId}`, activityData);
      return response.activity;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ActivityNotFoundError(activityId);
      }
      throw error;
    }
  }

  /**
   * Delete activity
   * @param activityId - Activity ID
   */
  async delete(activityId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `activities/${activityId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ActivityNotFoundError(activityId);
      }
      throw error;
    }
  }

  /**
   * Start activity execution
   * @param activityId - Activity ID
   * @param input - Optional input data
   * @returns ActivityResponse object
   */
  async start(
    activityId: string,
    input?: Record<string, any>
  ): Promise<ActivityResponse> {
    try {
      const response = await this.stateset.request(
        'POST',
        `activities/${activityId}/start`,
        { input }
      );
      return response.activity;
    } catch (error: any) {
      throw new ActivityExecutionError(error.message, activityId);
    }
  }

  /**
   * Complete activity
   * @param activityId - Activity ID
   * @param output - Output data
   * @returns ActivityResponse object
   */
  async complete(
    activityId: string,
    output: Record<string, any>
  ): Promise<ActivityResponse> {
    const response = await this.stateset.request(
      'POST',
      `activities/${activityId}/complete`,
      { output }
    );
    return response.activity;
  }

  /**
   * Fail activity
   * @param activityId - Activity ID
   * @param error - Error object
   * @returns ActivityResponse object
   */
  async fail(
    activityId: string,
    error: {
      code: string;
      message: string;
      details?: any;
    }
  ): Promise<ActivityResponse> {
    const response = await this.stateset.request(
      'POST',
      `activities/${activityId}/fail`,
      { error }
    );
    return response.activity;
  }

  /**
   * Cancel activity
   * @param activityId - Activity ID
   * @param reason - Optional reason for cancellation
   * @returns ActivityResponse object
   */
  async cancel(activityId: string, reason?: string): Promise<ActivityResponse> {
    const response = await this.stateset.request(
      'POST',
      `activities/${activityId}/cancel`,
      { reason }
    );
    return response.activity;
  }

  /**
   * Get activity metrics
   * @param activityId - Activity ID
   * @returns ActivityMetrics object
   */
  async getMetrics(activityId: string): Promise<ActivityMetrics> {
    const response = await this.stateset.request(
      'GET',
      `activities/${activityId}/metrics`
    );
    return response.metrics;
  }

  /**
   * Retry failed activity
   * @param activityId - Activity ID
   * @returns ActivityResponse object
   */
  async retry(activityId: string): Promise<ActivityResponse> {
    const response = await this.stateset.request(
      'POST',
      `activities/${activityId}/retry`
    );
    return response.activity;
  }

  /**
   * Validate activity data
   * @param data - ActivityData object
  */
  private validateActivityData(data: ActivityData): void {
    if (!data.name) {
      throw new ActivityValidationError('Activity name is required');
    }

    if (!data.type) {
      throw new ActivityValidationError('Activity type is required');
    }

    if (!data.workflow_id) {
      throw new ActivityValidationError('Workflow ID is required');
    }

    if (!data.configuration) {
      throw new ActivityValidationError('Activity configuration is required');
    }

    // Validate type-specific configuration
    switch (data.type) {
      case ActivityType.AI_INFERENCE:
      case ActivityType.AI_TRAINING:
      case ActivityType.AI_VALIDATION:
      case ActivityType.PROMPT_GENERATION: {
        const aiConfig = data.configuration as AIConfig;
        if (!aiConfig.model || !aiConfig.provider) {
          throw new ActivityValidationError('AI activity requires model and provider');
        }
        break;
      }

      case ActivityType.API_CALL:
      case ActivityType.WEBHOOK: {
        const integrationConfig = data.configuration as IntegrationConfig;
        if (!integrationConfig.endpoint) {
          throw new ActivityValidationError('Integration activity requires endpoint');
        }
        break;
      }

      case ActivityType.HUMAN_REVIEW:
      case ActivityType.APPROVAL: {
        const humanConfig = data.configuration as HumanTaskConfig;
        if (!humanConfig.form_configuration) {
          throw new ActivityValidationError('Human task requires form configuration');
        }
        break;
      }
    }
  }
}

export default Activities;