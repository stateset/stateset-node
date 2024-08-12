import { EventEmitter } from 'events';
import * as https from 'https';
import * as http from 'http';
import { HttpClient } from './HttpClient';
import utils from './utils';
import Account from './lib/resources/Account';
import Return from './lib/resources/Return';
import ReturnLine from './lib/resources/ReturnLineItem';
import Warranty from './lib/resources/Warranty';
import WarrantyLine from './lib/resources/WarrantyLineItem';
import Order from './lib/resources/Order';
import OrderLine from './lib/resources/OrderLineItem';
import Shipment from './lib/resources/Shipment';
import ShipmentLine from './lib/resources/ShipmentLineItem';
import WorkOrder from './lib/resources/WorkOrder';
import WorkOrderLine from './lib/resources/WorkOrderLineItem';
import InventoryItem from './lib/resources/InventoryItem';
import BillOfMaterial from './lib/resources/BillOfMaterial';
import BillOfMaterialLine from './lib/resources/BillOfMaterialLineItem';
import ManufactureOrder from './lib/resources/ManufactureOrder';
import ManufactureOrderLine from './lib/resources/ManufactureOrderLineItem';
import PurchaseOrder from './lib/resources/PurchaseOrder';
import PurchaseOrderLine from './lib/resources/PurchaseOrderLineItem';

interface ApiConfig {
  host: string;
  port: string;
  protocol: string;
  basePath: string;
  version: string | null;
  timeout: number;
  maxNetworkRetries: number;
  httpClient: HttpClient;
  [key: string]: any;
}

class Stateset extends EventEmitter {
  private static readonly DEFAULT_HOST = 'api.stateset.com';
  private static readonly DEFAULT_PORT = '443';
  private static readonly DEFAULT_BASE_PATH = '/v1/';
  private static readonly DEFAULT_API_VERSION = null;
  private static readonly DEFAULT_TIMEOUT = 80000;
  private static readonly MAX_NETWORK_RETRY_DELAY_SEC = 2;
  private static readonly INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;

  private static readonly DEFAULT_MAX_NETWORK_RETRIES = 0;
  public static readonly PACKAGE_VERSION = '0.0.1';
  public static readonly USER_AGENT = {
    bindings_version: Stateset.PACKAGE_VERSION,
    lang: 'node',
    lang_version: process.version,
    platform: process.platform,
    publisher: 'stateset',
    uname: null,
  };

  public static USER_AGENT_SERIALIZED: string | null = null;

  private _api: ApiConfig;
  private _enableTelemetry: boolean;
  private _props: { [key: string]: any };

  // Explicitly typed resources
  public accounts: any;
  public returns: any;
  public returnlines: any;
  public warranties: any;
  public warrantylines: any;
  public orders: any;
  public orderlines: any;
  public inventoryitems: any;
  public shipments: any;
  public shipmentlines: any;
  public workorders: any;
  public workorderlines: any;
  public billofmaterials: any;
  public billofmateriallines: any;
  public manufactureorders: any;
  public manufactureorderlines: any;
  public purchaseorders: any;
  public purchaseorderlines: any;


  constructor(token?: string) {
    super();

    this._api = {
      host: Stateset.DEFAULT_HOST,
      port: Stateset.DEFAULT_PORT,
      protocol: 'https',
      basePath: Stateset.DEFAULT_BASE_PATH,
      version: Stateset.DEFAULT_API_VERSION,
      timeout: Stateset.DEFAULT_TIMEOUT,
      maxNetworkRetries: Stateset.DEFAULT_MAX_NETWORK_RETRIES,
      httpClient: this.createDefaultHttpClient(),
    };

    this._enableTelemetry = true;
    this._props = {};

    this._initializeResources();
    this.setToken(token);
  }

  private _initializeResources(): void {
    this.accounts = new Account(this);
    this.returns = new Return(this);
    this.returnlines = new ReturnLine(this);
    this.warranties = new Warranty(this);
    this.warrantylines = new WarrantyLine(this);
    this.orders = new Order(this);
    this.orderlines = new OrderLine(this);
    this.inventoryitems = new InventoryItem(this);
    this.shipments = new Shipment(this);
    this.shipmentlines = new ShipmentLine(this);
    this.workorders = new WorkOrder(this);
    this.workorderlines = new WorkOrderLine(this);
    this.billofmaterials = new BillOfMaterial(this);
    this.billofmateriallines = new BillOfMaterialLine(this);
    this.manufactureorders = new ManufactureOrder(this);
    this.manufactureorderlines = new ManufactureOrderLine(this);
    this.purchaseorders = new PurchaseOrder(this);
    this.purchaseorderlines = new PurchaseOrderLine(this);
  }

  private createDefaultHttpClient(): HttpClient {
    return new HttpClient(new https.Agent({ keepAlive: true }));
  }

  setHost(host: string, port?: string, protocol?: string): void {
    this.setApiField('host', host);
    if (port) {
      this.setPort(port);
    }
    if (protocol) {
      this.setProtocol(protocol);
    }
  }

  setProtocol(protocol: string): void {
    this.setApiField('protocol', protocol.toLowerCase());
  }

  setPort(port: string): void {
    this.setApiField('port', port);
  }

  setApiVersion(version: string): void {
    if (version) {
      this.setApiField('version', version);
    }
  }

  setToken(token?: string): void {
    if (token) {
      this.setApiField('auth', `Bearer ${token}`);
    }
  }

  setTimeout(timeout: number): void {
    this.setApiField('timeout', timeout == null ? Stateset.DEFAULT_TIMEOUT : timeout);
  }

  setMaxNetworkRetries(maxNetworkRetries: number): void {
    this.setApiField('maxNetworkRetries', maxNetworkRetries);
  }

  setEnableTelemetry(enableTelemetry: boolean): void {
    this._enableTelemetry = enableTelemetry;
  }

  getTelemetryEnabled(): boolean {
    return this._enableTelemetry;
  }

  getApiField<T extends keyof ApiConfig>(key: T): ApiConfig[T] {
    return this._api[key];
  }

  private setApiField<T extends keyof ApiConfig>(key: T, value: ApiConfig[T]): void {
    this._api[key] = value;
  }

  getClientUserAgent(cb: (userAgent: string) => void): void {
    if (Stateset.USER_AGENT_SERIALIZED) {
      return cb(Stateset.USER_AGENT_SERIALIZED);
    }
    this.getClientUserAgentSeeded(Stateset.USER_AGENT, (cua) => {
      Stateset.USER_AGENT_SERIALIZED = cua;
      cb(Stateset.USER_AGENT_SERIALIZED);
    });
  }

  private getClientUserAgentSeeded(seed: Record<string, any>, cb: (userAgent: string) => void): void {
    utils.safeExec('uname -a', (err, uname) => {
      const userAgent: Record<string, string> = {};
      for (const field in seed) {
        userAgent[field] = encodeURIComponent(seed[field]);
      }
      userAgent.uname = encodeURIComponent(uname || 'UNKNOWN');
      cb(JSON.stringify(userAgent));
    });
  }
}

export default Stateset;
