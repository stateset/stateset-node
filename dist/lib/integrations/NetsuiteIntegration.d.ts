import BaseIntegration from './BaseIntegration';
type NonEmptyString<T extends string> = T extends '' ? never : T;
type Timestamp = string;
export declare enum NetsuiteRecordStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CLOSED = "closed",
    CANCELLED = "cancelled"
}
export declare enum NetsuiteItemType {
    INVENTORY = "InventoryItem",
    NON_INVENTORY = "NonInventoryItem",
    SERVICE = "ServiceItem",
    ASSEMBLY = "AssemblyItem"
}
export interface NetsuiteProduct {
    id: NonEmptyString<string>;
    itemId: string;
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
    tranId: string;
    status: NetsuiteRecordStatus;
    entity: {
        id: string;
        name: string;
    };
    itemList: Array<{
        item: {
            id: string;
            name: string;
        };
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
    item: {
        id: string;
        name: string;
    };
    location: {
        id: string;
        name: string;
    };
    quantityOnHand: number;
    lastModifiedDate: Timestamp;
}
export declare class NetsuiteIntegrationError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
export default class NetsuiteIntegration extends BaseIntegration {
    constructor(apiKey: NonEmptyString<string>, baseUrl?: string);
    private validateRequestData;
    private paginatedRequest;
    getProducts(params?: {
        limit?: number;
        offset?: number;
        type?: NetsuiteItemType;
    }): Promise<{
        products: NetsuiteProduct[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createProduct(data: Omit<NetsuiteProduct, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<NetsuiteProduct>;
    getOrders(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        orders: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getCustomers(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        customers: NetsuiteCustomer[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createCustomer(data: Omit<NetsuiteCustomer, 'id' | 'createdDate' | 'lastModifiedDate'>): Promise<NetsuiteCustomer>;
    getInventory(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        inventory: NetsuiteInventory[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createInventory(data: Omit<NetsuiteInventory, 'id' | 'lastModifiedDate'>): Promise<NetsuiteInventory>;
    getSalesOrders(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        salesOrders: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createSalesOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getInvoices(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        invoices: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createInvoice(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getPayments(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        payments: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createPayment(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getShipments(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        shipments: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createShipment(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getCarriers(): Promise<any[]>;
    getRates(data: {
        orderId: string;
    }): Promise<any[]>;
    getTrackingNumbers(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        trackingNumbers: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createTrackingNumber(data: any): Promise<any>;
    getReturns(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        returns: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createReturn(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getWarranties(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        warranties: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createWarranty(data: any): Promise<any>;
    getWarrantyItems(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        warrantyItems: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createWarrantyItem(data: any): Promise<any>;
    getWorkOrders(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        workOrders: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createWorkOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getWorkOrderItems(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        workOrderItems: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createWorkOrderItem(data: any): Promise<any>;
    getPurchaseOrders(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        purchaseOrders: NetsuiteOrder[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createPurchaseOrder(data: Omit<NetsuiteOrder, 'id' | 'tranDate'>): Promise<NetsuiteOrder>;
    getPurchaseOrderItems(params?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        purchaseOrderItems: any[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
        };
    }>;
    createPurchaseOrderItem(data: any): Promise<any>;
}
export {};
//# sourceMappingURL=NetsuiteIntegration.d.ts.map