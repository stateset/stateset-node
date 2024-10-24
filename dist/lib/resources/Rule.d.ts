import { stateset } from '../../stateset-client';
export declare enum RuleType {
    AUTOMATION = "automation",
    RESTRICTION = "restriction",
    PERMISSION = "permission",
    VALIDATION = "validation",
    NOTIFICATION = "notification",
    ROUTING = "routing",
    ESCALATION = "escalation",
    COMPLIANCE = "compliance",
    SECURITY = "security"
}
export declare enum RulePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum TriggerType {
    EVENT = "event",
    SCHEDULE = "schedule",
    CONDITION = "condition",
    THRESHOLD = "threshold",
    PATTERN = "pattern"
}
export declare enum ActionType {
    EXECUTE = "execute",
    NOTIFY = "notify",
    UPDATE = "update",
    CREATE = "create",
    DELETE = "delete",
    ESCALATE = "escalate",
    RESTRICT = "restrict",
    LOG = "log"
}
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
export declare class RuleNotFoundError extends Error {
    constructor(ruleId: string);
}
export declare class RuleValidationError extends Error {
    constructor(message: string);
}
export declare class RuleExecutionError extends Error {
    readonly ruleId: string;
    constructor(message: string, ruleId: string);
}
declare class Rules {
    private readonly stateset;
    constructor(stateset: stateset);
    /**
     * List rules with optional filtering
     */
    list(params?: {
        rule_type?: RuleType;
        activated?: boolean;
        agent_id?: string;
        priority?: RulePriority;
        org_id?: string;
    }): Promise<RuleResponse[]>;
    /**
     * Get specific rule by ID
     */
    get(ruleId: string): Promise<RuleResponse>;
    /**
     * Create new rule
     */
    create(ruleData: RuleData): Promise<RuleResponse>;
    /**
     * Update existing rule
     */
    update(ruleId: string, ruleData: Partial<RuleData>): Promise<RuleResponse>;
    /**
     * Delete rule
     */
    delete(ruleId: string): Promise<void>;
    /**
     * Activate/Deactivate rule
     */
    setActivation(ruleId: string, activated: boolean): Promise<RuleResponse>;
    /**
     * Test rule execution
     */
    testRule(ruleId: string, testData: Record<string, any>): Promise<RuleExecutionResult>;
    /**
     * Get rule execution history
     */
    getExecutionHistory(ruleId: string, params?: {
        start_date?: Date;
        end_date?: Date;
        status?: 'success' | 'failure';
        limit?: number;
    }): Promise<RuleExecutionResult[]>;
    /**
     * Clone existing rule
     */
    cloneRule(ruleId: string, options?: {
        new_name?: string;
        activate?: boolean;
    }): Promise<RuleResponse>;
    /**
     * Validate rule conditions
     */
    private validateConditions;
    /**
     * Validate rule actions
     */
    private validateActions;
}
export default Rules;
