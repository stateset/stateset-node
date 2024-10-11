"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class AmazonIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.amazon.com');
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
    async getInventory() {
        return this.request('GET', 'inventory');
    }
    async createInventory(data) {
        return this.request('POST', 'inventory', data);
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
    async getReports() {
        return this.request('GET', 'reports');
    }
    async createReport(data) {
        return this.request('POST', 'reports', data);
    }
}
exports.default = AmazonIntegration;
