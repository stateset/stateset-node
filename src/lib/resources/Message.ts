import type { ApiClientLike } from '../../types';
import { BaseResource } from './BaseResource';

// Enums for message management
export enum MessageType {
  TEXT = 'text',
  CODE = 'code',
  CHART = 'chart',
  IMAGE = 'image',
  VOICE = 'voice',
  COMMERCE = 'commerce',
  SYSTEM = 'system',
  ERROR = 'error',
}

export enum MessageStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessagePriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum VoiceModelProvider {
  ELEVEN_LABS = 'eleven_labs',
  AMAZON_POLLY = 'amazon_polly',
  GOOGLE_CLOUD = 'google_cloud',
  MICROSOFT_AZURE = 'microsoft_azure',
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
  constructor(
    message: string,
    public readonly messageId: string
  ) {
    super(message);
    this.name = 'MessageDeliveryError';
  }
}

// Main Messages Class
class Messages extends BaseResource {
  constructor(client: ApiClientLike) {
    super(client as any, 'messages', 'messages');
    this.singleKey = 'message';
    this.listKey = 'messages';
  }

  /**
   * List messages with optional filtering
   * @param params - Optional filtering parameters
   * @returns Array of MessageResponse objects
   */
  override async list(params?: {
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
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.list(requestParams as any);
    return (response as any).messages ?? response;
  }

  /**
   * Get specific message by ID
   * @param messageId - Message ID
   * @returns MessageResponse object
   */
  override async get(messageId: string): Promise<MessageResponse> {
    return super.get(messageId);
  }

  /**
   * Create new message
   * @param messageData - MessageData object
   * @returns MessageResponse object
   */
  override async create(messageData: MessageData): Promise<MessageResponse> {
    this.validateMessageData(messageData);
    return super.create(messageData);
  }

  /**
   * Update existing message
   * @param messageId - Message ID
   * @param messageData - Partial<MessageData> object
   * @returns MessageResponse object
   */
  override async update(messageId: string, messageData: Partial<MessageData>): Promise<MessageResponse> {
    return super.update(messageId, messageData);
  }

  /**
   * Delete message
   * @param messageId - Message ID
   */
  override async delete(messageId: string): Promise<void> {
    await super.delete(messageId);
  }

  /**
   * Like message
   * @param messageId - Message ID
   * @returns MessageResponse object
   */
  async like(messageId: string): Promise<MessageResponse> {
    const response = await this.client.request('POST', `messages/${messageId}/like`);
    return (response as any).message ?? response;
  }

  /**
   * Unlike message
   * @param messageId - Message ID
   * @returns MessageResponse object
   */
  async unlike(messageId: string): Promise<MessageResponse> {
    const response = await this.client.request('POST', `messages/${messageId}/unlike`);
    return (response as any).message ?? response;
  }

  /**
   * Mark message as read
   * @param messageId - Message ID
   * @returns MessageResponse object
   */
  async markAsRead(messageId: string): Promise<MessageResponse> {
    const response = await this.client.request('POST', `messages/${messageId}/read`);
    return (response as any).message ?? response;
  }

  /**
   * Get message analytics
   * @param messageId - Message ID
   * @returns MessageAnalytics object
   */
  async getAnalytics(messageId: string): Promise<MessageAnalytics> {
    const response = await this.client.request('GET', `messages/${messageId}/analytics`);
    return (response as any).analytics ?? response;
  }

  /**
   * Search messages
   * @param query - Search query
   * @param params - Optional filtering parameters
   * @returns Array of MessageResponse objects
   */
  override async search(
    query: string,
    params?: {
      type?: MessageType;
      date_from?: Date;
      date_to?: Date;
      channel_id?: number;
      chat_id?: string;
      org_id?: string;
    }
  ): Promise<MessageResponse[]> {
    const requestParams: Record<string, unknown> = { ...(params || {}) };
    if (params?.date_from) requestParams.date_from = params.date_from.toISOString();
    if (params?.date_to) requestParams.date_to = params.date_to.toISOString();

    const response = await super.search(query, requestParams as any);
    return (response as any).messages ?? response;
  }

  /**
   * Get conversation thread
   * @param messageId - Message ID
   * @param params - Optional filtering parameters
   * @returns Array of MessageResponse objects
   */
  async getThread(
    messageId: string,
    params?: {
      limit?: number;
      include_context?: boolean;
    }
  ): Promise<MessageResponse[]> {
    const response = await this.client.request(
      'GET',
      `messages/${messageId}/thread`,
      undefined,
      { params: params as any }
    );
    return (response as any).messages ?? response;
  }

  /**
   * Validate message data
   * @param data - MessageData object
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
