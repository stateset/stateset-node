import { stateset } from '../../stateset-client';

type AgentStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK';

interface BaseAgentResponse {
  id: string;
  object: 'agent';
  status: AgentStatus;
}

interface AvailableAgentResponse extends BaseAgentResponse {
  status: 'AVAILABLE';
  available: true;
}

interface BusyAgentResponse extends BaseAgentResponse {
  status: 'BUSY';
  busy: true;
}

interface OfflineAgentResponse extends BaseAgentResponse {
  status: 'OFFLINE';
  offline: true;
}

interface OnBreakAgentResponse extends BaseAgentResponse {
  status: 'ON_BREAK';
  onBreak: true;
}

type AgentResponse = AvailableAgentResponse | BusyAgentResponse | OfflineAgentResponse | OnBreakAgentResponse;

interface ApiResponse {
  update_agents_by_pk: {
    id: string;
    status: AgentStatus;
    [key: string]: any;
  };
}

class Agents {
  constructor(private stateset: stateset) {}

  private handleCommandResponse(response: any): AgentResponse {
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.update_agents_by_pk) {
      throw new Error('Unexpected response format');
    }

    const agentData = response.update_agents_by_pk;

    const baseResponse: BaseAgentResponse = {
      id: agentData.id,
      object: 'agent',
      status: agentData.status,
    };

    switch (agentData.status) {
      case 'AVAILABLE':
        return { ...baseResponse, status: 'AVAILABLE', available: true };
      case 'BUSY':
        return { ...baseResponse, status: 'BUSY', busy: true };
      case 'OFFLINE':
        return { ...baseResponse, status: 'OFFLINE', offline: true };
      case 'ON_BREAK':
        return { ...baseResponse, status: 'ON_BREAK', onBreak: true };
      default:
        throw new Error(`Unexpected agent status: ${agentData.status}`);
    }
  }

  async list() {
    return this.stateset.request('GET', 'agents');
  }

  async get(agentId: string) {
    return this.stateset.request('GET', `agents/${agentId}`);
  }

  async create(agentData: any) {
    return this.stateset.request('POST', 'agents', agentData);
  }

  async update(agentId: string, agentData: any) {
    return this.stateset.request('PUT', `agents/${agentId}`, agentData);
  }

  async delete(agentId: string) {
    return this.stateset.request('DELETE', `agents/${agentId}`);
  }

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

  async assignTask(agentId: string, taskData: any): Promise<BusyAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/assign-task`, taskData);
    return this.handleCommandResponse(response) as BusyAgentResponse;
  }

  async completeTask(agentId: string, taskId: string): Promise<AvailableAgentResponse> {
    const response = await this.stateset.request('POST', `agents/${agentId}/complete-task/${taskId}`);
    return this.handleCommandResponse(response) as AvailableAgentResponse;
  }
}

export default Agents;