import Returns from './lib/resources/Return';
import Warranties from './lib/resources/Warranty';
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


interface StatesetOptions {
  apiKey: string;
  baseUrl?: string;
}

export class stateset {
  private baseUrl: string;
  private apiKey: string;
  public returns: Returns;
  public returnItems: ReturnLines;
  public warranties: Warranties;
  public warrantyItems: WarrantyLines;
  public orders: Orders;
  public orderItems: OrderLines;
  public shipments: Shipments;
  public shipmentItems: ShipmentLines;
  public inventory: Inventory;
  public customers: Customers;
  public workorders: Workorders;
  public workorderItems: WorkOrderLines;
  public billofmaterials: BillOfMaterials;
  public purchaseorders: PurchaseOrders;
  public purchaseorderItems: PurchaseOrderLines;
  public manufacturerorders: ManufacturerOrders;
  public manufacturerorderItems: ManufactureOrderLines;
  public channels: Channels;
  public messages: Messages;
  public agents: Agents;
  public rules: Rules;
  public attributes: Attributes;
  public workflows: Workflows;
  public users: Users;


  constructor(options: StatesetOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
    this.returns = new Returns(this);
    this.returnItems = new ReturnLines(this);
    this.warranties = new Warranties(this);
    this.warrantyItems = new WarrantyLines(this);
    this.orders = new Orders(this);
    this.orderItems = new OrderLines(this);
    this.shipments = new Shipments(this);
    this.shipmentItems = new ShipmentLines(this);
    this.inventory = new Inventory(this);
    this.customers = new Customers(this);
    this.workorders = new Workorders(this);
    this.workorderItems = new WorkOrderLines(this);
    this.billofmaterials = new BillOfMaterials(this);
    this.purchaseorders = new PurchaseOrders(this);
    this.purchaseorderItems = new PurchaseOrderLines(this);
    this.manufacturerorders = new ManufacturerOrders(this);
    this.manufacturerorderItems = new ManufactureOrderLines(this);
    this.channels = new Channels(this);
    this.messages = new Messages(this);
    this.agents = new Agents(this);
    this.rules = new Rules(this);
    this.attributes = new Attributes(this);
    this.workflows = new Workflows(this);
    this.users = new Users(this);
  }

  async request(method: string, path: string, data?: any) {
    const url = `${this.baseUrl}/${path}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    console.log(`Making ${method} request to ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Error response body: ${errorBody}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in Stateset request:', error);
      throw error;
    }
  }
}

export default stateset;