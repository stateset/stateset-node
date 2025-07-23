"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetsuiteIntegrationError = exports.NetsuiteItemType = exports.NetsuiteRecordStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var NetsuiteRecordStatus;
(function (NetsuiteRecordStatus) {
    NetsuiteRecordStatus["PENDING"] = "pending";
    NetsuiteRecordStatus["APPROVED"] = "approved";
    NetsuiteRecordStatus["REJECTED"] = "rejected";
    NetsuiteRecordStatus["CLOSED"] = "closed";
    NetsuiteRecordStatus["CANCELLED"] = "cancelled";
})(NetsuiteRecordStatus || (exports.NetsuiteRecordStatus = NetsuiteRecordStatus = {}));
var NetsuiteItemType;
(function (NetsuiteItemType) {
    NetsuiteItemType["INVENTORY"] = "InventoryItem";
    NetsuiteItemType["NON_INVENTORY"] = "NonInventoryItem";
    NetsuiteItemType["SERVICE"] = "ServiceItem";
    NetsuiteItemType["ASSEMBLY"] = "AssemblyItem";
})(NetsuiteItemType || (exports.NetsuiteItemType = NetsuiteItemType = {}));
// Error Classes
class NetsuiteIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'NetsuiteIntegrationError';
    }
}
exports.NetsuiteIntegrationError = NetsuiteIntegrationError;
class NetsuiteIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://rest.netsuite.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!(field) || !data[field]) {
                throw new NetsuiteIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async paginatedRequest(method, endpoint, params = {}) {
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
    async getProducts(params = {}) {
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
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['itemId', 'displayName', 'type']);
        try {
            const response = await this.request('POST', 'record/v1/item', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/salesOrder', params);
        return {
            orders: response.data,
            pagination: response.pagination
        };
    }
    async createOrder(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/salesOrder', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getCustomers(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/customer', params);
        return {
            customers: response.data,
            pagination: response.pagination
        };
    }
    async createCustomer(data) {
        this.validateRequestData(data, ['entityId']);
        try {
            const response = await this.request('POST', 'record/v1/customer', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create customer', { originalError: error });
        }
    }
    async getInventory(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/inventoryItem', params);
        return {
            inventory: response.data,
            pagination: response.pagination
        };
    }
    async createInventory(data) {
        this.validateRequestData(data, ['item', 'location', 'quantityOnHand']);
        try {
            const response = await this.request('POST', 'record/v1/inventoryItem', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create inventory', { originalError: error });
        }
    }
    async getSalesOrders(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/salesOrder', params);
        return {
            salesOrders: response.data,
            pagination: response.pagination
        };
    }
    async createSalesOrder(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/salesOrder', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create sales order', { originalError: error });
        }
    }
    async getInvoices(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/invoice', params);
        return {
            invoices: response.data,
            pagination: response.pagination
        };
    }
    async createInvoice(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/invoice', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create invoice', { originalError: error });
        }
    }
    async getPayments(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/customerPayment', params);
        return {
            payments: response.data,
            pagination: response.pagination
        };
    }
    async createPayment(data) {
        this.validateRequestData(data, ['entity']);
        try {
            const response = await this.request('POST', 'record/v1/customerPayment', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create payment', { originalError: error });
        }
    }
    async getShipments(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/itemFulfillment', params);
        return {
            shipments: response.data,
            pagination: response.pagination
        };
    }
    async createShipment(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/itemFulfillment', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create shipment', { originalError: error });
        }
    }
    async getCarriers() {
        try {
            const response = await this.request('GET', 'record/v1/carrier');
            return response.items;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to fetch carriers', { originalError: error });
        }
    }
    async getRates(data) {
        this.validateRequestData(data, ['orderId']);
        try {
            const response = await this.request('POST', `record/v1/salesOrder/${data.orderId}/rates`, data);
            return response.items;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to fetch rates', { originalError: error });
        }
    }
    async getTrackingNumbers(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/trackingNumber', params);
        return {
            trackingNumbers: response.data,
            pagination: response.pagination
        };
    }
    async createTrackingNumber(data) {
        this.validateRequestData(data, ['trackingNumber']);
        try {
            const response = await this.request('POST', 'record/v1/trackingNumber', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create tracking number', { originalError: error });
        }
    }
    async getReturns(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/returnAuthorization', params);
        return {
            returns: response.data,
            pagination: response.pagination
        };
    }
    async createReturn(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/returnAuthorization', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create return', { originalError: error });
        }
    }
    async getWarranties(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/warranty', params);
        return {
            warranties: response.data,
            pagination: response.pagination
        };
    }
    async createWarranty(data) {
        this.validateRequestData(data, ['entity']);
        try {
            const response = await this.request('POST', 'record/v1/warranty', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create warranty', { originalError: error });
        }
    }
    async getWarrantyItems(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/warrantyItem', params);
        return {
            warrantyItems: response.data,
            pagination: response.pagination
        };
    }
    async createWarrantyItem(data) {
        this.validateRequestData(data, ['item']);
        try {
            const response = await this.request('POST', 'record/v1/warrantyItem', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create warranty item', { originalError: error });
        }
    }
    async getWorkOrders(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/workOrder', params);
        return {
            workOrders: response.data,
            pagination: response.pagination
        };
    }
    async createWorkOrder(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/workOrder', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create work order', { originalError: error });
        }
    }
    async getWorkOrderItems(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/workOrderItem', params);
        return {
            workOrderItems: response.data,
            pagination: response.pagination
        };
    }
    async createWorkOrderItem(data) {
        this.validateRequestData(data, ['item']);
        try {
            const response = await this.request('POST', 'record/v1/workOrderItem', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create work order item', { originalError: error });
        }
    }
    async getPurchaseOrders(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/purchaseOrder', params);
        return {
            purchaseOrders: response.data,
            pagination: response.pagination
        };
    }
    async createPurchaseOrder(data) {
        this.validateRequestData(data, ['entity', 'itemList']);
        try {
            const response = await this.request('POST', 'record/v1/purchaseOrder', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create purchase order', { originalError: error });
        }
    }
    async getPurchaseOrderItems(params = {}) {
        const response = await this.paginatedRequest('GET', 'record/v1/purchaseOrderItem', params);
        return {
            purchaseOrderItems: response.data,
            pagination: response.pagination
        };
    }
    async createPurchaseOrderItem(data) {
        this.validateRequestData(data, ['item']);
        try {
            const response = await this.request('POST', 'record/v1/purchaseOrderItem', data);
            return response;
        }
        catch (error) {
            throw new NetsuiteIntegrationError('Failed to create purchase order item', { originalError: error });
        }
    }
}
exports.default = NetsuiteIntegration;
//# sourceMappingURL=NetsuiteIntegration.js.map