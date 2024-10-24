import { stateset } from '../../stateset-client';

// Enums for message management
export enum MessageType {
  TEXT = 'text',
  CODE = 'code',
  CHART = 'chart',
  IMAGE = 'image',
  VOICE = 'voice',
  COMMERCE = 'commerce',
  SYSTEM = 'system',
  ERROR = 'error'
}

export enum MessageStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessagePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum VoiceModelProvider {
  ELEVEN_LABS = 'eleven_labs',
  AMAZON_POLLY = 'amazon_polly',
  GOOGLE_CLOUD = 'google_cloud',
  MICROSOFT_AZURE = 'microsoft_azure'
}

// Interfaces for message data structures
export interface MessageReceipt {
  status: MessageStatus;
  timestamp: string;
  attempt?: number;
  error?: string;
}

export interface MessageDelivery {
  sent_receipt?: MessageReceipt;
  delivered_receipt?: MessageReceipt;
  read_receipt?: MessageReceipt;
}

export interface CodeContent {
  code: string;
  language?: string;
  title?: string;
  line_numbers?: boolean;
}

export interface ChartContent {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'custom';
  data: any;
  config?: any;
  chartJSON?: any;
}

export interface CommerceContent {
  product_id?: string;
  order_id?: string;
  return_id?: string;
  warranty_id?: string;
  action?: string;
  details?: Record<string, any>;
}

export interface VoiceContent {
  text: string;
  model_id: string;
  provider: VoiceModelProvider;
  voice_url?: string;
  duration?: number;
  language?: string;
  settings?: Record<string, any>;
}

export interface MessageMetadata {
  channel_id?: number;
  chat_id?: string;
  session_id?: string;
  thread_id?: string;
  references?: string[];
  tags?: string[];
  context?: Record<string, any>;
}

export interface MessageAnalytics {
  likes: number;
  points: number;
  interactions: number;
  response_time?: number;
  sentiment_score?: number;
  relevance_score?: number;
}

export interface MessageData {
  body: string;
  type: MessageType;
  from: string;
  to: string;
  fromMe?: boolean;
  fromAgent?: boolean;
  is_public?: boolean;
  priority?: MessagePriority;
  code_content?: CodeContent;
  chart_content?: ChartContent;
  commerce_content?: CommerceContent;
  voice_content?: VoiceContent;
  image_url?: string;
  metadata?: MessageMetadata;
  analytics?: MessageAnalytics;
  delivery?: MessageDelivery;
  org_id?: string;
  user_id?: string;
  agent_id?: string;
}

// Response Interfaces
export interface MessageResponse {
  id: string;
  message_number: number;
  created_at: string;
  date: string;
  time: string;
  timestamp: string;
  data: MessageData;
}

// Custom Error Classes
export class MessageNotFoundError extends Error {
  constructor(messageId: string) {
    super(`Message with ID ${messageId} not found`);
    this.name = 'MessageNotFoundError';
  }
}

export class MessageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MessageValidationError';
  }
}

export class MessageDeliveryError extends Error {
  constructor(message: string, public readonly messageId: string) {
    super(message);
    this.name = 'MessageDeliveryError';
  }
}

// Main Messages Class
class Messages {
  constructor(private readonly stateset: stateset) {}

