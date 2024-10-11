"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("qs"));
class Stateset {
    constructor(options) {
        this.options = options;
        this.returns = {
            create: (params) => this.client(this.createOptions('POST', '/returns', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/returns/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/returns/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/returns', params)),
        };
        this.returnItems = {
            create: (params) => this.client(this.createOptions('POST', '/return-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/return-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/return-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/return-items', params)),
        };
        this.warranties = {
            create: (params) => this.client(this.createOptions('POST', '/warranties', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/warranties/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/warranties/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/warranties', params)),
        };
        this.warrantyItems = {
            create: (params) => this.client(this.createOptions('POST', '/warranty-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/warranty-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/warranty-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/warranty-items', params)),
        };
        this.products = {
            create: (params) => this.client(this.createOptions('POST', '/products', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/products/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/products/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/products', params)),
        };
        this.orders = {
            create: (params) => this.client(this.createOptions('POST', '/orders', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/orders/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/orders/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/orders', params)),
        };
        this.orderItems = {
            create: (params) => this.client(this.createOptions('POST', '/order-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/order-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/order-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/order-items', params)),
        };
        this.shipments = {
            create: (params) => this.client(this.createOptions('POST', '/shipments', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/shipments/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/shipments/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/shipments', params)),
        };
        this.shipmentItems = {
            create: (params) => this.client(this.createOptions('POST', '/shipment-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/shipment-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/shipment-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/shipment-items', params)),
        };
        this.inventory = {
            create: (params) => this.client(this.createOptions('POST', '/inventory', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/inventory/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/inventory/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/inventory', params)),
        };
        this.customers = {
            create: (params) => this.client(this.createOptions('POST', '/customers', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/customers/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/customers/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/customers', params)),
        };
        this.workorders = {
            create: (params) => this.client(this.createOptions('POST', '/workorders', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/workorders/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/workorders/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/workorders', params)),
        };
        this.workorderItems = {
            create: (params) => this.client(this.createOptions('POST', '/workorder-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/workorder-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/workorder-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/workorder-items', params)),
        };
        this.billOfMaterials = {
            create: (params) => this.client(this.createOptions('POST', '/bill-of-materials', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/bill-of-material/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/bill-of-material/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/bill-of-material', params)),
        };
        this.purchaseOrders = {
            create: (params) => this.client(this.createOptions('POST', '/purchase-orders', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/purchase-orders/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/purchase-orders/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/purchase-orders', params)),
        };
        this.purchaseOrderItems = {
            create: (params) => this.client(this.createOptions('POST', '/purchase-order-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/purchase-order-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/purchase-order-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/purchase-order-items', params)),
        };
        this.manufacturerOrders = {
            create: (params) => this.client(this.createOptions('POST', '/manufacturer-orders', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/manufacturer-orders/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/manufacturer-orders/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/manufacturer-orders', params)),
        };
        this.manufacturerOrderItems = {
            create: (params) => this.client(this.createOptions('POST', '/manufacturer-order-items', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/manufacturer-order-items/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/manufacturer-order-items/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/manufacturer-order-items', params)),
        };
        this.channels = {
            create: (params) => this.client(this.createOptions('POST', '/channels', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/channels/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/channels/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/channels', params)),
        };
        this.messages = {
            create: (params) => this.client(this.createOptions('POST', '/messages', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/messages/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/messages/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/messages', params)),
        };
        this.agents = {
            create: (params) => this.client(this.createOptions('POST', '/agents', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/agents/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/agents/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/agents', params)),
        };
        this.rules = {
            create: (params) => this.client(this.createOptions('POST', '/rules', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/rules/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/rules/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/rules', params)),
        };
        this.attributes = {
            create: (params) => this.client(this.createOptions('POST', '/attributes', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/attributes/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/attributes/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/attributes', params)),
        };
        this.workflows = {
            create: (params) => this.client(this.createOptions('POST', '/workflows', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/workflows/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/workflows/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/workflows', params)),
        };
        this.users = {
            create: (params) => this.client(this.createOptions('POST', '/users', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/users/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/users/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/users', params)),
        };
        this.settlements = {
            create: (params) => this.client(this.createOptions('POST', '/settlements', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/settlements/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/settlements/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/settlements', params)),
        };
        this.payouts = {
            create: (params) => this.client(this.createOptions('POST', '/payouts', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/payouts/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/payouts/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/payouts', params)),
        };
        this.picks = {
            create: (params) => this.client(this.createOptions('POST', '/picks', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/picks/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/picks/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/picks', params)),
        };
        this.cycleCounts = {
            create: (params) => this.client(this.createOptions('POST', '/cycle-counts', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/cycle-counts/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/cycle-counts/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/cycle-counts', params)),
        };
        this.machines = {
            create: (params) => this.client(this.createOptions('POST', '/machines', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/machines/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/machines/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/machines', params)),
        };
        this.wasteAndScrap = {
            create: (params) => this.client(this.createOptions('POST', '/waste-and-scrap', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/waste-and-scrap/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/waste-and-scrap/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/waste-and-scrap', params)),
        };
        const baseURL = options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
        this.client = axios_1.default.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${options.apiKey}`,
            },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets', encode: false }),
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.client.interceptors.request.use((config) => config, (error) => Promise.reject(error));
        this.client.interceptors.response.use((response) => response, (error) => Promise.reject(this.handleError(error)));
    }
    handleError(error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
        }
        else if (error.request) {
            console.error('No response received:', error.request);
        }
        else {
            console.error('Error:', error.message);
        }
        return error;
    }
    createOptions(method, path, params) {
        const options = {
            method,
            url: path,
            headers: {
                Authorization: `Bearer ${this.options.apiKey}`,
            },
        };
        if (method === 'GET') {
            options.params = params;
        }
        else {
            options.data = params;
        }
        return options;
    }
}
exports.default = Stateset;
