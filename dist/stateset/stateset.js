"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const qs = require('qs');
class Stateset {
    constructor(apiKey) {
        // Example of a converted resource method
        this.accounts = {
            create: (params) => this.client(this.createOptions('POST', '/accounts', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/accounts/${id}`)),
            update: (id, params) => this.client(this.createOptions('PUT', `/accounts/${id}`, params)),
            list: (params) => this.client(this.createOptions('GET', '/accounts', params)),
        };
        // Add other resources here...
        this.transactions = {
            create: (params) => this.client(this.createOptions('POST', '/transactions', params)),
            retrieve: (id) => this.client(this.createOptions('GET', `/transactions/${id}`)),
            list: (params) => this.client(this.createOptions('GET', '/transactions', params)),
        };
        this.apiKey = apiKey;
        this.baseUri = `https://api.stateset.com/v1`;
        this.client = axios_1.default.create({
            baseURL: this.baseUri,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
            },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets', encode: false }),
        });
        // Interceptors for request/response (optional)
        this.client.interceptors.request.use((config) => {
            // Add logic before request is sent
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            // Any status code that lies within the range of 2xx cause this function to trigger
            return response;
        }, (error) => {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            return Promise.reject(this.handleError(error));
        });
    }
    handleError(error) {
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('API Error:', error.response.data);
        }
        else if (error.request) {
            // No response received
            console.error('No response received:', error.request);
        }
        else {
            // Other errors (e.g., configuration)
            console.error('Error:', error.message);
        }
        return error;
    }
    createOptions(method, path, params) {
        const options = {
            method,
            url: path,
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
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
module.exports = (apiKey) => new Stateset(apiKey);
