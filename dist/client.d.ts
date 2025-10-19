import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './core/http-client';
import { StatesetConfig, RequestOptions } from './types';
import type { RetryOptions } from './utils/retry';
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
type RequestOptionsInternal = RequestOptions & Record<string, any>;
declare const RESOURCE_REGISTRY: {
    returns: typeof Returns;
    returnItems: typeof ReturnLines;
    warranties: typeof Warranties;
    warrantyItems: typeof WarrantyLines;
    products: typeof Products;
    orders: typeof Orders;
    orderItems: typeof OrderLines;
    shipments: typeof Shipments;
    shipmentItems: typeof ShipmentLines;
    shipTo: typeof ShipTo;
    inventory: typeof Inventory;
    customers: typeof Customers;
    workorders: typeof Workorders;
    workorderItems: typeof WorkOrderLines;
    billofmaterials: typeof BillOfMaterials;
    purchaseorders: typeof PurchaseOrders;
    purchaseorderItems: typeof PurchaseOrderLines;
    manufacturerorders: typeof ManufacturerOrders;
    manufacturerorderItems: typeof ManufactureOrderLines;
    packinglists: typeof PackingList;
    packinglistItems: typeof PackingListLines;
    asns: typeof ASN;
    asnItems: typeof ASNLine;
    channels: typeof Channels;
    messages: typeof Messages;
    agents: typeof Agents;
    rules: typeof Rules;
    attributes: typeof Attributes;
    responses: typeof Responses;
    knowledge: typeof Knowledge;
    evals: typeof Evals;
    workflows: typeof Workflows;
    schedules: typeof Schedule;
    users: typeof Users;
    settlements: typeof Settlements;
    payouts: typeof Payouts;
    payments: typeof Payments;
    refunds: typeof Refunds;
    creditsDebits: typeof CreditsDebits;
    ledger: typeof Ledger;
    picks: typeof Picks;
    cycleCounts: typeof CycleCounts;
    machines: typeof Machines;
    wasteAndScrap: typeof WasteAndScrap;
    warehouses: typeof Warehouses;
    suppliers: typeof Suppliers;
    locations: typeof Locations;
    vendors: typeof Vendors;
    invoices: typeof Invoices;
    invoiceLines: typeof InvoiceLines;
    compliance: typeof Compliance;
    leads: typeof Leads;
    assets: typeof Assets;
    contracts: typeof Contracts;
    promotions: typeof Promotions;
    logs: typeof Logs;
    maintenanceSchedules: typeof MaintenanceSchedules;
    qualityControl: typeof QualityControl;
    resourceUtilization: typeof ResourceUtilization;
    opportunities: typeof Opportunities;
    contacts: typeof Contacts;
    casesTickets: typeof CasesTickets;
    carriers: typeof Carriers;
    routes: typeof Routes;
    deliveryConfirmations: typeof DeliveryConfirmations;
    activities: typeof Activities;
    fulfillment: typeof Fulfillment;
    productionJob: typeof ProductionJob;
    salesOrders: typeof SalesOrders;
    fulfillmentOrders: typeof FulfillmentOrders;
    itemReceipts: typeof ItemReceipts;
    cashSales: typeof CashSales;
};
export declare class StatesetClient {
    private httpClient;
    private config;
    private cache;
    private cacheKeyIndex;
    constructor(config?: StatesetClientConfig);
    private validateConfig;
    private isValidUrl;
    private buildConfig;
    private buildUserAgent;
    private normalizeRetryOptions;
    private buildHttpClientOptions;
    private parseProxyUrl;
    private setupCustomInterceptors;
    private initializeResources;
    /**
     * Update the API key used for requests
     */
    updateApiKey(apiKey: string): void;
    setApiKey(apiKey: string): void;
    /**
     * Update the base URL used for requests
     */
    updateBaseURL(baseURL: string): void;
    setBaseUrl(baseURL: string): void;
    /**
     * Update the request timeout
     */
    updateTimeout(timeout: number): void;
    setTimeout(timeout: number): void;
    /**
     * Update retry configuration
     */
    updateRetryOptions(retry: number, retryDelayMs?: number): void;
    setRetryOptions(retry: number, retryDelayMs?: number): void;
    setRetryStrategy(options: Partial<RetryOptions>): void;
    /**
     * Update headers
     */
    updateHeaders(headers: Record<string, string>): void;
    setHeaders(headers: Record<string, string>): void;
    /**
     * Update proxy configuration
     */
    updateProxy(proxyUrl: string): void;
    setProxy(proxyUrl: string): void;
    clearProxy(): void;
    /**
     * Update app info for user agent
     */
    updateAppInfo(info: {
        name: string;
        version?: string;
        url?: string;
    }): void;
    setAppInfo(info: {
        name: string;
        version?: string;
        url?: string;
    }): void;
    /**
     * Add custom request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void;
    /**
     * Add custom response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void;
    /**
     * Add custom error interceptor
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): void;
    /**
     * Health check endpoint
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        details: any;
    }>;
    /**
     * Get circuit breaker state
     */
    getCircuitBreakerState(): string;
    /**
     * Reset circuit breaker
     */
    resetCircuitBreaker(): void;
    /**
     * Get current configuration (sanitized)
     */
    getConfig(): Omit<StatesetClientConfigInternal, 'apiKey' | 'requestInterceptors' | 'responseInterceptors' | 'errorInterceptors'>;
    private resolveCacheDirective;
    private collectInvalidationTargets;
    private generateCacheKey;
    private normalizePath;
    private indexCacheKey;
    private invalidateCacheForPath;
    private pathsOverlap;
    /**
     * Enhanced request method with caching and performance monitoring
     */
    request(method: string, path: string, data?: any, options?: RequestOptionsInternal): Promise<any>;
    /**
     * Get cache statistics
     */
    getCacheStats(): any;
    /**
     * Clear the cache
     */
    clearCache(): void;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): any;
    /**
     * Enable or disable caching
     */
    setCacheEnabled(enabled: boolean): void;
    /**
     * Enable or disable performance monitoring
     */
    setPerformanceMonitoringEnabled(enabled: boolean): void;
    /**
     * Bulk operations helper
     */
    bulk<T>(operations: (() => Promise<T>)[], concurrency?: number): Promise<T[]>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
export default StatesetClient;
type ResourceInstances = {
    [K in keyof typeof RESOURCE_REGISTRY]: InstanceType<(typeof RESOURCE_REGISTRY)[K]>;
};
export interface StatesetClient extends ResourceInstances {
    workOrders: InstanceType<typeof Workorders>;
}
//# sourceMappingURL=client.d.ts.map