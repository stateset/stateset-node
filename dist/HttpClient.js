"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
class HttpClient {
    axiosInstance;
    constructor(agent) {
        this.axiosInstance = axios_1.default.create({
            httpsAgent: agent,
            timeout: 80000, // Default timeout, can be overridden in requests
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });
    }
    // Generic request method
    request(config) {
        return this.axiosInstance(config);
    }
    // GET request
    get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    // POST request
    post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    // PUT request
    put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    // DELETE request
    delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
}
exports.HttpClient = HttpClient;
exports.default = HttpClient;
//# sourceMappingURL=HttpClient.js.map