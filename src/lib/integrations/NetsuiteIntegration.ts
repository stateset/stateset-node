import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum NetsuiteRecordStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum NetsuiteItemType {
  INVENTORY = 'InventoryItem',
  NON_INVENTORY = 'NonInventoryItem',
  SERVICE = 'ServiceItem',
  ASSEMBLY = 'AssemblyItem'
}

// Core Interfaces
export interface NetsuiteProduct {
  id: NonEmptyString<string>;
  itemId: string; // Internal ID or custom ID
  displayName: string;
  type: NetsuiteItemType;
  status: NetsuiteRecordStatus;
  basePrice: number;
  currency: string;
  inventoryLocation?: string;
  createdDate: Timestamp;
  lastModifiedDate: Timestamp;
}

export interface NetsuiteOrder {
  id: NonEmptyString<string>;
  tranId: string; // Transaction ID
  status: NetsuiteRecordStatus;
  entity: { id: string; name: string }; // Customer reference
  itemList: Array<{
    item: { id: string; name: string };
    quantity: number;
    amount: number;
  }>;
  total: number;
  currency: string;
  tranDate: Timestamp;
}

export interface NetsuiteCustomer {
  id: NonEmptyString<string>;
  entityId: string;
  companyName?: string;
  email?: string;
  phone?: string;
  addressList: Array<{
    addr1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  }>;
  createdDate: Timestamp;
  lastModifiedDate: Timestamp;
}

export interface NetsuiteInventory {
  id: NonEmptyString<string>;
  item: { id: string; name: string };
  location: { id: string; name: string };
  quantityOnHand: number;
  lastModifiedDate: Timestamp;
}

// Error Classes
export class NetsuiteIntegrationError extends Error {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = 'NetsuiteIntegrationError';
  }
}

