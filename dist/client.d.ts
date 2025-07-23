import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './core/http-client';
import { StatesetConfig } from './types';
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
export declare class StatesetClient {
    private httpClient;
    private config;
    returns: Returns;
    returnItems: ReturnLines;
    warranties: Warranties;
    warrantyItems: WarrantyLines;
    products: Products;
    orders: Orders;
    orderItems: OrderLines;
    shipments: Shipments;
    shipmentItems: ShipmentLines;
    shipTo: ShipTo;
    inventory: Inventory;
    customers: Customers;
    workorders: Workorders;
    workorderItems: WorkOrderLines;
    billofmaterials: BillOfMaterials;
    purchaseorders: PurchaseOrders;
    purchaseorderItems: PurchaseOrderLines;
    manufacturerorders: ManufacturerOrders;
    manufacturerorderItems: ManufactureOrderLines;
    packinglists: PackingList;
    packinglistItems: PackingListLines;
    asns: ASN;
    asnItems: ASNLine;
    channels: Channels;
    messages: Messages;
    agents: Agents;
    rules: Rules;
    attributes: Attributes;
    responses: Responses;
    knowledge: Knowledge;
    evals: Evals;
    workflows: Workflows;
    schedules: Schedule;
    users: Users;
    settlements: Settlements;
    payouts: Payouts;
    payments: Payments;
    refunds: Refunds;
    creditsDebits: CreditsDebits;
    ledger: Ledger;
    picks: Picks;
    cycleCounts: CycleCounts;
    machines: Machines;
    wasteAndScrap: WasteAndScrap;
    warehouses: Warehouses;
    suppliers: Suppliers;
    locations: Locations;
    vendors: Vendors;
    invoices: Invoices;
    invoiceLines: InvoiceLines;
    compliance: Compliance;
    leads: Leads;
    assets: Assets;
    contracts: Contracts;
    promotions: Promotions;
    logs: Logs;
    maintenanceSchedules: MaintenanceSchedules;
    qualityControl: QualityControl;
    resourceUtilization: ResourceUtilization;
    opportunities: Opportunities;
    contacts: Contacts;
    casesTickets: CasesTickets;
    carriers: Carriers;
    routes: Routes;
    deliveryConfirmations: DeliveryConfirmations;
    activities: Activities;
    fulfillment: Fulfillment;
    productionJob: ProductionJob;
    salesOrders: SalesOrders;
    fulfillmentOrders: FulfillmentOrders;
    itemReceipts: ItemReceipts;
    cashSales: CashSales;
    workOrders: Workorders;
    constructor(config?: StatesetClientConfig);
    private validateConfig;
    private isValidUrl;
    private buildConfig;
    private buildUserAgent;
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
    /**
     * Update headers
     */
    updateHeaders(headers: Record<string, string>): void;
    setHeaders(headers: Record<string, string>): void;
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
    /**
     * Legacy request method for backward compatibility
     */
    request(method: string, path: string, data?: any, options?: any): Promise<any>;
    /**
     * Clean up resources
     */
    destroy(): void;
}
export default StatesetClient;
//# sourceMappingURL=client.d.ts.map