"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyIntegrationError = exports.ShopifyInventoryAdjustmentType = exports.ShopifyOrderStatus = exports.ShopifyProductStatus = void 0;
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
// Enums
var ShopifyProductStatus;
(function (ShopifyProductStatus) {
    ShopifyProductStatus["ACTIVE"] = "active";
    ShopifyProductStatus["DRAFT"] = "draft";
    ShopifyProductStatus["ARCHIVED"] = "archived";
})(ShopifyProductStatus || (exports.ShopifyProductStatus = ShopifyProductStatus = {}));
var ShopifyOrderStatus;
(function (ShopifyOrderStatus) {
    ShopifyOrderStatus["OPEN"] = "open";
    ShopifyOrderStatus["CLOSED"] = "closed";
    ShopifyOrderStatus["CANCELLED"] = "cancelled";
    ShopifyOrderStatus["PENDING"] = "pending";
})(ShopifyOrderStatus || (exports.ShopifyOrderStatus = ShopifyOrderStatus = {}));
var ShopifyInventoryAdjustmentType;
(function (ShopifyInventoryAdjustmentType) {
    ShopifyInventoryAdjustmentType["INCREASE"] = "increase";
    ShopifyInventoryAdjustmentType["DECREASE"] = "decrease";
    ShopifyInventoryAdjustmentType["SET"] = "set";
})(ShopifyInventoryAdjustmentType || (exports.ShopifyInventoryAdjustmentType = ShopifyInventoryAdjustmentType = {}));
// Error Classes
class ShopifyIntegrationError extends Error {
    details;
    constructor(message, details) {
        super(message);
        this.details = details;
        this.name = 'ShopifyIntegrationError';
    }
}
exports.ShopifyIntegrationError = ShopifyIntegrationError;
class ShopifyIntegration extends BaseIntegration_1.default {
    constructor(apiKey, baseUrl = 'https://api.shopify.com') {
        super(apiKey, baseUrl);
    }
    validateRequestData(data, requiredFields) {
        requiredFields.forEach(field => {
            if (!(field) || !data[field]) {
                throw new ShopifyIntegrationError(`Missing required field: ${field}`);
            }
        });
    }
    async getProducts(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page_info && { page_info: params.page_info }),
            ...(params.fields && { fields: params.fields.join(',') }),
        });
        try {
            const response = await this.request('GET', `products?${query}`);
            return {
                products: response.products,
                pagination: { limit: params.limit || 50, page_info: response.next_page_info },
            };
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to fetch products', { originalError: error });
        }
    }
    async createProduct(data) {
        this.validateRequestData(data, ['title']);
        try {
            const response = await this.request('POST', 'products', { product: data });
            return response.product;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to create product', { originalError: error });
        }
    }
    async updateProduct(id, data) {
        try {
            const response = await this.request('PUT', `products/${id}`, { product: data });
            return response.product;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to update product', { originalError: error, productId: id });
        }
    }
    async deleteProduct(id) {
        try {
            await this.request('DELETE', `products/${id}`);
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to delete product', { originalError: error, productId: id });
        }
    }
    async getOrders(params = {}) {
        const query = new URLSearchParams({
            ...(params.status && { status: params.status }),
            ...(params.date_range?.since && { created_at_min: params.date_range.since.toISOString() }),
            ...(params.date_range?.until && { created_at_max: params.date_range.until.toISOString() }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page_info && { page_info: params.page_info }),
        });
        try {
            const response = await this.request('GET', `orders?${query}`);
            return {
                orders: response.orders,
                pagination: { limit: params.limit || 50, page_info: response.next_page_info },
            };
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to fetch orders', { originalError: error });
        }
    }
    async createOrder(data) {
        this.validateRequestData(data, ['line_items']);
        try {
            const response = await this.request('POST', 'orders', { order: data });
            return response.order;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to create order', { originalError: error });
        }
    }
    async updateOrder(id, data) {
        try {
            const response = await this.request('PUT', `orders/${id}`, { order: data });
            return response.order;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to update order', { originalError: error, orderId: id });
        }
    }
    async deleteOrder(id) {
        try {
            await this.request('DELETE', `orders/${id}`);
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to delete order', { originalError: error, orderId: id });
        }
    }
    async getCustomers(params = {}) {
        const query = new URLSearchParams({
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page_info && { page_info: params.page_info }),
            ...(params.search && { query: params.search }),
        });
        try {
            const response = await this.request('GET', `customers?${query}`);
            return {
                customers: response.customers,
                pagination: { limit: params.limit || 50, page_info: response.next_page_info },
            };
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to fetch customers', { originalError: error });
        }
    }
    async createCustomer(data) {
        this.validateRequestData(data, ['email']);
        try {
            const response = await this.request('POST', 'customers', { customer: data });
            return response.customer;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to create customer', { originalError: error });
        }
    }
    async updateCustomer(id, data) {
        try {
            const response = await this.request('PUT', `customers/${id}`, { customer: data });
            return response.customer;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to update customer', { originalError: error, customerId: id });
        }
    }
    async deleteCustomer(id) {
        try {
            await this.request('DELETE', `customers/${id}`);
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to delete customer', { originalError: error, customerId: id });
        }
    }
    async getInventory(params = {}) {
        const query = new URLSearchParams({
            ...(params.location_id && { location_ids: params.location_id }),
            ...(params.limit && { limit: params.limit.toString() }),
            ...(params.page_info && { page_info: params.page_info }),
        });
        try {
            const response = await this.request('GET', `inventory_items?${query}`);
            return {
                inventory_items: response.inventory_items,
                pagination: { limit: params.limit || 50, page_info: response.next_page_info },
            };
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to fetch inventory', { originalError: error });
        }
    }
    async createInventory(data) {
        this.validateRequestData(data, ['variant_id', 'location_id', 'available']);
        if (data.available < 0) {
            throw new ShopifyIntegrationError('Available quantity cannot be negative');
        }
        try {
            const response = await this.request('POST', 'inventory_levels/set', { inventory_item: data });
            return response.inventory_item;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to create inventory', { originalError: error });
        }
    }
    async updateInventory(id, data) {
        this.validateRequestData(data, ['available']);
        if (data.available < 0) {
            throw new ShopifyIntegrationError('Available quantity cannot be negative');
        }
        try {
            const endpoint = data.adjustment_type === ShopifyInventoryAdjustmentType.SET
                ? 'inventory_levels/set'
                : 'inventory_levels/adjust';
            const response = await this.request('PUT', endpoint, { inventory_item_id: id, ...data });
            return response.inventory_item;
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to update inventory', { originalError: error, inventoryItemId: id });
        }
    }
    async deleteInventory(id) {
        try {
            await this.request('DELETE', `inventory_levels/${id}`);
        }
        catch (error) {
            throw new ShopifyIntegrationError('Failed to delete inventory', { originalError: error, inventoryItemId: id });
        }
    }
}
exports.default = ShopifyIntegration;
//# sourceMappingURL=ShopifyIntegration.js.map