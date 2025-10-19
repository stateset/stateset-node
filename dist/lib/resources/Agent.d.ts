import type { ApiClientLike } from '../../types';
export type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK';
export type AgentRole = 'CUSTOMER_SERVICE' | 'SALES' | 'SUPPORT' | 'ADMIN';
export type AgentCapability = 'CHAT' | 'VOICE' | 'EMAIL' | 'VIDEO';
export interface AgentMetadata {
    name?: string;
    email?: string;
    department?: string;
    skills?: string[];
    languages?: string[];
    [key: string]: any;
}
export interface AgentCreateParams {
    agent_name?: string;
    agent_type?: string;
    description?: string;
    activated?: boolean;
    org_id?: string;
    voice_model?: string;
    voice_model_id?: string;
    voice_model_provider?: string;
    user_id?: string;
    goal?: string;
    instructions?: string;
    role?: string;
    avatar_url?: string;
    mcp_servers?: Record<string, unknown>;
    model_id?: string;
    skills?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    capabilities?: AgentCapability[];
}
export interface AgentUpdateParams {
    agent_name?: string;
    agent_type?: string;
    description?: string;
    activated?: boolean;
    org_id?: string;
    voice_model?: string;
    voice_model_id?: string;
    voice_model_provider?: string;
    user_id?: string;
    goal?: string;
    instructions?: string;
    role?: string;
    avatar_url?: string;
    mcp_servers?: Record<string, unknown>;
    model_id?: string;
    skills?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    capabilities?: AgentCapability[];
}
export interface TaskData {
    id: string;
    type: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    description: string;
    metadata?: Record<string, any>;
}
interface BaseAgentResponse {
    id: string;
    object: 'agent';
    created_at: string;
    updated_at: string;
    agent_name?: string;
    agent_type?: string;
    description?: string;
    activated?: boolean;
    last_updated?: string;
    org_id?: string;
    voice_model?: string;
    voice_model_id?: string;
    voice_model_provider?: string;
    user_id?: string;
    goal?: string;
    instructions?: string;
    role?: string;
    avatar_url?: string;
    mcp_servers?: Record<string, unknown>;
    model_id?: string;
    skills?: Record<string, unknown>;
    attributes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    capabilities?: AgentCapability[];
    status?: AgentStatus;
    current_task?: TaskData;
}
interface AvailableAgentResponse extends BaseAgentResponse {
    status: 'AVAILABLE';
    available: true;
}
interface BusyAgentResponse extends BaseAgentResponse {
    status: 'BUSY';
    busy: true;
    current_task: TaskData;
}
interface OfflineAgentResponse extends BaseAgentResponse {
    status: 'OFFLINE';
    offline: true;
}
interface OnBreakAgentResponse extends BaseAgentResponse {
    status: 'ON_BREAK';
    onBreak: true;
}
export type AgentResponse = AvailableAgentResponse | BusyAgentResponse | OfflineAgentResponse | OnBreakAgentResponse;
export declare class AgentNotFoundError extends Error {
    constructor(agentId: string);
}
export declare class InvalidAgentStatusError extends Error {
    constructor(status: string);
}
export declare class AgentOperationError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
declare class Agents {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * Transforms API response into a strongly-typed AgentResponse
     */
    private handleCommandResponse;
    /**
     * List all agents with optional filtering
     */
    list(params?: {
        status?: AgentStatus;
        role?: AgentRole;
        capability?: AgentCapability;
    }): Promise<AgentResponse[]>;
    /**
     * Get a specific agent by ID
     */
    get(agentId: string): Promise<AgentResponse>;
    /**
     * Create a new agent
     * @param params - AgentCreateParams object
     * @returns AgentResponse object
     */
    create(params: AgentCreateParams): Promise<AgentResponse>;
    /**
     * Update an existing agent
     * @param agentId - Agent ID
     * @param params - AgentUpdateParams object
     * @returns AgentResponse object
     */
    update(agentId: string, params: AgentUpdateParams): Promise<AgentResponse>;
    /**
     * Delete an agent
     * @param agentId - Agent ID
     */
    delete(agentId: string): Promise<void>;
    /**
     * Set agent status methods
     * @param agentId - Agent ID
     * @returns AgentResponse object
     */
    setAvailable(agentId: string): Promise<AvailableAgentResponse>;
    setBusy(agentId: string): Promise<BusyAgentResponse>;
    setOffline(agentId: string): Promise<OfflineAgentResponse>;
    setOnBreak(agentId: string): Promise<OnBreakAgentResponse>;
    /**
     * Task management methods
     */
    assignTask(agentId: string, taskData: TaskData): Promise<BusyAgentResponse>;
    completeTask(agentId: string, taskId: string): Promise<AvailableAgentResponse>;
    /**
     * Get agent performance metrics
     * @param agentId - Agent ID
     * @param timeframe - Timeframe for metrics ('day', 'week', 'month')
     * @returns Object containing metrics
     */
    getMetrics(agentId: string, timeframe?: 'day' | 'week' | 'month'): Promise<any>;
    /**
     * Get agent availability schedule
     * @param agentId - Agent ID
     * @param startDate - Start date
     * @param endDate - End date
     * @returns Object containing schedule
     */
    getSchedule(agentId: string, startDate: Date, endDate: Date): Promise<any>;
}
export default Agents;
//# sourceMappingURL=Agent.d.ts.map