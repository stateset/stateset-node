import BaseIntegration from './BaseIntegration';

// Utility Types
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string; // ISO 8601 format expected

// Enums
export enum ShipStationOrderStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  AWAITING_SHIPMENT = 'awaiting_shipment',
  SHIPPED = 'shipped',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum ShipStationShipmentStatus {
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  EXCEPTION = 'exception',
}

// Core Interfaces
export interface ShipStationProduct {
  productId: number;
  sku: NonEmptyString<string>;
  name: string;
  price: number;
  defaultCost: number;
  weight?: {
    value: number;
    units: 'pounds' | 'ounces' | 'grams';
  };
  dimensions?: {
    length: number;
    width: number;
    height: number;
    units: 'inches' | 'centimeters';
  };
  active: boolean;
  createdDate: Timestamp;
  modifiedDate: Timestamp;
}

export interface ShipStationOrder {
  orderId: number;
  orderNumber: string;
  orderStatus: ShipStationOrderStatus;
  orderDate: Timestamp;
  customer: {
    customerId: number;
    name: string;
    email: string;
  };
  shipTo: {
    name: string;
    street1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    lineItemKey?: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  orderTotal: number;
  createDate: Timestamp;
  modifyDate: Timestamp;
}

export interface ShipStationShipment {
  shipmentId: number;
  orderId: number;
  trackingNumber: string;
  carrierCode: string;
  serviceCode: string;
  shipDate: Timestamp;
  status: ShipStationShipmentStatus;
  shipmentCost: number;
  items: Array<{
    orderItemId: number;
    quantity: number;
  }>;
  createdDate: Timestamp;
}

export interface ShipStationCarrier {
  carrierCode: string;
  name: string;
  services: Array<{
    code: string;
    name: string;
    domestic: boolean;
    international: boolean;
  }>;
}

export interface ShipStationRate {
  carrierCode: string;
  serviceCode: string;
  totalCharges: number;
  estimatedDeliveryDate?: Timestamp;
}

// Error Classes
export class ShipStationIntegrationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ShipStationIntegrationError';
  }
}

export default class ShipStationIntegration extends BaseIntegration {
  constructor(apiKey: NonEmptyString<string>, baseUrl: string = 'https://ssapi.shipstation.com') {
    super(apiKey, baseUrl);
  }

  private validateRequestData<T>(data: T, requiredFields: string[]): void {
    requiredFields.forEach(field => {
      if (!field || !data[field as keyof T]) {
        throw new ShipStationIntegrationError(`Missing required field: ${field}`);
      }
    });
  }

  public async getProducts(
    params: {
      sku?: string;
      page?: number;
      pageSize?: number; // ShipStation caps at 500
    } = {}
  ): Promise<{
    products: ShipStationProduct[];
    pagination: { total: number; page: number; pages: number; pageSize: number };
  }> {
    const query = new URLSearchParams({
      ...(params.sku && { sku: params.sku }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.pageSize && { pageSize: params.pageSize.toString() }),
    });

    try {
      const response = await this.request('GET', `products?${query}`);
      return {
        products: response.products,
        pagination: {
          total: response.total,
          page: response.page,
          pages: response.pages,
          pageSize: params.pageSize || 100,
        },
      };
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to fetch products', { originalError: error });
    }
  }

  public async createProduct(
    data: Omit<ShipStationProduct, 'productId' | 'createdDate' | 'modifiedDate'>
  ): Promise<ShipStationProduct> {
    this.validateRequestData(data, ['sku', 'name']);
    try {
      const response = await this.request('POST', 'products', data);
      return response;
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to create product', { originalError: error });
    }
  }

  public async getOrders(
    params: {
      orderStatus?: ShipStationOrderStatus;
      orderDateStart?: Date;
      orderDateEnd?: Date;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{
    orders: ShipStationOrder[];
    pagination: { total: number; page: number; pages: number; pageSize: number };
  }> {
    const query = new URLSearchParams({
      ...(params.orderStatus && { orderStatus: params.orderStatus }),
      ...(params.orderDateStart && { orderDateStart: params.orderDateStart.toISOString() }),
      ...(params.orderDateEnd && { orderDateEnd: params.orderDateEnd.toISOString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.pageSize && { pageSize: params.pageSize.toString() }),
    });

    try {
      const response = await this.request('GET', `orders?${query}`);
      return {
        orders: response.orders,
        pagination: {
          total: response.total,
          page: response.page,
          pages: response.pages,
          pageSize: params.pageSize || 100,
        },
      };
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to fetch orders', { originalError: error });
    }
  }

  public async createOrder(
    data: Omit<ShipStationOrder, 'orderId' | 'createDate' | 'modifyDate'>
  ): Promise<ShipStationOrder> {
    this.validateRequestData(data, ['orderNumber', 'shipTo', 'items']);
    try {
      const response = await this.request('POST', 'orders/createorder', data);
      return response;
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to create order', { originalError: error });
    }
  }

  public async getShipments(
    params: {
      orderId?: number;
      shipmentStatus?: ShipStationShipmentStatus;
      shipDateStart?: Date;
      shipDateEnd?: Date;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{
    shipments: ShipStationShipment[];
    pagination: { total: number; page: number; pages: number; pageSize: number };
  }> {
    const query = new URLSearchParams({
      ...(params.orderId && { orderId: params.orderId.toString() }),
      ...(params.shipmentStatus && { shipmentStatus: params.shipmentStatus }),
      ...(params.shipDateStart && { shipDateStart: params.shipDateStart.toISOString() }),
      ...(params.shipDateEnd && { shipDateEnd: params.shipDateEnd.toISOString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.pageSize && { pageSize: params.pageSize.toString() }),
    });

    try {
      const response = await this.request('GET', `shipments?${query}`);
      return {
        shipments: response.shipments,
        pagination: {
          total: response.total,
          page: response.page,
          pages: response.pages,
          pageSize: params.pageSize || 100,
        },
      };
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to fetch shipments', { originalError: error });
    }
  }

  public async createShipment(
    data: Omit<ShipStationShipment, 'shipmentId' | 'createdDate'>
  ): Promise<ShipStationShipment> {
    this.validateRequestData(data, [
      'orderId',
      'trackingNumber',
      'carrierCode',
      'serviceCode',
      'shipDate',
    ]);
    try {
      const response = await this.request('POST', 'shipments/createshipment', data);
      return response;
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to create shipment', { originalError: error });
    }
  }

  public async getCarriers(): Promise<ShipStationCarrier[]> {
    try {
      const response = await this.request('GET', 'carriers');
      return response;
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to fetch carriers', { originalError: error });
    }
  }

  public async getRates(data: {
    carrierCode: string;
    serviceCode?: string;
    fromPostalCode: string;
    toPostalCode: string;
    weight: { value: number; units: 'pounds' | 'ounces' | 'grams' };
    dimensions?: { length: number; width: number; height: number; units: 'inches' | 'centimeters' };
  }): Promise<ShipStationRate[]> {
    this.validateRequestData(data, ['carrierCode', 'fromPostalCode', 'toPostalCode', 'weight']);
    try {
      const response = await this.request('POST', 'shipments/getrates', data);
      return response;
    } catch (error: any) {
      throw new ShipStationIntegrationError('Failed to fetch rates', { originalError: error });
    }
  }
}
