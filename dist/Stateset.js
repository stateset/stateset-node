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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stateset = void 0;
const axios_1 = __importDefault(require("axios"));
const qs = __importStar(require("qs"));
class Stateset {
    options;
    client;
    returns;
    constructor(options) {
        this.options = options;
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
    getApiField(field) {
        switch (field) {
            case 'auth':
                return `Bearer ${this.options.apiKey}`;
            case 'basePath':
            case 'host':
                return this.options.baseUrl || 'https://stateset-proxy-server.stateset.cloud.stateset.app/api';
            case 'httpClient':
                return this.client;
            default:
                return null;
        }
    }
    request(method, path, data, options = {}) {
        return this.client.request({
            method,
            url: path,
            data,
            ...options,
        });
    }
}
exports.Stateset = Stateset;
exports.default = Stateset;
//# sourceMappingURL=Stateset.js.map