"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatesetRateLimitError = exports.StatesetPermissionError = exports.StatesetConnectionError = exports.StatesetAuthenticationError = exports.StatesetAPIError = exports.StatesetInvalidRequestError = exports.StatesetNotFoundError = exports.StatesetError = exports.StatesetBaseError = void 0;
class StatesetBaseError extends Error {
    type;
    code;
    detail;
    path;
    statusCode;
    timestamp;
    request_id;
    constructor(type, message, raw) {
        super(message);
        this.type = type;
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, new.target);
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
        this.timestamp = raw.timestamp;
        this.request_id = raw.request_id;
    }
    toJSON() {
        return {
            type: this.type,
            message: this.message,
            code: this.code,
            detail: this.detail,
            path: this.path,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            request_id: this.request_id,
        };
    }
    /**
     * @deprecated Dynamic subclassing via extend is legacy. Use native `class extends` instead.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static extend(subClass) {
        const Parent = this;
        class Extended extends Parent {
            constructor(...args) {
                // @ts-ignore allow legacy call signatures that pass (type, message, raw)
                super(...args);
            }
        }
        Object.assign(Extended, subClass);
        Object.assign(Extended.prototype, subClass);
        return Extended;
    }
}
exports.StatesetBaseError = StatesetBaseError;
class StatesetError extends StatesetBaseError {
    constructor(raw) {
        super(raw.type || 'api_error', raw.message, raw);
    }
    static generate(raw) {
        const normalized = { ...raw, type: raw.type || 'api_error' };
        switch (normalized.type) {
            case 'invalid_request_error':
                return new StatesetInvalidRequestError(normalized);
            case 'api_error':
                return new StatesetAPIError(normalized);
            case 'authentication_error':
                return new StatesetAuthenticationError(normalized);
            case 'connection_error':
                return new StatesetConnectionError(normalized);
            case 'not_found_error':
                return new StatesetNotFoundError(normalized);
            case 'rate_limit_error':
                return new StatesetRateLimitError(normalized);
            case 'permission_error':
                return new StatesetPermissionError(normalized);
            default:
                return new StatesetError(normalized);
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
    constructor(raw) {
        super(typeof raw === 'string'
            ? { type: 'permission_error', message: raw }
            : { ...raw, type: 'permission_error' });
    }
}
exports.StatesetPermissionError = StatesetPermissionError;
class StatesetRateLimitError extends StatesetError {
    constructor(raw) {
        super(typeof raw === 'string'
            ? { type: 'rate_limit_error', message: raw }
            : { ...raw, type: 'rate_limit_error' });
    }
}
exports.StatesetRateLimitError = StatesetRateLimitError;
//# sourceMappingURL=StatesetError.js.map