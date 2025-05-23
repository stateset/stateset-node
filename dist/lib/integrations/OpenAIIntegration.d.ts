export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface ChatCompletionOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
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
export default class OpenAIIntegration {
    private client;
    constructor(apiKey: string, baseUrl?: string);
    createChatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<ChatCompletionResponse>;
}
