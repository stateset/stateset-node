"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonIntegrationError = exports.AmazonFulfillmentMethod = exports.AmazonOrderStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var AmazonOrderStatus;
(function (AmazonOrderStatus) {
    AmazonOrderStatus["PENDING"] = "Pending";
    AmazonOrderStatus["UN_SHIPPED"] = "Unshipped";
    AmazonOrderStatus["PARTIALLY_SHIPPED"] = "PartiallyShipped";
    AmazonOrderStatus["SHIPPED"] = "Shipped";
    AmazonOrderStatus["CANCELED"] = "Canceled";
    AmazonOrderStatus["UNFULFILLABLE"] = "Unfulfillable";
})(AmazonOrderStatus || (exports.AmazonOrderStatus = AmazonOrderStatus = {}));
var AmazonFulfillmentMethod;
(function (AmazonFulfillmentMethod) {
    AmazonFulfillmentMethod["FBA"] = "FBA";
    AmazonFulfillmentMethod["FBM"] = "FBM"; // Fulfillment by Merchant
})(AmazonFulfillmentMethod || (exports.AmazonFulfillmentMethod = AmazonFulfillmentMethod = {}));
// Error Classes
class AmazonIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'AmazonIntegrationError';
    }
}
exports.AmazonIntegrationError = AmazonIntegrationError;
class AmazonIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.amazon.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!(field) || !data[field]) {
                throw new AmazonIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
        const query = new URLSearchParams({
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.status && { status: params.status }),
            ...(params.category && { category: params.category }),
        });
        try {
            const response = await this.request('GET', `products?${query.toString()}`);
            return {
                products: response.products,
                pagination: response.pagination || { total: response.products.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['sku', 'title', 'price']);
        try {
            return await this.request('POST', 'products', data);
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async getOrders(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.fulfillment_method && { fulfillment_method: params.fulfillment_method }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `orders?${query.toString()}`);
            return {
                orders: response.orders,
                pagination: response.pagination || { total: response.orders.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['items', 'shipping_address']);
        try {
            return await this.request('POST', 'orders', data);
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async getInventory(params = {}) {
        const query = new URLSearchParams({
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
            ...(params.sku && { sku: params.sku }),
        });
        try {
            const response = await this.request('GET', `inventory?${query.toString()}`);
            return {
                inventory: response.inventory,
                pagination: response.pagination || { total: response.inventory.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to fetch inventory', { originalError: error });
        }
    }
    async createInventory(data) {
        this.validateRequestData(data, ['sku', 'quantity_available']);
        if (data.quantity_available < 0) {
            throw new AmazonIntegrationError('Quantity available cannot be negative');
        }
        try {
            return await this.request('POST', 'inventory', data);
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to create inventory', { originalError: error });
        }
    }
    async getReviews(params = {}) {
        const query = new URLSearchParams({
            ...(params.asin && { asin: params.asin }),
            ...(params.rating && { rating: params.rating.toString() }),
            ...(params.date_range?.from && { from: params.date_range.from.toISOString() }),
            ...(params.date_range?.to && { to: params.date_range.to.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.offset && { offset: params.offset.toString() }),
        });
        try {
            const response = await this.request('GET', `reviews?${query.toString()}`);
            return {
                reviews: response.reviews,
                pagination: response.pagination || { total: response.reviews.length, limit: params.limit || 100, offset: params.offset || 0 },
            };
        }
        catch (error) {
            throw new AmazonIntegrationError('Failed to fetch reviews', { originalError: error });
        }
    }
    async createReview(data) {
        this.validateRequestData(data, ['asin', 'rating', 'title', 'content', 'reviewer_id']);
        try {
            return await this.request('POST', 'reviews', data);
        }
        catch (error) {
            return error;
        }
    }
}
exports.default = AmazonIntegration;
//# sourceMappingURL=AmazonIntegration.js.map