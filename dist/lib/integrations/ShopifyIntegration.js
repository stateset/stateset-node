"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class ShopifyIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.shopify.com');
    }
    async getProducts() {
        return this.request('GET', 'products');
    }
    async createProduct(data) {
        return this.request('POST', 'products', data);
    }
    async updateProduct(id, data) {
        return this.request('PUT', `products/${id}`, data);
    }
    async deleteProduct(id) {
        return this.request('DELETE', `products/${id}`);
    }
    async getOrders() {
        return this.request('GET', 'orders');
    }
    async createOrder(data) {
        return this.request('POST', 'orders', data);
    }
    async updateOrder(id, data) {
        return this.request('PUT', `orders/${id}`, data);
    }
    async deleteOrder(id) {
        return this.request('DELETE', `orders/${id}`);
    }
    async getCustomers() {
        return this.request('GET', 'customers');
    }
    async createCustomer(data) {
        return this.request('POST', 'customers', data);
    }
    async updateCustomer(id, data) {
        return this.request('PUT', `customers/${id}`, data);
    }
    async deleteCustomer(id) {
        return this.request('DELETE', `customers/${id}`);
    }
    async getInventory() {
        return this.request('GET', 'inventory');
    }
    async createInventory(data) {
        return this.request('POST', 'inventory', data);
    }
    async updateInventory(id, data) {
        return this.request('PUT', `inventory/${id}`, data);
    }
    async deleteInventory(id) {
        return this.request('DELETE', `inventory/${id}`);
    }
}
exports.default = ShopifyIntegration;
