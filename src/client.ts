import {
  EnhancedHttpClient,
  HttpClientOptions,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from './core/http-client';
import { logger } from './utils/logger';
import { performanceMonitor } from './utils/performance';
import { MemoryCache } from './utils/cache';
import { StatesetConfig, RequestOptions, CacheControlOptions } from './types';
import type { RetryOptions } from './utils/retry';

// Import all resource classes
import Returns from './lib/resources/Return';
import Warranties from './lib/resources/Warranty';
import Products from './lib/resources/Product';
import Orders from './lib/resources/Order';
import Shipments from './lib/resources/Shipment';
import Inventory from './lib/resources/Inventory';
import Customers from './lib/resources/Customer';
import Workorders from './lib/resources/WorkOrder';
import BillOfMaterials from './lib/resources/BillOfMaterial';
import PurchaseOrders from './lib/resources/PurchaseOrder';
import ManufacturerOrders from './lib/resources/ManufactureOrder';
import Channels from './lib/resources/Channel';
import Messages from './lib/resources/Message';
import Agents from './lib/resources/Agent';
import Rules from './lib/resources/Rule';
import Attributes from './lib/resources/Attribute';
import Responses from './lib/resources/Response';
import Knowledge from './lib/resources/Knowledge';
import Evals from './lib/resources/Eval';
import Workflows from './lib/resources/Workflow';
import Users from './lib/resources/User';
import ReturnLines from './lib/resources/ReturnLine';
import WarrantyLines from './lib/resources/WarrantyLine';
import OrderLines from './lib/resources/OrderLine';
import ShipmentLines from './lib/resources/ShipmentLine';
import WorkOrderLines from './lib/resources/WorkOrderLine';
import PurchaseOrderLines from './lib/resources/PurchaseOrderLine';
import ManufactureOrderLines from './lib/resources/ManufactureOrderLine';
import PackingList from './lib/resources/PackingList';
import PackingListLines from './lib/resources/PackingListLine';
import ASN from './lib/resources/AdvancedShippingNotice';
import ASNLine from './lib/resources/AdvancedShippingNoticeLine';
import Settlements from './lib/resources/Settlement';
import Payouts from './lib/resources/Payout';
import Picks from './lib/resources/Pick';
import CycleCounts from './lib/resources/CycleCount';
import Machines from './lib/resources/Machine';
import WasteAndScrap from './lib/resources/WasteAndScrap';
import Warehouses from './lib/resources/Warehouse';
import Suppliers from './lib/resources/Supplier';
import Locations from './lib/resources/Location';
import Vendors from './lib/resources/Vendor';
import Invoices from './lib/resources/Invoice';
import InvoiceLines from './lib/resources/InvoiceLine';
import Compliance from './lib/resources/Compliance';
import Leads from './lib/resources/Lead';
import Assets from './lib/resources/Asset';
import Contracts from './lib/resources/Contract';
import Promotions from './lib/resources/Promotion';
import Schedule from './lib/resources/Schedule';
import ShipTo from './lib/resources/ShipTo';
import Logs from './lib/resources/Log';
import MaintenanceSchedules from './lib/resources/MaintenanceSchedule';
import QualityControl from './lib/resources/QualityControl';
import ResourceUtilization from './lib/resources/ResourceUtilization';
import Payments from './lib/resources/Payment';
import Refunds from './lib/resources/Refund';
import CreditsDebits from './lib/resources/CreditsDebits';
import Ledger from './lib/resources/Ledger';
import Opportunities from './lib/resources/Opportunity';
import Contacts from './lib/resources/Contact';
import CasesTickets from './lib/resources/CaseTicket';
import Carriers from './lib/resources/Carrier';
import Routes from './lib/resources/Route';
import DeliveryConfirmations from './lib/resources/DeliveryConfirmation';
import Activities from './lib/resources/Activities';
import Fulfillment from './lib/resources/Fulfillment';
import ProductionJob from './lib/resources/ProductionJob';
import SalesOrders from './lib/resources/SalesOrder';
import FulfillmentOrders from './lib/resources/FulfillmentOrder';
import ItemReceipts from './lib/resources/ItemReceipt';
import CashSales from './lib/resources/CashSale';

export interface StatesetClientConfig extends StatesetConfig {
  /**
   * Maximum number of HTTP connections to maintain in the pool
   */
  maxSockets?: number;
  /**
   * Whether to keep HTTP connections alive
   */
  keepAlive?: boolean;
  /**
   * Custom request interceptors
   */
  requestInterceptors?: RequestInterceptor[];
  /**
   * Custom response interceptors
   */
  responseInterceptors?: ResponseInterceptor[];
  /**
   * Custom error interceptors
   */
  errorInterceptors?: ErrorInterceptor[];
  /**
   * Cache configuration
   */
  cache?: {
    enabled?: boolean;
    ttl?: number;
    maxSize?: number;
  };
  /**
   * Performance monitoring configuration
   */
  performance?: {
    enabled?: boolean;
    slowRequestThreshold?: number;
  };
}

interface StatesetClientConfigInternal extends StatesetConfig {
  maxSockets: number;
  keepAlive: boolean;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
  errorInterceptors: ErrorInterceptor[];
  retryOptions: RetryOptions;
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  performance: {
    enabled: boolean;
    slowRequestThreshold: number;
  };
  proxy?: string;
  appInfo?: {
    name: string;
    version?: string;
    url?: string;
  };
}

type CacheDirectiveOption = boolean | CacheControlOptions;

type RequestOptionsInternal = RequestOptions & Record<string, any>;

type ResourceConstructor<T = any> = new (client: any) => T;

const RESOURCE_REGISTRY = {
  // Core Commerce Resources
  returns: Returns,
  returnItems: ReturnLines,
  warranties: Warranties,
  warrantyItems: WarrantyLines,
  products: Products,
  orders: Orders,
  orderItems: OrderLines,
  shipments: Shipments,
  shipmentItems: ShipmentLines,
  shipTo: ShipTo,
  inventory: Inventory,
  customers: Customers,

  // Manufacturing & Supply Chain
  workorders: Workorders,
  workorderItems: WorkOrderLines,
  billofmaterials: BillOfMaterials,
  purchaseorders: PurchaseOrders,
  purchaseorderItems: PurchaseOrderLines,
  manufacturerorders: ManufacturerOrders,
  manufacturerorderItems: ManufactureOrderLines,
  packinglists: PackingList,
  packinglistItems: PackingListLines,
  asns: ASN,
  asnItems: ASNLine,

  // AI & Automation
  channels: Channels,
  messages: Messages,
  agents: Agents,
  rules: Rules,
  attributes: Attributes,
  responses: Responses,
  knowledge: Knowledge,
  evals: Evals,
  workflows: Workflows,
  schedules: Schedule,
  users: Users,

  // Financial & Settlement
  settlements: Settlements,
  payouts: Payouts,
  payments: Payments,
  refunds: Refunds,
  creditsDebits: CreditsDebits,
  ledger: Ledger,

  // Warehouse & Operations
  picks: Picks,
  cycleCounts: CycleCounts,
  machines: Machines,
  wasteAndScrap: WasteAndScrap,
  warehouses: Warehouses,
  suppliers: Suppliers,
  locations: Locations,
  vendors: Vendors,

  // Accounting & Compliance
  invoices: Invoices,
  invoiceLines: InvoiceLines,
  compliance: Compliance,
  leads: Leads,
  assets: Assets,
  contracts: Contracts,
  promotions: Promotions,

  // Maintenance & Quality
  logs: Logs,
  maintenanceSchedules: MaintenanceSchedules,
  qualityControl: QualityControl,
  resourceUtilization: ResourceUtilization,

  // Sales & CRM
  opportunities: Opportunities,
  contacts: Contacts,
  casesTickets: CasesTickets,

  // Logistics & Delivery
  carriers: Carriers,
  routes: Routes,
  deliveryConfirmations: DeliveryConfirmations,
  activities: Activities,
  fulfillment: Fulfillment,
  productionJob: ProductionJob,
  salesOrders: SalesOrders,
  fulfillmentOrders: FulfillmentOrders,
  itemReceipts: ItemReceipts,
  cashSales: CashSales,
} satisfies Record<string, ResourceConstructor>;

export class StatesetClient {
  private httpClient: EnhancedHttpClient;
  private config: StatesetClientConfigInternal;
  private cache: MemoryCache;
  private cacheKeyIndex = new Map<string, Set<string>>();

  constructor(config: StatesetClientConfig = {}) {
    // Validate required configuration
    this.validateConfig(config);

    // Build complete configuration with defaults
    this.config = this.buildConfig(config);

    // Initialize cache if enabled
    this.cache = new MemoryCache({
      ttl: this.config.cache.ttl,
      maxSize: this.config.cache.maxSize,
    });

    // Initialize HTTP client
    this.httpClient = new EnhancedHttpClient(this.buildHttpClientOptions());

    // Setup custom interceptors
    this.setupCustomInterceptors();

    // Initialize all resources
    this.initializeResources();

    logger.info('StatesetClient initialized successfully', {
      operation: 'client.init',
      metadata: {
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        retryEnabled: this.config.retry && this.config.retry > 0,
        maxSockets: this.config.maxSockets,
      },
    });
  }

  private validateConfig(config: StatesetClientConfig): void {
    if (!config.apiKey && !process.env.STATESET_API_KEY) {
      throw new Error(
        'Stateset API key is required. Provide it in config.apiKey or STATESET_API_KEY environment variable.'
      );
    }

    if (config.baseUrl && !this.isValidUrl(config.baseUrl)) {
      throw new Error('Invalid base URL provided');
    }

    if (config.timeout && (config.timeout < 1000 || config.timeout > 600000)) {
      throw new Error('Timeout must be between 1000ms and 600000ms (10 minutes)');
    }

    if (config.retry && (config.retry < 0 || config.retry > 10)) {
      throw new Error('Retry count must be between 0 and 10');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private buildConfig(config: StatesetClientConfig): StatesetClientConfigInternal {
    const envRetry = parseInt(process.env.STATESET_RETRY || '0', 10);
    const envRetryDelay = parseInt(process.env.STATESET_RETRY_DELAY_MS || '1000', 10);

    const baseRetryCount = config.retry ?? envRetry;
    const baseRetryDelay = config.retryDelayMs ?? envRetryDelay;

    const combinedRetryOptions: Partial<RetryOptions> = {
      ...config.retryOptions,
    };

    if (config.onRetryAttempt) {
      combinedRetryOptions.onRetryAttempt = config.onRetryAttempt;
    }

    const normalizedRetryOptions = this.normalizeRetryOptions(
      combinedRetryOptions,
      Math.max(1, baseRetryCount + 1),
      baseRetryDelay
    );

    return {
      apiKey: config.apiKey || process.env.STATESET_API_KEY || '',
      baseUrl:
        config.baseUrl ||
        process.env.STATESET_BASE_URL ||
        'https://stateset-proxy-server.stateset.cloud.stateset.app/api',
      timeout: config.timeout ?? 60000,
      retry: Math.max(0, (normalizedRetryOptions.maxAttempts ?? 1) - 1),
      retryDelayMs: normalizedRetryOptions.baseDelay ?? baseRetryDelay,
      retryOptions: normalizedRetryOptions,
      userAgent: config.userAgent || this.buildUserAgent(config.appInfo),
      additionalHeaders: config.additionalHeaders || {},
      proxy:
        config.proxy ||
        process.env.STATESET_PROXY ||
        process.env.HTTPS_PROXY ||
        process.env.HTTP_PROXY,
      appInfo: config.appInfo,
      maxSockets: config.maxSockets ?? 10,
      keepAlive: config.keepAlive ?? true,
      requestInterceptors: config.requestInterceptors || [],
      responseInterceptors: config.responseInterceptors || [],
      errorInterceptors: config.errorInterceptors || [],
      cache: {
        enabled: config.cache?.enabled ?? true,
        ttl: config.cache?.ttl ?? 300000, // 5 minutes
        maxSize: config.cache?.maxSize ?? 1000,
      },
      performance: {
        enabled: config.performance?.enabled ?? true,
        slowRequestThreshold: config.performance?.slowRequestThreshold ?? 5000, // 5 seconds
      },
    };
  }

  private buildUserAgent(appInfo?: StatesetClientConfig['appInfo']): string {
    const packageVersion = process.env.npm_package_version || '1.0.0';
    const info = appInfo ?? this.config?.appInfo;
    let ua = `stateset-node/${packageVersion}`;

    if (info) {
      ua += ` ${info.name}`;
      if (info.version) {
        ua += `/${info.version}`;
      }
      if (info.url) {
        ua += ` (${info.url})`;
      }
    }

    return ua;
  }

  private normalizeRetryOptions(
    options: Partial<RetryOptions> | undefined,
    fallbackAttempts: number,
    fallbackDelay: number
  ): RetryOptions {
    const normalized: Partial<RetryOptions> = { ...(options ?? {}) };
    const attempts = Math.max(1, normalized.maxAttempts ?? fallbackAttempts);
    const baseDelay = normalized.baseDelay ?? fallbackDelay;

    normalized.maxAttempts = attempts;
    normalized.baseDelay = baseDelay;

    if (normalized.maxDelay !== undefined && normalized.maxDelay < baseDelay) {
      normalized.maxDelay = baseDelay;
    }

    return normalized as RetryOptions;
  }

  private buildHttpClientOptions(): HttpClientOptions {
    const proxy = this.config.proxy ? this.parseProxyUrl(this.config.proxy) : undefined;

    return {
      baseURL: this.config.baseUrl!,
      apiKey: this.config.apiKey!,
      timeout: this.config.timeout,
      retry: { ...this.config.retryOptions },
      userAgent: this.config.userAgent,
      additionalHeaders: this.config.additionalHeaders,
      maxSockets: this.config.maxSockets,
      keepAlive: this.config.keepAlive,
      proxy,
    };
  }

  private parseProxyUrl(proxyUrl: string) {
    try {
      const parsed = new URL(proxyUrl);
      const protocol = parsed.protocol.replace(':', '');

      if (!['http', 'https'].includes(protocol)) {
        logger.warn('Unsupported proxy protocol provided', {
          operation: 'client.init',
          metadata: { protocol },
        });
        return undefined;
      }

      if (!parsed.hostname) {
        logger.warn('Proxy URL missing hostname', {
          operation: 'client.init',
        });
        return undefined;
      }

      return {
        protocol,
        host: parsed.hostname,
        port: Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80),
        auth:
          parsed.username || parsed.password
            ? {
                username: decodeURIComponent(parsed.username),
                password: decodeURIComponent(parsed.password),
              }
            : undefined,
      };
    } catch {
      logger.warn('Invalid proxy URL provided', {
        operation: 'client.init',
        metadata: { proxyUrl: '[REDACTED]' },
      });
      return undefined;
    }
  }

  private setupCustomInterceptors(): void {
    // Add custom request interceptors
    this.config.requestInterceptors.forEach(interceptor => {
      this.httpClient.addRequestInterceptor(interceptor);
    });

    // Add custom response interceptors
    this.config.responseInterceptors.forEach(interceptor => {
      this.httpClient.addResponseInterceptor(interceptor);
    });

    // Add custom error interceptors
    this.config.errorInterceptors.forEach(interceptor => {
      this.httpClient.addErrorInterceptor(interceptor);
    });
  }

  private initializeResources(): void {
    const clientInstance = this as any;

    Object.entries(RESOURCE_REGISTRY).forEach(([property, ResourceConstructor]) => {
      (this as any)[property] = new (ResourceConstructor as ResourceConstructor)(clientInstance);
    });

    // Legacy compatibility alias
    this.workOrders = this.workorders;
  }

  /**
   * Update the API key used for requests
   */
  updateApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }

    this.config.apiKey = apiKey;
    this.httpClient.updateApiKey(apiKey);

    logger.info('API key updated successfully', {
      operation: 'client.update_api_key',
    });
  }

  setApiKey(apiKey: string): void {
    this.updateApiKey(apiKey);
  }

  /**
   * Update the base URL used for requests
   */
  updateBaseURL(baseURL: string): void {
    if (!this.isValidUrl(baseURL)) {
      throw new Error('Invalid base URL provided');
    }

    this.config.baseUrl = baseURL;
    this.httpClient.updateBaseURL(baseURL);

    logger.info('Base URL updated successfully', {
      operation: 'client.update_base_url',
      metadata: { baseURL },
    });
  }

  setBaseUrl(baseURL: string): void {
    this.updateBaseURL(baseURL);
  }

  /**
   * Update the request timeout
   */
  updateTimeout(timeout: number): void {
    if (timeout < 1000 || timeout > 600000) {
      throw new Error('Timeout must be between 1000ms and 600000ms (10 minutes)');
    }

    this.config.timeout = timeout;
    this.httpClient.updateTimeout(timeout);

    logger.info('Timeout updated successfully', {
      operation: 'client.update_timeout',
      metadata: { timeout },
    });
  }

  setTimeout(timeout: number): void {
    this.updateTimeout(timeout);
  }

  /**
   * Update retry configuration
   */
  updateRetryOptions(retry: number, retryDelayMs?: number): void {
    const delay = retryDelayMs ?? this.config.retryDelayMs ?? 1000;

    if (retry < 0 || retry > 10) {
      throw new Error('Retry count must be between 0 and 10');
    }

    if (delay < 100 || delay > 30000) {
      throw new Error('Retry delay must be between 100ms and 30000ms');
    }

    this.config.retry = retry;
    this.config.retryDelayMs = delay;
    this.config.retryOptions = this.normalizeRetryOptions(
      { ...this.config.retryOptions, maxAttempts: retry + 1, baseDelay: delay },
      Math.max(1, retry + 1),
      delay
    );
    this.httpClient.updateRetryOptions(this.config.retryOptions);

    logger.info('Retry options updated successfully', {
      operation: 'client.update_retry_options',
      metadata: { retry, retryDelayMs: delay, maxAttempts: this.config.retryOptions.maxAttempts },
    });
  }

  setRetryOptions(retry: number, retryDelayMs?: number): void {
    this.updateRetryOptions(retry, retryDelayMs);
  }

  setRetryStrategy(options: Partial<RetryOptions>): void {
    const fallbackAttempts = Math.max(1, (this.config.retry ?? 0) + 1);
    const fallbackDelay = this.config.retryDelayMs ?? 1000;

    this.config.retryOptions = this.normalizeRetryOptions(
      { ...this.config.retryOptions, ...options },
      fallbackAttempts,
      fallbackDelay
    );
    this.config.retry = Math.max(0, this.config.retryOptions.maxAttempts - 1);
    this.config.retryDelayMs = this.config.retryOptions.baseDelay ?? fallbackDelay;
    this.httpClient.updateRetryOptions(this.config.retryOptions);

    logger.info('Retry strategy updated successfully', {
      operation: 'client.update_retry_strategy',
      metadata: {
        maxAttempts: this.config.retryOptions.maxAttempts,
        baseDelay: this.config.retryOptions.baseDelay,
        jitter: this.config.retryOptions.jitter,
      },
    });
  }

  /**
   * Update headers
   */
  updateHeaders(headers: Record<string, string>): void {
    this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
    this.httpClient.updateHeaders(headers);

    logger.info('Headers updated successfully', {
      operation: 'client.update_headers',
      metadata: { headerCount: Object.keys(headers).length },
    });
  }

  setHeaders(headers: Record<string, string>): void {
    this.updateHeaders(headers);
  }

  /**
   * Update proxy configuration
   */
  updateProxy(proxyUrl: string): void {
    const parsed = this.parseProxyUrl(proxyUrl);

    if (!parsed) {
      throw new Error('Invalid proxy URL provided');
    }

    this.config.proxy = proxyUrl;
    this.httpClient.updateProxy(parsed);

    logger.info('Proxy configuration updated', {
      operation: 'client.update_proxy',
      metadata: { host: parsed.host, port: parsed.port, protocol: parsed.protocol },
    });
  }

  setProxy(proxyUrl: string): void {
    this.updateProxy(proxyUrl);
  }

  clearProxy(): void {
    this.config.proxy = undefined;
    this.httpClient.updateProxy(null);

    logger.info('Proxy configuration cleared', {
      operation: 'client.clear_proxy',
    });
  }

  /**
   * Update app info for user agent
   */
  updateAppInfo(info: { name: string; version?: string; url?: string }): void {
    this.config.appInfo = info;
    const userAgent = this.buildUserAgent();
    this.config.userAgent = userAgent;
    this.httpClient.updateHeaders({ 'User-Agent': userAgent });

    logger.info('App info updated successfully', {
      operation: 'client.update_app_info',
      metadata: { appName: info.name, appVersion: info.version },
    });
  }

  setAppInfo(info: { name: string; version?: string; url?: string }): void {
    this.updateAppInfo(info);
  }

  /**
   * Add custom request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.httpClient.addRequestInterceptor(interceptor);
  }

  /**
   * Add custom response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.httpClient.addResponseInterceptor(interceptor);
  }

  /**
   * Add custom error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.httpClient.addErrorInterceptor(interceptor);
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; details: any }> {
    logger.debug('Performing health check', {
      operation: 'client.health_check',
    });

    try {
      const result = await this.httpClient.healthCheck();

      logger.info('Health check completed', {
        operation: 'client.health_check',
        metadata: { status: result.status },
      });

      return result;
    } catch (error) {
      logger.error(
        'Health check failed',
        {
          operation: 'client.health_check',
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): string {
    return this.httpClient.getCircuitBreakerState();
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.httpClient.resetCircuitBreaker();

    logger.info('Circuit breaker reset', {
      operation: 'client.reset_circuit_breaker',
    });
  }

  /**
   * Get current configuration (sanitized)
   */
  getConfig(): Omit<
    StatesetClientConfigInternal,
    'apiKey' | 'requestInterceptors' | 'responseInterceptors' | 'errorInterceptors'
  > {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { apiKey, requestInterceptors, responseInterceptors, errorInterceptors, ...safeConfig } =
      this.config;
    return safeConfig;
  }

  private resolveCacheDirective(
    method: string,
    path: string,
    params: Record<string, unknown> | undefined,
    cacheOption: CacheDirectiveOption | undefined,
    explicitCacheKey?: string,
    ttlOverride?: number
  ): { key: string; ttl?: number } | null {
    if (method !== 'GET') {
      return null;
    }

    if (!this.config.cache.enabled) {
      return null;
    }

    if (cacheOption === false) {
      return null;
    }

    const derivedKey =
      explicitCacheKey ||
      (typeof cacheOption === 'object' ? cacheOption.key : undefined) ||
      this.generateCacheKey(path, params || {});

    if (!derivedKey) {
      return null;
    }

    const ttl = ttlOverride ?? (typeof cacheOption === 'object' ? cacheOption.ttl : undefined);

    return { key: derivedKey, ttl };
  }

  private collectInvalidationTargets(
    method: string,
    normalizedPath: string,
    cacheOption: CacheDirectiveOption | undefined,
    overridePaths?: string | string[]
  ): Set<string> {
    const targets = new Set<string>();

    if (method !== 'GET' && normalizedPath) {
      targets.add(normalizedPath);
    }

    const addPaths = (paths?: string | string[]): void => {
      if (!paths) {
        return;
      }

      const list = Array.isArray(paths) ? paths : [paths];
      for (const raw of list) {
        const normalized = this.normalizePath(raw);
        if (normalized) {
          targets.add(normalized);
        }
      }
    };

    addPaths(overridePaths);

    if (typeof cacheOption === 'object') {
      addPaths(cacheOption.invalidate);
    }

    return targets;
  }

  private generateCacheKey(path: string, params: Record<string, unknown>): string {
    const serializedParams = params && Object.keys(params).length > 0 ? JSON.stringify(params) : '';
    return `${path}:${serializedParams}`;
  }

  private normalizePath(path: string): string {
    if (!path) {
      return '';
    }

    const withoutQuery = path.split('?')[0];
    return withoutQuery.replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private indexCacheKey(normalizedPath: string, cacheKey: string): void {
    if (!normalizedPath) {
      return;
    }

    const existing = this.cacheKeyIndex.get(normalizedPath) ?? new Set<string>();
    existing.add(cacheKey);
    this.cacheKeyIndex.set(normalizedPath, existing);
  }

  private invalidateCacheForPath(normalizedPath: string): void {
    if (!normalizedPath || this.cacheKeyIndex.size === 0) {
      return;
    }

    let removedEntries = 0;

    for (const [storedPath, keys] of this.cacheKeyIndex.entries()) {
      if (!this.pathsOverlap(normalizedPath, storedPath)) {
        continue;
      }

      for (const key of keys) {
        if (this.cache.delete(key)) {
          removedEntries++;
        }
      }

      this.cacheKeyIndex.delete(storedPath);
    }

    if (removedEntries > 0) {
      logger.debug('Cache invalidated for path', {
        operation: 'client.cache_invalidate',
        metadata: { path: normalizedPath, removedEntries },
      });
    }
  }

  private pathsOverlap(pathA: string, pathB: string): boolean {
    if (pathA === pathB) {
      return true;
    }

    if (!pathA || !pathB) {
      return false;
    }

    return pathA.startsWith(`${pathB}/`) || pathB.startsWith(`${pathA}/`);
  }

  /**
   * Enhanced request method with caching and performance monitoring
   */
  async request(
    method: string,
    path: string,
    data?: any,
    options: RequestOptionsInternal = {}
  ): Promise<any> {
    const methodUpper = method.toUpperCase();
    const timer = this.config.performance.enabled
      ? performanceMonitor.startTimer(`client.request.${methodUpper}.${path}`)
      : null;

    const {
      cache: cacheOption,
      cacheKey: explicitCacheKey,
      cacheTTL,
      invalidateCachePaths,
      signal,
      idempotencyKey,
      retryOptions: perRequestRetry,
      onRetryAttempt,
      ...axiosOptions
    } = options || {};

    try {
      const normalizedPath = this.normalizePath(path);
      const cacheDirective = this.resolveCacheDirective(
        methodUpper,
        path,
        axiosOptions.params as Record<string, unknown> | undefined,
        cacheOption,
        explicitCacheKey,
        cacheTTL
      );

      // Check cache for GET requests
      if (this.config.cache.enabled && cacheDirective) {
        const cached = this.cache.get(cacheDirective.key);
        if (cached) {
          timer?.end(true);
          logger.debug('Request served from cache', {
            operation: 'client.request',
            metadata: { method, path, cached: true },
          });
          return cached;
        }
      }

      logger.debug('Making HTTP request', {
        operation: 'client.request',
        metadata: { method, path },
      });

      const { headers: providedHeaders, ...restAxiosOptions } = axiosOptions as {
        headers?: Record<string, string>;
      };

      const headers = providedHeaders ? { ...providedHeaders } : {};
      if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
      }

      const config: Record<string, any> = {
        method: methodUpper.toLowerCase(),
        url: path,
        data,
        ...restAxiosOptions,
        headers,
      };

      if (signal) {
        config.signal = signal;
      }

      if (perRequestRetry || onRetryAttempt) {
        config.statesetRetryOptions = {
          ...(perRequestRetry as Partial<RetryOptions> | undefined),
          ...(onRetryAttempt ? { onRetryAttempt } : {}),
        } as Partial<RetryOptions>;
      }

      const response = await this.httpClient.request(config);
      const result = response.data;

      if (this.config.cache.enabled) {
        const invalidationTargets = this.collectInvalidationTargets(
          methodUpper,
          normalizedPath,
          cacheOption,
          invalidateCachePaths
        );

        if (methodUpper === 'GET' && cacheDirective) {
          invalidationTargets.delete(normalizedPath);
        }

        invalidationTargets.forEach(target => this.invalidateCacheForPath(target));
      }

      // Cache successful GET responses
      if (this.config.cache.enabled && cacheDirective) {
        this.cache.set(cacheDirective.key, result, cacheDirective.ttl);
        this.indexCacheKey(normalizedPath, cacheDirective.key);
      }

      timer?.end(true);

      return result;
    } catch (error) {
      timer?.end(false, (error as Error).message);
      logger.error(
        'Request failed',
        {
          operation: 'client.request',
          metadata: { method, path },
        },
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return this.cache.getStats();
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheKeyIndex.clear();
    logger.info('Cache cleared manually', {
      operation: 'client.clear_cache',
    });
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): any {
    return performanceMonitor.getStats();
  }

  /**
   * Enable or disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.config.cache.enabled = enabled;
    if (!enabled) {
      this.cache.clear();
      this.cacheKeyIndex.clear();
    }
    logger.info(`Cache ${enabled ? 'enabled' : 'disabled'}`, {
      operation: 'client.set_cache_enabled',
      metadata: { enabled },
    });
  }

  /**
   * Enable or disable performance monitoring
   */
  setPerformanceMonitoringEnabled(enabled: boolean): void {
    this.config.performance.enabled = enabled;
    logger.info(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`, {
      operation: 'client.set_performance_monitoring',
      metadata: { enabled },
    });
  }

  /**
   * Bulk operations helper
   */
  async bulk<T>(operations: (() => Promise<T>)[], concurrency: number = 5): Promise<T[]> {
    const results: T[] = [];
    const batches: (() => Promise<T>)[][] = [];

    // Split operations into batches
    for (let i = 0; i < operations.length; i += concurrency) {
      batches.push(operations.slice(i, i + concurrency));
    }

    // Execute batches sequentially
    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.httpClient.destroy();
    this.cache.destroy();
    this.cacheKeyIndex.clear();

    logger.info('StatesetClient destroyed', {
      operation: 'client.destroy',
    });
  }
}

export default StatesetClient;

type ResourceInstances = {
  [K in keyof typeof RESOURCE_REGISTRY]: InstanceType<(typeof RESOURCE_REGISTRY)[K]>;
};

// eslint-disable-next-line no-redeclare
export interface StatesetClient extends ResourceInstances {
  workOrders: InstanceType<typeof Workorders>;
}
