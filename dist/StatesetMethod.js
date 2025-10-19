'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("./utils"));
const makeRequest_1 = __importDefault(require("./makeRequest"));
const autoPagination_1 = require("./autoPagination");
/**
 * Creates a method for interacting with the Stateset API.
 * @param {MethodSpec} spec - The specification for the method, defining the HTTP method, path, etc.
 * @returns {StatesetMethodFunction} - The function to be used for making the API request.
 */
function statesetMethod(spec) {
    if (spec.path && spec.fullPath) {
        throw new Error(`Method spec should not specify both 'path' (${spec.path}) and 'fullPath' (${spec.fullPath}).`);
    }
    return function (...args) {
        const callback = typeof args[args.length - 1] === 'function' ? args.pop() : undefined;
        const urlParams = utils_1.default.extractUrlParams(spec.fullPath || this.createResourcePathWithSymbols(spec.path || ''));
        spec.urlParams = urlParams;
        const requestPromise = utils_1.default.callbackifyPromiseWithTimeout((0, makeRequest_1.default)(this, {
            method: spec.method || 'GET',
            path: spec.fullPath || this.createResourcePathWithSymbols(spec.path || ''),
            params: args,
        }), callback);
        if (spec.methodType === 'list' || spec.methodType === 'search') {
            const autoPaginationMethods = (0, autoPagination_1.makeAutoPaginationMethods)(this, args, spec, requestPromise);
            Object.assign(requestPromise, autoPaginationMethods);
        }
        return requestPromise;
    };
}
exports.default = statesetMethod;
//# sourceMappingURL=StatesetMethod.js.map