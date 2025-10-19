import type { ApiClientLike } from '../../types';

// Enums for schedule management
export enum ScheduleType {
  RECURRING = 'recurring',
  ONE_TIME = 'one_time',
  ADAPTIVE = 'adaptive',
  CONDITIONAL = 'conditional',
}

export enum ScheduleStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum RecurrencePattern {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum ExecutionStrategy {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  ROUND_ROBIN = 'round_robin',
}

// Interfaces for schedule data structures
export interface TimeWindow {
  start_time: string;
  end_time: string;
  timezone: string;
  blackout_periods?: Array<{
    start: string;
    end: string;
    reason?: string;
  }>;
}

export interface RecurrenceConfig {
  pattern: RecurrencePattern;
  interval: number;
  days_of_week?: Array<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'>;
  days_of_month?: number[];
  months?: number[];
  specific_dates?: string[];
  time_of_day?: string[];
  end_after?: number;
  end_date?: string;
  timezone: string;
}

export interface AdaptiveConfig {
  load_threshold: number;
  performance_metrics: string[];
  adjustment_factors: Record<string, number>;
  learning_rate: number;
  max_adjustment?: number;
}

export interface ConditionalConfig {
  conditions: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
    value: number;
    window_size: string;
  }>;
  evaluation_interval: string;
}

export interface TaskConfig {
  task_type: string;
  parameters: Record<string, any>;
  timeout?: string;
  retry_config?: {
    max_attempts: number;
    initial_delay: string;
    max_delay: string;
    backoff_multiplier: number;
  };
  dependencies?: string[];
  resources?: Array<{
    type: string;
    quantity: number;
  }>;
}

export interface ScheduleData {
  name: string;
  description?: string;
  schedule_type: ScheduleType;
  priority: TaskPriority;
  time_window: TimeWindow;
  recurrence_config?: RecurrenceConfig;
  adaptive_config?: AdaptiveConfig;
  conditional_config?: ConditionalConfig;
  tasks: TaskConfig[];
  execution_strategy: ExecutionStrategy;
  max_concurrent_executions?: number;
  notification_config?: {
    success?: string[];
    failure?: string[];
    warning?: string[];
  };
  metadata?: Record<string, any>;
  org_id?: string;
  agent_ids?: string[];
}

export interface ExecutionResult {
  execution_id: string;
  schedule_id: string;
  start_time: string;
  end_time?: string;
  status: 'success' | 'failure' | 'in_progress' | 'canceled';
  tasks_results: Array<{
    task_id: string;
    status: string;
    start_time: string;
    end_time?: string;
    error?: string;
    output?: any;
    metrics?: Record<string, number>;
  }>;
  error?: string;
  metrics?: {
    duration: number;
    cpu_usage?: number;
    memory_usage?: number;
    [key: string]: any;
  };
}

// Response interfaces
export interface ScheduleResponse {
  id: string;
  created_at: string;
  updated_at: string;
  status: ScheduleStatus;
  data: ScheduleData;
  next_execution?: string;
  last_execution?: ExecutionResult;
  execution_stats?: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    success_rate: number;
  };
}

// Custom Error Classes
export class ScheduleNotFoundError extends Error {
  constructor(scheduleId: string) {
    super(`Schedule with ID ${scheduleId} not found`);
    this.name = 'ScheduleNotFoundError';
  }
}

export class ScheduleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScheduleValidationError';
  }
}

export class ScheduleExecutionError extends Error {
  constructor(
    message: string,
    public readonly scheduleId: string
  ) {
    super(message);
    this.name = 'ScheduleExecutionError';
  }
}

