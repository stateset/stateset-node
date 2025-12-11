import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import * as https from 'https';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { withRetry, CircuitBreaker, RetryOptions } from '../utils/retry';
import {
  StatesetError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetInvalidRequestError,
  StatesetNotFoundError,
  StatesetPermissionError,
  StatesetRateLimitError,
} from '../StatesetError';

export interface HttpClientOptions {
  baseURL: string;
  apiKey: string;
  timeout?: number;
  retry?: Partial<RetryOptions>;
  userAgent?: string;
  additionalHeaders?: Record<string, string>;
  maxSockets?: number;
  keepAlive?: boolean;
  proxy?: {
    protocol: string;
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export interface RequestMetadata {
  requestId: string;
  startTime: number;
  method: string;
  url: string;
  headers: Record<string, string>;
}

export interface ResponseMetadata extends RequestMetadata {
  endTime: number;
  statusCode: number;
  responseTime: number;
  responseSize: number;
}

export type RequestInterceptor = (
  config: InternalAxiosRequestConfig & { metadata?: RequestMetadata }
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
export type ResponseInterceptor = (
  response: AxiosResponse & { metadata?: ResponseMetadata }
) => AxiosResponse | Promise<AxiosResponse>;
export type ErrorInterceptor = (
  error: AxiosError & { metadata?: RequestMetadata }
) => void | AxiosError | Promise<void | AxiosError>;

type InternalAxiosRequestConfigWithRetry = AxiosRequestConfig & {
  statesetRetryOptions?: Partial<RetryOptions>;
};

export class EnhancedHttpClient {
  private axiosInstance: AxiosInstance;
  private circuitBreaker: CircuitBreaker;
  private retryOptions: Partial<RetryOptions>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(options: HttpClientOptions) {
    this.retryOptions = options.retry || {};
    this.circuitBreaker = new CircuitBreaker();

    // Create HTTPS agent with connection pooling
    const httpsAgent = new https.Agent({
      keepAlive: options.keepAlive ?? true,
      maxSockets: options.maxSockets ?? 10,
      maxFreeSockets: 5,
      timeout: options.timeout ?? 60000,
    });

    this.axiosInstance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 60000,
      httpsAgent,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': options.userAgent || 'stateset-node-client/1.0.0',
        ...options.additionalHeaders,
      },
      proxy: options.proxy
        ? {
            protocol: options.proxy.protocol,
            host: options.proxy.host,
            port: options.proxy.port,
            auth: options.proxy.auth,
          }
        : false,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const requestId = uuidv4();
        const startTime = Date.now();
        const metadata: RequestMetadata = {
          requestId,
          startTime,
          method: config.method?.toUpperCase() || 'GET',
          url: config.url || '',
          headers: config.headers as Record<string, string>,
        };

        // Add request ID to headers for tracing
        if (config.headers) {
          config.headers['X-Request-ID'] = requestId;
        }

        // Attach metadata to config
        (config as any).metadata = metadata;

        logger.debug('HTTP request initiated', {
          requestId,
          operation: 'http_request',
          metadata: {
            method: metadata.method,
            url: metadata.url,
            headers: this.sanitizeHeaders(metadata.headers),
          },
        });

        // Apply custom request interceptors
        return this.applyRequestInterceptors(config);
      },
      error => {
        logger.error(
          'Request interceptor error',
          {
            operation: 'http_request',
            metadata: { error: error.message },
          },
          error
        );
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      response => {
        const metadata = (response.config as any).metadata as RequestMetadata;
        const endTime = Date.now();
        const responseMetadata: ResponseMetadata = {
          ...metadata,
          endTime,
          statusCode: response.status,
          responseTime: endTime - metadata.startTime,
          responseSize: JSON.stringify(response.data).length,
        };

        // Attach metadata to response
        (response as any).metadata = responseMetadata;

        logger.info('HTTP response received', {
          requestId: metadata.requestId,
          operation: 'http_response',
          metadata: {
            statusCode: responseMetadata.statusCode,
            responseTime: responseMetadata.responseTime,
            responseSize: responseMetadata.responseSize,
          },
        });

        // Apply custom response interceptors
        return this.applyResponseInterceptors(response);
      },
      async error => {
        const metadata = (error.config as any)?.metadata as RequestMetadata;

        if (metadata) {
          const endTime = Date.now();
          logger.error(
            'HTTP request failed',
            {
              requestId: metadata.requestId,
              operation: 'http_error',
              metadata: {
                method: metadata.method,
                url: metadata.url,
                responseTime: endTime - metadata.startTime,
                statusCode: error.response?.status,
                errorMessage: error.message,
              },
            },
            error
          );
        }

        // Apply custom error interceptors
        const processedError = await this.applyErrorInterceptors(error);

        // Transform axios errors to Stateset errors
        throw this.transformError(processedError);
      }
    );
  }

  private async applyRequestInterceptors(
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors(response: AxiosResponse): Promise<AxiosResponse> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyErrorInterceptors(error: AxiosError): Promise<AxiosError> {
    let current = error;

    for (const interceptor of this.errorInterceptors) {
      const result = await interceptor(current as AxiosError & { metadata?: RequestMetadata });
      if (result) {
        current = result;
      }
    }

    return current;
  }

  private transformError(error: AxiosError): StatesetError {
    const metadata = (error.config as any)?.metadata as RequestMetadata;
    const raw = {
      type: 'api_error',
      message: error.message,
      code: error.code,
      detail: (error.response?.data as any)?.detail || error.stack,
      path: error.config?.url,
      statusCode: error.response?.status,
      status: error.response?.status,
      timestamp: new Date().toISOString(),
      request_id: metadata?.requestId,
    };

    if (error.response) {
      const status = error.response.status;
      if (status === 400) {
        return new StatesetInvalidRequestError(raw);
      }
      if (status === 401) {
        return new StatesetAuthenticationError({ ...raw, type: 'authentication_error' });
      }
      if (status === 403) {
        return new StatesetPermissionError({ ...raw, type: 'permission_error' });
      }
      if (status === 404) {
        return new StatesetNotFoundError(raw);
      }
      if (status === 429) {
        return new StatesetRateLimitError({ ...raw, type: 'rate_limit_error' });
      }
      if (status >= 400 && status < 500) {
        return new StatesetInvalidRequestError(raw);
      }
      if (status >= 500) {
        return new StatesetAPIError({ ...raw, type: 'api_error' });
      }
    }

    // Network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new StatesetConnectionError({
        ...raw,
        type: 'connection_error',
        message: 'Request timeout',
      });
    }

