"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class NetsuiteIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.netsuite.com');
    }
    async getProducts() {
        return this.request('GET', 'products');
    }
    async createProduct(data) {
        return this.request('POST', 'products', data);
    }
    async getOrders() {
        return this.request('GET', 'orders');
    }
    async createOrder(data) {
        return this.request('POST', 'orders', data);
    }
    async getCustomers() {
        return this.request('GET', 'customers');
    }
    async createCustomer(data) {
        return this.request('POST', 'customers', data);
    }
    async getInventory() {
        return this.request('GET', 'inventory');
    }
    async createInventory(data) {
        return this.request('POST', 'inventory', data);
    }
    async getSalesOrders() {
        return this.request('GET', 'salesOrders');
    }
    async createSalesOrder(data) {
        return this.request('POST', 'salesOrders', data);
    }
    async getInvoices() {
        return this.request('GET', 'invoices');
    }
    async createInvoice(data) {
        return this.request('POST', 'invoices', data);
    }
    async getPayments() {
        return this.request('GET', 'payments');
    }
    async createPayment(data) {
        return this.request('POST', 'payments', data);
    }
    async getShipments() {
        return this.request('GET', 'shipments');
    }
    async createShipment(data) {
        return this.request('POST', 'shipments', data);
    }
    async getCarriers() {
        return this.request('GET', 'carriers');
    }
    async getRates(data) {
        return this.request('POST', 'rates', data);
    }
    async getTrackingNumbers() {
        return this.request('GET', 'trackingNumbers');
    }
    async createTrackingNumber(data) {
        return this.request('POST', 'trackingNumbers', data);
    }
    async getReturns() {
        return this.request('GET', 'returns');
    }
    async createReturn(data) {
        return this.request('POST', 'returns', data);
    }
    async getWarranties() {
        return this.request('GET', 'warranties');
    }
    async createWarranty(data) {
        return this.request('POST', 'warranties', data);
    }
    async getWarrantyItems() {
        return this.request('GET', 'warrantyItems');
    }
    async createWarrantyItem(data) {
        return this.request('POST', 'warrantyItems', data);
    }
    async getWorkOrders() {
        return this.request('GET', 'workOrders');
    }
    async createWorkOrder(data) {
        return this.request('POST', 'workOrders', data);
    }
    async getWorkOrderItems() {
        return this.request('GET', 'workOrderItems');
    }
    async createWorkOrderItem(data) {
        return this.request('POST', 'workOrderItems', data);
    }
    async getPurchaseOrders() {
        return this.request('GET', 'purchaseOrders');
    }
    async createPurchaseOrder(data) {
        return this.request('POST', 'purchaseOrders', data);
    }
    async getPurchaseOrderItems() {
        return this.request('GET', 'purchaseOrderItems');
    }
    async createPurchaseOrderItem(data) {
        return this.request('POST', 'purchaseOrderItems', data);
    }
}
exports.default = NetsuiteIntegration;
