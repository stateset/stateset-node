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
