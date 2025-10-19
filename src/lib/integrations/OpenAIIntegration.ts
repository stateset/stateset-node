import axios, { AxiosInstance } from 'axios';

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
  private client: AxiosInstance;

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const data = {
      model: options.model || 'gpt-3.5-turbo',
      messages,
      ...options,
    };
    const resp = await this.client.post('/chat/completions', data);
    return resp.data;
  }
}
