import axios, { AxiosInstance, AxiosError } from 'axios';

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
  response_format?: { type: string };
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

export class OpenAIIntegrationError extends Error {
  public readonly status?: number;
  public override readonly cause?: unknown;

  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = 'OpenAIIntegrationError';
    this.status = status;
    this.cause = cause;
    Error.captureStackTrace?.(this, new.target);
  }
}

export default class OpenAIIntegration {
  private client: AxiosInstance;
  private defaultModel: string;

  constructor(apiKey: string, options: OpenAIIntegrationOptions = {}) {
    const {
      baseUrl = 'https://api.openai.com/v1',
      defaultModel = 'gpt-4o-mini',
      timeoutMs = 60000,
      additionalHeaders = {},
    } = options;

    this.defaultModel = defaultModel;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...additionalHeaders,
      },
    });
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const { signal, model, ...restOptions } = options;
    const payload = {
      model: model || this.defaultModel,
      messages,
      ...restOptions,
    };

    try {
      const resp = await this.client.post('/chat/completions', payload, { signal });
      return resp.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: { message?: string } }>;
        const status = axiosError.response?.status;
        const details =
          axiosError.response?.data?.error?.message || axiosError.message || 'Unknown error';
        throw new OpenAIIntegrationError(`OpenAI chat completion failed: ${details}`, status, error);
      }

      throw new OpenAIIntegrationError('OpenAI chat completion failed', undefined, error);
    }
  }
}
