import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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

interface StatesetOptions {
  apiKey: string;
  baseUrl?: string;
}

export class stateset {
  private baseUrl: string;
  private apiKey: string;
  private httpClient: AxiosInstance;
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

  constructor(options: StatesetOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
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