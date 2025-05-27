import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageVersion: string = require('../package.json').version;
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
}

export class stateset {
  private baseUrl: string;
  private apiKey: string;
  private httpClient: AxiosInstance;
  private retry: number;
  private retryDelayMs: number;
  private timeout: number;
  private userAgent: string;
  private additionalHeaders: Record<string, string>;
  public returns: Returns;
  public returnItems: ReturnLines;
  public warranties: Warranties;
  public warrantyItems: WarrantyLines;
  public products: Products;
  public orders: Orders;
  public orderItems: OrderLines;
  public shipments: Shipments;
  public shipmentItems: ShipmentLines;
  public shipTo: ShipTo;
  public inventory: Inventory;
  public customers: Customers;
  public workorders: Workorders;
  public workorderItems: WorkOrderLines;
  public billofmaterials: BillOfMaterials;
  public purchaseorders: PurchaseOrders;
  public purchaseorderItems: PurchaseOrderLines;
  public manufacturerorders: ManufacturerOrders;
  public manufacturerorderItems: ManufactureOrderLines;
  public packinglists: PackingList;
  public packinglistItems: PackingListLines;
  public asns: ASN;
  public asnItems: ASNLine;
  public channels: Channels;
  public messages: Messages;
  public agents: Agents;
  public rules: Rules;
  public attributes: Attributes;
  public responses: Responses;
  public knowledge: Knowledge;
  public evals: Evals;
  public workflows: Workflows;
  public schedules: Schedule;
  public users: Users;
  public settlements: Settlements;
  public payouts: Payouts;
  public picks: Picks;
  public cycleCounts: CycleCounts;
  public machines: Machines;
  public wasteAndScrap: WasteAndScrap;
  public warehouses: Warehouses;
  public suppliers: Suppliers;
  public locations: Locations;
  public vendors: Vendors;
  public invoices: Invoices;
  public invoiceLines: InvoiceLines;
  public compliance: Compliance;
  public leads: Leads;
  public assets: Assets;
  public contracts: Contracts;
  public promotions: Promotions;
  public logs: Logs;
  public maintenanceSchedules: MaintenanceSchedules;
  public qualityControl: QualityControl;
  public resourceUtilization: ResourceUtilization;
  public payments: Payments;
  public refunds: Refunds;
  public creditsDebits: CreditsDebits;
  public ledger: Ledger;
  public opportunities: Opportunities;
  public contacts: Contacts;
  public casesTickets: CasesTickets;
  public carriers: Carriers;
  public routes: Routes;
  public deliveryConfirmations: DeliveryConfirmations;
  public activities: Activities;
  public fulfillment: Fulfillment;
  public productionJob: ProductionJob;
  public salesOrders: SalesOrders;
  public fulfillmentOrders: FulfillmentOrders;
  public itemReceipts: ItemReceipts;
  public cashSales: CashSales;

