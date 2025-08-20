import type { ApiClientLike } from '../../types';
export declare enum ActivityType {
    AI_INFERENCE = "ai_inference",
    AI_TRAINING = "ai_training",
    AI_VALIDATION = "ai_validation",
    PROMPT_GENERATION = "prompt_generation",
    RESPONSE_PROCESSING = "response_processing",
    DATA_TRANSFORMATION = "data_transformation",
    DATA_VALIDATION = "data_validation",
    DATA_ENRICHMENT = "data_enrichment",
    DATA_AGGREGATION = "data_aggregation",
    API_CALL = "api_call",
    WEBHOOK = "webhook",
    EVENT_EMISSION = "event_emission",
    MESSAGE_QUEUE = "message_queue",
    CONDITION = "condition",
    SWITCH = "switch",
    LOOP = "loop",
    PARALLEL = "parallel",
    MAP = "map",
    HUMAN_REVIEW = "human_review",
    APPROVAL = "approval",
    MANUAL_TASK = "manual_task",
    DELAY = "delay",
    NOTIFICATION = "notification",
    LOGGING = "logging",
    ERROR_HANDLING = "error_handling"
}
export declare enum ActivityStatus {
    PENDING = "pending",
    SCHEDULED = "scheduled",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    SKIPPED = "skipped",
    WAITING = "waiting"
}
export declare enum ActivityPriority {
    CRITICAL = "critical",
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
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
export interface ActivityResponse {
    id: string;
    created_at: string;
    updated_at: string;
    data: ActivityData;
}
export declare class ActivityNotFoundError extends Error {
    constructor(activityId: string);
}
export declare class ActivityValidationError extends Error {
    constructor(message: string);
}
export declare class ActivityExecutionError extends Error {
    readonly activityId: string;
    constructor(message: string, activityId: string);
}
declare class Activities {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * List activities with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of ActivityResponse objects
     */
    list(params?: {
        workflow_id?: string;
        type?: ActivityType;
        status?: ActivityStatus;
        agent_id?: string;
        org_id?: string;
        tags?: string[];
    }): Promise<ActivityResponse[]>;
    /**
     * Get specific activity
     * @param activityId - Activity ID
     * @returns ActivityResponse object
     */
    get(activityId: string): Promise<ActivityResponse>;
    /**
     * Create new activity
     * @param activityData - ActivityData object
     * @returns ActivityResponse object
     */
    create(activityData: ActivityData): Promise<ActivityResponse>;
    /**
     * Update activity
     * @param activityId - Activity ID
     * @param activityData - Partial<ActivityData> object
     * @returns ActivityResponse object
     */
    update(activityId: string, activityData: Partial<ActivityData>): Promise<ActivityResponse>;
    /**
     * Delete activity
     * @param activityId - Activity ID
     */
    delete(activityId: string): Promise<void>;
    /**
     * Start activity execution
     * @param activityId - Activity ID
     * @param input - Optional input data
     * @returns ActivityResponse object
     */
    start(activityId: string, input?: Record<string, any>): Promise<ActivityResponse>;
    /**
     * Complete activity
     * @param activityId - Activity ID
     * @param output - Output data
     * @returns ActivityResponse object
     */
    complete(activityId: string, output: Record<string, any>): Promise<ActivityResponse>;
    /**
     * Fail activity
     * @param activityId - Activity ID
     * @param error - Error object
     * @returns ActivityResponse object
     */
    fail(activityId: string, error: {
        code: string;
        message: string;
        details?: any;
    }): Promise<ActivityResponse>;
    /**
     * Cancel activity
     * @param activityId - Activity ID
     * @param reason - Optional reason for cancellation
     * @returns ActivityResponse object
     */
    cancel(activityId: string, reason?: string): Promise<ActivityResponse>;
    /**
     * Get activity metrics
     * @param activityId - Activity ID
     * @returns ActivityMetrics object
     */
    getMetrics(activityId: string): Promise<ActivityMetrics>;
    /**
     * Retry failed activity
     * @param activityId - Activity ID
     * @returns ActivityResponse object
     */
    retry(activityId: string): Promise<ActivityResponse>;
    /**
     * Validate activity data
     * @param data - ActivityData object
    */
    private validateActivityData;
}
export default Activities;
//# sourceMappingURL=Activities.d.ts.map