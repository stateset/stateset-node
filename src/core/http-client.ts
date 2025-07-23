import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProxyConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { StatesetConfig, RequestOptions } from '../types';
import { logger } from '../utils/logger';
import { withRetry, CircuitBreaker } from '../utils/retry';
import {
  StatesetError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetInvalidRequestError,
  StatesetNotFoundError,
  StatesetRateLimitError,
} from '../StatesetError';

export interface HttpRequestConfig extends AxiosRequestConfig {
  requestId?: string;
  retries?: number;
  circuitBreaker?: boolean;
  metadata?: any;
}

export class HttpClient {
  private client: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private defaultRetries: number;

  constructor(private config: StatesetConfig) {
    this.defaultRetries = config.retry ?? 0;
    this.circuitBreaker = new CircuitBreaker();
    
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? 60000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent ?? this.buildUserAgent(),
        ...config.additionalHeaders,
      },
    });

    this.setupProxy();
    this.setupInterceptors();
  }

  private buildUserAgent(): string {
    const packageVersion = process.env.npm_package_version ?? '1.0.0';
    let ua = `stateset-node/${packageVersion}`;
    
    if (this.config.appInfo) {
      ua += ` ${this.config.appInfo.name}`;
      if (this.config.appInfo.version) {
        ua += `/${this.config.appInfo.version}`;
      }
      if (this.config.appInfo.url) {
        ua += ` (${this.config.appInfo.url})`;
      }
    }
    
    return ua;
  }

  private setupProxy(): void {
    if (this.config.proxy) {
      const parsed = new URL(this.config.proxy);
      const proxy: AxiosProxyConfig = {
        protocol: parsed.protocol.replace(':', ''),
        host: parsed.hostname,
        port: Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80),
      };

      if (parsed.username || parsed.password) {
        proxy.auth = {
          username: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password),
        };
      }

      this.client.defaults.proxy = proxy;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        const requestId = uuidv4();
        config.metadata = { requestId, startTime: Date.now() };
        
        logger.debug('HTTP request started', {
          requestId,
          operation: 'http_request',
          metadata: {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
          },
        });

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', undefined, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        const { requestId, startTime } = response.config?.metadata || {};
        const duration = Date.now() - (startTime || Date.now());

        logger.debug('HTTP request completed', {
          requestId,
          operation: 'http_response',
          metadata: {
            status: response.status,
            duration,
            size: JSON.stringify(response.data).length,
          },
        });

        return response;
      },
      (error: any) => {
        const { requestId, startTime } = error.config?.metadata || {};
        const duration = Date.now() - (startTime || Date.now());

        logger.error('HTTP request failed', {
          requestId,
          operation: 'http_error',
          metadata: {
            status: error.response?.status,
            duration,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
          },
        }, error);

        return Promise.reject(this.transformError(error, requestId));
      }
    );
  }

  private transformError(error: any, requestId?: string): StatesetError {
    const baseErrorData = {
      type: 'api_error',
      message: error.message,
      path: error.config?.url,
      statusCode: error.response?.status,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    if (error.response) {
      const { status, data } = error.response;
      const errorData = {
        ...baseErrorData,
        message: data?.message || error.message,
        code: data?.code,
        detail: data?.detail,
        statusCode: status,
      };

      switch (status) {
        case 400:
          return new StatesetInvalidRequestError(errorData);
        case 401:
        case 403:
          return new StatesetAuthenticationError(errorData);
        case 404:
          return new StatesetNotFoundError(errorData);
        case 429:
          return new StatesetRateLimitError(errorData.message);
        case 500:
        case 502:
        case 503:
        case 504:
          return new StatesetAPIError(errorData);
        default:
          return new StatesetError(errorData);
      }
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new StatesetConnectionError({
        ...baseErrorData,
        type: 'connection_error',
        message: 'Request timeout',
        detail: error.message,
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new StatesetConnectionError({
        ...baseErrorData,
        type: 'connection_error',
        message: 'Connection failed',
        detail: error.message,
      });
    }

    return new StatesetConnectionError({
      ...baseErrorData,
      type: 'connection_error',
      message: 'Network error',
      detail: error.message,
    });
  }

  async request<T = any>(
    method: string,
    path: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const requestConfig: HttpRequestConfig = {
      method: method.toLowerCase() as any,
      url: path,
      data,
      timeout: options.timeout || this.client.defaults.timeout,
      headers: options.headers,
      params: options.params,
      retries: options.retries ?? this.defaultRetries,
    };

    const operation = async () => {
      if (requestConfig.circuitBreaker !== false) {
        return this.circuitBreaker.execute(async () => {
          const response: AxiosResponse<T> = await this.client.request(requestConfig);
          return response.data;
        });
      } else {
        const response: AxiosResponse<T> = await this.client.request(requestConfig);
        return response.data;
      }
    };

    if ((requestConfig.retries ?? 0) > 0) {
      return withRetry(operation, {
        maxAttempts: (requestConfig.retries ?? 0) + 1,
        baseDelay: this.config.retryDelayMs ?? 1000,
      });
    }

    return operation();
  }

  async get<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T = any>(path: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  async put<T = any>(path: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  async patch<T = any>(path: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', path, data, options);
  }

  async delete<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  // Configuration updates
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
  }

  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.client.defaults.baseURL = baseUrl;
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.client.defaults.timeout = timeout;
  }

  setHeaders(headers: Record<string, string>): void {
    this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
    Object.assign(this.client.defaults.headers, headers);
  }

  setRetryOptions(retry: number, retryDelayMs: number): void {
    this.config.retry = retry;
    this.config.retryDelayMs = retryDelayMs;
    this.defaultRetries = retry;
  }

  setProxy(proxy: string): void {
    this.config.proxy = proxy;
    this.setupProxy();
  }

  setAppInfo(appInfo: { name: string; version?: string; url?: string }): void {
    this.config.appInfo = appInfo;
    this.client.defaults.headers['User-Agent'] = this.buildUserAgent();
  }

  // Health check
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      await this.get('/health');
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }

  // Get circuit breaker state
  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  // Reset circuit breaker
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}