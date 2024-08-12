"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = __importDefault(require("./utils"));
const StatesetError_1 = require("./StatesetError");
const StatesetMethod_1 = __importDefault(require("./StatesetMethod"));
class StatesetResource {
    constructor(stateset, deprecatedUrlData) {
        this._stateset = stateset;
        this._httpClient = stateset.getApiField('httpClient');
        if (deprecatedUrlData) {
            throw new Error('Support for curried url params was dropped in stateset-node v7.0.0. Instead, pass two ids.');
        }
        const basePath = stateset.getApiField('basePath');
        this.basePath = utils_1.default.makeURLInterpolator(basePath);
        const path = '/default-path'; // or fetch it from stateset if dynamic
        this.path = utils_1.default.makeURLInterpolator(path);
        const urlData = {};
        this.resourcePath = this.path(urlData);
    }
    createFullPath(commandPath, urlData) {
        const urlParts = [this.basePath(urlData), this.path(urlData)];
        if (typeof commandPath === 'function') {
            const computedCommandPath = commandPath(urlData);
            if (computedCommandPath) {
                urlParts.push(computedCommandPath);
            }
        }
        else {
            urlParts.push(commandPath);
        }
        return this._joinUrlParts(urlParts);
    }
    createResourcePathWithSymbols(pathWithSymbols) {
        return pathWithSymbols
            ? `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`
            : `/${this.resourcePath}`;
    }
    _joinUrlParts(parts) {
        return parts.join('/').replace(/\/{2,}/g, '/');
    }
    _getRequestOptions(method, host, path, data, auth, options) {
        return {
            method,
            url: `${host}${path}`,
            data,
            headers: {
                Authorization: auth,
                ...options.headers,
            },
            ...options,
        };
    }
    _request(method, host, path, data, auth, options = {}, callback) {
        const requestOptions = this._getRequestOptions(method, host, path, data, auth, options);
        this._httpClient
            .request(requestOptions)
            .then((response) => {
            this._handleResponse(response, callback);
        })
            .catch((error) => {
            this._handleError(error, callback);
        });
    }
    _handleResponse(response, callback) {
        // Process the response, handle different status codes, etc.
        callback(null, response);
    }
    _handleError(error, callback) {
        var _a;
        if (error.isAxiosError) {
            switch ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) {
                case 401:
                    callback(new StatesetError_1.StatesetAuthenticationError({ type: 'AuthenticationError', message: 'Authentication failed.' }));
                    break;
                case 403:
                    callback(new StatesetError_1.StatesetPermissionError('Permission denied.'));
                    break;
                case 429:
                    callback(new StatesetError_1.StatesetRateLimitError('Rate limit exceeded.'));
                    break;
                case 500:
                case 502:
                case 503:
                    callback(new StatesetError_1.StatesetAPIError({ type: 'APIError', message: 'API error occurred.' }));
                    break;
                default:
                    callback(new StatesetError_1.StatesetError({ type: 'Error', message: 'An unknown error occurred.' }));
            }
        }
        else {
            callback(new StatesetError_1.StatesetConnectionError({ type: 'ConnectionError', message: 'Connection error occurred.' }));
        }
    }
}
StatesetResource.extend = utils_1.default.protoExtend;
StatesetResource.method = StatesetMethod_1.default;
StatesetResource.BASIC_METHODS = require('./StatesetMethod.basic');
StatesetResource.MAX_BUFFERED_REQUEST_METRICS = 100;
exports.default = StatesetResource;
