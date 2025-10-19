import Agents, { AgentCapability } from '../src/lib/resources/Agent';
import { stateset } from '../src/stateset-client';

// Mock the stateset client
jest.mock('../src/stateset-client');

describe('Agent Resource', () => {
  let agents: Agents;
  let mockRequest: jest.Mock;

  beforeEach(() => {
    mockRequest = jest.fn();
    (stateset as any).request = mockRequest;
    agents = new Agents(stateset as any);
  });

  describe('create', () => {
    it('should create an agent with all fields', async () => {
      const agentData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        object: 'agent',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        agent_name: 'Support Agent 1',
        agent_type: 'customer_service',
        description: 'A helpful customer service agent',
        activated: true,
        last_updated: '2024-01-01T00:00:00Z',
        org_id: 'org_123',
        voice_model: 'conversational',
        voice_model_id: 'voice_123',
        voice_model_provider: 'openai',
        user_id: 'user_123',
        goal: 'Provide excellent customer service',
        instructions: 'Be polite and helpful',
        role: 'support',
        avatar_url: 'https://example.com/avatar.png',
        mcp_servers: { server1: { enabled: true } },
        model_id: 'gpt-4',
        skills: { languages: ['en', 'es'], expertise: ['billing', 'technical'] },
        attributes: { department: 'support', level: 'senior' },
        metadata: { custom_field: 'value' },
        capabilities: ['CHAT', 'EMAIL'] as AgentCapability[],
        status: 'AVAILABLE',
      };

      mockRequest.mockResolvedValue({ agent: agentData });

      const createParams = {
        agent_name: 'Support Agent 1',
        agent_type: 'customer_service',
        description: 'A helpful customer service agent',
        activated: true,
        org_id: 'org_123',
        voice_model: 'conversational',
        voice_model_id: 'voice_123',
        voice_model_provider: 'openai',
        user_id: 'user_123',
        goal: 'Provide excellent customer service',
        instructions: 'Be polite and helpful',
        role: 'support',
        avatar_url: 'https://example.com/avatar.png',
        mcp_servers: { server1: { enabled: true } },
        model_id: 'gpt-4',
        skills: { languages: ['en', 'es'], expertise: ['billing', 'technical'] },
        attributes: { department: 'support', level: 'senior' },
        metadata: { custom_field: 'value' },
        capabilities: ['CHAT', 'EMAIL'] as AgentCapability[],
      };

      const result = await agents.create(createParams);

      expect(mockRequest).toHaveBeenCalledWith('POST', 'agents', createParams);
      expect(result).toMatchObject({
        id: agentData.id,
        agent_name: agentData.agent_name,
        agent_type: agentData.agent_type,
        description: agentData.description,
        activated: agentData.activated,
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
      });
    });
  });

  describe('update', () => {
    it('should update an agent with partial fields', async () => {
      const agentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData = {
        agent_name: 'Updated Agent Name',
        activated: false,
        voice_model: 'new_model',
        skills: { languages: ['en', 'fr', 'de'] },
        metadata: { updated: true },
      };

      const updatedAgent = {
        id: agentId,
        object: 'agent',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        ...updateData,
        status: 'OFFLINE',
      };

      mockRequest.mockResolvedValue({ agent: updatedAgent });

      const result = await agents.update(agentId, updateData);

      expect(mockRequest).toHaveBeenCalledWith('PUT', `agents/${agentId}`, updateData);
      expect(result.agent_name).toBe(updateData.agent_name);
      expect(result.activated).toBe(updateData.activated);
      expect(result.voice_model).toBe(updateData.voice_model);
      expect(result.skills).toEqual(updateData.skills);
      expect(result.metadata).toEqual(updateData.metadata);
    });
  });

  describe('list', () => {
    it('should list agents with filtering', async () => {
      const agentsList = [
        {
          id: '1',
          object: 'agent',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          agent_name: 'Agent 1',
          agent_type: 'sales',
          activated: true,
          status: 'AVAILABLE',
        },
        {
          id: '2',
          object: 'agent',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          agent_name: 'Agent 2',
          agent_type: 'support',
          activated: true,
          status: 'BUSY',
        },
      ];

      mockRequest.mockResolvedValue({ agents: agentsList });

      const result = await agents.list({ status: 'AVAILABLE' });

      expect(mockRequest).toHaveBeenCalledWith('GET', 'agents?status=AVAILABLE');
      expect(result).toHaveLength(2);
      expect(result[0].agent_name).toBe('Agent 1');
      expect(result[1].agent_name).toBe('Agent 2');
    });
  });

  describe('get', () => {
    it('should get a single agent with all fields', async () => {
      const agentId = '123e4567-e89b-12d3-a456-426614174000';
      const agentData = {
        id: agentId,
        object: 'agent',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        agent_name: 'Support Agent',
        agent_type: 'customer_service',
        description: 'A helpful agent',
        activated: true,
        last_updated: '2024-01-01T00:00:00Z',
        org_id: 'org_123',
        voice_model: 'conversational',
        voice_model_id: 'voice_123',
        voice_model_provider: 'openai',
        user_id: 'user_123',
        goal: 'Help customers',
        instructions: 'Be helpful',
        role: 'support',
        avatar_url: 'https://example.com/avatar.png',
        mcp_servers: { server1: { enabled: true } },
        model_id: 'gpt-4',
        skills: { languages: ['en'] },
        attributes: { level: 'senior' },
        metadata: { custom: 'data' },
        status: 'AVAILABLE',
      };

      mockRequest.mockResolvedValue({ agent: agentData });

      const result = await agents.get(agentId);

      expect(mockRequest).toHaveBeenCalledWith('GET', `agents/${agentId}`);
      expect(result.id).toBe(agentId);
      expect(result.agent_name).toBe(agentData.agent_name);
      expect(result.mcp_servers).toEqual(agentData.mcp_servers);
      expect(result.skills).toEqual(agentData.skills);
    });
  });
});
