"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseIntegration_1 = __importDefault(require("./BaseIntegration"));
class ShipfusionIntegration extends BaseIntegration_1.default {
    constructor(apiKey) {
        super(apiKey, 'https://api.shipfusion.com');
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
    async getShipments() {
        return this.request('GET', 'shipments');
    }
    async createShipment(data) {
        return this.request('POST', 'shipments', data);
    }
    async getCarriers() {
        return this.request('GET', 'carriers');
    }
    async getRates(data) {
        return this.request('POST', 'rates', data);
    }
}
exports.default = ShipfusionIntegration;
