"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigCommerceIntegrationError = exports.BigCommerceOrderStatus = exports.BigCommerceProductStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var BigCommerceProductStatus;
(function (BigCommerceProductStatus) {
    BigCommerceProductStatus[BigCommerceProductStatus["ACTIVE"] = 0] = "ACTIVE";
    BigCommerceProductStatus[BigCommerceProductStatus["DISABLED"] = 1] = "DISABLED";
    BigCommerceProductStatus[BigCommerceProductStatus["DRAFT"] = 2] = "DRAFT";
})(BigCommerceProductStatus || (exports.BigCommerceProductStatus = BigCommerceProductStatus = {}));
var BigCommerceOrderStatus;
(function (BigCommerceOrderStatus) {
    BigCommerceOrderStatus[BigCommerceOrderStatus["PENDING"] = 1] = "PENDING";
    BigCommerceOrderStatus[BigCommerceOrderStatus["AWAITING_PAYMENT"] = 2] = "AWAITING_PAYMENT";
    BigCommerceOrderStatus[BigCommerceOrderStatus["AWAITING_FULFILLMENT"] = 3] = "AWAITING_FULFILLMENT";
    BigCommerceOrderStatus[BigCommerceOrderStatus["AWAITING_SHIPMENT"] = 4] = "AWAITING_SHIPMENT";
    BigCommerceOrderStatus[BigCommerceOrderStatus["PARTIALLY_SHIPPED"] = 7] = "PARTIALLY_SHIPPED";
    BigCommerceOrderStatus[BigCommerceOrderStatus["SHIPPED"] = 9] = "SHIPPED";
    BigCommerceOrderStatus[BigCommerceOrderStatus["COMPLETED"] = 10] = "COMPLETED";
    BigCommerceOrderStatus[BigCommerceOrderStatus["CANCELLED"] = 11] = "CANCELLED";
})(BigCommerceOrderStatus || (exports.BigCommerceOrderStatus = BigCommerceOrderStatus = {}));
// Error Classes
class BigCommerceIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'BigCommerceIntegrationError';
    }
}
exports.BigCommerceIntegrationError = BigCommerceIntegrationError;
class BigCommerceIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.bigcommerce.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!field || !data[field]) {
                throw new BigCommerceIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page && { page: params.page.toString() }),
            ...(params.include && { include: params.include }),
        });
        try {
            const response = await this.request('GET', `catalog/products?${query}`);
            return {
                products: response.data,
                pagination: {
                    total: response.meta.pagination.total,
                    page: response.meta.pagination.current_page,
                    limit: response.meta.pagination.per_page,
                    total_pages: response.meta.pagination.total_pages,
                },
            };
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['name', 'type', 'price', 'weight']);
        try {
            const response = await this.request('POST', 'catalog/products', data);
            return response.data;
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
        const query = new URLSearchParams({
            ...(params.status_id && { status_id: params.status_id.toString() }),
            ...(params.date_range?.min_date && {
                min_date_created: params.date_range.min_date.toISOString(),
            }),
            ...(params.date_range?.max_date && {
                max_date_created: params.date_range.max_date.toISOString(),
            }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page && { page: params.page.toString() }),
        });
        try {
            const response = await this.request('GET', `orders?${query}`);
            return {
                orders: response.data,
                pagination: {
                    total: response.meta.pagination.total,
                    page: response.meta.pagination.current_page,
                    limit: response.meta.pagination.per_page,
                    total_pages: response.meta.pagination.total_pages,
                },
            };
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['products', 'billing_address']);
        try {
            const response = await this.request('POST', 'orders', data);
            return response.data;
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getShipments(params = {}) {
        const query = new URLSearchParams({
            ...(params.order_id && { order_id: params.order_id.toString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page && { page: params.page.toString() }),
        });
        try {
            const response = await this.request('GET', `orders/shipments?${query}`);
            return {
                shipments: response.data,
                pagination: {
                    total: response.meta.pagination.total,
                    page: response.meta.pagination.current_page,
                    limit: response.meta.pagination.per_page,
                    total_pages: response.meta.pagination.total_pages,
                },
            };
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to fetch shipments', { originalError: error });
        }
    }
    async createShipment(data) {
        this.validateRequestData(data, ['order_id', 'tracking_number', 'items']);
        try {
            const response = await this.request('POST', `orders/${data.order_id}/shipments`, data);
            return response.data;
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to create shipment', { originalError: error });
        }
    }
    async getCarriers() {
        try {
            const response = await this.request('GET', 'shipping/carriers');
            return response.data;
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to fetch carriers', { originalError: error });
        }
    }
    async getRates(data) {
        this.validateRequestData(data, ['order_id', 'shipping_address']);
        try {
            const response = await this.request('POST', `orders/${data.order_id}/shipping_rates`, {
                shipping_address: data.shipping_address,
            });
            return response.data;
        }
        catch (error) {
            throw new BigCommerceIntegrationError('Failed to fetch shipping rates', {
                originalError: error,
            });
        }
    }
}
exports.default = BigCommerceIntegration;
//# sourceMappingURL=BigCommerceIntegration.js.map