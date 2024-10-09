import BaseIntegration from './BaseIntegration';

export default class NetsuiteIntegration extends BaseIntegration {
  constructor(apiKey: string) {
    super(apiKey, 'https://api.netsuite.com');
  }

  public async getProducts() {
    return this.request('GET', 'products');
  }

  public async createProduct(data: any) {
    return this.request('POST', 'products', data);
  }

  public async getOrders() {
    return this.request('GET', 'orders');
  }

  public async createOrder(data: any) {
    return this.request('POST', 'orders', data);
  }

  public async getCustomers() {
    return this.request('GET', 'customers');
  }

  public async createCustomer(data: any) {
    return this.request('POST', 'customers', data);
  }

  public async getInventory() {
    return this.request('GET', 'inventory');
  }

  public async createInventory(data: any) {
    return this.request('POST', 'inventory', data);
  }

  public async getSalesOrders() {
    return this.request('GET', 'salesOrders');
  }

  public async createSalesOrder(data: any) {
    return this.request('POST', 'salesOrders', data);
  }

  public async getInvoices() {
    return this.request('GET', 'invoices');
  }

  public async createInvoice(data: any) {
    return this.request('POST', 'invoices', data);
  }

  public async getPayments() {
    return this.request('GET', 'payments');
  }

  public async createPayment(data: any) {
    return this.request('POST', 'payments', data);
  }

  public async getShipments() {
    return this.request('GET', 'shipments');
  }

  public async createShipment(data: any) {
    return this.request('POST', 'shipments', data);
  }

  public async getCarriers() {
    return this.request('GET', 'carriers');
  } 

  public async getRates(data: any) {
    return this.request('POST', 'rates', data);
  }

  public async getTrackingNumbers() {
    return this.request('GET', 'trackingNumbers');
  }

  public async createTrackingNumber(data: any) {
    return this.request('POST', 'trackingNumbers', data);
  }

  public async getReturns() {
    return this.request('GET', 'returns');
  }

  public async createReturn(data: any) {
    return this.request('POST', 'returns', data);
  }

  public async getWarranties() {
    return this.request('GET', 'warranties');
  }

  public async createWarranty(data: any) {
    return this.request('POST', 'warranties', data);
  }

  public async getWarrantyItems() {
    return this.request('GET', 'warrantyItems');
  }

  public async createWarrantyItem(data: any) {  
    return this.request('POST', 'warrantyItems', data);
  }

  public async getWorkOrders() {
    return this.request('GET', 'workOrders');
  }

  public async createWorkOrder(data: any) {
    return this.request('POST', 'workOrders', data);
  }

  public async getWorkOrderItems() {
    return this.request('GET', 'workOrderItems');
  }

  public async createWorkOrderItem(data: any) {
    return this.request('POST', 'workOrderItems', data);
  }

  public async getPurchaseOrders() {
    return this.request('GET', 'purchaseOrders');
  }

  public async createPurchaseOrder(data: any) {
    return this.request('POST', 'purchaseOrders', data);
  }

  public async getPurchaseOrderItems() {
    return this.request('GET', 'purchaseOrderItems');
  }

  public async createPurchaseOrderItem(data: any) {
    return this.request('POST', 'purchaseOrderItems', data);
  }
  
}