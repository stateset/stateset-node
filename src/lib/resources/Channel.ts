import { stateset } from '../../stateset-client';

// Enums for channel management
export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
  EMAIL = 'email',
  CHAT = 'chat',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  API = 'api',
  WEBHOOK = 'webhook'
}

export enum ChannelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  RATE_LIMITED = 'rate_limited'
}

export enum AIModel {
  GPT_4 = 'gpt-4',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  CLAUDE_2 = 'claude-2',
  CLAUDE_INSTANT = 'claude-instant',
  CUSTOM = 'custom'
}

export enum VoiceModel {
  ELEVEN_LABS = 'eleven_labs',
  AMAZON_POLLY = 'amazon_polly',
  GOOGLE_CLOUD = 'google_cloud',
  AZURE_COGNITIVE = 'azure_cognitive'
}

export enum ChannelPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ChannelRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

// Interfaces for channel data structures
export interface ChannelConfig {
  rate_limit?: {
    requests_per_minute: number;
    burst_limit: number;
  };
  retry_policy?: {
    max_attempts: number;
    initial_delay: number;
    max_delay: number;
    backoff_multiplier: number;
  };
  timeout_settings?: {
    connection_timeout: number;
    response_timeout: number;
    idle_timeout: number;
  };
  authentication?: {
    type: 'api_key' | 'oauth' | 'jwt' | 'basic';
    credentials?: Record<string, any>;
  };
}

export interface VoiceConfig {
  model_id: string;
  voice_id: string;
  provider: VoiceModel;
  settings?: {
    language_code?: string;
    voice_style?: string;
    speaking_rate?: number;
    pitch?: number;
    volume_gain_db?: number;
  };
  fallback_voice?: {
    provider: VoiceModel;
    voice_id: string;
  };
}

export interface ResponseConfig {
  system_prompt: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string[];
  response_format?: {
    type: 'text' | 'json' | 'markdown';
    schema?: Record<string, any>;
  };
}

export interface EscalationRules {
  conditions: Array<{
    type: 'sentiment' | 'keyword' | 'intent' | 'time' | 'custom';
    params: Record<string, any>;
    action: 'escalate' | 'notify' | 'tag';
  }>;
  routing?: {
    agent_id?: string;
    team_id?: string;
    priority?: ChannelPriority;
  };
}

export interface ChannelMetrics {
  messages_sent: number;
  messages_received: number;
  average_response_time: number;
  error_rate: number;
  user_satisfaction: number;
  escalation_rate: number;
}

export interface ChannelData {
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  priority: ChannelPriority;
  model: AIModel;
  voice_config?: VoiceConfig;
  response_config: ResponseConfig;
  channel_config: ChannelConfig;
  escalation_rules?: EscalationRules;
  tags?: string[];
  rating?: ChannelRating;
  agent_id?: string;
  user_id?: string;
  org_id?: string;
  metadata?: Record<string, any>;
}

// Response Interface
export interface ChannelResponse {
  uuid: string;
  id: number;
  created_at: string;
  updated_at: string;
  data: ChannelData;
  metrics?: ChannelMetrics;
}

// Custom Error Classes
export class ChannelNotFoundError extends Error {
  constructor(channelId: string) {
    super(`Channel with ID ${channelId} not found`);
    this.name = 'ChannelNotFoundError';
  }
}

export class ChannelValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChannelValidationError';
  }
}

export class ChannelOperationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ChannelOperationError';
  }
}

// Main Channels Class
class Channels {
  constructor(private readonly stateset: stateset) {}

