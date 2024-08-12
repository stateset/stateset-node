"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const https = __importStar(require("https"));
const HttpClient_1 = require("./HttpClient");
const utils_1 = __importDefault(require("./utils"));
const Account_1 = __importDefault(require("./lib/resources/Account"));
const Return_1 = __importDefault(require("./lib/resources/Return"));
const ReturnLineItem_1 = __importDefault(require("./lib/resources/ReturnLineItem"));
const Warranty_1 = __importDefault(require("./lib/resources/Warranty"));
const WarrantyLineItem_1 = __importDefault(require("./lib/resources/WarrantyLineItem"));
const Order_1 = __importDefault(require("./lib/resources/Order"));
const OrderLineItem_1 = __importDefault(require("./lib/resources/OrderLineItem"));
const Shipment_1 = __importDefault(require("./lib/resources/Shipment"));
const ShipmentLineItem_1 = __importDefault(require("./lib/resources/ShipmentLineItem"));
const WorkOrder_1 = __importDefault(require("./lib/resources/WorkOrder"));
const WorkOrderLineItem_1 = __importDefault(require("./lib/resources/WorkOrderLineItem"));
const InventoryItem_1 = __importDefault(require("./lib/resources/InventoryItem"));
const BillOfMaterial_1 = __importDefault(require("./lib/resources/BillOfMaterial"));
const BillOfMaterialLineItem_1 = __importDefault(require("./lib/resources/BillOfMaterialLineItem"));
const ManufactureOrder_1 = __importDefault(require("./lib/resources/ManufactureOrder"));
const ManufactureOrderLineItem_1 = __importDefault(require("./lib/resources/ManufactureOrderLineItem"));
const PurchaseOrder_1 = __importDefault(require("./lib/resources/PurchaseOrder"));
const PurchaseOrderLineItem_1 = __importDefault(require("./lib/resources/PurchaseOrderLineItem"));
class Stateset extends events_1.EventEmitter {
    constructor(token) {
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
    _initializeResources() {
        this.accounts = new Account_1.default(this);
        this.returns = new Return_1.default(this);
        this.returnlines = new ReturnLineItem_1.default(this);
        this.warranties = new Warranty_1.default(this);
        this.warrantylines = new WarrantyLineItem_1.default(this);
        this.orders = new Order_1.default(this);
        this.orderlines = new OrderLineItem_1.default(this);
        this.inventoryitems = new InventoryItem_1.default(this);
        this.shipments = new Shipment_1.default(this);
        this.shipmentlines = new ShipmentLineItem_1.default(this);
        this.workorders = new WorkOrder_1.default(this);
        this.workorderlines = new WorkOrderLineItem_1.default(this);
        this.billofmaterials = new BillOfMaterial_1.default(this);
        this.billofmateriallines = new BillOfMaterialLineItem_1.default(this);
        this.manufactureorders = new ManufactureOrder_1.default(this);
        this.manufactureorderlines = new ManufactureOrderLineItem_1.default(this);
        this.purchaseorders = new PurchaseOrder_1.default(this);
        this.purchaseorderlines = new PurchaseOrderLineItem_1.default(this);
    }
    createDefaultHttpClient() {
        return new HttpClient_1.HttpClient(new https.Agent({ keepAlive: true }));
    }
    setHost(host, port, protocol) {
        this.setApiField('host', host);
        if (port) {
            this.setPort(port);
        }
        if (protocol) {
            this.setProtocol(protocol);
        }
    }
    setProtocol(protocol) {
        this.setApiField('protocol', protocol.toLowerCase());
    }
    setPort(port) {
        this.setApiField('port', port);
    }
    setApiVersion(version) {
        if (version) {
            this.setApiField('version', version);
        }
    }
    setToken(token) {
        if (token) {
            this.setApiField('auth', `Bearer ${token}`);
        }
    }
    setTimeout(timeout) {
        this.setApiField('timeout', timeout == null ? Stateset.DEFAULT_TIMEOUT : timeout);
    }
    setMaxNetworkRetries(maxNetworkRetries) {
        this.setApiField('maxNetworkRetries', maxNetworkRetries);
    }
    setEnableTelemetry(enableTelemetry) {
        this._enableTelemetry = enableTelemetry;
    }
    getTelemetryEnabled() {
        return this._enableTelemetry;
    }
    getApiField(key) {
        return this._api[key];
    }
    setApiField(key, value) {
        this._api[key] = value;
    }
    getClientUserAgent(cb) {
        if (Stateset.USER_AGENT_SERIALIZED) {
            return cb(Stateset.USER_AGENT_SERIALIZED);
        }
        this.getClientUserAgentSeeded(Stateset.USER_AGENT, (cua) => {
            Stateset.USER_AGENT_SERIALIZED = cua;
            cb(Stateset.USER_AGENT_SERIALIZED);
        });
    }
    getClientUserAgentSeeded(seed, cb) {
        utils_1.default.safeExec('uname -a', (err, uname) => {
            const userAgent = {};
            for (const field in seed) {
                userAgent[field] = encodeURIComponent(seed[field]);
            }
            userAgent.uname = encodeURIComponent(uname || 'UNKNOWN');
            cb(JSON.stringify(userAgent));
        });
    }
}
Stateset.DEFAULT_HOST = 'api.stateset.com';
Stateset.DEFAULT_PORT = '443';
Stateset.DEFAULT_BASE_PATH = '/v1/';
Stateset.DEFAULT_API_VERSION = null;
Stateset.DEFAULT_TIMEOUT = 80000;
Stateset.MAX_NETWORK_RETRY_DELAY_SEC = 2;
Stateset.INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
Stateset.DEFAULT_MAX_NETWORK_RETRIES = 0;
Stateset.PACKAGE_VERSION = '0.0.1';
Stateset.USER_AGENT = {
    bindings_version: Stateset.PACKAGE_VERSION,
    lang: 'node',
    lang_version: process.version,
    platform: process.platform,
    publisher: 'stateset',
    uname: null,
};
Stateset.USER_AGENT_SERIALIZED = null;
exports.default = Stateset;
