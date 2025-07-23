import { AxiosRequestConfig } from 'axios';
import { StatesetConfig, RequestOptions } from '../types';
export interface HttpRequestConfig extends AxiosRequestConfig {
    requestId?: string;
    retries?: number;
    circuitBreaker?: boolean;
    metadata?: any;
}
export declare class HttpClient {
    private config;
    private client;
    private circuitBreaker;
    private defaultRetries;
    constructor(config: StatesetConfig);
    private buildUserAgent;
    private setupProxy;
    private setupInterceptors;
    private transformError;
    request<T = any>(method: string, path: string, data?: any, options?: RequestOptions): Promise<T>;
    get<T = any>(path: string, options?: RequestOptions): Promise<T>;
    post<T = any>(path: string, data?: any, options?: RequestOptions): Promise<T>;
    put<T = any>(path: string, data?: any, options?: RequestOptions): Promise<T>;
    patch<T = any>(path: string, data?: any, options?: RequestOptions): Promise<T>;
    delete<T = any>(path: string, options?: RequestOptions): Promise<T>;
    setApiKey(apiKey: string): void;
    setBaseUrl(baseUrl: string): void;
    setTimeout(timeout: number): void;
    setHeaders(headers: Record<string, string>): void;
    setRetryOptions(retry: number, retryDelayMs: number): void;
    setProxy(proxy: string): void;
    setAppInfo(appInfo: {
        name: string;
        version?: string;
        url?: string;
    }): void;
    healthCheck(): Promise<{
        status: 'ok' | 'error';
        timestamp: string;
    }>;
    getCircuitBreakerState(): string;
    resetCircuitBreaker(): void;
}
//# sourceMappingURL=http-client.d.ts.map