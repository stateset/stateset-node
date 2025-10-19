export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface ChatCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    user?: string;
    response_format?: {
        type: string;
    };
    signal?: AbortSignal;
}
export interface ChatCompletionResponseChoice {
    index: number;
    message: ChatMessage;
    finish_reason: string;
}
export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChatCompletionResponseChoice[];
}
export interface OpenAIIntegrationOptions {
    baseUrl?: string;
    defaultModel?: string;
    timeoutMs?: number;
    additionalHeaders?: Record<string, string>;
}
export declare class OpenAIIntegrationError extends Error {
    readonly status?: number;
    readonly cause?: unknown;
    constructor(message: string, status?: number, cause?: unknown);
}
export default class OpenAIIntegration {
    private client;
    private defaultModel;
    constructor(apiKey: string, options?: OpenAIIntegrationOptions);
    setDefaultModel(model: string): void;
    getDefaultModel(): string;
    createChatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResponse>;
}
//# sourceMappingURL=OpenAIIntegration.d.ts.map