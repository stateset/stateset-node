"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class TikTokShopIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.tiktokshop.com');
    }
    async getProducts() {
        return this.request('GET', 'products');
    }
    async createProduct(data) {
        return this.request('POST', 'products', data);
    }
    async getOrders() {
        return this.request('GET', 'orders');
    }
    async createOrder(data) {
        return this.request('POST', 'orders', data);
    }
    async getCustomers() {
        return this.request('GET', 'customers');
    }
    async createCustomer(data) {
        return this.request('POST', 'customers', data);
    }
    async getReviews() {
        return this.request('GET', 'reviews');
    }
    async createReview(data) {
        return this.request('POST', 'reviews', data);
    }
    async getFulfillments() {
        return this.request('GET', 'fulfillments');
    }
    async createFulfillment(data) {
        return this.request('POST', 'fulfillments', data);
    }
}
exports.default = TikTokShopIntegration;
