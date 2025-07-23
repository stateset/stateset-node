import { StatesetConfig } from './types';
import { HttpClient } from './core/http-client';
import { logger } from './utils/logger';

// Import resources
import { ReturnsResource } from './resources/returns';
import { 
  OrdersResource, 
  ProductsResource, 
  CustomersResource, 
  ShipmentsResource, 
  WorkOrdersResource, 
  AgentsResource, 
  InventoryResource 
} from './resources';

export class StatesetClient {
  private httpClient: HttpClient;
  private config: StatesetConfig;

  // Resources
  public readonly returns: ReturnsResource;
  public readonly orders: OrdersResource;
  public readonly products: ProductsResource;
  public readonly customers: CustomersResource;
  public readonly shipments: ShipmentsResource;
  public readonly workOrders: WorkOrdersResource;
  public readonly agents: AgentsResource;
  public readonly inventory: InventoryResource;

  constructor(config: StatesetConfig = {}) {
    this.config = this.normalizeConfig(config);
    this.validateConfig();
    
    this.httpClient = new HttpClient(this.config);
    
    logger.info('Stateset client initialized', {
      operation: 'client_init',
      metadata: {
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        retry: this.config.retry,
      },
    });

    // Initialize resources
    this.returns = new ReturnsResource(this.httpClient);
    this.orders = new OrdersResource(this.httpClient);
    this.products = new ProductsResource(this.httpClient);
    this.customers = new CustomersResource(this.httpClient);
    this.shipments = new ShipmentsResource(this.httpClient);
    this.workOrders = new WorkOrdersResource(this.httpClient);
    this.agents = new AgentsResource(this.httpClient);
    this.inventory = new InventoryResource(this.httpClient);
  }

  private normalizeConfig(config: StatesetConfig): StatesetConfig {
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

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(
        'Stateset API key is required. ' +
        'Set it in the config or STATESET_API_KEY environment variable.'
      );
    }

    if (!this.config.baseUrl) {
      throw new Error('Stateset base URL is required.');
    }

    // Validate URL format
    try {
      new URL(this.config.baseUrl);
    } catch (error) {
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
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.httpClient.setApiKey(apiKey);
    
    logger.info('API key updated', {
      operation: 'config_update',
      metadata: { field: 'apiKey' },
    });
  }

  setBaseUrl(baseUrl: string): void {
    try {
      new URL(baseUrl);
    } catch (error) {
      throw new Error(`Invalid base URL: ${baseUrl}`);
    }
    
    this.config.baseUrl = baseUrl;
    this.httpClient.setBaseUrl(baseUrl);
    
    logger.info('Base URL updated', {
      operation: 'config_update',
      metadata: { field: 'baseUrl', value: baseUrl },
    });
  }

  setTimeout(timeout: number): void {
    if (timeout < 1000 || timeout > 300000) {
      throw new Error('Timeout must be between 1000ms and 300000ms (5 minutes)');
    }
    
    this.config.timeout = timeout;
    this.httpClient.setTimeout(timeout);
    
    logger.info('Timeout updated', {
      operation: 'config_update',
      metadata: { field: 'timeout', value: timeout },
    });
  }

  setRetryOptions(retry: number, retryDelayMs: number): void {
    if (retry < 0 || retry > 10) {
      throw new Error('Retry count must be between 0 and 10');
    }
    
    if (retryDelayMs < 100 || retryDelayMs > 30000) {
      throw new Error('Retry delay must be between 100ms and 30000ms');
    }
    
    this.config.retry = retry;
    this.config.retryDelayMs = retryDelayMs;
    this.httpClient.setRetryOptions(retry, retryDelayMs);
    
    logger.info('Retry options updated', {
      operation: 'config_update',
      metadata: { field: 'retry', retry, retryDelayMs },
    });
  }

  setHeaders(headers: Record<string, string>): void {
    this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
    this.httpClient.setHeaders(headers);
    
    logger.info('Headers updated', {
      operation: 'config_update',
      metadata: { field: 'headers', count: Object.keys(headers).length },
    });
  }

  setProxy(proxy: string): void {
    this.config.proxy = proxy;
    this.httpClient.setProxy(proxy);
    
    logger.info('Proxy updated', {
      operation: 'config_update',
      metadata: { field: 'proxy' },
    });
  }

  setAppInfo(appInfo: { name: string; version?: string; url?: string }): void {
    this.config.appInfo = appInfo;
    this.httpClient.setAppInfo(appInfo);
    
    logger.info('App info updated', {
      operation: 'config_update',
      metadata: { field: 'appInfo', app: appInfo.name },
    });
  }

  // Health and monitoring methods
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string; details?: any }> {
    try {
      const result = await this.httpClient.healthCheck();
      
      logger.info('Health check completed', {
        operation: 'health_check',
        metadata: { status: result.status },
      });
      
      return {
        ...result,
        details: {
          circuitBreakerState: this.httpClient.getCircuitBreakerState(),
        },
      };
    } catch (error) {
      logger.error('Health check failed', {
        operation: 'health_check',
      }, error as Error);
      
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        details: {
          error: (error as Error).message,
          circuitBreakerState: this.httpClient.getCircuitBreakerState(),
        },
      };
    }
  }

  getCircuitBreakerState(): string {
    return this.httpClient.getCircuitBreakerState();
  }

  resetCircuitBreaker(): void {
    this.httpClient.resetCircuitBreaker();
    
    logger.info('Circuit breaker reset', {
      operation: 'circuit_breaker_reset',
    });
  }

  // Legacy method for backward compatibility
  async request(method: string, path: string, data?: any, options: any = {}): Promise<any> {
    logger.warn('Using deprecated request method, consider using resource methods instead', {
      operation: 'deprecated_request',
      metadata: { method, path },
    });
    
    return this.httpClient.request(method, path, data, options);
  }

  // Get current configuration (without sensitive data)
  getConfig(): Omit<StatesetConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }

  // Destroy client and cleanup resources
  destroy(): void {
    logger.info('Stateset client destroyed', {
      operation: 'client_destroy',
    });
    
    // Any cleanup logic would go here
  }
}