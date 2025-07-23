import utils from './utils';

interface StatesetErrorRaw {
  type: string;
  message: string;
  code?: string;
  detail?: string;
  path?: string;
  statusCode?: number;
  timestamp?: string;
  request_id?: string;
}

interface ErrorInterface extends Error {
  type: string;
  code?: string;
  detail?: string;
  path?: string;
  statusCode?: number;
  timestamp?: string;
  request_id?: string;
  populate(raw: StatesetErrorRaw): void;
}

class StatesetBaseError extends Error implements ErrorInterface {
  type: string;
  code?: string;
  detail?: string;
  path?: string;
  statusCode?: number;
  timestamp?: string;
  request_id?: string;

  constructor(type: string, message: string, raw?: StatesetErrorRaw) {
    super(message);
    this.type = type;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);

    if (raw) {
      this.populate(raw);
    }
  }

  populate(raw: StatesetErrorRaw): void {
    this.type = raw.type;
    this.message = raw.message;
    this.code = raw.code;
    this.detail = raw.detail;
    this.path = raw.path;
    this.statusCode = raw.statusCode;
    this.timestamp = raw.timestamp;
    this.request_id = raw.request_id;
  }

  static extend(subClass: Partial<typeof StatesetBaseError>): typeof StatesetBaseError {
    return utils.protoExtend(subClass);
  }
}

class StatesetError extends StatesetBaseError {
  constructor(raw: StatesetErrorRaw) {
    super(raw.type, raw.message, raw);
  }

  static generate(raw: StatesetErrorRaw): StatesetError {
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
      case 'rate_limit_error':
        return new StatesetRateLimitError(raw.message);
      case 'permission_error':
        return new StatesetPermissionError(raw.message);
      default:
        return new StatesetError({ type: 'generic_error', message: 'Unknown Error' });
    }
  }
}

class StatesetNotFoundError extends StatesetError {
  constructor(raw: StatesetErrorRaw) {
    super({ ...raw, type: 'not_found_error' });
  }
}

class StatesetInvalidRequestError extends StatesetError {
  constructor(raw: StatesetErrorRaw) {
    super({ ...raw, type: 'invalid_request_error' });
  }
}

class StatesetAPIError extends StatesetError {
  constructor(raw: StatesetErrorRaw) {
    super({ ...raw, type: 'api_error' });
  }
}

class StatesetAuthenticationError extends StatesetError {
  constructor(raw: StatesetErrorRaw) {
    super({ ...raw, type: 'authentication_error' });
  }
}

class StatesetConnectionError extends StatesetError {
  constructor(raw: StatesetErrorRaw) {
    super({ ...raw, type: 'connection_error' });
  }
}

class StatesetPermissionError extends StatesetError {
  constructor(message: string) {
    super({ type: 'PermissionError', message });
  }
}

class StatesetRateLimitError extends StatesetError {
  constructor(message: string) {
    super({ type: 'RateLimitError', message });
  }
}

export {
  StatesetBaseError,
  StatesetError,
  StatesetNotFoundError,
  StatesetInvalidRequestError,
  StatesetAPIError,
  StatesetAuthenticationError,
  StatesetConnectionError,
  StatesetPermissionError,
  StatesetRateLimitError
};