  /**
   * List channels with optional filtering
   * @param params - Optional filtering parameters
   * @returns Array of ChannelResponse objects
   */
  async list(params?: {
    type?: ChannelType;
    status?: ChannelStatus;
    agent_id?: string;
    org_id?: string;
    tags?: string[];
  }): Promise<ChannelResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.agent_id) queryParams.append('agent_id', params.agent_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);
    if (params?.tags) queryParams.append('tags', JSON.stringify(params.tags));

    const response = await this.stateset.request('GET', `channels?${queryParams.toString()}`);
    return response.channels;
  }

  /**
   * Get specific channel
   * @param channelId - Channel ID
   * @returns ChannelResponse object
   */
  async get(channelId: string): Promise<ChannelResponse> {
    try {
      const response = await this.stateset.request('GET', `channels/${channelId}`);
      return response.channel;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ChannelNotFoundError(channelId);
      }
      throw error;
    }
  }

  /**
   * Create new channel
   * @param channelData - ChannelData object
   * @returns ChannelResponse object
   */
  async create(channelData: ChannelData): Promise<ChannelResponse> {
    this.validateChannelData(channelData);

    try {
      const response = await this.stateset.request('POST', 'channels', channelData);
      return response.channel;
    } catch (error: any) {
      if (error.status === 400) {
        throw new ChannelValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update channel
   * @param channelId - Channel ID
   * @param channelData - Partial<ChannelData> object
   * @returns ChannelResponse object
   */
  async update(
    channelId: string,
    channelData: Partial<ChannelData>
  ): Promise<ChannelResponse> {
    try {
      const response = await this.stateset.request('PUT', `channels/${channelId}`, channelData);
      return response.channel;
    } catch (error: any) {
      if (error.status === 404) {
        throw new ChannelNotFoundError(channelId);
      }
      throw error;
    }
  }

  /**
   * Delete channel
   * @param channelId - Channel ID
   */
  async delete(channelId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `channels/${channelId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new ChannelNotFoundError(channelId);
      }
      throw error;
    }
  }

  /**
   * Update channel status
   * @param channelId - Channel ID
   * @param status - ChannelStatus
   * @param reason - Optional reason for status change
   * @returns ChannelResponse object
   */
  async updateStatus(
    channelId: string,
    status: ChannelStatus,
    reason?: string
  ): Promise<ChannelResponse> {
    const response = await this.stateset.request(
      'POST',
      `channels/${channelId}/status`,
      { status, reason }
    );
    return response.channel;
  }

  /**
   * Get channel metrics
   * @param channelId - Channel ID
   * @param params - Optional filtering parameters
   * @returns ChannelMetrics object
   */
  async getMetrics(
    channelId: string,
    params?: {
      start_date?: Date;
      end_date?: Date;
    }
  ): Promise<ChannelMetrics> {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append('start_date', params.start_date.toISOString());
    if (params?.end_date) queryParams.append('end_date', params.end_date.toISOString());

    const response = await this.stateset.request(
      'GET',
      `channels/${channelId}/metrics?${queryParams.toString()}`
    );
    return response.metrics;
  }

  /**
   * Test channel configuration
   * @param channelId - Channel ID
   * @param testData - Optional test data
   * @returns Object containing success, latency, and error (if any)
   */
  async testChannel(
    channelId: string,
    testData?: {
      message?: string;
      timeout?: number;
    }
  ): Promise<{
    success: boolean;
    latency: number;
    error?: string;
  }> {
    const response = await this.stateset.request(
      'POST',
      `channels/${channelId}/test`,
      testData
    );
    return response.result;
  }

  /**
   * Update channel voice configuration
   * @param channelId - Channel ID
   * @param voiceConfig - VoiceConfig object
   * @returns ChannelResponse object
   */
  async updateVoiceConfig(
    channelId: string,
    voiceConfig: VoiceConfig
  ): Promise<ChannelResponse> {
    const response = await this.stateset.request(
      'PUT',
      `channels/${channelId}/voice-config`,
      voiceConfig
    );
    return response.channel;
  }

  /**
   * Update channel response configuration
   * @param channelId - Channel ID
   * @param responseConfig - ResponseConfig object
   * @returns ChannelResponse object
   */
  async updateResponseConfig(
    channelId: string,
    responseConfig: ResponseConfig
  ): Promise<ChannelResponse> {
    const response = await this.stateset.request(
      'PUT',
      `channels/${channelId}/response-config`,
      responseConfig
    );
    return response.channel;
  }

  /**
   * Validate channel data
   * @param data - ChannelData object
   */
  private validateChannelData(data: ChannelData): void {
    if (!data.name) {
      throw new ChannelValidationError('Channel name is required');
    }

    if (!data.type) {
      throw new ChannelValidationError('Channel type is required');
    }

    if (!data.model) {
      throw new ChannelValidationError('AI model is required');
    }

    if (data.type === ChannelType.VOICE && !data.voice_config) {
      throw new ChannelValidationError('Voice configuration is required for voice channels');
    }

    if (!data.response_config?.system_prompt) {
      throw new ChannelValidationError('Response system prompt is required');
    }
  }
}

export default Channels;