export default class NetsuiteIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://rest.netsuite.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!(field) || !data[field as keyof T]) {
        throw new NetsuiteIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  private async paginatedRequest<T>(
    method: 'GET',
    endpoint: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<{ data: T[]; pagination: { total: number; limit: number; offset: number } }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
    });

    const response = await this.request(method, `${endpoint}?${query}`);
    return {
      data: response.items,
      pagination: {
        total: response.totalResults,
        limit: params.limit || 100,
        offset: params.offset || 0,
      },
    };
  }

  public async getProducts(params: { limit?: number; offset?: number; type?: NetsuiteItemType } = {}): Promise<{
    products: NetsuiteProduct[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const query = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.offset && { offset: params.offset.toString() }),
      ...(params.type && { q: `type IS ${params.type}` }),
    });

    try {
      const response = await this.request('GET', `record/v1/item?${query}`);
      return {
        products: response.items,
        pagination: {
          total: response.totalResults,
          limit: params.limit || 100,
          offset: params.offset || 0,
        },
      };
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(data: Omit<NetsuiteProduct, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<NetsuiteProduct> {
    this.validateRequestData(data, ['itemId', 'displayName', 'type']);
    try {
      const response = await this.request('POST', 'record/v1/item', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(params: { limit?: number; offset?: number } = {}): Promise<{
    orders: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/salesOrder', params);
    return {
      orders: response.data,
      pagination: response.pagination
    };
  }

  public async createOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/salesOrder', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getCustomers(params: { limit?: number; offset?: number } = {}): Promise<{
    customers: NetsuiteCustomer[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteCustomer>('GET', 'record/v1/customer', params);
    return {
      customers: response.data,
      pagination: response.pagination
    };
  }

  public async createCustomer(data: Omit<NetsuiteCustomer, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<NetsuiteCustomer> {
    this.validateRequestData(data, ['entityId']);
    try {
      const response = await this.request('POST', 'record/v1/customer', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create customer', { originalError: error });
    }
  }

  public async getInventory(params: { limit?: number; offset?: number } = {}): Promise<{
    inventory: NetsuiteInventory[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteInventory>('GET', 'record/v1/inventoryItem', params);
    return {
      inventory: response.data,
      pagination: response.pagination
    };
  }

  public async createInventory(data: Omit<NetsuiteInventory, 'id' | 'lastModifiedDate'>): Promise<NetsuiteInventory> {
    this.validateRequestData(data, ['item', 'location', 'quantityOnHand']);
    try {
      const response = await this.request('POST', 'record/v1/inventoryItem', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create inventory', { originalError: error });
    }
  }

  public async getSalesOrders(params: { limit?: number; offset?: number } = {}): Promise<{
    salesOrders: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/salesOrder', params);
    return {
      salesOrders: response.data,
      pagination: response.pagination
    };
  }

  public async createSalesOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/salesOrder', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create sales order', { originalError: error });
    }
  }

  public async getInvoices(params: { limit?: number; offset?: number } = {}): Promise<{
    invoices: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/invoice', params);
    return {
      invoices: response.data,
      pagination: response.pagination
    };
  }

  public async createInvoice(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/invoice', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create invoice', { originalError: error });
    }
  }

  public async getPayments(params: { limit?: number; offset?: number } = {}): Promise<{
    payments: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/customerPayment', params);
    return {
      payments: response.data,
      pagination: response.pagination
    };
  }

  public async createPayment(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity']);
    try {
      const response = await this.request('POST', 'record/v1/customerPayment', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create payment', { originalError: error });
    }
  }

  public async getShipments(params: { limit?: number; offset?: number } = {}): Promise<{
    shipments: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/itemFulfillment', params);
    return {
      shipments: response.data,
      pagination: response.pagination
    };
  }

  public async createShipment(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/itemFulfillment', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create shipment', { originalError: error });
    }
  }

  public async getCarriers(): Promise<any[]> {
    try {
      const response = await this.request('GET', 'record/v1/carrier');
      return response.items;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to fetch carriers', { originalError: error });
    }
  }

  public async getRates(data: { orderId: string }): Promise<any[]> {
    this.validateRequestData(data, ['orderId']);
    try {
      const response = await this.request('POST', `record/v1/salesOrder/${data.orderId}/rates`, data);
      return response.items;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to fetch rates', { originalError: error });
    }
  }

  public async getTrackingNumbers(params: { limit?: number; offset?: number } = {}): Promise<{
    trackingNumbers: any[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<any>('GET', 'record/v1/trackingNumber', params);
    return {
      trackingNumbers: response.data,
      pagination: response.pagination
    };
  }

  public async createTrackingNumber(data: any): Promise<any> {
    this.validateRequestData(data, ['trackingNumber']);
    try {
      const response = await this.request('POST', 'record/v1/trackingNumber', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create tracking number', { originalError: error });
    }
  }

  public async getReturns(params: { limit?: number; offset?: number } = {}): Promise<{
    returns: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/returnAuthorization', params);
    return {
      returns: response.data,
      pagination: response.pagination
    };
  }

  public async createReturn(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/returnAuthorization', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create return', { originalError: error });
    }
  }

  public async getWarranties(params: { limit?: number; offset?: number } = {}): Promise<{
    warranties: any[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<any>('GET', 'record/v1/warranty', params);
    return {
      warranties: response.data,
      pagination: response.pagination
    };
  }

  public async createWarranty(data: any): Promise<any> {
    this.validateRequestData(data, ['entity']);
    try {
      const response = await this.request('POST', 'record/v1/warranty', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create warranty', { originalError: error });
    }
  }

  public async getWarrantyItems(params: { limit?: number; offset?: number } = {}): Promise<{
    warrantyItems: any[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<any>('GET', 'record/v1/warrantyItem', params);
    return {
      warrantyItems: response.data,
      pagination: response.pagination
    };
  }

  public async createWarrantyItem(data: any): Promise<any> {
    this.validateRequestData(data, ['item']);
    try {
      const response = await this.request('POST', 'record/v1/warrantyItem', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create warranty item', { originalError: error });
    }
  }

  public async getWorkOrders(params: { limit?: number; offset?: number } = {}): Promise<{
    workOrders: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/workOrder', params);
    return {
      workOrders: response.data,
      pagination: response.pagination
    };
  }

  public async createWorkOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/workOrder', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create work order', { originalError: error });
    }
  }

  public async getWorkOrderItems(params: { limit?: number; offset?: number } = {}): Promise<{
    workOrderItems: any[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<any>('GET', 'record/v1/workOrderItem', params);
    return {
      workOrderItems: response.data,
      pagination: response.pagination
    };
  }

  public async createWorkOrderItem(data: any): Promise<any> {
    this.validateRequestData(data, ['item']);
    try {
      const response = await this.request('POST', 'record/v1/workOrderItem', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create work order item', { originalError: error });
    }
  }

  public async getPurchaseOrders(params: { limit?: number; offset?: number } = {}): Promise<{
    purchaseOrders: NetsuiteOrder[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<NetsuiteOrder>('GET', 'record/v1/purchaseOrder', params);
    return {
      purchaseOrders: response.data,
      pagination: response.pagination
    };
  }

  public async createPurchaseOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder> {
    this.validateRequestData(data, ['entity', 'itemList']);
    try {
      const response = await this.request('POST', 'record/v1/purchaseOrder', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create purchase order', { originalError: error });
    }
  }

  public async getPurchaseOrderItems(params: { limit?: number; offset?: number } = {}): Promise<{
    purchaseOrderItems: any[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await this.paginatedRequest<any>('GET', 'record/v1/purchaseOrderItem', params);
    return {
      purchaseOrderItems: response.data,
      pagination: response.pagination
    };
  }

  public async createPurchaseOrderItem(data: any): Promise<any> {
    this.validateRequestData(data, ['item']);
    try {
      const response = await this.request('POST', 'record/v1/purchaseOrderItem', data);
      return response;
    } catch (error: any) {
      throw new NetsuiteIntegrationError('Failed to create purchase order item', { originalError: error });
    }
  }
}