import type { ApiClientLike } from '../../types';
export declare enum MessageType {
    TEXT = "text",
    CODE = "code",
    CHART = "chart",
    IMAGE = "image",
    VOICE = "voice",
    COMMERCE = "commerce",
    SYSTEM = "system",
    ERROR = "error"
}
export declare enum MessageStatus {
    QUEUED = "queued",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}
export declare enum MessagePriority {
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low"
}
export declare enum VoiceModelProvider {
    ELEVEN_LABS = "eleven_labs",
    AMAZON_POLLY = "amazon_polly",
    GOOGLE_CLOUD = "google_cloud",
    MICROSOFT_AZURE = "microsoft_azure"
}
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
export interface MessageResponse {
    id: string;
    message_number: number;
    created_at: string;
    date: string;
    time: string;
    timestamp: string;
    data: MessageData;
}
export declare class MessageNotFoundError extends Error {
    constructor(messageId: string);
}
export declare class MessageValidationError extends Error {
    constructor(message: string);
}
export declare class MessageDeliveryError extends Error {
    readonly messageId: string;
    constructor(message: string, messageId: string);
}
declare class Messages {
    private readonly stateset;
    constructor(stateset: ApiClientLike);
    /**
     * List messages with optional filtering
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    list(params?: {
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
    }): Promise<MessageResponse[]>;
    /**
     * Get specific message by ID
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    get(messageId: string): Promise<MessageResponse>;
    /**
     * Create new message
     * @param messageData - MessageData object
     * @returns MessageResponse object
     */
    create(messageData: MessageData): Promise<MessageResponse>;
    /**
     * Update existing message
     * @param messageId - Message ID
     * @param messageData - Partial<MessageData> object
     * @returns MessageResponse object
     */
    update(messageId: string, messageData: Partial<MessageData>): Promise<MessageResponse>;
    /**
     * Delete message
     * @param messageId - Message ID
     */
    delete(messageId: string): Promise<void>;
    /**
     * Like message
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    like(messageId: string): Promise<MessageResponse>;
    /**
     * Unlike message
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    unlike(messageId: string): Promise<MessageResponse>;
    /**
     * Mark message as read
     * @param messageId - Message ID
     * @returns MessageResponse object
     */
    markAsRead(messageId: string): Promise<MessageResponse>;
    /**
     * Get message analytics
     * @param messageId - Message ID
     * @returns MessageAnalytics object
     */
    getAnalytics(messageId: string): Promise<MessageAnalytics>;
    /**
     * Search messages
     * @param query - Search query
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    search(query: string, params?: {
        type?: MessageType;
        date_from?: Date;
        date_to?: Date;
        channel_id?: number;
        chat_id?: string;
        org_id?: string;
    }): Promise<MessageResponse[]>;
    /**
     * Get conversation thread
     * @param messageId - Message ID
     * @param params - Optional filtering parameters
     * @returns Array of MessageResponse objects
     */
    getThread(messageId: string, params?: {
        limit?: number;
        include_context?: boolean;
    }): Promise<MessageResponse[]>;
    /**
     * Validate message data
     * @param data - MessageData object
     */
    private validateMessageData;
}
export default Messages;
//# sourceMappingURL=Message.d.ts.map