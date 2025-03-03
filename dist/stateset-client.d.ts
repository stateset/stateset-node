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
interface StatesetOptions {
    apiKey: string;
    baseUrl?: string;
}
export declare class stateset {
    private baseUrl;
    private apiKey;
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
    constructor(options: StatesetOptions);
    request(method: string, path: string, data?: any): Promise<any>;
}
export default stateset;
