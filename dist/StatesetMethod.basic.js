'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StatesetMethod_1 = __importDefault(require("./StatesetMethod"));
// Define common method configurations
const createMethod = (config) => {
    return (0, StatesetMethod_1.default)(config);
};
// Common CRUD methods implemented using StatesetMethod
const commonMethods = {
    create: createMethod({
        method: 'POST',
        path: '/', // Assuming the base path handles POST for creation
    }),
    list: createMethod({
        method: 'GET',
        path: '/',
    }),
    retrieve: createMethod({
        method: 'GET',
        path: '/{id}',
        urlParams: ['id'],
    }),
    update: createMethod({
        method: 'PUT',
        path: '/{id}',
        urlParams: ['id'],
    }),
    del: createMethod({
        method: 'DELETE',
        path: '/{id}',
        urlParams: ['id'],
    }),
};
exports.default = commonMethods;
//# sourceMappingURL=StatesetMethod.basic.js.map