"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const https = __importStar(require("https"));
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
const retry_1 = require("../utils/retry");
const StatesetError_1 = require("../StatesetError");
class EnhancedHttpClient {
    axiosInstance;
    circuitBreaker;
    retryOptions;
    requestInterceptors = [];
    responseInterceptors = [];
    errorInterceptors = [];
    constructor(options) {
        this.retryOptions = options.retry || {};
        this.circuitBreaker = new retry_1.CircuitBreaker();
        // Create HTTPS agent with connection pooling
        const httpsAgent = new https.Agent({
            keepAlive: options.keepAlive ?? true,
            maxSockets: options.maxSockets ?? 10,
            maxFreeSockets: 5,
            timeout: options.timeout ?? 60000,
        });
        this.axiosInstance = axios_1.default.create({
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
    setupInterceptors() {
        // Request interceptor
        this.axiosInstance.interceptors.request.use((config) => {
            const requestId = (0, uuid_1.v4)();
            const startTime = Date.now();
            const metadata = {
                requestId,
                startTime,
                method: config.method?.toUpperCase() || 'GET',
                url: config.url || '',
                headers: config.headers,
            };
            // Add request ID to headers for tracing
            if (config.headers) {
                config.headers['X-Request-ID'] = requestId;
            }
            // Attach metadata to config
            config.metadata = metadata;
            logger_1.logger.debug('HTTP request initiated', {
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
        }, error => {
            logger_1.logger.error('Request interceptor error', {
                operation: 'http_request',
                metadata: { error: error.message },
            }, error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.axiosInstance.interceptors.response.use(response => {
            const metadata = response.config.metadata;
            const endTime = Date.now();
            const responseMetadata = {
                ...metadata,
                endTime,
                statusCode: response.status,
                responseTime: endTime - metadata.startTime,
                responseSize: JSON.stringify(response.data).length,
            };
            // Attach metadata to response
            response.metadata = responseMetadata;
            logger_1.logger.info('HTTP response received', {
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
        }, async (error) => {
            const metadata = error.config?.metadata;
            if (metadata) {
                const endTime = Date.now();
                logger_1.logger.error('HTTP request failed', {
                    requestId: metadata.requestId,
                    operation: 'http_error',
                    metadata: {
                        method: metadata.method,
                        url: metadata.url,
                        responseTime: endTime - metadata.startTime,
                        statusCode: error.response?.status,
                        errorMessage: error.message,
                    },
                }, error);
            }
            // Apply custom error interceptors
            const processedError = await this.applyErrorInterceptors(error);
            // Transform axios errors to Stateset errors
            throw this.transformError(processedError);
        });
    }
    async applyRequestInterceptors(config) {
        let result = config;
        for (const interceptor of this.requestInterceptors) {
            result = await interceptor(result);
        }
        return result;
    }
    async applyResponseInterceptors(response) {
        let result = response;
        for (const interceptor of this.responseInterceptors) {
            result = await interceptor(result);
        }
        return result;
    }
    async applyErrorInterceptors(error) {
        let current = error;
        for (const interceptor of this.errorInterceptors) {
            const result = await interceptor(current);
            if (result) {
                current = result;
            }
        }
        return current;
    }
    transformError(error) {
        const metadata = error.config?.metadata;
        const raw = {
            type: 'api_error',
            message: error.message,
            code: error.code,
            detail: error.response?.data?.detail || error.stack,
            path: error.config?.url,
            statusCode: error.response?.status,
            timestamp: new Date().toISOString(),
            request_id: metadata?.requestId,
        };
        if (error.response) {
            const status = error.response.status;
            if (status === 400) {
                return new StatesetError_1.StatesetInvalidRequestError(raw);
            }
            if (status === 401 || status === 403) {
                return new StatesetError_1.StatesetAuthenticationError(raw);
            }
            if (status === 404) {
                return new StatesetError_1.StatesetNotFoundError(raw);
            }
            if (status >= 500) {
                return new StatesetError_1.StatesetAPIError(raw);
            }
        }
        // Network errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return new StatesetError_1.StatesetConnectionError({
                ...raw,
                type: 'connection_error',
                message: 'Request timeout',
            });
        }
        return new StatesetError_1.StatesetConnectionError({
            ...raw,
            type: 'connection_error',
        });
    }
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        // Remove sensitive headers from logs
        if (sanitized.Authorization) {
            sanitized.Authorization = '[REDACTED]';
        }
        return sanitized;
    }
    // Public methods for interceptors
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }
    addErrorInterceptor(interceptor) {
        this.errorInterceptors.push(interceptor);
    }
    // HTTP methods with retry logic and circuit breaker
    async get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    async post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    async put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    async patch(url, data, config) {
        return this.request({ ...config, method: 'PATCH', url, data });
    }
    async delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
    async request(config) {
        const { statesetRetryOptions, ...axiosConfig } = config;
        const mergedRetryOptions = {
            ...this.retryOptions,
            ...statesetRetryOptions,
        };
        const operation = () => this.circuitBreaker.execute(() => this.axiosInstance.request(axiosConfig));
        if (mergedRetryOptions.maxAttempts && mergedRetryOptions.maxAttempts > 1) {
            return (0, retry_1.withRetry)(operation, mergedRetryOptions);
        }
        return operation();
    }
    // Health check endpoint
    async healthCheck() {
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
        }
        catch (error) {
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
    updateApiKey(apiKey) {
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    }
    updateBaseURL(baseURL) {
        this.axiosInstance.defaults.baseURL = baseURL;
    }
    updateTimeout(timeout) {
        this.axiosInstance.defaults.timeout = timeout;
    }
    updateHeaders(headers) {
        Object.assign(this.axiosInstance.defaults.headers.common, headers);
    }
    updateRetryOptions(retry) {
        this.retryOptions = retry ? { ...retry } : {};
    }
    updateProxy(proxy) {
        this.axiosInstance.defaults.proxy = proxy || false;
    }
    getCircuitBreakerState() {
        return this.circuitBreaker.getState();
    }
    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }
    // Cleanup method
    destroy() {
        // Clear interceptors
        this.requestInterceptors.length = 0;
        this.responseInterceptors.length = 0;
        this.errorInterceptors.length = 0;
        // Reset circuit breaker
        this.circuitBreaker.reset();
    }
}
exports.EnhancedHttpClient = EnhancedHttpClient;
//# sourceMappingURL=http-client.js.map