  /**
   * List messages with optional filtering
   */
  async list(params?: {
    type?: MessageType;
    from?: string;
    to?: string;
    chat_id?: string;
    channel_id?: number;
    date_from?: Date;
    date_to?: Date;
    fromAgent?: boolean;
    is_public?: boolean;
    org_id?: string;
  }): Promise<MessageResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.chat_id) queryParams.append('chat_id', params.chat_id);
    if (params?.channel_id) queryParams.append('channel_id', params.channel_id.toString());
    if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
    if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
    if (params?.fromAgent !== undefined) queryParams.append('fromAgent', params.fromAgent.toString());
    if (params?.is_public !== undefined) queryParams.append('is_public', params.is_public.toString());
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request('GET', `messages?${queryParams.toString()}`);
    return response.messages;
  }

  /**
   * Get specific message by ID
   */
  async get(messageId: string): Promise<MessageResponse> {
    try {
      const response = await this.stateset.request('GET', `messages/${messageId}`);
      return response.message;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MessageNotFoundError(messageId);
      }
      throw error;
    }
  }

  /**
   * Create new message
   */
  async create(messageData: MessageData): Promise<MessageResponse> {
    this.validateMessageData(messageData);

    try {
      const response = await this.stateset.request('POST', 'messages', messageData);
      return response.message;
    } catch (error: any) {
      if (error.status === 400) {
        throw new MessageValidationError(error.message);
      }
      throw error;
    }
  }

  /**
   * Update existing message
   */
  async update(
    messageId: string,
    messageData: Partial<MessageData>
  ): Promise<MessageResponse> {
    try {
      const response = await this.stateset.request('PUT', `messages/${messageId}`, messageData);
      return response.message;
    } catch (error: any) {
      if (error.status === 404) {
        throw new MessageNotFoundError(messageId);
      }
      throw error;
    }
  }

  /**
   * Delete message
   */
  async delete(messageId: string): Promise<void> {
    try {
      await this.stateset.request('DELETE', `messages/${messageId}`);
    } catch (error: any) {
      if (error.status === 404) {
        throw new MessageNotFoundError(messageId);
      }
      throw error;
    }
  }

  /**
   * Like message
   */
  async like(messageId: string): Promise<MessageResponse> {
    const response = await this.stateset.request('POST', `messages/${messageId}/like`);
    return response.message;
  }

  /**
   * Unlike message
   */
  async unlike(messageId: string): Promise<MessageResponse> {
    const response = await this.stateset.request('POST', `messages/${messageId}/unlike`);
    return response.message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<MessageResponse> {
    const response = await this.stateset.request('POST', `messages/${messageId}/read`);
    return response.message;
  }

  /**
   * Get message analytics
   */
  async getAnalytics(messageId: string): Promise<MessageAnalytics> {
    const response = await this.stateset.request('GET', `messages/${messageId}/analytics`);
    return response.analytics;
  }

  /**
   * Search messages
   */
  async search(query: string, params?: {
    type?: MessageType;
    date_from?: Date;
    date_to?: Date;
    channel_id?: number;
    chat_id?: string;
    org_id?: string;
  }): Promise<MessageResponse[]> {
    const queryParams = new URLSearchParams({ query });
    
    if (params?.type) queryParams.append('type', params.type);
    if (params?.date_from) queryParams.append('date_from', params.date_from.toISOString());
    if (params?.date_to) queryParams.append('date_to', params.date_to.toISOString());
    if (params?.channel_id) queryParams.append('channel_id', params.channel_id.toString());
    if (params?.chat_id) queryParams.append('chat_id', params.chat_id);
    if (params?.org_id) queryParams.append('org_id', params.org_id);

    const response = await this.stateset.request(
      'GET',
      `messages/search?${queryParams.toString()}`
    );
    return response.messages;
  }

  /**
   * Get conversation thread
   */
  async getThread(messageId: string, params?: {
    limit?: number;
    include_context?: boolean;
  }): Promise<MessageResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.include_context !== undefined) {
      queryParams.append('include_context', params.include_context.toString());
    }

    const response = await this.stateset.request(
      'GET',
      `messages/${messageId}/thread?${queryParams.toString()}`
    );
    return response.messages;
  }

  /**
   * Validate message data
   */
  private validateMessageData(data: MessageData): void {
    if (!data.body) {
      throw new MessageValidationError('Message body is required');
    }

    if (!data.type) {
      throw new MessageValidationError('Message type is required');
    }

    if (!data.from || !data.to) {
      throw new MessageValidationError('Message must have from and to fields');
    }

    if (data.type === MessageType.CODE && !data.code_content) {
      throw new MessageValidationError('Code content is required for code messages');
    }

    if (data.type === MessageType.CHART && !data.chart_content) {
      throw new MessageValidationError('Chart content is required for chart messages');
    }

    if (data.type === MessageType.VOICE && !data.voice_content) {
      throw new MessageValidationError('Voice content is required for voice messages');
    }
  }
}

export default Messages;