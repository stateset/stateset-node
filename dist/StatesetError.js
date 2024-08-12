"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesetRateLimitError = exports.StatesetPermissionError = exports.StatesetConnectionError = exports.StatesetAuthenticationError = exports.StatesetAPIError = exports.StatesetInvalidRequestError = exports.StatesetNotFoundError = exports.StatesetError = exports.StatesetBaseError = void 0;
const utils_1 = __importDefault(require("./utils"));
class StatesetBaseError extends Error {
    constructor(type, message, raw) {
        super(message);
        this.type = type;
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        if (raw) {
            this.populate(raw);
        }
    }
    populate(raw) {
        this.type = raw.type;
        this.message = raw.message;
        this.code = raw.code;
        this.detail = raw.detail;
        this.path = raw.path;
        this.statusCode = raw.statusCode;
    }
    static extend(subClass) {
        return utils_1.default.protoExtend(subClass);
    }
}
exports.StatesetBaseError = StatesetBaseError;
class StatesetError extends StatesetBaseError {
    constructor(raw) {
        super(raw.type, raw.message, raw);
    }
    static generate(raw) {
        switch (raw.type) {
            case 'invalid_request_error':
                return new StatesetInvalidRequestError(raw);
            case 'api_error':
                return new StatesetAPIError(raw);
            case 'authentication_error':
                return new StatesetAuthenticationError(raw);
            case 'connection_error':
                return new StatesetConnectionError(raw);
            case 'not_found_error':
                return new StatesetNotFoundError(raw);
            default:
                return new StatesetError({ type: 'generic_error', message: 'Unknown Error' });
        }
    }
}
exports.StatesetError = StatesetError;
class StatesetNotFoundError extends StatesetError {
    constructor(raw) {
        super({ ...raw, type: 'not_found_error' });
    }
}
exports.StatesetNotFoundError = StatesetNotFoundError;
class StatesetInvalidRequestError extends StatesetError {
    constructor(raw) {
        super({ ...raw, type: 'invalid_request_error' });
    }
}
exports.StatesetInvalidRequestError = StatesetInvalidRequestError;
class StatesetAPIError extends StatesetError {
    constructor(raw) {
        super({ ...raw, type: 'api_error' });
    }
}
exports.StatesetAPIError = StatesetAPIError;
class StatesetAuthenticationError extends StatesetError {
    constructor(raw) {
        super({ ...raw, type: 'authentication_error' });
    }
}
exports.StatesetAuthenticationError = StatesetAuthenticationError;
class StatesetConnectionError extends StatesetError {
    constructor(raw) {
        super({ ...raw, type: 'connection_error' });
    }
}
exports.StatesetConnectionError = StatesetConnectionError;
class StatesetPermissionError extends StatesetError {
    constructor(message) {
        super({ type: 'PermissionError', message });
    }
}
exports.StatesetPermissionError = StatesetPermissionError;
class StatesetRateLimitError extends StatesetError {
    constructor(message) {
        super({ type: 'RateLimitError', message });
    }
}
exports.StatesetRateLimitError = StatesetRateLimitError;
