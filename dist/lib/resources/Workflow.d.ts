import { stateset } from '../../stateset-client';
export declare enum WorkflowType {
    SEQUENTIAL = "sequential",
    PARALLEL = "parallel",
    EVENT_DRIVEN = "event_driven",
    CONDITIONAL = "conditional",
    STATE_MACHINE = "state_machine"
}
export declare enum WorkflowStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    PAUSED = "paused",
    ARCHIVED = "archived",
    ERROR = "error"
}
export declare enum TaskType {
    AI_PROCESSING = "ai_processing",
    DATA_TRANSFORMATION = "data_transformation",
    API_CALL = "api_call",
    NOTIFICATION = "notification",
    DECISION = "decision",
    HUMAN_REVIEW = "human_review",
    WAIT = "wait"
}
export declare enum TriggerType {
    SCHEDULE = "schedule",
    EVENT = "event",
    API = "api",
    CONDITION = "condition",
    MANUAL = "manual"
}
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
export declare class WorkflowNotFoundError extends Error {
    constructor(workflowId: string);
}
export declare class WorkflowValidationError extends Error {
    constructor(message: string);
}
export declare class WorkflowExecutionError extends Error {
    readonly executionId: string;
    constructor(message: string, executionId: string);
}
declare class Workflows {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List workflows with optional filtering
     */
    list(params?: {
        type?: WorkflowType;
        status?: WorkflowStatus;
        agent_id?: string;
        org_id?: string;
        tags?: string[];
    }): Promise<WorkflowResponse[]>;
    /**
     * Get specific workflow
     */
    get(workflowId: string): Promise<WorkflowResponse>;
    /**
     * Create new workflow
     */
    create(workflowData: WorkflowData): Promise<WorkflowResponse>;
    /**
     * Update workflow
     */
    update(workflowId: string, workflowData: Partial<WorkflowData>): Promise<WorkflowResponse>;
    /**
     * Delete workflow
     */
    delete(workflowId: string): Promise<void>;
    /**
     * Execute workflow
     */
    execute(workflowId: string, input: Record<string, any>): Promise<WorkflowExecution>;
    /**
     * Get workflow execution status
     */
    getExecutionStatus(workflowId: string, executionId: string): Promise<WorkflowExecution>;
    /**
     * Get workflow execution history
     */
    getExecutionHistory(workflowId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        status?: 'completed' | 'failed' | 'cancelled';
        limit?: number;
    }): Promise<WorkflowExecution[]>;
    /**
     * Clone workflow
     */
    cloneWorkflow(workflowId: string, options?: {
        new_name?: string;
        new_version?: string;
    }): Promise<WorkflowResponse>;
    /**
     * Validate workflow data
     */
    private validateWorkflowData;
}
export default Workflows;
