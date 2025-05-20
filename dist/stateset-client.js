"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateset = void 0;
const axios_1 = __importDefault(require("axios"));
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
class stateset {
    constructor(options) {
        var _a, _b;
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
        this.retry = (_a = options.retry) !== null && _a !== void 0 ? _a : 0;
        this.retryDelayMs = (_b = options.retryDelayMs) !== null && _b !== void 0 ? _b : 1000;
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        // Simple automatic retry mechanism for transient failures
        this.httpClient.interceptors.response.use((resp) => resp, async (error) => {
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
        });
        this.returns = new Return_1.default(this);
        this.returnItems = new ReturnLine_1.default(this);
        this.warranties = new Warranty_1.default(this);
        this.warrantyItems = new WarrantyLine_1.default(this);
        this.products = new Product_1.default(this);
        this.orders = new Order_1.default(this);
        this.orderItems = new OrderLine_1.default(this);
        this.shipments = new Shipment_1.default(this);
        this.shipmentItems = new ShipmentLine_1.default(this);
        this.shipTo = new ShipTo_1.default(this);
        this.inventory = new Inventory_1.default(this);
        this.customers = new Customer_1.default(this);
        this.workorders = new WorkOrder_1.default(this);
        this.workorderItems = new WorkOrderLine_1.default(this);
        this.billofmaterials = new BillOfMaterial_1.default(this);
        this.purchaseorders = new PurchaseOrder_1.default(this);
        this.purchaseorderItems = new PurchaseOrderLine_1.default(this);
        this.manufacturerorders = new ManufactureOrder_1.default(this);
        this.manufacturerorderItems = new ManufactureOrderLine_1.default(this);
        this.packinglists = new PackingList_1.default(this);
        this.packinglistItems = new PackingListLine_1.default(this);
        this.asns = new AdvancedShippingNotice_1.default(this);
        this.asnItems = new AdvancedShippingNoticeLine_1.default(this);
        this.channels = new Channel_1.default(this);
        this.messages = new Message_1.default(this);
        this.agents = new Agent_1.default(this);
        this.rules = new Rule_1.default(this);
        this.attributes = new Attribute_1.default(this);
        this.workflows = new Workflow_1.default(this);
        this.schedules = new Schedule_1.default(this);
        this.users = new User_1.default(this);
        this.settlements = new Settlement_1.default(this);
        this.payouts = new Payout_1.default(this);
        this.picks = new Pick_1.default(this);
        this.cycleCounts = new CycleCount_1.default(this);
        this.machines = new Machine_1.default(this);
        this.wasteAndScrap = new WasteAndScrap_1.default(this);
        this.warehouses = new Warehouse_1.default(this);
        this.suppliers = new Supplier_1.default(this);
        this.locations = new Location_1.default(this);
        this.vendors = new Vendor_1.default(this);
        this.invoices = new Invoice_1.default(this);
        this.invoiceLines = new InvoiceLine_1.default(this);
        this.compliance = new Compliance_1.default(this);
        this.leads = new Lead_1.default(this);
        this.assets = new Asset_1.default(this);
        this.contracts = new Contract_1.default(this);
        this.promotions = new Promotion_1.default(this);
        this.logs = new Log_1.default(this);
        this.maintenanceSchedules = new MaintenanceSchedule_1.default(this);
        this.qualityControl = new QualityControl_1.default(this);
        this.resourceUtilization = new ResourceUtilization_1.default(this);
        this.payments = new Payment_1.default(this);
        this.refunds = new Refund_1.default(this);
        this.creditsDebits = new CreditsDebits_1.default(this);
        this.ledger = new Ledger_1.default(this);
        this.opportunities = new Opportunity_1.default(this);
        this.contacts = new Contact_1.default(this);
        this.casesTickets = new CaseTicket_1.default(this);
        this.carriers = new Carrier_1.default(this);
        this.routes = new Route_1.default(this);
        this.deliveryConfirmations = new DeliveryConfirmation_1.default(this);
    }
    async request(method, path, data, options = {}) {
        try {
            const response = await this.httpClient.request({
                method,
                url: path,
                data,
                ...options
            });
            return response.data;
        }
        catch (error) {
            console.error('Error in Stateset request:', error);
            throw error;
        }
    }
}
exports.stateset = stateset;
exports.default = stateset;
