import { EnhancedHttpClient, HttpClientOptions, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './core/http-client';
import { logger } from './utils/logger';
import { StatesetConfig } from './types';

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
}

interface StatesetClientConfigInternal extends StatesetConfig {
  maxSockets: number;
  keepAlive: boolean;
  requestInterceptors: RequestInterceptor[];
  responseInterceptors: ResponseInterceptor[];
  errorInterceptors: ErrorInterceptor[];
  proxy?: string;
  appInfo?: {
    name: string;
    version?: string;
    url?: string;
  };
}

export class StatesetClient {
  private httpClient: EnhancedHttpClient;
  private config: StatesetClientConfigInternal;

  // Core Commerce Resources
  public returns!: Returns;
  public returnItems!: ReturnLines;
  public warranties!: Warranties;
  public warrantyItems!: WarrantyLines;
  public products!: Products;
  public orders!: Orders;
  public orderItems!: OrderLines;
  public shipments!: Shipments;
  public shipmentItems!: ShipmentLines;
  public shipTo!: ShipTo;
  public inventory!: Inventory;
  public customers!: Customers;

  // Manufacturing & Supply Chain
  public workorders!: Workorders;
  public workorderItems!: WorkOrderLines;
  public billofmaterials!: BillOfMaterials;
  public purchaseorders!: PurchaseOrders;
  public purchaseorderItems!: PurchaseOrderLines;
  public manufacturerorders!: ManufacturerOrders;
  public manufacturerorderItems!: ManufactureOrderLines;
  public packinglists!: PackingList;
  public packinglistItems!: PackingListLines;
  public asns!: ASN;
  public asnItems!: ASNLine;

  // AI & Automation
  public channels!: Channels;
  public messages!: Messages;
  public agents!: Agents;
  public rules!: Rules;
  public attributes!: Attributes;
  public responses!: Responses;
  public knowledge!: Knowledge;
  public evals!: Evals;
  public workflows!: Workflows;
  public schedules!: Schedule;
  public users!: Users;

  // Financial & Settlement
  public settlements!: Settlements;
  public payouts!: Payouts;
  public payments!: Payments;
  public refunds!: Refunds;
  public creditsDebits!: CreditsDebits;
  public ledger!: Ledger;

  // Warehouse & Operations
  public picks!: Picks;
  public cycleCounts!: CycleCounts;
  public machines!: Machines;
  public wasteAndScrap!: WasteAndScrap;
  public warehouses!: Warehouses;
  public suppliers!: Suppliers;
  public locations!: Locations;
  public vendors!: Vendors;

  // Accounting & Compliance
  public invoices!: Invoices;
  public invoiceLines!: InvoiceLines;
  public compliance!: Compliance;
  public leads!: Leads;
  public assets!: Assets;
  public contracts!: Contracts;
  public promotions!: Promotions;

  // Maintenance & Quality
  public logs!: Logs;
  public maintenanceSchedules!: MaintenanceSchedules;
  public qualityControl!: QualityControl;
  public resourceUtilization!: ResourceUtilization;

  // Sales & CRM
  public opportunities!: Opportunities;
  public contacts!: Contacts;
  public casesTickets!: CasesTickets;

  // Logistics & Delivery
  public carriers!: Carriers;
  public routes!: Routes;
  public deliveryConfirmations!: DeliveryConfirmations;
  public activities!: Activities;
  public fulfillment!: Fulfillment;
  public productionJob!: ProductionJob;
  public salesOrders!: SalesOrders;
  public fulfillmentOrders!: FulfillmentOrders;
  public itemReceipts!: ItemReceipts;
  public cashSales!: CashSales;

  // Legacy compatibility
  public workOrders!: Workorders;

  constructor(config: StatesetClientConfig = {}) {
    // Validate required configuration
    this.validateConfig(config);

    // Build complete configuration with defaults
    this.config = this.buildConfig(config);

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
      throw new Error('Stateset API key is required. Provide it in config.apiKey or STATESET_API_KEY environment variable.');
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
    return {
      apiKey: config.apiKey || process.env.STATESET_API_KEY || '',
      baseUrl: config.baseUrl || process.env.STATESET_BASE_URL || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api',
      timeout: config.timeout ?? 60000,
      retry: config.retry ?? parseInt(process.env.STATESET_RETRY || '0', 10),
      retryDelayMs: config.retryDelayMs ?? parseInt(process.env.STATESET_RETRY_DELAY_MS || '1000', 10),
      userAgent: config.userAgent || this.buildUserAgent(),
      additionalHeaders: config.additionalHeaders || {},
      proxy: config.proxy || process.env.STATESET_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
      appInfo: config.appInfo,
      maxSockets: config.maxSockets ?? 10,
      keepAlive: config.keepAlive ?? true,
      requestInterceptors: config.requestInterceptors || [],
      responseInterceptors: config.responseInterceptors || [],
      errorInterceptors: config.errorInterceptors || [],
    };
  }

