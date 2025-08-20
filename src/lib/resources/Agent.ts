import type { ApiClientLike } from '../../types';

// Agent Types and Interfaces
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
  role: AgentRole;
  capabilities: AgentCapability[];
  metadata?: AgentMetadata;
}

export interface AgentUpdateParams {
  role?: AgentRole;
  capabilities?: AgentCapability[];
  metadata?: Partial<AgentMetadata>;
}

export interface TaskData {
  id: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  metadata?: Record<string, any>;
}

// Response Interfaces
interface BaseAgentResponse {
  id: string;
  object: 'agent';
  created_at: string;
  updated_at: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  status: AgentStatus;
  metadata: AgentMetadata;
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

export type AgentResponse = 
  | AvailableAgentResponse 
  | BusyAgentResponse 
  | OfflineAgentResponse 
  | OnBreakAgentResponse;

// Error Classes
export class AgentNotFoundError extends Error {
  constructor(agentId: string) {
    super(`Agent with ID ${agentId} not found`);
    this.name = 'AgentNotFoundError';
  }
}

export class InvalidAgentStatusError extends Error {
  constructor(status: string) {
    super(`Invalid agent status: ${status}`);
    this.name = 'InvalidAgentStatusError';
  }
}

export class AgentOperationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AgentOperationError';
  }
}

// Main Agents Class
class Agents {
  constructor(private readonly stateset: ApiClientLike) {}

  /**
   * Transforms API response into a strongly-typed AgentResponse
   */
  private handleCommandResponse(response: any): AgentResponse {
    if (response.error) {
      throw new AgentOperationError(response.error.message, response.error.code);
    }

    if (!response.update_agents_by_pk) {
      throw new Error('Unexpected response format');
    }

    const agentData = response.update_agents_by_pk;
    
    const baseResponse: BaseAgentResponse = {
      id: agentData.id,
      object: 'agent',
      created_at: agentData.created_at,
      updated_at: agentData.updated_at,
      role: agentData.role,
      capabilities: agentData.capabilities,
      status: agentData.status,
      metadata: agentData.metadata || {},
      current_task: agentData.current_task
    };

    switch (agentData.status) {
      case 'AVAILABLE':
        return { ...baseResponse, status: 'AVAILABLE', available: true };
      case 'BUSY':
        return { 
          ...baseResponse, 
          status: 'BUSY', 
          busy: true,
          current_task: agentData.current_task
        };
      case 'OFFLINE':
        return { ...baseResponse, status: 'OFFLINE', offline: true };
      case 'ON_BREAK':
        return { ...baseResponse, status: 'ON_BREAK', onBreak: true };
      default:
        throw new InvalidAgentStatusError(agentData.status);
    }
  }

  /**
   * List all agents with optional filtering
   */
  async list(params?: {
    status?: AgentStatus;
    role?: AgentRole;
    capability?: AgentCapability;
  }): Promise<AgentResponse[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.capability) queryParams.append('capability', params.capability);

    const response = await this.stateset.request('GET', `agents?${queryParams.toString()}`);
    return response.agents.map((agent: any) => this.handleCommandResponse({ update_agents_by_pk: agent }));
  }

  /**
   * Get a specific agent by ID
   */
  async get(agentId: string): Promise<AgentResponse> {
    try {
      const response = await this.stateset.request('GET', `agents/${agentId}`);
      return this.handleCommandResponse({ update_agents_by_pk: response.agent });
    } catch (error: any) {
      if (error.status === 404) {
        throw new AgentNotFoundError(agentId);
      }
      throw error;
    }
  }

  /**
   * Create a new agent
   * @param params - AgentCreateParams object
   * @returns AgentResponse object
   */
  async create(params: AgentCreateParams): Promise<AgentResponse> {
    const response = await this.stateset.request('POST', 'agents', params);
    return this.handleCommandResponse({ update_agents_by_pk: response.agent });
  }

  /**
   * Update an existing agent
   * @param agentId - Agent ID
   * @param params - AgentUpdateParams object
   * @returns AgentResponse object
   */
  async update(agentId: string, params: AgentUpdateParams): Promise<AgentResponse> {
    try {
      const response = await this.stateset.request('PUT', `agents/${agentId}`, params);
      return this.handleCommandResponse({ update_agents_by_pk: response.agent });
    } catch (error: any) {
      if (error.status === 404) {
        throw new AgentNotFoundError(agentId);
      }
      throw error;
    }
  }

  /**
   * Delete an agent
   * @param agentId - Agent ID
   */
  async delete(agentId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `agents/${agentId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new AgentNotFoundError(agentId);
      }
      throw error;
    }
  }

  /**
   * Set agent status methods
   * @param agentId - Agent ID
   * @returns AgentResponse object
   */
  async setAvailable(agentId: string): Promise<AvailableAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/set-available`);
    return this.handleCommandResponse(response) as AvailableAgentResponse;
  }

  async setBusy(agentId: string): Promise<BusyAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/set-busy`);
    return this.handleCommandResponse(response) as BusyAgentResponse;
  }

  async setOffline(agentId: string): Promise<OfflineAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/set-offline`);
    return this.handleCommandResponse(response) as OfflineAgentResponse;
  }

  async setOnBreak(agentId: string): Promise<OnBreakAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/set-on-break`);
    return this.handleCommandResponse(response) as OnBreakAgentResponse;
  }

  /**
  * Task management methods
   */
  async assignTask(agentId: string, taskData: TaskData): Promise<BusyAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/assign-task`, taskData);
    return this.handleCommandResponse(response) as BusyAgentResponse;
  }

  async completeTask(agentId: string, taskId: string): Promise<AvailableAgentResponse> {
    const response = await this.stateset.request(
      'POST', 
      `agents/${agentId}/complete-task/${taskId}`
    );
    return this.handleCommandResponse(response) as AvailableAgentResponse;
  }

  /**
   * Get agent performance metrics
   * @param agentId - Agent ID
   * @param timeframe - Timeframe for metrics ('day', 'week', 'month')
   * @returns Object containing metrics
   */
  async getMetrics(agentId: string, timeframe: 'day' | 'week' | 'month' = 'day') {
    return this.stateset.request('GET', `agents/${agentId}/metrics?timeframe=${timeframe}`);
  }

  /**
   * Get agent availability schedule
   * @param agentId - Agent ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Object containing schedule
   */
  async getSchedule(agentId: string, startDate: Date, endDate: Date) {
    const params = new URLSearchParams({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
    return this.stateset.request('GET', `agents/${agentId}/schedule?${params.toString()}`);
  }
}

export default Agents;