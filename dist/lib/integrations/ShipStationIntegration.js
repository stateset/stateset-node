"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipStationIntegrationError = exports.ShipStationShipmentStatus = exports.ShipStationOrderStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var ShipStationOrderStatus;
(function (ShipStationOrderStatus) {
    ShipStationOrderStatus["AWAITING_PAYMENT"] = "awaiting_payment";
    ShipStationOrderStatus["AWAITING_SHIPMENT"] = "awaiting_shipment";
    ShipStationOrderStatus["SHIPPED"] = "shipped";
    ShipStationOrderStatus["ON_HOLD"] = "on_hold";
    ShipStationOrderStatus["CANCELLED"] = "cancelled";
})(ShipStationOrderStatus || (exports.ShipStationOrderStatus = ShipStationOrderStatus = {}));
var ShipStationShipmentStatus;
(function (ShipStationShipmentStatus) {
    ShipStationShipmentStatus["SHIPPED"] = "shipped";
    ShipStationShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipStationShipmentStatus["DELIVERED"] = "delivered";
    ShipStationShipmentStatus["EXCEPTION"] = "exception";
})(ShipStationShipmentStatus || (exports.ShipStationShipmentStatus = ShipStationShipmentStatus = {}));
// Error Classes
class ShipStationIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ShipStationIntegrationError';
    }
}
exports.ShipStationIntegrationError = ShipStationIntegrationError;
class ShipStationIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://ssapi.shipstation.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!(field) || !data[field]) {
                throw new ShipStationIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
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
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['sku', 'name']);
        try {
            const response = await this.request('POST', 'products', data);
            return response;
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
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
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['orderNumber', 'shipTo', 'items']);
        try {
            const response = await this.request('POST', 'orders/createorder', data);
            return response;
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getShipments(params = {}) {
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
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to fetch shipments', { originalError: error });
        }
    }
    async createShipment(data) {
        this.validateRequestData(data, ['orderId', 'trackingNumber', 'carrierCode', 'serviceCode', 'shipDate']);
        try {
            const response = await this.request('POST', 'shipments/createshipment', data);
            return response;
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to create shipment', { originalError: error });
        }
    }
    async getCarriers() {
        try {
            const response = await this.request('GET', 'carriers');
            return response;
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to fetch carriers', { originalError: error });
        }
    }
    async getRates(data) {
        this.validateRequestData(data, ['carrierCode', 'fromPostalCode', 'toPostalCode', 'weight']);
        try {
            const response = await this.request('POST', 'shipments/getrates', data);
            return response;
        }
        catch (error) {
            throw new ShipStationIntegrationError('Failed to fetch rates', { originalError: error });
        }
    }
}
exports.default = ShipStationIntegration;
//# sourceMappingURL=ShipStationIntegration.js.map