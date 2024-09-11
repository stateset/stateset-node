"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateset = void 0;
const Return_1 = __importDefault(require("./lib/resources/Return"));
const Warranty_1 = __importDefault(require("./lib/resources/Warranty"));
const Order_1 = __importDefault(require("./lib/resources/Order"));
const Shipment_1 = __importDefault(require("./lib/resources/Shipment"));
const Inventory_1 = __importDefault(require("./lib/resources/Inventory"));
const Customer_1 = __importDefault(require("./lib/resources/Customer"));
class stateset {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
        this.returns = new Return_1.default(this);
        this.warranties = new Warranty_1.default(this);
        this.orders = new Order_1.default(this);
        this.shipments = new Shipment_1.default(this);
        this.inventory = new Inventory_1.default(this);
        this.customers = new Customer_1.default(this);
    }
    async request(method, path, data) {
        const url = `${this.baseUrl}/${path}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
        console.log(`Making ${method} request to ${url}`);
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            console.log(`Response status: ${response.status}`);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Error response body: ${errorBody}`);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error in Stateset request:', error);
            throw error;
        }
    }
}
exports.stateset = stateset;
exports.default = stateset;
