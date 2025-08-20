import type { ApiClientLike } from '../../types';
export declare enum ChannelType {
    TEXT = "text",
    VOICE = "voice",
    EMAIL = "email",
    CHAT = "chat",
    SMS = "sms",
    WHATSAPP = "whatsapp",
    MESSENGER = "messenger",
    API = "api",
    WEBHOOK = "webhook"
}
export declare enum ChannelStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    ERROR = "error",
    RATE_LIMITED = "rate_limited"
}
export declare enum AIModel {
    GPT_4 = "gpt-4",
    GPT_3_5_TURBO = "gpt-3.5-turbo",
    CLAUDE_2 = "claude-2",
    CLAUDE_INSTANT = "claude-instant",
    CUSTOM = "custom"
}
export declare enum VoiceModel {
    ELEVEN_LABS = "eleven_labs",
    AMAZON_POLLY = "amazon_polly",
    GOOGLE_CLOUD = "google_cloud",
    AZURE_COGNITIVE = "azure_cognitive"
}
export declare enum ChannelPriority {
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum ChannelRating {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor"
}
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
export interface ChannelResponse {
    uuid: string;
    id: number;
    created_at: string;
    updated_at: string;
    data: ChannelData;
    metrics?: ChannelMetrics;
}
export declare class ChannelNotFoundError extends Error {
    constructor(channelId: string);
}
export declare class ChannelValidationError extends Error {
    constructor(message: string);
}
export declare class ChannelOperationError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
declare class Channels {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * List channels with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of ChannelResponse objects
     */
    list(params?: {
        type?: ChannelType;
        status?: ChannelStatus;
        agent_id?: string;
        org_id?: string;
        tags?: string[];
    }): Promise<ChannelResponse[]>;
    /**
     * Get specific channel
     * @param channelId - Channel ID
     * @returns ChannelResponse object
     */
    get(channelId: string): Promise<ChannelResponse>;
    /**
     * Create new channel
     * @param channelData - ChannelData object
     * @returns ChannelResponse object
     */
    create(channelData: ChannelData): Promise<ChannelResponse>;
    /**
     * Update channel
     * @param channelId - Channel ID
     * @param channelData - Partial<ChannelData> object
     * @returns ChannelResponse object
     */
    update(channelId: string, channelData: Partial<ChannelData>): Promise<ChannelResponse>;
    /**
     * Delete channel
     * @param channelId - Channel ID
     */
    delete(channelId: string): Promise<void>;
    /**
     * Update channel status
     * @param channelId - Channel ID
     * @param status - ChannelStatus
     * @param reason - Optional reason for status change
     * @returns ChannelResponse object
     */
    updateStatus(channelId: string, status: ChannelStatus, reason?: string): Promise<ChannelResponse>;
    /**
     * Get channel metrics
     * @param channelId - Channel ID
     * @param params - Optional filtering parameters
     * @returns ChannelMetrics object
     */
    getMetrics(channelId: string, params?: {
        start_date?: Date;
        end_date?: Date;
    }): Promise<ChannelMetrics>;
    /**
     * Test channel configuration
     * @param channelId - Channel ID
     * @param testData - Optional test data
     * @returns Object containing success, latency, and error (if any)
     */
    testChannel(channelId: string, testData?: {
        message?: string;
        timeout?: number;
    }): Promise<{
        success: boolean;
        latency: number;
        error?: string;
    }>;
    /**
     * Update channel voice configuration
     * @param channelId - Channel ID
     * @param voiceConfig - VoiceConfig object
     * @returns ChannelResponse object
     */
    updateVoiceConfig(channelId: string, voiceConfig: VoiceConfig): Promise<ChannelResponse>;
    /**
     * Update channel response configuration
     * @param channelId - Channel ID
     * @param responseConfig - ResponseConfig object
     * @returns ChannelResponse object
     */
    updateResponseConfig(channelId: string, responseConfig: ResponseConfig): Promise<ChannelResponse>;
    /**
     * Validate channel data
     * @param data - ChannelData object
     */
    private validateChannelData;
}
export default Channels;
//# sourceMappingURL=Channel.d.ts.map