"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
const retry_1 = require("../utils/retry");
const StatesetError_1 = require("../StatesetError");
class HttpClient {
    config;
    client;
    circuitBreaker;
    defaultRetries;
    constructor(config) {
        this.config = config;
        this.defaultRetries = config.retry ?? 0;
        this.circuitBreaker = new retry_1.CircuitBreaker();
        this.client = axios_1.default.create({
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
    buildUserAgent() {
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
    setupProxy() {
        if (this.config.proxy) {
            const parsed = new URL(this.config.proxy);
            const proxy = {
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
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            const requestId = (0, uuid_1.v4)();
            config.metadata = { requestId, startTime: Date.now() };
            logger_1.logger.debug('HTTP request started', {
                requestId,
                operation: 'http_request',
                metadata: {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    baseURL: config.baseURL,
                },
            });
            return config;
        }, (error) => {
            logger_1.logger.error('Request interceptor error', undefined, error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            const { requestId, startTime } = response.config?.metadata || {};
            const duration = Date.now() - (startTime || Date.now());
            logger_1.logger.debug('HTTP request completed', {
                requestId,
                operation: 'http_response',
                metadata: {
                    status: response.status,
                    duration,
                    size: JSON.stringify(response.data).length,
                },
            });
            return response;
        }, (error) => {
            const { requestId, startTime } = error.config?.metadata || {};
            const duration = Date.now() - (startTime || Date.now());
            logger_1.logger.error('HTTP request failed', {
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
        });
    }
    transformError(error, requestId) {
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
                    return new StatesetError_1.StatesetInvalidRequestError(errorData);
                case 401:
                case 403:
                    return new StatesetError_1.StatesetAuthenticationError(errorData);
                case 404:
                    return new StatesetError_1.StatesetNotFoundError(errorData);
                case 429:
                    return new StatesetError_1.StatesetRateLimitError(errorData.message);
                case 500:
                case 502:
                case 503:
                case 504:
                    return new StatesetError_1.StatesetAPIError(errorData);
                default:
                    return new StatesetError_1.StatesetError(errorData);
            }
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return new StatesetError_1.StatesetConnectionError({
                ...baseErrorData,
                type: 'connection_error',
                message: 'Request timeout',
                detail: error.message,
            });
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return new StatesetError_1.StatesetConnectionError({
                ...baseErrorData,
                type: 'connection_error',
                message: 'Connection failed',
                detail: error.message,
            });
        }
        return new StatesetError_1.StatesetConnectionError({
            ...baseErrorData,
            type: 'connection_error',
            message: 'Network error',
            detail: error.message,
        });
    }
    async request(method, path, data, options = {}) {
        const requestConfig = {
            method: method.toLowerCase(),
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
                    const response = await this.client.request(requestConfig);
                    return response.data;
                });
            }
            else {
                const response = await this.client.request(requestConfig);
                return response.data;
            }
        };
        if ((requestConfig.retries ?? 0) > 0) {
            return (0, retry_1.withRetry)(operation, {
                maxAttempts: (requestConfig.retries ?? 0) + 1,
                baseDelay: this.config.retryDelayMs ?? 1000,
            });
        }
        return operation();
    }
    async get(path, options = {}) {
        return this.request('GET', path, undefined, options);
    }
    async post(path, data, options = {}) {
        return this.request('POST', path, data, options);
    }
    async put(path, data, options = {}) {
        return this.request('PUT', path, data, options);
    }
    async patch(path, data, options = {}) {
        return this.request('PATCH', path, data, options);
    }
    async delete(path, options = {}) {
        return this.request('DELETE', path, undefined, options);
    }
    // Configuration updates
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
    }
    setBaseUrl(baseUrl) {
        this.config.baseUrl = baseUrl;
        this.client.defaults.baseURL = baseUrl;
    }
    setTimeout(timeout) {
        this.config.timeout = timeout;
        this.client.defaults.timeout = timeout;
    }
    setHeaders(headers) {
        this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
        Object.assign(this.client.defaults.headers, headers);
    }
    setRetryOptions(retry, retryDelayMs) {
        this.config.retry = retry;
        this.config.retryDelayMs = retryDelayMs;
        this.defaultRetries = retry;
    }
    setProxy(proxy) {
        this.config.proxy = proxy;
        this.setupProxy();
    }
    setAppInfo(appInfo) {
        this.config.appInfo = appInfo;
        this.client.defaults.headers['User-Agent'] = this.buildUserAgent();
    }
    // Health check
    async healthCheck() {
        try {
            await this.get('/health');
            return { status: 'ok', timestamp: new Date().toISOString() };
        }
        catch (error) {
            return { status: 'error', timestamp: new Date().toISOString() };
        }
    }
    // Get circuit breaker state
    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }
    // Reset circuit breaker
    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }
}
exports.HttpClient = HttpClient;
//# sourceMappingURL=http-client.js.map