"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateset = void 0;
const Return_1 = __importDefault(require("./lib/resources/Return"));
const Warranty_1 = __importDefault(require("./lib/resources/Warranty"));
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
const Workflow_1 = __importDefault(require("./lib/resources/Workflow"));
const User_1 = __importDefault(require("./lib/resources/User"));
const ReturnLine_1 = __importDefault(require("./lib/resources/ReturnLine"));
const WarrantyLine_1 = __importDefault(require("./lib/resources/WarrantyLine"));
const OrderLine_1 = __importDefault(require("./lib/resources/OrderLine"));
const ShipmentLine_1 = __importDefault(require("./lib/resources/ShipmentLine"));
const WorkOrderLine_1 = __importDefault(require("./lib/resources/WorkOrderLine"));
const PurchaseOrderLine_1 = __importDefault(require("./lib/resources/PurchaseOrderLine"));
const ManufactureOrderLine_1 = __importDefault(require("./lib/resources/ManufactureOrderLine"));
class stateset {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
        this.returns = new Return_1.default(this);
        this.returnItems = new ReturnLine_1.default(this);
        this.warranties = new Warranty_1.default(this);
        this.warrantyItems = new WarrantyLine_1.default(this);
        this.orders = new Order_1.default(this);
        this.orderItems = new OrderLine_1.default(this);
        this.shipments = new Shipment_1.default(this);
        this.shipmentItems = new ShipmentLine_1.default(this);
        this.inventory = new Inventory_1.default(this);
        this.customers = new Customer_1.default(this);
        this.workorders = new WorkOrder_1.default(this);
        this.workorderItems = new WorkOrderLine_1.default(this);
        this.billofmaterials = new BillOfMaterial_1.default(this);
        this.purchaseorders = new PurchaseOrder_1.default(this);
        this.purchaseorderItems = new PurchaseOrderLine_1.default(this);
        this.manufacturerorders = new ManufactureOrder_1.default(this);
        this.manufacturerorderItems = new ManufactureOrderLine_1.default(this);
        this.channels = new Channel_1.default(this);
        this.messages = new Message_1.default(this);
        this.agents = new Agent_1.default(this);
        this.rules = new Rule_1.default(this);
        this.attributes = new Attribute_1.default(this);
        this.workflows = new Workflow_1.default(this);
        this.users = new User_1.default(this);
    }
    async request(method, path, data) {
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
        }
        catch (error) {
            console.error('Error in Stateset request:', error);
            throw error;
        }
    }
}
exports.stateset = stateset;
exports.default = stateset;
