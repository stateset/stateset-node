import { AxiosRequestConfig } from 'axios';
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
interface StatesetOptions {
    apiKey?: string;
    baseUrl?: string;
    /**
     * Number of times to retry a failed request. Defaults to 0 (no retries).
     */
    retry?: number;
    /**
     * Delay in milliseconds between retries.
     */
    retryDelayMs?: number;
    /**
     * Request timeout in milliseconds. Defaults to 60000 (60s).
     */
    timeout?: number;
    /**
     * Custom User-Agent header value. Defaults to `stateset-node/<version>`.
     */
    userAgent?: string;
    /**
     * Additional headers to include with every request.
     */
    additionalHeaders?: Record<string, string>;
    /**
     * Proxy server URL (e.g. "http://localhost:3128"). Can also be set with
     * the STATESET_PROXY environment variable.
     */
    proxy?: string;
    /**
     * Information about your application to be appended to the User-Agent
     * header for telemetry and debugging purposes.
     */
    appInfo?: {
        name: string;
        version?: string;
        url?: string;
    };
}
export declare class stateset {
    private baseUrl;
    private apiKey;
    private httpClient;
    private retry;
    private retryDelayMs;
    private timeout;
    private userAgent;
    private appInfo?;
    private additionalHeaders;
    private proxy?;
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
    payments: Payments;
    refunds: Refunds;
    creditsDebits: CreditsDebits;
    ledger: Ledger;
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
    constructor(options: StatesetOptions);
    /**
     * Update the API key used for requests after initialization.
     * @param apiKey - new API key string
     */
    setApiKey(apiKey: string): void;
    /**
     * Update the base URL used for requests after initialization.
     * @param baseUrl - new base URL string
     */
    setBaseUrl(baseUrl: string): void;
    /**
     * Update the request timeout used for HTTP requests.
     * @param timeout - timeout in milliseconds
     */
    setTimeout(timeout: number): void;
    /**
     * Update retry configuration used for requests.
     * @param retry - number of retries
     * @param retryDelayMs - delay in ms between retries
     */
    setRetryOptions(retry: number, retryDelayMs?: number): void;
    /**
     * Update proxy configuration used for requests.
     * @param proxyUrl - proxy server URL
     */
    setProxy(proxyUrl: string): void;
    private buildUserAgent;
    /**
     * Provide information about your application for the User-Agent header.
     * @param info - object containing name, version and optional url
     */
    setAppInfo(info: {
        name: string;
        version?: string;
        url?: string;
    }): void;
    /**
     * Merge additional headers to include with every request.
     * @param headers - headers object
     */
    setHeaders(headers: Record<string, string>): void;
    request(method: string, path: string, data?: any, options?: AxiosRequestConfig): Promise<any>;
}
export default stateset;
//# sourceMappingURL=stateset-client.d.ts.map