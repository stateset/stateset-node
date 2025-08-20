import type { ApiClientLike } from '../../types';
export declare enum ScheduleType {
    RECURRING = "recurring",
    ONE_TIME = "one_time",
    ADAPTIVE = "adaptive",
    CONDITIONAL = "conditional"
}
export declare enum ScheduleStatus {
    ACTIVE = "active",
    PAUSED = "paused",
    COMPLETED = "completed",
    FAILED = "failed",
    PENDING = "pending"
}
export declare enum TaskPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum RecurrencePattern {
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    CUSTOM = "custom"
}
export declare enum ExecutionStrategy {
    SEQUENTIAL = "sequential",
    PARALLEL = "parallel",
    ROUND_ROBIN = "round_robin"
}
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
export declare class ScheduleNotFoundError extends Error {
    constructor(scheduleId: string);
}
export declare class ScheduleValidationError extends Error {
    constructor(message: string);
}
export declare class ScheduleExecutionError extends Error {
    readonly scheduleId: string;
    constructor(message: string, scheduleId: string);
}
declare class Schedule {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * List schedules with optional filtering
     * @param params - Filtering parameters
     * @returns Array of ScheduleResponse objects
     */
    list(params?: {
        status?: ScheduleStatus;
        schedule_type?: ScheduleType;
        priority?: TaskPriority;
        agent_id?: string;
        org_id?: string;
    }): Promise<ScheduleResponse[]>;
    /**
     * Get specific schedule by ID
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    get(scheduleId: string): Promise<ScheduleResponse>;
    /**
     * Create new schedule
     * @param scheduleData - ScheduleData object
     * @returns ScheduleResponse object
     */
    create(scheduleData: ScheduleData): Promise<ScheduleResponse>;
    /**
     * Update existing schedule
     * @param scheduleId - Schedule ID
     * @param scheduleData - Partial<ScheduleData> object
     * @returns ScheduleResponse object
     */
    update(scheduleId: string, scheduleData: Partial<ScheduleData>): Promise<ScheduleResponse>;
    /**
     * Delete schedule
     * @param scheduleId - Schedule ID
     */
    delete(scheduleId: string): Promise<void>;
    /**
     * Pause schedule
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    pause(scheduleId: string): Promise<ScheduleResponse>;
    /**
     * Resume schedule
     * @param scheduleId - Schedule ID
     * @returns ScheduleResponse object
     */
    resume(scheduleId: string): Promise<ScheduleResponse>;
    /**
     * Trigger immediate execution
     * @param scheduleId - Schedule ID
     * @param params - Parameters object
     * @returns ExecutionResult object
     */
    triggerExecution(scheduleId: string, params?: {
        override_params?: Record<string, any>;
        priority?: TaskPriority;
    }): Promise<ExecutionResult>;
    /**
     * Get execution history
     * @param scheduleId - Schedule ID
     * @param params - Filtering parameters
     * @returns Array of ExecutionResult objects
     */
    getExecutionHistory(scheduleId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        status?: 'success' | 'failure' | 'in_progress' | 'canceled';
        limit?: number;
    }): Promise<ExecutionResult[]>;
    /**
     * Get next scheduled executions
     * @param scheduleId - Schedule ID
     * @param limit - Number of executions to return
     * @returns Array of objects with scheduled_time and estimation_basis
     */
    getNextExecutions(scheduleId: string, limit?: number): Promise<Array<{
        scheduled_time: string;
        estimation_basis: string;
    }>>;
    /**
     * Validate schedule data
     * @param data - ScheduleData object
     * @param isUpdate - Boolean value
     */
    private validateScheduleData;
}
export default Schedule;
//# sourceMappingURL=Schedule.d.ts.map