    return new StatesetConnectionError({
      ...raw,
      type: 'connection_error',
    });
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    // Remove sensitive headers from logs
    if (sanitized.Authorization) {
      sanitized.Authorization = '[REDACTED]';
    }
    return sanitized;
  }

  // Public methods for interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // HTTP methods with retry logic and circuit breaker
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request({ ...config, method: 'DELETE', url });
  }

  async request<T = any>(config: InternalAxiosRequestConfigWithRetry): Promise<AxiosResponse<T>> {
    const { statesetRetryOptions, ...axiosConfig } = config as InternalAxiosRequestConfigWithRetry;
    const mergedRetryOptions = {
      ...this.retryOptions,
      ...statesetRetryOptions,
    };

    const operation = () =>
      this.circuitBreaker.execute(() => this.axiosInstance.request<T>(axiosConfig));

    if (mergedRetryOptions.maxAttempts && mergedRetryOptions.maxAttempts > 1) {
      return withRetry(operation, mergedRetryOptions);
    }

    return operation();
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string; details: any }> {
    try {
      const response = await this.get('/health');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        details: {
          circuitBreakerState: this.circuitBreaker.getState(),
          response: response.data,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        details: {
          circuitBreakerState: this.circuitBreaker.getState(),
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Configuration updates
  updateApiKey(apiKey: string): void {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }

  updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  updateTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  updateHeaders(headers: Record<string, string>): void {
    Object.assign(this.axiosInstance.defaults.headers.common, headers);
  }

  updateRetryOptions(retry?: Partial<RetryOptions>): void {
    this.retryOptions = retry ? { ...retry } : {};
  }

  updateProxy(proxy?: HttpClientOptions['proxy'] | null): void {
    this.axiosInstance.defaults.proxy = proxy || false;
  }

  getCircuitBreakerState(): string {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }

  // Cleanup method
  destroy(): void {
    // Clear interceptors
    this.requestInterceptors.length = 0;
    this.responseInterceptors.length = 0;
    this.errorInterceptors.length = 0;

    // Reset circuit breaker
    this.circuitBreaker.reset();
  }
}
