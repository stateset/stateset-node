"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOperationError = exports.InvalidAgentStatusError = exports.AgentNotFoundError = void 0;
// Error Classes
class AgentNotFoundError extends Error {
    constructor(agentId) {
        super(`Agent with ID ${agentId} not found`);
        this.name = 'AgentNotFoundError';
    }
}
exports.AgentNotFoundError = AgentNotFoundError;
class InvalidAgentStatusError extends Error {
    constructor(status) {
        super(`Invalid agent status: ${status}`);
        this.name = 'InvalidAgentStatusError';
    }
}
exports.InvalidAgentStatusError = InvalidAgentStatusError;
class AgentOperationError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'AgentOperationError';
    }
}
exports.AgentOperationError = AgentOperationError;
// Main Agents Class
class Agents {
    stateset;
    constructor(stateset) {
        this.stateset = stateset;
    }
    /**
     * Transforms API response into a strongly-typed AgentResponse
     */
    handleCommandResponse(response) {
        if (response.error) {
            throw new AgentOperationError(response.error.message, response.error.code);
        }
        if (!response.update_agents_by_pk) {
            throw new Error('Unexpected response format');
        }
        const agentData = response.update_agents_by_pk;
        const baseResponse = {
            id: agentData.id,
            object: 'agent',
            created_at: agentData.created_at,
            updated_at: agentData.updated_at,
            agent_name: agentData.agent_name,
            agent_type: agentData.agent_type,
            description: agentData.description,
            activated: agentData.activated,
            last_updated: agentData.last_updated,
            org_id: agentData.org_id,
            voice_model: agentData.voice_model,
            voice_model_id: agentData.voice_model_id,
            voice_model_provider: agentData.voice_model_provider,
            user_id: agentData.user_id,
            goal: agentData.goal,
            instructions: agentData.instructions,
            role: agentData.role,
            avatar_url: agentData.avatar_url,
            mcp_servers: agentData.mcp_servers,
            model_id: agentData.model_id,
            skills: agentData.skills,
            attributes: agentData.attributes,
            metadata: agentData.metadata,
            capabilities: agentData.capabilities,
            status: agentData.status,
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
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.status)
            queryParams.append('status', params.status);
        if (params?.role)
            queryParams.append('role', params.role);
        if (params?.capability)
            queryParams.append('capability', params.capability);
        const response = await this.stateset.request('GET', `agents?${queryParams.toString()}`);
        return response.agents.map((agent) => this.handleCommandResponse({ update_agents_by_pk: agent }));
    }
    /**
     * Get a specific agent by ID
     */
    async get(agentId) {
        try {
            const response = await this.stateset.request('GET', `agents/${agentId}`);
            return this.handleCommandResponse({ update_agents_by_pk: response.agent });
        }
        catch (error) {
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
    async create(params) {
        const response = await this.stateset.request('POST', 'agents', params);
        return this.handleCommandResponse({ update_agents_by_pk: response.agent });
    }
    /**
     * Update an existing agent
     * @param agentId - Agent ID
     * @param params - AgentUpdateParams object
     * @returns AgentResponse object
     */
    async update(agentId, params) {
        try {
            const response = await this.stateset.request('PUT', `agents/${agentId}`, params);
            return this.handleCommandResponse({ update_agents_by_pk: response.agent });
        }
        catch (error) {
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
    async delete(agentId) {
        try {
            await this.stateset.request('DELETE', `agents/${agentId}`);
        }
        catch (error) {
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
    async setAvailable(agentId) {
        const response = await this.stateset.request('POST', `agents/${agentId}/set-available`);
        return this.handleCommandResponse(response);
    }
    async setBusy(agentId) {
        const response = await this.stateset.request('POST', `agents/${agentId}/set-busy`);
        return this.handleCommandResponse(response);
    }
    async setOffline(agentId) {
        const response = await this.stateset.request('POST', `agents/${agentId}/set-offline`);
        return this.handleCommandResponse(response);
    }
    async setOnBreak(agentId) {
        const response = await this.stateset.request('POST', `agents/${agentId}/set-on-break`);
        return this.handleCommandResponse(response);
    }
    /**
    * Task management methods
     */
    async assignTask(agentId, taskData) {
        const response = await this.stateset.request('POST', `agents/${agentId}/assign-task`, taskData);
        return this.handleCommandResponse(response);
    }
    async completeTask(agentId, taskId) {
        const response = await this.stateset.request('POST', `agents/${agentId}/complete-task/${taskId}`);
        return this.handleCommandResponse(response);
    }
    /**
     * Get agent performance metrics
     * @param agentId - Agent ID
     * @param timeframe - Timeframe for metrics ('day', 'week', 'month')
     * @returns Object containing metrics
     */
    async getMetrics(agentId, timeframe = 'day') {
        return this.stateset.request('GET', `agents/${agentId}/metrics?timeframe=${timeframe}`);
    }
    /**
     * Get agent availability schedule
     * @param agentId - Agent ID
     * @param startDate - Start date
     * @param endDate - End date
     * @returns Object containing schedule
     */
    async getSchedule(agentId, startDate, endDate) {
        const params = new URLSearchParams({
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        });
        return this.stateset.request('GET', `agents/${agentId}/schedule?${params.toString()}`);
    }
}
exports.default = Agents;
//# sourceMappingURL=Agent.js.map