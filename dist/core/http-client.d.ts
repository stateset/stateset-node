import { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { RetryOptions } from '../utils/retry';
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
export type RequestInterceptor = (config: InternalAxiosRequestConfig & {
    metadata?: RequestMetadata;
}) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
export type ResponseInterceptor = (response: AxiosResponse & {
    metadata?: ResponseMetadata;
}) => AxiosResponse | Promise<AxiosResponse>;
export type ErrorInterceptor = (error: AxiosError & {
    metadata?: RequestMetadata;
}) => void | AxiosError | Promise<void | AxiosError>;
type InternalAxiosRequestConfigWithRetry = AxiosRequestConfig & {
    statesetRetryOptions?: Partial<RetryOptions>;
};
export declare class EnhancedHttpClient {
    private axiosInstance;
    private circuitBreaker;
    private retryOptions;
    private requestInterceptors;
    private responseInterceptors;
    private errorInterceptors;
    constructor(options: HttpClientOptions);
    private setupInterceptors;
    private applyRequestInterceptors;
    private applyResponseInterceptors;
    private applyErrorInterceptors;
    private transformError;
    private sanitizeHeaders;
    addRequestInterceptor(interceptor: RequestInterceptor): void;
    addResponseInterceptor(interceptor: ResponseInterceptor): void;
    addErrorInterceptor(interceptor: ErrorInterceptor): void;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    request<T = any>(config: InternalAxiosRequestConfigWithRetry): Promise<AxiosResponse<T>>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        details: any;
    }>;
    updateApiKey(apiKey: string): void;
    updateBaseURL(baseURL: string): void;
    updateTimeout(timeout: number): void;
    updateHeaders(headers: Record<string, string>): void;
    updateRetryOptions(retry?: Partial<RetryOptions>): void;
    updateProxy(proxy?: HttpClientOptions['proxy'] | null): void;
    getCircuitBreakerState(): string;
    resetCircuitBreaker(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=http-client.d.ts.map