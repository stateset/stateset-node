"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesetClient = void 0;
const http_client_1 = require("./core/http-client");
const logger_1 = require("./utils/logger");
// Import resources
const returns_1 = require("./resources/returns");
const resources_1 = require("./resources");
class StatesetClient {
    httpClient;
    config;
    // Resources
    returns;
    orders;
    products;
    customers;
    shipments;
    workOrders;
    agents;
    inventory;
    constructor(config = {}) {
        this.config = this.normalizeConfig(config);
        this.validateConfig();
        this.httpClient = new http_client_1.HttpClient(this.config);
        logger_1.logger.info('Stateset client initialized', {
            operation: 'client_init',
            metadata: {
                baseUrl: this.config.baseUrl,
                timeout: this.config.timeout,
                retry: this.config.retry,
            },
        });
        // Initialize resources
        this.returns = new returns_1.ReturnsResource(this.httpClient);
        this.orders = new resources_1.OrdersResource(this.httpClient);
        this.products = new resources_1.ProductsResource(this.httpClient);
        this.customers = new resources_1.CustomersResource(this.httpClient);
        this.shipments = new resources_1.ShipmentsResource(this.httpClient);
        this.workOrders = new resources_1.WorkOrdersResource(this.httpClient);
        this.agents = new resources_1.AgentsResource(this.httpClient);
        this.inventory = new resources_1.InventoryResource(this.httpClient);
    }
    normalizeConfig(config) {
        const packageVersion = require('../package.json').version;
        return {
            apiKey: config.apiKey || process.env.STATESET_API_KEY,
            baseUrl: config.baseUrl ||
                process.env.STATESET_BASE_URL ||
                'https://stateset-proxy-server.stateset.cloud.stateset.app/api',
            retry: config.retry ??
                (process.env.STATESET_RETRY ? parseInt(process.env.STATESET_RETRY, 10) : 3),
            retryDelayMs: config.retryDelayMs ??
                (process.env.STATESET_RETRY_DELAY_MS ?
                    parseInt(process.env.STATESET_RETRY_DELAY_MS, 10) : 1000),
            timeout: config.timeout ?? 60000,
            userAgent: config.userAgent || `stateset-node/${packageVersion}`,
            additionalHeaders: config.additionalHeaders || {},
            proxy: config.proxy ||
                process.env.STATESET_PROXY ||
                process.env.HTTPS_PROXY ||
                process.env.HTTP_PROXY,
            appInfo: config.appInfo,
        };
    }
    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error('Stateset API key is required. ' +
                'Set it in the config or STATESET_API_KEY environment variable.');
        }
        if (!this.config.baseUrl) {
            throw new Error('Stateset base URL is required.');
        }
        // Validate URL format
        try {
            new URL(this.config.baseUrl);
        }
        catch (error) {
            throw new Error(`Invalid base URL: ${this.config.baseUrl}`);
        }
        // Validate timeout
        if (this.config.timeout && (this.config.timeout < 1000 || this.config.timeout > 300000)) {
            throw new Error('Timeout must be between 1000ms and 300000ms (5 minutes)');
        }
        // Validate retry settings
        if (this.config.retry && (this.config.retry < 0 || this.config.retry > 10)) {
            throw new Error('Retry count must be between 0 and 10');
        }
        if (this.config.retryDelayMs && (this.config.retryDelayMs < 100 || this.config.retryDelayMs > 30000)) {
            throw new Error('Retry delay must be between 100ms and 30000ms');
        }
    }
    // Configuration methods for backward compatibility
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.httpClient.setApiKey(apiKey);
        logger_1.logger.info('API key updated', {
            operation: 'config_update',
            metadata: { field: 'apiKey' },
        });
    }
    setBaseUrl(baseUrl) {
        try {
            new URL(baseUrl);
        }
        catch (error) {
            throw new Error(`Invalid base URL: ${baseUrl}`);
        }
        this.config.baseUrl = baseUrl;
        this.httpClient.setBaseUrl(baseUrl);
        logger_1.logger.info('Base URL updated', {
            operation: 'config_update',
            metadata: { field: 'baseUrl', value: baseUrl },
        });
    }
    setTimeout(timeout) {
        if (timeout < 1000 || timeout > 300000) {
            throw new Error('Timeout must be between 1000ms and 300000ms (5 minutes)');
        }
        this.config.timeout = timeout;
        this.httpClient.setTimeout(timeout);
        logger_1.logger.info('Timeout updated', {
            operation: 'config_update',
            metadata: { field: 'timeout', value: timeout },
        });
    }
    setRetryOptions(retry, retryDelayMs) {
        if (retry < 0 || retry > 10) {
            throw new Error('Retry count must be between 0 and 10');
        }
        if (retryDelayMs < 100 || retryDelayMs > 30000) {
            throw new Error('Retry delay must be between 100ms and 30000ms');
        }
        this.config.retry = retry;
        this.config.retryDelayMs = retryDelayMs;
        this.httpClient.setRetryOptions(retry, retryDelayMs);
        logger_1.logger.info('Retry options updated', {
            operation: 'config_update',
            metadata: { field: 'retry', retry, retryDelayMs },
        });
    }
    setHeaders(headers) {
        this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
        this.httpClient.setHeaders(headers);
        logger_1.logger.info('Headers updated', {
            operation: 'config_update',
            metadata: { field: 'headers', count: Object.keys(headers).length },
        });
    }
    setProxy(proxy) {
        this.config.proxy = proxy;
        this.httpClient.setProxy(proxy);
        logger_1.logger.info('Proxy updated', {
            operation: 'config_update',
            metadata: { field: 'proxy' },
        });
    }
    setAppInfo(appInfo) {
        this.config.appInfo = appInfo;
        this.httpClient.setAppInfo(appInfo);
        logger_1.logger.info('App info updated', {
            operation: 'config_update',
            metadata: { field: 'appInfo', app: appInfo.name },
        });
    }
    // Health and monitoring methods
    async healthCheck() {
        try {
            const result = await this.httpClient.healthCheck();
            logger_1.logger.info('Health check completed', {
                operation: 'health_check',
                metadata: { status: result.status },
            });
            return {
                ...result,
                details: {
                    circuitBreakerState: this.httpClient.getCircuitBreakerState(),
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Health check failed', {
                operation: 'health_check',
            }, error);
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                details: {
                    error: error.message,
                    circuitBreakerState: this.httpClient.getCircuitBreakerState(),
                },
            };
        }
    }
    getCircuitBreakerState() {
        return this.httpClient.getCircuitBreakerState();
    }
    resetCircuitBreaker() {
        this.httpClient.resetCircuitBreaker();
        logger_1.logger.info('Circuit breaker reset', {
            operation: 'circuit_breaker_reset',
        });
    }
    // Legacy method for backward compatibility
    async request(method, path, data, options = {}) {
        logger_1.logger.warn('Using deprecated request method, consider using resource methods instead', {
            operation: 'deprecated_request',
            metadata: { method, path },
        });
        return this.httpClient.request(method, path, data, options);
    }
    // Get current configuration (without sensitive data)
    getConfig() {
        const { apiKey, ...safeConfig } = this.config;
        return safeConfig;
    }
    // Destroy client and cleanup resources
    destroy() {
        logger_1.logger.info('Stateset client destroyed', {
            operation: 'client_destroy',
        });
        // Any cleanup logic would go here
    }
}
exports.StatesetClient = StatesetClient;
//# sourceMappingURL=client.js.map