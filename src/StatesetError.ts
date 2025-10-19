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
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);

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

  toJSON(): StatesetErrorRaw {
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
  static extend(subClass: Partial<typeof StatesetBaseError>): typeof StatesetBaseError {
    const Parent = this;
    class Extended extends (Parent as typeof StatesetBaseError) {
      constructor(...args: any[]) {
        // @ts-ignore allow legacy call signatures that pass (type, message, raw)
        super(...args);
      }
    }

    Object.assign(Extended, subClass);
    Object.assign(Extended.prototype, subClass);
    return Extended;
  }
}

class StatesetError extends StatesetBaseError {
  constructor(raw: StatesetErrorRaw) {
    super(raw.type || 'api_error', raw.message, raw);
  }

  static generate(raw: StatesetErrorRaw): StatesetError {
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
  constructor(raw: StatesetErrorRaw | string) {
    super(
      typeof raw === 'string'
        ? { type: 'permission_error', message: raw }
        : { ...raw, type: 'permission_error' }
    );
  }
}

class StatesetRateLimitError extends StatesetError {
  constructor(raw: StatesetErrorRaw | string) {
    super(
      typeof raw === 'string'
        ? { type: 'rate_limit_error', message: raw }
        : { ...raw, type: 'rate_limit_error' }
    );
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
  StatesetRateLimitError,
};