  constructor(options: StatesetOptions) {
    this.apiKey = options.apiKey || process.env.STATESET_API_KEY || '';
    this.baseUrl =
      options.baseUrl ||
      process.env.STATESET_BASE_URL ||
      'https://stateset-proxy-server.stateset.cloud.stateset.app/api';

    if (!this.apiKey) {
      throw new Error('Stateset API key is required');
    }
    const envRetry = process.env.STATESET_RETRY
      ? parseInt(process.env.STATESET_RETRY, 10)
      : undefined;
    const envRetryDelay = process.env.STATESET_RETRY_DELAY_MS
      ? parseInt(process.env.STATESET_RETRY_DELAY_MS, 10)
      : undefined;

    this.retry = options.retry ?? envRetry ?? 0;
    this.retryDelayMs = options.retryDelayMs ?? envRetryDelay ?? 1000;
    this.timeout = options.timeout ?? 60000;
    this.userAgent = options.userAgent || `stateset-node/${packageVersion}`;
    this.additionalHeaders = options.additionalHeaders || {};

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': this.userAgent,
        ...this.additionalHeaders
      }
    });
    // Simple automatic retry mechanism for transient failures
    this.httpClient.interceptors.response.use(
      (resp) => resp,
      async (error) => {
        const config = error.config;
        if (!config || this.retry <= 0) {
          return Promise.reject(error);
        }
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount >= this.retry) {
          return Promise.reject(error);
        }
        config.__retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
        return this.httpClient.request(config);
      }
    );
    this.returns = new Returns(this);
    this.returnItems = new ReturnLines(this);
    this.warranties = new Warranties(this);
    this.warrantyItems = new WarrantyLines(this);
    this.products = new Products(this);
    this.orders = new Orders(this);
    this.orderItems = new OrderLines(this);
    this.shipments = new Shipments(this);
    this.shipmentItems = new ShipmentLines(this);
    this.shipTo = new ShipTo(this);
    this.inventory = new Inventory(this);
    this.customers = new Customers(this);
    this.workorders = new Workorders(this);
    this.workorderItems = new WorkOrderLines(this);
    this.billofmaterials = new BillOfMaterials(this);
    this.purchaseorders = new PurchaseOrders(this);
    this.purchaseorderItems = new PurchaseOrderLines(this);
    this.manufacturerorders = new ManufacturerOrders(this);
    this.manufacturerorderItems = new ManufactureOrderLines(this);
    this.packinglists = new PackingList(this);
    this.packinglistItems = new PackingListLines(this);
    this.asns = new ASN(this);
    this.asnItems = new ASNLine(this);
    this.channels = new Channels(this);
    this.messages = new Messages(this);
    this.agents = new Agents(this);
    this.rules = new Rules(this);
    this.attributes = new Attributes(this);
    this.responses = new Responses(this);
    this.knowledge = new Knowledge(this);
    this.evals = new Evals(this);
    this.workflows = new Workflows(this);
    this.schedules = new Schedule(this);
    this.users = new Users(this);
    this.settlements = new Settlements(this);
    this.payouts = new Payouts(this);
    this.picks = new Picks(this);
    this.cycleCounts = new CycleCounts(this);
    this.machines = new Machines(this);
    this.wasteAndScrap = new WasteAndScrap(this);
    this.warehouses = new Warehouses(this);
    this.suppliers = new Suppliers(this);
    this.locations = new Locations(this);
    this.vendors = new Vendors(this);
    this.invoices = new Invoices(this);
    this.invoiceLines = new InvoiceLines(this);
    this.compliance = new Compliance(this);
    this.leads = new Leads(this);
    this.assets = new Assets(this);
    this.contracts = new Contracts(this);
    this.promotions = new Promotions(this);
    this.logs = new Logs(this);
    this.maintenanceSchedules = new MaintenanceSchedules(this);
    this.qualityControl = new QualityControl(this);
    this.resourceUtilization = new ResourceUtilization(this);
    this.payments = new Payments(this);
    this.refunds = new Refunds(this);
    this.creditsDebits = new CreditsDebits(this);
    this.ledger = new Ledger(this);
    this.opportunities = new Opportunities(this);
    this.contacts = new Contacts(this);
    this.casesTickets = new CasesTickets(this);
    this.carriers = new Carriers(this);
    this.routes = new Routes(this);
    this.deliveryConfirmations = new DeliveryConfirmations(this);
    this.activities = new Activities(this);
    this.fulfillment = new Fulfillment(this);
    this.productionJob = new ProductionJob(this);
    this.salesOrders = new SalesOrders(this);
    this.fulfillmentOrders = new FulfillmentOrders(this);
    this.itemReceipts = new ItemReceipts(this);
    this.cashSales = new CashSales(this);
  }

  /**
   * Update the API key used for requests after initialization.
   * @param apiKey - new API key string
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    (this.httpClient.defaults.headers as any)['Authorization'] = `Bearer ${apiKey}`;
  }

  /**
   * Update the base URL used for requests after initialization.
   * @param baseUrl - new base URL string
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.httpClient.defaults.baseURL = baseUrl;
  }

  /**
   * Update the request timeout used for HTTP requests.
   * @param timeout - timeout in milliseconds
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
    this.httpClient.defaults.timeout = timeout;
  }

  /**
   * Update retry configuration used for requests.
   * @param retry - number of retries
   * @param retryDelayMs - delay in ms between retries
   */
  setRetryOptions(retry: number, retryDelayMs: number = this.retryDelayMs): void {
    this.retry = retry;
    this.retryDelayMs = retryDelayMs;
  }

  /**
   * Merge additional headers to include with every request.
   * @param headers - headers object
   */
  setHeaders(headers: Record<string, string>): void {
    this.additionalHeaders = { ...this.additionalHeaders, ...headers };
    Object.assign(this.httpClient.defaults.headers, this.additionalHeaders);
  }

  async request(method: string, path: string, data?: any, options: AxiosRequestConfig = {}) {
    try {
      const response = await this.httpClient.request({
        method,
        url: path,
        data,
        ...options
      });
      return response.data;
    } catch (error: any) {
      console.error('Error in Stateset request:', error);
      throw error;
    }
  }
}

export default stateset;