  private buildUserAgent(): string {
    const packageVersion = process.env.npm_package_version || '1.0.0';
    let ua = `stateset-node/${packageVersion}`;
    
    if (this.config?.appInfo) {
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

  private buildHttpClientOptions(): HttpClientOptions {
    const proxy = this.config.proxy ? this.parseProxyUrl(this.config.proxy) : undefined;

    return {
      baseURL: this.config.baseUrl!,
      apiKey: this.config.apiKey!,
      timeout: this.config.timeout,
      retry: {
        maxAttempts: (this.config.retry || 0) + 1, // retry count + initial attempt
        baseDelay: this.config.retryDelayMs,
      },
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
      return {
        protocol: parsed.protocol.replace(':', ''),
        host: parsed.hostname,
        port: Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80),
        auth: parsed.username || parsed.password ? {
          username: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password),
        } : undefined,
      };
    } catch (error) {
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
    // Note: Resources need to be updated to accept EnhancedHttpClient instead of stateset
    // For now, we'll pass `this` as the client parameter and update resources later
    const clientInstance = this as any;

    // Core Commerce Resources
    this.returns = new Returns(clientInstance);
    this.returnItems = new ReturnLines(clientInstance);
    this.warranties = new Warranties(clientInstance);
    this.warrantyItems = new WarrantyLines(clientInstance);
    this.products = new Products(clientInstance);
    this.orders = new Orders(clientInstance);
    this.orderItems = new OrderLines(clientInstance);
    this.shipments = new Shipments(clientInstance);
    this.shipmentItems = new ShipmentLines(clientInstance);
    this.shipTo = new ShipTo(clientInstance);
    this.inventory = new Inventory(clientInstance);
    this.customers = new Customers(clientInstance);

    // Manufacturing & Supply Chain
    this.workorders = new Workorders(clientInstance);
    this.workorderItems = new WorkOrderLines(clientInstance);
    this.billofmaterials = new BillOfMaterials(clientInstance);
    this.purchaseorders = new PurchaseOrders(clientInstance);
    this.purchaseorderItems = new PurchaseOrderLines(clientInstance);
    this.manufacturerorders = new ManufacturerOrders(clientInstance);
    this.manufacturerorderItems = new ManufactureOrderLines(clientInstance);
    this.packinglists = new PackingList(clientInstance);
    this.packinglistItems = new PackingListLines(clientInstance);
    this.asns = new ASN(clientInstance);
    this.asnItems = new ASNLine(clientInstance);

    // AI & Automation
    this.channels = new Channels(clientInstance);
    this.messages = new Messages(clientInstance);
    this.agents = new Agents(clientInstance);
    this.rules = new Rules(clientInstance);
    this.attributes = new Attributes(clientInstance);
    this.responses = new Responses(clientInstance);
    this.knowledge = new Knowledge(clientInstance);
    this.evals = new Evals(clientInstance);
    this.workflows = new Workflows(clientInstance);
    this.schedules = new Schedule(clientInstance);
    this.users = new Users(clientInstance);

    // Financial & Settlement
    this.settlements = new Settlements(clientInstance);
    this.payouts = new Payouts(clientInstance);
    this.payments = new Payments(clientInstance);
    this.refunds = new Refunds(clientInstance);
    this.creditsDebits = new CreditsDebits(clientInstance);
    this.ledger = new Ledger(clientInstance);

    // Warehouse & Operations
    this.picks = new Picks(clientInstance);
    this.cycleCounts = new CycleCounts(clientInstance);
    this.machines = new Machines(clientInstance);
    this.wasteAndScrap = new WasteAndScrap(clientInstance);
    this.warehouses = new Warehouses(clientInstance);
    this.suppliers = new Suppliers(clientInstance);
    this.locations = new Locations(clientInstance);
    this.vendors = new Vendors(clientInstance);

    // Accounting & Compliance
    this.invoices = new Invoices(clientInstance);
    this.invoiceLines = new InvoiceLines(clientInstance);
    this.compliance = new Compliance(clientInstance);
    this.leads = new Leads(clientInstance);
    this.assets = new Assets(clientInstance);
    this.contracts = new Contracts(clientInstance);
    this.promotions = new Promotions(clientInstance);

    // Maintenance & Quality
    this.logs = new Logs(clientInstance);
    this.maintenanceSchedules = new MaintenanceSchedules(clientInstance);
    this.qualityControl = new QualityControl(clientInstance);
    this.resourceUtilization = new ResourceUtilization(clientInstance);

    // Sales & CRM
    this.opportunities = new Opportunities(clientInstance);
    this.contacts = new Contacts(clientInstance);
    this.casesTickets = new CasesTickets(clientInstance);

    // Logistics & Delivery
    this.carriers = new Carriers(clientInstance);
    this.routes = new Routes(clientInstance);
    this.deliveryConfirmations = new DeliveryConfirmations(clientInstance);
    this.activities = new Activities(clientInstance);
    this.fulfillment = new Fulfillment(clientInstance);
    this.productionJob = new ProductionJob(clientInstance);
    this.salesOrders = new SalesOrders(clientInstance);
    this.fulfillmentOrders = new FulfillmentOrders(clientInstance);
    this.itemReceipts = new ItemReceipts(clientInstance);
    this.cashSales = new CashSales(clientInstance);

    // Legacy compatibility
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
    
    logger.info('Retry options updated successfully', {
      operation: 'client.update_retry_options',
      metadata: { retry, retryDelayMs: delay },
    });
  }

  setRetryOptions(retry: number, retryDelayMs?: number): void {
    this.updateRetryOptions(retry, retryDelayMs);
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
      logger.error('Health check failed', {
        operation: 'client.health_check',
      }, error as Error);
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
  getConfig(): Omit<StatesetClientConfigInternal, 'apiKey' | 'requestInterceptors' | 'responseInterceptors' | 'errorInterceptors'> {
    const { apiKey, requestInterceptors, responseInterceptors, errorInterceptors, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Legacy request method for backward compatibility
   */
  async request(method: string, path: string, data?: any, options: any = {}): Promise<any> {
    logger.debug('Legacy request method called', {
      operation: 'client.legacy_request',
      metadata: { method, path },
    });

    const config = {
      method: method.toLowerCase(),
      url: path,
      data,
      ...options,
    };

    const response = await this.httpClient.request(config);
    return response.data;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.httpClient.destroy();
    
    logger.info('StatesetClient destroyed', {
      operation: 'client.destroy',
    });
  }
}

export default StatesetClient;