// Main Schedule Class
class Schedule {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * List schedules with optional filtering
   * @param params - Filtering parameters
   * @returns Array of ScheduleResponse objects
   */
  async list(params?: {
    status?: ScheduleStatus;
    schedule_type?: ScheduleType;
    priority?: TaskPriority;
    agent_id?: string;
    org_id?: string;
  }): Promise<ScheduleResponse[]> {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.schedule_type) queryParams.append('schedule_type', params.schedule_type);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `schedules?${queryParams.toString()}`);
    return response.schedules;
  }

  /**
   * Get specific schedule by ID
   * @param scheduleId - Schedule ID
   * @returns ScheduleResponse object
   */
  async get(scheduleId: string): Promise<ScheduleResponse> {
    try {
      const response = await this.stateset.request('GET', `schedules/${scheduleId}`);
      return response.schedule;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ScheduleNotFoundError(scheduleId);
      }
      throw error;
    }
  }

  /**
   * Create new schedule
   * @param scheduleData - ScheduleData object
   * @returns ScheduleResponse object
   */
  async create(scheduleData: ScheduleData): Promise<ScheduleResponse> {
    this.validateScheduleData(scheduleData);

    try {
      const response = await this.stateset.request('POST', 'schedules', scheduleData);
      return response.schedule;
    } catch (error: any) {
      if (error.status === 400) {
        throw new ScheduleValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update existing schedule
   * @param scheduleId - Schedule ID
   * @param scheduleData - Partial<ScheduleData> object
   * @returns ScheduleResponse object
   */
  async update(scheduleId: string, scheduleData: Partial<ScheduleData>): Promise<ScheduleResponse> {
    if (Object.keys(scheduleData).length > 0) {
      this.validateScheduleData(scheduleData as ScheduleData, true);
    }

    try {
      const response = await this.stateset.request('PUT', `schedules/${scheduleId}`, scheduleData);
      return response.schedule;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ScheduleNotFoundError(scheduleId);
      }
      throw error;
    }
  }

  /**
   * Delete schedule
   * @param scheduleId - Schedule ID
   */
  async delete(scheduleId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `schedules/${scheduleId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ScheduleNotFoundError(scheduleId);
      }
      throw error;
    }
  }

  /**
   * Pause schedule
   * @param scheduleId - Schedule ID
   * @returns ScheduleResponse object
   */
  async pause(scheduleId: string): Promise<ScheduleResponse> {
    const response = await this.stateset.request('POST', `schedules/${scheduleId}/pause`);
    return response.schedule;
  }

  /**
   * Resume schedule
   * @param scheduleId - Schedule ID
   * @returns ScheduleResponse object
   */
  async resume(scheduleId: string): Promise<ScheduleResponse> {
    const response = await this.stateset.request('POST', `schedules/${scheduleId}/resume`);
    return response.schedule;
  }

  /**
   * Trigger immediate execution
   * @param scheduleId - Schedule ID
   * @param params - Parameters object
   * @returns ExecutionResult object
   */
  async triggerExecution(
    scheduleId: string,
    params?: {
      override_params?: Record<string, any>;
      priority?: TaskPriority;
    }
  ): Promise<ExecutionResult> {
    try {
      const response = await this.stateset.request(
        'POST',
        `schedules/${scheduleId}/trigger`,
        params
      );
      return response.execution;
    } catch (error: any) {
      throw new ScheduleExecutionError(error.message, scheduleId);
    }
  }

  /**
   * Get execution history
   * @param scheduleId - Schedule ID
   * @param params - Filtering parameters
   * @returns Array of ExecutionResult objects
   */
  async getExecutionHistory(
    scheduleId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
      status?: 'success' | 'failure' | 'in_progress' | 'canceled';
      limit?: number;
    }
  ): Promise<ExecutionResult[]> {
    const queryParams = new URLSearchParams();

    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.stateset.request(
      'GET',
      `schedules/${scheduleId}/execution-history?${queryParams.toString()}`
    );
    return response.executions;
  }

  /**
   * Get next scheduled executions
   * @param scheduleId - Schedule ID
   * @param limit - Number of executions to return
   * @returns Array of objects with scheduled_time and estimation_basis
   */
  async getNextExecutions(
    scheduleId: string,
    limit: number = 10
  ): Promise<Array<{ scheduled_time: string; estimation_basis: string }>> {
    const response = await this.stateset.request(
      'GET',
      `schedules/${scheduleId}/next-executions?limit=${limit}`
    );
    return response.executions;
  }

  /**
   * Validate schedule data
   * @param data - ScheduleData object
   * @param isUpdate - Boolean value
   */
  private validateScheduleData(data: ScheduleData, isUpdate: boolean = false): void {
    if (!isUpdate) {
      if (!data.name) {
        throw new ScheduleValidationError('Schedule name is required');
      }
      if (!data.schedule_type) {
        throw new ScheduleValidationError('Schedule type is required');
      }
      if (!data.time_window) {
        throw new ScheduleValidationError('Time window is required');
      }
      if (!data.tasks || !data.tasks.length) {
        throw new ScheduleValidationError('At least one task is required');
      }
    }

    if (data.schedule_type === ScheduleType.RECURRING && !data.recurrence_config) {
      throw new ScheduleValidationError(
        'Recurrence configuration is required for recurring schedules'
      );
    }

    if (data.schedule_type === ScheduleType.ADAPTIVE && !data.adaptive_config) {
      throw new ScheduleValidationError(
        'Adaptive configuration is required for adaptive schedules'
      );
    }

    if (data.schedule_type === ScheduleType.CONDITIONAL && !data.conditional_config) {
      throw new ScheduleValidationError(
        'Conditional configuration is required for conditional schedules'
      );
    }

    if (data.time_window) {
      const { start_time, end_time } = data.time_window;
      if (new Date(start_time) >= new Date(end_time)) {
        throw new ScheduleValidationError('Time window start must be before end');
      }
    }
  }
}

export default Schedule;
