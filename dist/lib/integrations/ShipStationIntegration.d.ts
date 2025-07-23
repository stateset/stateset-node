import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum ShipStationOrderStatus {
    AWAITING_PAYMENT = "awaiting_payment",
    AWAITING_SHIPMENT = "awaiting_shipment",
    SHIPPED = "shipped",
    ON_HOLD = "on_hold",
    CANCELLED = "cancelled"
}
export declare enum ShipStationShipmentStatus {
    SHIPPED = "shipped",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    EXCEPTION = "exception"
}
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
export declare class ShipStationIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class ShipStationIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    getProducts(params?: {
        sku?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        products: ShipStationProduct[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            pageSize: number;
        };
    }>;
    createProduct(data: Omit<ShipStationProduct, 'productId' | 'createdDate' | 'modifiedDate'>): Promise<ShipStationProduct>;
    getOrders(params?: {
        orderStatus?: ShipStationOrderStatus;
        orderDateStart?: Date;
        orderDateEnd?: Date;
        page?: number;
        pageSize?: number;
    }): Promise<{
        orders: ShipStationOrder[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            pageSize: number;
        };
    }>;
    createOrder(data: Omit<ShipStationOrder, 'orderId' | 'createDate' | 'modifyDate'>): Promise<ShipStationOrder>;
    getShipments(params?: {
        orderId?: number;
        shipmentStatus?: ShipStationShipmentStatus;
        shipDateStart?: Date;
        shipDateEnd?: Date;
        page?: number;
        pageSize?: number;
    }): Promise<{
        shipments: ShipStationShipment[];
        pagination: {
            total: number;
            page: number;
            pages: number;
            pageSize: number;
        };
    }>;
    createShipment(data: Omit<ShipStationShipment, 'shipmentId' | 'createdDate'>): Promise<ShipStationShipment>;
    getCarriers(): Promise<ShipStationCarrier[]>;
    getRates(data: {
        carrierCode: string;
        serviceCode?: string;
        fromPostalCode: string;
        toPostalCode: string;
        weight: {
            value: number;
            units: 'pounds' | 'ounces' | 'grams';
        };
        dimensions?: {
            length: number;
            width: number;
            height: number;
            units: 'inches' | 'centimeters';
        };
    }): Promise<ShipStationRate[]>;
}
export {};
//# sourceMappingURL=ShipStationIntegration.d.ts.map