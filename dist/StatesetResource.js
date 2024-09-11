"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StatesetResource {
    constructor(options) {
        this.stateset = options.stateset;
        this.path = options.path;
        this.operations = options.operations;
        this.operations.forEach(operation => {
            this[operation] = this.createMethod(operation);
        });
    }
    createMethod(operation) {
        return async (params) => {
            const method = this.getHttpMethod(operation);
            const path = this.getPath(operation, params);
            const data = this.getData(operation, params);
            return this.stateset.request(method, path, data);
        };
    }
    getHttpMethod(operation) {
        switch (operation) {
            case 'list':
            case 'retrieve':
                return 'GET';
            case 'create':
                return 'POST';
            case 'update':
                return 'PUT';
            case 'delete':
                return 'DELETE';
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }
    getPath(operation, params) {
        switch (operation) {
            case 'list':
                return this.path;
            case 'retrieve':
            case 'update':
            case 'delete':
                return `${this.path}${params.id}`;
            case 'create':
                return this.path;
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }
    getData(operation, params) {
        switch (operation) {
            case 'list':
            case 'retrieve':
                return { params };
            case 'create':
            case 'update':
                return params;
            case 'delete':
                return null;
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    }
}
exports.default = StatesetResource;
