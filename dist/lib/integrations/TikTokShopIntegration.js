"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokShopIntegrationError = exports.TikTokFulfillmentStatus = exports.TikTokOrderStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var TikTokOrderStatus;
(function (TikTokOrderStatus) {
    TikTokOrderStatus["PENDING"] = "PENDING";
    TikTokOrderStatus["PROCESSING"] = "PROCESSING";
    TikTokOrderStatus["SHIPPED"] = "SHIPPED";
    TikTokOrderStatus["DELIVERED"] = "DELIVERED";
    TikTokOrderStatus["CANCELLED"] = "CANCELLED";
    TikTokOrderStatus["RETURNED"] = "RETURNED";
})(TikTokOrderStatus || (exports.TikTokOrderStatus = TikTokOrderStatus = {}));
var TikTokFulfillmentStatus;
(function (TikTokFulfillmentStatus) {
    TikTokFulfillmentStatus["PENDING"] = "PENDING";
    TikTokFulfillmentStatus["PROCESSING"] = "PROCESSING";
    TikTokFulfillmentStatus["SHIPPED"] = "SHIPPED";
    TikTokFulfillmentStatus["DELIVERED"] = "DELIVERED";
    TikTokFulfillmentStatus["CANCELLED"] = "CANCELLED";
})(TikTokFulfillmentStatus || (exports.TikTokFulfillmentStatus = TikTokFulfillmentStatus = {}));
// Error Classes
class TikTokShopIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'TikTokShopIntegrationError';
    }
}
exports.TikTokShopIntegrationError = TikTokShopIntegrationError;
class TikTokShopIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.tiktokshop.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!(field) || !data[field]) {
                throw new TikTokShopIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.category_id && { category_id: params.category_id }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `products?${query}`);
            return {
                products: response.products,
                pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['sku', 'name', 'price', 'images', 'category_id']);
        try {
            return await this.request('POST', 'products', data);
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `orders?${query}`);
            return {
                orders: response.orders,
                pagination: response.pagination || { total: response.orders.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['items', 'shipping_address', 'total_amount']);
        try {
            return await this.request('POST', 'orders', data);
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getCustomers(params = {}) {
        const query = new URLSearchParams({
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.search && { search: params.search }),
        });
        try {
            const response = await this.request('GET', `customers?${query}`);
            return {
                customers: response.customers,
                pagination: response.pagination || { total: response.customers.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to fetch customers', { originalError: error });
        }
    }
    async createCustomer(data) {
        this.validateRequestData(data, ['name']);
        try {
            return await this.request('POST', 'customers', data);
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to create customer', { originalError: error });
        }
    }
    async getReviews(params = {}) {
        const query = new URLSearchParams({
            ...(params.product_id && { product_id: params.product_id }),
            ...(params.rating && { rating: params.rating.toString() }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `reviews?${query}`);
            return {
                reviews: response.reviews,
                pagination: response.pagination || { total: response.reviews.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to fetch reviews', { originalError: error });
        }
    }
    async createReview(data) {
        this.validateRequestData(data, ['product_id', 'order_id', 'rating', 'reviewer_id']);
        try {
            return await this.request('POST', 'reviews', data);
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to create review', { originalError: error });
        }
    }
    async getFulfillments(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.order_id && { order_id: params.order_id }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `fulfillments?${query}`);
            return {
                fulfillments: response.fulfillments,
                pagination: response.pagination || { total: response.fulfillments.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to fetch fulfillments', { originalError: error });
        }
    }
    async createFulfillment(data) {
        this.validateRequestData(data, ['order_id', 'status']);
        try {
            return await this.request('POST', 'fulfillments', data);
        }
        catch (error) {
            throw new TikTokShopIntegrationError('Failed to create fulfillment', { originalError: error });
        }
    }
}
exports.default = TikTokShopIntegration;
//# sourceMappingURL=TikTokShopIntegration.js.map