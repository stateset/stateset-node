"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesetClient = void 0;
const http_client_1 = require("./core/http-client");
const logger_1 = require("./utils/logger");
const performance_1 = require("./utils/performance");
const cache_1 = require("./utils/cache");
// Import all resource classes
const Return_1 = __importDefault(require("./lib/resources/Return"));
const Warranty_1 = __importDefault(require("./lib/resources/Warranty"));
const Product_1 = __importDefault(require("./lib/resources/Product"));
const Order_1 = __importDefault(require("./lib/resources/Order"));
const Shipment_1 = __importDefault(require("./lib/resources/Shipment"));
const Inventory_1 = __importDefault(require("./lib/resources/Inventory"));
const Customer_1 = __importDefault(require("./lib/resources/Customer"));
const WorkOrder_1 = __importDefault(require("./lib/resources/WorkOrder"));
const BillOfMaterial_1 = __importDefault(require("./lib/resources/BillOfMaterial"));
const PurchaseOrder_1 = __importDefault(require("./lib/resources/PurchaseOrder"));
const ManufactureOrder_1 = __importDefault(require("./lib/resources/ManufactureOrder"));
const Channel_1 = __importDefault(require("./lib/resources/Channel"));
const Message_1 = __importDefault(require("./lib/resources/Message"));
const Agent_1 = __importDefault(require("./lib/resources/Agent"));
const Rule_1 = __importDefault(require("./lib/resources/Rule"));
const Attribute_1 = __importDefault(require("./lib/resources/Attribute"));
const Response_1 = __importDefault(require("./lib/resources/Response"));
const Knowledge_1 = __importDefault(require("./lib/resources/Knowledge"));
const Eval_1 = __importDefault(require("./lib/resources/Eval"));
const Workflow_1 = __importDefault(require("./lib/resources/Workflow"));
const User_1 = __importDefault(require("./lib/resources/User"));
const ReturnLine_1 = __importDefault(require("./lib/resources/ReturnLine"));
const WarrantyLine_1 = __importDefault(require("./lib/resources/WarrantyLine"));
const OrderLine_1 = __importDefault(require("./lib/resources/OrderLine"));
const ShipmentLine_1 = __importDefault(require("./lib/resources/ShipmentLine"));
const WorkOrderLine_1 = __importDefault(require("./lib/resources/WorkOrderLine"));
const PurchaseOrderLine_1 = __importDefault(require("./lib/resources/PurchaseOrderLine"));
const ManufactureOrderLine_1 = __importDefault(require("./lib/resources/ManufactureOrderLine"));
const PackingList_1 = __importDefault(require("./lib/resources/PackingList"));
const PackingListLine_1 = __importDefault(require("./lib/resources/PackingListLine"));
const AdvancedShippingNotice_1 = __importDefault(require("./lib/resources/AdvancedShippingNotice"));
const AdvancedShippingNoticeLine_1 = __importDefault(require("./lib/resources/AdvancedShippingNoticeLine"));
const Settlement_1 = __importDefault(require("./lib/resources/Settlement"));
const Payout_1 = __importDefault(require("./lib/resources/Payout"));
const Pick_1 = __importDefault(require("./lib/resources/Pick"));
const CycleCount_1 = __importDefault(require("./lib/resources/CycleCount"));
const Machine_1 = __importDefault(require("./lib/resources/Machine"));
const WasteAndScrap_1 = __importDefault(require("./lib/resources/WasteAndScrap"));
const Warehouse_1 = __importDefault(require("./lib/resources/Warehouse"));
const Supplier_1 = __importDefault(require("./lib/resources/Supplier"));
const Location_1 = __importDefault(require("./lib/resources/Location"));
const Vendor_1 = __importDefault(require("./lib/resources/Vendor"));
const Invoice_1 = __importDefault(require("./lib/resources/Invoice"));
const InvoiceLine_1 = __importDefault(require("./lib/resources/InvoiceLine"));
const Compliance_1 = __importDefault(require("./lib/resources/Compliance"));
const Lead_1 = __importDefault(require("./lib/resources/Lead"));
const Asset_1 = __importDefault(require("./lib/resources/Asset"));
const Contract_1 = __importDefault(require("./lib/resources/Contract"));
const Promotion_1 = __importDefault(require("./lib/resources/Promotion"));
const Schedule_1 = __importDefault(require("./lib/resources/Schedule"));
const ShipTo_1 = __importDefault(require("./lib/resources/ShipTo"));
const Log_1 = __importDefault(require("./lib/resources/Log"));
const MaintenanceSchedule_1 = __importDefault(require("./lib/resources/MaintenanceSchedule"));
const QualityControl_1 = __importDefault(require("./lib/resources/QualityControl"));
const ResourceUtilization_1 = __importDefault(require("./lib/resources/ResourceUtilization"));
const Payment_1 = __importDefault(require("./lib/resources/Payment"));
const Refund_1 = __importDefault(require("./lib/resources/Refund"));
const CreditsDebits_1 = __importDefault(require("./lib/resources/CreditsDebits"));
const Ledger_1 = __importDefault(require("./lib/resources/Ledger"));
const Opportunity_1 = __importDefault(require("./lib/resources/Opportunity"));
const Contact_1 = __importDefault(require("./lib/resources/Contact"));
const CaseTicket_1 = __importDefault(require("./lib/resources/CaseTicket"));
const Carrier_1 = __importDefault(require("./lib/resources/Carrier"));
const Route_1 = __importDefault(require("./lib/resources/Route"));
const DeliveryConfirmation_1 = __importDefault(require("./lib/resources/DeliveryConfirmation"));
const Activities_1 = __importDefault(require("./lib/resources/Activities"));
const Fulfillment_1 = __importDefault(require("./lib/resources/Fulfillment"));
const ProductionJob_1 = __importDefault(require("./lib/resources/ProductionJob"));
const SalesOrder_1 = __importDefault(require("./lib/resources/SalesOrder"));
const FulfillmentOrder_1 = __importDefault(require("./lib/resources/FulfillmentOrder"));
const ItemReceipt_1 = __importDefault(require("./lib/resources/ItemReceipt"));
const CashSale_1 = __importDefault(require("./lib/resources/CashSale"));
class StatesetClient {
    httpClient;
    config;
    cache;
    cacheKeyIndex = new Map();
    // Core Commerce Resources
    returns;
    returnItems;
    warranties;
    warrantyItems;
    products;
    orders;
    orderItems;
    shipments;
    shipmentItems;
    shipTo;
    inventory;
    customers;
    // Manufacturing & Supply Chain
    workorders;
    workorderItems;
    billofmaterials;
    purchaseorders;
    purchaseorderItems;
    manufacturerorders;
    manufacturerorderItems;
    packinglists;
    packinglistItems;
    asns;
    asnItems;
    // AI & Automation
    channels;
    messages;
    agents;
    rules;
    attributes;
    responses;
    knowledge;
    evals;
    workflows;
    schedules;
    users;
    // Financial & Settlement
    settlements;
    payouts;
    payments;
    refunds;
    creditsDebits;
    ledger;
    // Warehouse & Operations
    picks;
    cycleCounts;
    machines;
    wasteAndScrap;
    warehouses;
    suppliers;
    locations;
    vendors;
    // Accounting & Compliance
    invoices;
    invoiceLines;
    compliance;
    leads;
    assets;
    contracts;
    promotions;
    // Maintenance & Quality
    logs;
    maintenanceSchedules;
    qualityControl;
    resourceUtilization;
    // Sales & CRM
    opportunities;
    contacts;
    casesTickets;
    // Logistics & Delivery
    carriers;
    routes;
    deliveryConfirmations;
    activities;
    fulfillment;
    productionJob;
    salesOrders;
    fulfillmentOrders;
    itemReceipts;
    cashSales;
    // Legacy compatibility
    workOrders;
    constructor(config = {}) {
        // Validate required configuration
        this.validateConfig(config);
        // Build complete configuration with defaults
        this.config = this.buildConfig(config);
        // Initialize cache if enabled
        this.cache = new cache_1.MemoryCache({
            ttl: this.config.cache.ttl,
            maxSize: this.config.cache.maxSize,
        });
        // Initialize HTTP client
        this.httpClient = new http_client_1.EnhancedHttpClient(this.buildHttpClientOptions());
        // Setup custom interceptors
        this.setupCustomInterceptors();
        // Initialize all resources
        this.initializeResources();
        logger_1.logger.info('StatesetClient initialized successfully', {
            operation: 'client.init',
            metadata: {
                baseUrl: this.config.baseUrl,
                timeout: this.config.timeout,
                retryEnabled: this.config.retry && this.config.retry > 0,
                maxSockets: this.config.maxSockets,
            },
        });
    }
    validateConfig(config) {
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
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    buildConfig(config) {
        const envRetry = parseInt(process.env.STATESET_RETRY || '0', 10);
        const envRetryDelay = parseInt(process.env.STATESET_RETRY_DELAY_MS || '1000', 10);
        const baseRetryCount = config.retry ?? envRetry;
        const baseRetryDelay = config.retryDelayMs ?? envRetryDelay;
        const combinedRetryOptions = {
            ...config.retryOptions,
        };
        if (config.onRetryAttempt) {
            combinedRetryOptions.onRetryAttempt = config.onRetryAttempt;
        }
        const normalizedRetryOptions = this.normalizeRetryOptions(combinedRetryOptions, Math.max(1, baseRetryCount + 1), baseRetryDelay);
        return {
            apiKey: config.apiKey || process.env.STATESET_API_KEY || '',
            baseUrl: config.baseUrl || process.env.STATESET_BASE_URL || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api',
            timeout: config.timeout ?? 60000,
            retry: Math.max(0, (normalizedRetryOptions.maxAttempts ?? 1) - 1),
            retryDelayMs: normalizedRetryOptions.baseDelay ?? baseRetryDelay,
            retryOptions: normalizedRetryOptions,
            userAgent: config.userAgent || this.buildUserAgent(config.appInfo),
            additionalHeaders: config.additionalHeaders || {},
            proxy: config.proxy || process.env.STATESET_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
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
    buildUserAgent(appInfo) {
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
    normalizeRetryOptions(options, fallbackAttempts, fallbackDelay) {
        const normalized = { ...(options ?? {}) };
        const attempts = Math.max(1, normalized.maxAttempts ?? fallbackAttempts);
        const baseDelay = normalized.baseDelay ?? fallbackDelay;
        normalized.maxAttempts = attempts;
        normalized.baseDelay = baseDelay;
        if (normalized.maxDelay !== undefined && normalized.maxDelay < baseDelay) {
            normalized.maxDelay = baseDelay;
        }
        return normalized;
    }
    buildHttpClientOptions() {
        const proxy = this.config.proxy ? this.parseProxyUrl(this.config.proxy) : undefined;
        return {
            baseURL: this.config.baseUrl,
            apiKey: this.config.apiKey,
            timeout: this.config.timeout,
            retry: { ...this.config.retryOptions },
            userAgent: this.config.userAgent,
            additionalHeaders: this.config.additionalHeaders,
            maxSockets: this.config.maxSockets,
            keepAlive: this.config.keepAlive,
            proxy,
        };
    }
    parseProxyUrl(proxyUrl) {
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
        }
        catch {
            logger_1.logger.warn('Invalid proxy URL provided', {
                operation: 'client.init',
                metadata: { proxyUrl: '[REDACTED]' },
            });
            return undefined;
        }
    }
    setupCustomInterceptors() {
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
    initializeResources() {
        // Note: Resources need to be updated to accept EnhancedHttpClient instead of stateset
        // For now, we'll pass `this` as the client parameter and update resources later
        const clientInstance = this;
        // Core Commerce Resources
        this.returns = new Return_1.default(clientInstance);
        this.returnItems = new ReturnLine_1.default(clientInstance);
        this.warranties = new Warranty_1.default(clientInstance);
        this.warrantyItems = new WarrantyLine_1.default(clientInstance);
        this.products = new Product_1.default(clientInstance);
        this.orders = new Order_1.default(clientInstance);
        this.orderItems = new OrderLine_1.default(clientInstance);
        this.shipments = new Shipment_1.default(clientInstance);
        this.shipmentItems = new ShipmentLine_1.default(clientInstance);
        this.shipTo = new ShipTo_1.default(clientInstance);
        this.inventory = new Inventory_1.default(clientInstance);
        this.customers = new Customer_1.default(clientInstance);
        // Manufacturing & Supply Chain
        this.workorders = new WorkOrder_1.default(clientInstance);
        this.workorderItems = new WorkOrderLine_1.default(clientInstance);
        this.billofmaterials = new BillOfMaterial_1.default(clientInstance);
        this.purchaseorders = new PurchaseOrder_1.default(clientInstance);
        this.purchaseorderItems = new PurchaseOrderLine_1.default(clientInstance);
        this.manufacturerorders = new ManufactureOrder_1.default(clientInstance);
        this.manufacturerorderItems = new ManufactureOrderLine_1.default(clientInstance);
        this.packinglists = new PackingList_1.default(clientInstance);
        this.packinglistItems = new PackingListLine_1.default(clientInstance);
        this.asns = new AdvancedShippingNotice_1.default(clientInstance);
        this.asnItems = new AdvancedShippingNoticeLine_1.default(clientInstance);
        // AI & Automation
        this.channels = new Channel_1.default(clientInstance);
        this.messages = new Message_1.default(clientInstance);
        this.agents = new Agent_1.default(clientInstance);
        this.rules = new Rule_1.default(clientInstance);
        this.attributes = new Attribute_1.default(clientInstance);
        this.responses = new Response_1.default(clientInstance);
        this.knowledge = new Knowledge_1.default(clientInstance);
        this.evals = new Eval_1.default(clientInstance);
        this.workflows = new Workflow_1.default(clientInstance);
        this.schedules = new Schedule_1.default(clientInstance);
        this.users = new User_1.default(clientInstance);
        // Financial & Settlement
        this.settlements = new Settlement_1.default(clientInstance);
        this.payouts = new Payout_1.default(clientInstance);
        this.payments = new Payment_1.default(clientInstance);
        this.refunds = new Refund_1.default(clientInstance);
        this.creditsDebits = new CreditsDebits_1.default(clientInstance);
        this.ledger = new Ledger_1.default(clientInstance);
        // Warehouse & Operations
        this.picks = new Pick_1.default(clientInstance);
        this.cycleCounts = new CycleCount_1.default(clientInstance);
        this.machines = new Machine_1.default(clientInstance);
        this.wasteAndScrap = new WasteAndScrap_1.default(clientInstance);
        this.warehouses = new Warehouse_1.default(clientInstance);
        this.suppliers = new Supplier_1.default(clientInstance);
        this.locations = new Location_1.default(clientInstance);
        this.vendors = new Vendor_1.default(clientInstance);
        // Accounting & Compliance
        this.invoices = new Invoice_1.default(clientInstance);
        this.invoiceLines = new InvoiceLine_1.default(clientInstance);
        this.compliance = new Compliance_1.default(clientInstance);
        this.leads = new Lead_1.default(clientInstance);
        this.assets = new Asset_1.default(clientInstance);
        this.contracts = new Contract_1.default(clientInstance);
        this.promotions = new Promotion_1.default(clientInstance);
        // Maintenance & Quality
        this.logs = new Log_1.default(clientInstance);
        this.maintenanceSchedules = new MaintenanceSchedule_1.default(clientInstance);
        this.qualityControl = new QualityControl_1.default(clientInstance);
        this.resourceUtilization = new ResourceUtilization_1.default(clientInstance);
        // Sales & CRM
        this.opportunities = new Opportunity_1.default(clientInstance);
        this.contacts = new Contact_1.default(clientInstance);
        this.casesTickets = new CaseTicket_1.default(clientInstance);
        // Logistics & Delivery
        this.carriers = new Carrier_1.default(clientInstance);
        this.routes = new Route_1.default(clientInstance);
        this.deliveryConfirmations = new DeliveryConfirmation_1.default(clientInstance);
        this.activities = new Activities_1.default(clientInstance);
        this.fulfillment = new Fulfillment_1.default(clientInstance);
        this.productionJob = new ProductionJob_1.default(clientInstance);
        this.salesOrders = new SalesOrder_1.default(clientInstance);
        this.fulfillmentOrders = new FulfillmentOrder_1.default(clientInstance);
        this.itemReceipts = new ItemReceipt_1.default(clientInstance);
        this.cashSales = new CashSale_1.default(clientInstance);
        // Legacy compatibility
        this.workOrders = this.workorders;
    }
    /**
     * Update the API key used for requests
     */
    updateApiKey(apiKey) {
        if (!apiKey) {
            throw new Error('API key cannot be empty');
        }
        this.config.apiKey = apiKey;
        this.httpClient.updateApiKey(apiKey);
        logger_1.logger.info('API key updated successfully', {
            operation: 'client.update_api_key',
        });
    }
    setApiKey(apiKey) {
        this.updateApiKey(apiKey);
    }
    /**
     * Update the base URL used for requests
     */
    updateBaseURL(baseURL) {
        if (!this.isValidUrl(baseURL)) {
            throw new Error('Invalid base URL provided');
        }
        this.config.baseUrl = baseURL;
        this.httpClient.updateBaseURL(baseURL);
        logger_1.logger.info('Base URL updated successfully', {
            operation: 'client.update_base_url',
            metadata: { baseURL },
        });
    }
    setBaseUrl(baseURL) {
        this.updateBaseURL(baseURL);
    }
    /**
     * Update the request timeout
     */
    updateTimeout(timeout) {
        if (timeout < 1000 || timeout > 600000) {
            throw new Error('Timeout must be between 1000ms and 600000ms (10 minutes)');
        }
        this.config.timeout = timeout;
        this.httpClient.updateTimeout(timeout);
        logger_1.logger.info('Timeout updated successfully', {
            operation: 'client.update_timeout',
            metadata: { timeout },
        });
    }
    setTimeout(timeout) {
        this.updateTimeout(timeout);
    }
    /**
     * Update retry configuration
     */
    updateRetryOptions(retry, retryDelayMs) {
        const delay = retryDelayMs ?? this.config.retryDelayMs ?? 1000;
        if (retry < 0 || retry > 10) {
            throw new Error('Retry count must be between 0 and 10');
        }
        if (delay < 100 || delay > 30000) {
            throw new Error('Retry delay must be between 100ms and 30000ms');
        }
        this.config.retry = retry;
        this.config.retryDelayMs = delay;
        this.config.retryOptions = this.normalizeRetryOptions({ ...this.config.retryOptions, maxAttempts: retry + 1, baseDelay: delay }, Math.max(1, retry + 1), delay);
        this.httpClient.updateRetryOptions(this.config.retryOptions);
        logger_1.logger.info('Retry options updated successfully', {
            operation: 'client.update_retry_options',
            metadata: { retry, retryDelayMs: delay, maxAttempts: this.config.retryOptions.maxAttempts },
        });
    }
    setRetryOptions(retry, retryDelayMs) {
        this.updateRetryOptions(retry, retryDelayMs);
    }
    setRetryStrategy(options) {
        const fallbackAttempts = Math.max(1, (this.config.retry ?? 0) + 1);
        const fallbackDelay = this.config.retryDelayMs ?? 1000;
        this.config.retryOptions = this.normalizeRetryOptions({ ...this.config.retryOptions, ...options }, fallbackAttempts, fallbackDelay);
        this.config.retry = Math.max(0, this.config.retryOptions.maxAttempts - 1);
        this.config.retryDelayMs = this.config.retryOptions.baseDelay ?? fallbackDelay;
        this.httpClient.updateRetryOptions(this.config.retryOptions);
        logger_1.logger.info('Retry strategy updated successfully', {
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
    updateHeaders(headers) {
        this.config.additionalHeaders = { ...this.config.additionalHeaders, ...headers };
        this.httpClient.updateHeaders(headers);
        logger_1.logger.info('Headers updated successfully', {
            operation: 'client.update_headers',
            metadata: { headerCount: Object.keys(headers).length },
        });
    }
    setHeaders(headers) {
        this.updateHeaders(headers);
    }
    /**
     * Update proxy configuration
     */
    updateProxy(proxyUrl) {
        const parsed = this.parseProxyUrl(proxyUrl);
        if (!parsed) {
            throw new Error('Invalid proxy URL provided');
        }
        this.config.proxy = proxyUrl;
        this.httpClient.updateProxy(parsed);
        logger_1.logger.info('Proxy configuration updated', {
            operation: 'client.update_proxy',
            metadata: { host: parsed.host, port: parsed.port, protocol: parsed.protocol },
        });
    }
    setProxy(proxyUrl) {
        this.updateProxy(proxyUrl);
    }
    clearProxy() {
        this.config.proxy = undefined;
        this.httpClient.updateProxy(null);
        logger_1.logger.info('Proxy configuration cleared', {
            operation: 'client.clear_proxy',
        });
    }
    /**
     * Update app info for user agent
     */
    updateAppInfo(info) {
        this.config.appInfo = info;
        const userAgent = this.buildUserAgent();
        this.config.userAgent = userAgent;
        this.httpClient.updateHeaders({ 'User-Agent': userAgent });
        logger_1.logger.info('App info updated successfully', {
            operation: 'client.update_app_info',
            metadata: { appName: info.name, appVersion: info.version },
        });
    }
    setAppInfo(info) {
        this.updateAppInfo(info);
    }
    /**
     * Add custom request interceptor
     */
    addRequestInterceptor(interceptor) {
        this.httpClient.addRequestInterceptor(interceptor);
    }
    /**
     * Add custom response interceptor
     */
    addResponseInterceptor(interceptor) {
        this.httpClient.addResponseInterceptor(interceptor);
    }
    /**
     * Add custom error interceptor
     */
    addErrorInterceptor(interceptor) {
        this.httpClient.addErrorInterceptor(interceptor);
    }
    /**
     * Health check endpoint
     */
    async healthCheck() {
        logger_1.logger.debug('Performing health check', {
            operation: 'client.health_check',
        });
        try {
            const result = await this.httpClient.healthCheck();
            logger_1.logger.info('Health check completed', {
                operation: 'client.health_check',
                metadata: { status: result.status },
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Health check failed', {
                operation: 'client.health_check',
            }, error);
            throw error;
        }
    }
    /**
     * Get circuit breaker state
     */
    getCircuitBreakerState() {
        return this.httpClient.getCircuitBreakerState();
    }
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker() {
        this.httpClient.resetCircuitBreaker();
        logger_1.logger.info('Circuit breaker reset', {
            operation: 'client.reset_circuit_breaker',
        });
    }
    /**
     * Get current configuration (sanitized)
     */
    getConfig() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { apiKey, requestInterceptors, responseInterceptors, errorInterceptors, ...safeConfig } = this.config;
        return safeConfig;
    }
    resolveCacheDirective(method, path, params, cacheOption, explicitCacheKey, ttlOverride) {
        if (method !== 'GET') {
            return null;
        }
        if (!this.config.cache.enabled) {
            return null;
        }
        if (cacheOption === false) {
            return null;
        }
        const derivedKey = explicitCacheKey
            || (typeof cacheOption === 'object' ? cacheOption.key : undefined)
            || this.generateCacheKey(path, params || {});
        if (!derivedKey) {
            return null;
        }
        const ttl = ttlOverride ?? (typeof cacheOption === 'object' ? cacheOption.ttl : undefined);
        return { key: derivedKey, ttl };
    }
    collectInvalidationTargets(method, normalizedPath, cacheOption, overridePaths) {
        const targets = new Set();
        if (method !== 'GET' && normalizedPath) {
            targets.add(normalizedPath);
        }
        const addPaths = (paths) => {
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
    generateCacheKey(path, params) {
        const serializedParams = params && Object.keys(params).length > 0
            ? JSON.stringify(params)
            : '';
        return `${path}:${serializedParams}`;
    }
    normalizePath(path) {
        if (!path) {
            return '';
        }
        const withoutQuery = path.split('?')[0];
        return withoutQuery.replace(/^\/+/, '').replace(/\/+$/, '');
    }
    indexCacheKey(normalizedPath, cacheKey) {
        if (!normalizedPath) {
            return;
        }
        const existing = this.cacheKeyIndex.get(normalizedPath) ?? new Set();
        existing.add(cacheKey);
        this.cacheKeyIndex.set(normalizedPath, existing);
    }
    invalidateCacheForPath(normalizedPath) {
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
            logger_1.logger.debug('Cache invalidated for path', {
                operation: 'client.cache_invalidate',
                metadata: { path: normalizedPath, removedEntries },
            });
        }
    }
    pathsOverlap(pathA, pathB) {
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
    async request(method, path, data, options = {}) {
        const methodUpper = method.toUpperCase();
        const timer = this.config.performance.enabled
            ? performance_1.performanceMonitor.startTimer(`client.request.${methodUpper}.${path}`)
            : null;
        const { cache: cacheOption, cacheKey: explicitCacheKey, cacheTTL, invalidateCachePaths, signal, idempotencyKey, retryOptions: perRequestRetry, onRetryAttempt, ...axiosOptions } = options || {};
        try {
            const normalizedPath = this.normalizePath(path);
            const cacheDirective = this.resolveCacheDirective(methodUpper, path, axiosOptions.params, cacheOption, explicitCacheKey, cacheTTL);
            // Check cache for GET requests
            if (this.config.cache.enabled && cacheDirective) {
                const cached = this.cache.get(cacheDirective.key);
                if (cached) {
                    timer?.end(true);
                    logger_1.logger.debug('Request served from cache', {
                        operation: 'client.request',
                        metadata: { method, path, cached: true },
                    });
                    return cached;
                }
            }
            logger_1.logger.debug('Making HTTP request', {
                operation: 'client.request',
                metadata: { method, path },
            });
            const { headers: providedHeaders, ...restAxiosOptions } = axiosOptions;
            const headers = providedHeaders ? { ...providedHeaders } : {};
            if (idempotencyKey) {
                headers['Idempotency-Key'] = idempotencyKey;
            }
            const config = {
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
                    ...perRequestRetry,
                    ...(onRetryAttempt ? { onRetryAttempt } : {}),
                };
            }
            const response = await this.httpClient.request(config);
            const result = response.data;
            if (this.config.cache.enabled) {
                const invalidationTargets = this.collectInvalidationTargets(methodUpper, normalizedPath, cacheOption, invalidateCachePaths);
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
        }
        catch (error) {
            timer?.end(false, error.message);
            logger_1.logger.error('Request failed', {
                operation: 'client.request',
                metadata: { method, path },
            }, error);
            throw error;
        }
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return this.cache.getStats();
    }
    /**
     * Clear the cache
     */
    clearCache() {
        this.cache.clear();
        this.cacheKeyIndex.clear();
        logger_1.logger.info('Cache cleared manually', {
            operation: 'client.clear_cache',
        });
    }
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return performance_1.performanceMonitor.getStats();
    }
    /**
     * Enable or disable caching
     */
    setCacheEnabled(enabled) {
        this.config.cache.enabled = enabled;
        if (!enabled) {
            this.cache.clear();
            this.cacheKeyIndex.clear();
        }
        logger_1.logger.info(`Cache ${enabled ? 'enabled' : 'disabled'}`, {
            operation: 'client.set_cache_enabled',
            metadata: { enabled },
        });
    }
    /**
     * Enable or disable performance monitoring
     */
    setPerformanceMonitoringEnabled(enabled) {
        this.config.performance.enabled = enabled;
        logger_1.logger.info(`Performance monitoring ${enabled ? 'enabled' : 'disabled'}`, {
            operation: 'client.set_performance_monitoring',
            metadata: { enabled },
        });
    }
    /**
     * Bulk operations helper
     */
    async bulk(operations, concurrency = 5) {
        const results = [];
        const batches = [];
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
    destroy() {
        this.httpClient.destroy();
        this.cache.destroy();
        this.cacheKeyIndex.clear();
        logger_1.logger.info('StatesetClient destroyed', {
            operation: 'client.destroy',
        });
    }
}
exports.StatesetClient = StatesetClient;
exports.default = StatesetClient;
//# sourceMappingURL=client.js.map