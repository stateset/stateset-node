"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makeRequest = (stateset, options) => {
    // Use options.spec and options.args if needed
    return stateset._request({
        method: options.method,
        url: options.path,
        data: options.data,
        headers: options.headers,
        params: options.params,
    });
};
exports.default = makeRequest;
