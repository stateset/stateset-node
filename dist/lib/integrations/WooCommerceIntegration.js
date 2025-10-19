"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WooCommerceIntegrationError = exports.WooCommerceOrderStatus = exports.WooCommerceProductStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var WooCommerceProductStatus;
(function (WooCommerceProductStatus) {
    WooCommerceProductStatus["PUBLISH"] = "publish";
    WooCommerceProductStatus["DRAFT"] = "draft";
    WooCommerceProductStatus["PENDING"] = "pending";
    WooCommerceProductStatus["PRIVATE"] = "private";
})(WooCommerceProductStatus || (exports.WooCommerceProductStatus = WooCommerceProductStatus = {}));
var WooCommerceOrderStatus;
(function (WooCommerceOrderStatus) {
    WooCommerceOrderStatus["PENDING"] = "pending";
    WooCommerceOrderStatus["PROCESSING"] = "processing";
    WooCommerceOrderStatus["ON_HOLD"] = "on-hold";
    WooCommerceOrderStatus["COMPLETED"] = "completed";
    WooCommerceOrderStatus["CANCELLED"] = "cancelled";
    WooCommerceOrderStatus["REFUNDED"] = "refunded";
    WooCommerceOrderStatus["FAILED"] = "failed";
})(WooCommerceOrderStatus || (exports.WooCommerceOrderStatus = WooCommerceOrderStatus = {}));
// Error Classes
class WooCommerceIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'WooCommerceIntegrationError';
    }
}
exports.WooCommerceIntegrationError = WooCommerceIntegrationError;
class WooCommerceIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.woocommerce.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!field || !data[field]) {
                throw new WooCommerceIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.type && { type: params.type }),
            ...(params.page && { page: params.page.toString() }),
            ...(params.per_page && { per_page: params.per_page.toString() }),
        });
        try {
            const response = await this.request('GET', `wc/v3/products?${query}`);
            return {
                products: response.data,
                pagination: {
                    total: parseInt(response.headers['x-wp-total'], 10),
                    page: params.page || 1,
                    per_page: params.per_page || 10,
                    total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
                },
            };
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['name', 'type']);
        try {
            const response = await this.request('POST', 'wc/v3/products', data);
            return response;
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.date_range?.after && { after: params.date_range.after.toISOString() }),
            ...(params.date_range?.before && { before: params.date_range.before.toISOString() }),
            ...(params.page && { page: params.page.toString() }),
            ...(params.per_page && { per_page: params.per_page.toString() }),
        });
        try {
            const response = await this.request('GET', `wc/v3/orders?${query}`);
            return {
                orders: response.data,
                pagination: {
                    total: parseInt(response.headers['x-wp-total'], 10),
                    page: params.page || 1,
                    per_page: params.per_page || 10,
                    total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
                },
            };
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['line_items', 'billing']);
        try {
            const response = await this.request('POST', 'wc/v3/orders', data);
            return response;
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getShipments(params = {}) {
        const query = new URLSearchParams({
            ...(params.order_id && { order_id: params.order_id.toString() }),
            ...(params.page && { page: params.page.toString() }),
            ...(params.per_page && { per_page: params.per_page.toString() }),
        });
        try {
            // Note: WooCommerce core doesn't have a native shipments endpoint; this assumes a shipping plugin
            const response = await this.request('GET', `wc/v3/shipments?${query}`);
            return {
                shipments: response.data,
                pagination: {
                    total: parseInt(response.headers['x-wp-total'], 10),
                    page: params.page || 1,
                    per_page: params.per_page || 10,
                    total_pages: parseInt(response.headers['x-wp-totalpages'], 10),
                },
            };
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to fetch shipments', { originalError: error });
        }
    }
    async createShipment(data) {
        this.validateRequestData(data, ['order_id', 'tracking_number', 'carrier']);
        try {
            // Note: This assumes a shipping plugin endpoint; adjust based on actual plugin
            const response = await this.request('POST', 'wc/v3/shipments', data);
            return response;
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to create shipment', { originalError: error });
        }
    }
    async getCarriers() {
        try {
            // Note: WooCommerce doesn't have a native carriers endpoint; this assumes a shipping plugin
            const response = await this.request('GET', 'wc/v3/shipping/carriers');
            return response.data;
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to fetch carriers', { originalError: error });
        }
    }
    async getRates(data) {
        this.validateRequestData(data, ['order_id', 'shipping']);
        try {
            // Note: WooCommerce rates typically come from shipping plugins; adjust endpoint accordingly
            const response = await this.request('POST', `wc/v3/orders/${data.order_id}/shipping/rates`, data);
            return response.data;
        }
        catch (error) {
            throw new WooCommerceIntegrationError('Failed to fetch rates', { originalError: error });
        }
    }
}
exports.default = WooCommerceIntegration;
//# sourceMappingURL=WooCommerceIntegration.js.map