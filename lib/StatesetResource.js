'use strict';

const utils = require('./utils');
const {
  StatesetConnectionError,
  StatesetAuthenticationError,
  StatesetPermissionError,
  StatesetRateLimitError,
  StatesetError,
  StatesetAPIError,
} = require('./StatesetError');

const {HttpClient} = require('./net/HttpClient');

// Provide extension mechanism for Stateset Resource Sub-Classes
StatesetResource.extend = utils.protoExtend;

// Expose method-creator & prepared (basic) methods
StatesetResource.method = require('./StatesetMethod');
StatesetResource.BASIC_METHODS = require('./StatesetMethod.basic');

StatesetResource.MAX_BUFFERED_REQUEST_METRICS = 100;
const MAX_RETRY_AFTER_WAIT = 60;

/**
 * Encapsulates request logic for a Stateset Resource
 */
function StatesetResource(stateset, deprecatedUrlData) {
  this._stateset = stateset;
  if (deprecatedUrlData) {
    throw new Error(
      'Support for curried url params was dropped in stateset-node v7.0.0. Instead, pass two ids.'
    );
  }

  this.basePath = utils.makeURLInterpolator(
    this.basePath || stateset.getApiField('basePath')
  );
  this.resourcePath = this.path;
  this.path = utils.makeURLInterpolator(this.path);

  // DEPRECATED: This was kept for backwards compatibility in case users were
  // using this, but basic methods are now explicitly defined on a resource.
  if (this.includeBasic) {
    this.includeBasic.forEach(function(methodName) {
      this[methodName] = StatesetResource.BASIC_METHODS[methodName];
    }, this);
  }

  this.initialize(...arguments);
}

StatesetResource.prototype = {
  path: '',

  // Methods that don't use the API's default '/v1' path can override it with this setting.
  basePath: null,

  initialize() {},

  // Function to override the default data processor. This allows full control
  // over how a StatesetResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,

  // Function to add a validation checks before sending the request, errors should
  // be thrown, and they will be passed to the callback/promise.
  validateRequest: null,

  createFullPath(commandPath, urlData) {
    const urlParts = [this.basePath(urlData), this.path(urlData)];

    if (typeof commandPath === 'function') {
      const computedCommandPath = commandPath(urlData);
      // If we have no actual command path, we just omit it to avoid adding a
      // trailing slash. This is important for top-level listing requests, which
      // do not have a command path.
      if (computedCommandPath) {
        urlParts.push(computedCommandPath);
      }
    } else {
      urlParts.push(commandPath);
    }

    return this._joinUrlParts(urlParts);
  },

  // Creates a relative resource path with symbols left in (unlike
  // createFullPath which takes some data to replace them with). For example it
  // might produce: /invoices/{id}
  createResourcePathWithSymbols(pathWithSymbols) {
    // If there is no path beyond the resource path, we want to produce just
    // /<resource path> rather than /<resource path>/.
    if (pathWithSymbols) {
      return `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`;
    } else {
      return `/${this.resourcePath}`;
    }
  },

  _joinUrlParts(parts) {
    // Replace any accidentally doubled up slashes. This previously used
    // path.join, which would do this as well. Unfortunately we need to do this
    // as the functions for creating paths are technically part of the public
    // interface and so we need to preserve backwards compatibility.
    return parts.join('/').replace(/\/{2,}/g, '/');
  },

  // DEPRECATED: Here for backcompat in case users relied on this.
  wrapTimeout: utils.callbackifyPromiseWithTimeout,

  _timeoutHandler(timeout, req, callback) {
    return () => {
      const timeoutErr = new TypeError('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req.destroy(timeoutErr);
    };
  },

  _addHeadersDirectlyToObject(obj, headers) {
    // For convenience, make some headers easily accessible on
    // lastResponse.

    // NOTE: Stateset responds with lowercase header names/keys.
    obj.requestId = headers['request-id'];
    obj.statesetAccount = obj.statesetAccount || headers['stateset-account'];
    obj.apiVersion = obj.apiVersion || headers['stateset-version'];
    obj.idempotencyKey = obj.idempotencyKey || headers['idempotency-key'];
  },

  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;

    return utils.removeNullish({
      api_version: headers['stateset-version'],
      account: headers['stateset-account'],
      idempotency_key: headers['idempotency-key'],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime,
    });
  },

  _getRequestId(headers) {
    return headers['request-id'];
  },

  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stateset
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, callback) {
    return (res) => {
      const headers = res.getHeaders();

      const streamCompleteCallback = () => {
        const responseEvent = this._makeResponseEvent(
          requestEvent,
          res.getStatusCode(),
          headers
        );
        this._stateset._emitter.emit('response', responseEvent);
        this._recordRequestMetrics(
          this._getRequestId(headers),
          responseEvent.elapsed
        );
      };

      const stream = res.toStream(streamCompleteCallback);

      // This is here for backwards compatibility, as the stream is a raw
      // HTTP response in Node and the legacy behavior was to mutate this
      // response.
      this._addHeadersDirectlyToObject(stream, headers);

      return callback(null, stream);
    };
  },

  /**
   * Default handler for Stateset responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();

      const responseEvent = this._makeResponseEvent(
        requestEvent,
        statusCode,
        headers
      );
      this._stateset._emitter.emit('response', responseEvent);

      res
        .toJSON()
        .then(
          (jsonResponse) => {
            if (jsonResponse.error) {
              let err;

              // Convert OAuth error responses into a standard format
              // so that the rest of the error logic can be shared
              if (typeof jsonResponse.error === 'string') {
                jsonResponse.error = {
                  type: jsonResponse.error,
                  message: jsonResponse.error_description,
                };
              }

              jsonResponse.error.headers = headers;
              jsonResponse.error.statusCode = statusCode;
              jsonResponse.error.requestId = requestId;

              if (statusCode === 401) {
                err = new StatesetAuthenticationError(jsonResponse.error);
              } else if (statusCode === 403) {
                err = new StatesetPermissionError(jsonResponse.error);
              } else if (statusCode === 429) {
                err = new StatesetRateLimitError(jsonResponse.error);
              } else {
                err = StatesetError.generate(jsonResponse.error);
              }

              throw err;
            }

            return jsonResponse;
          },
          (e) => {
            throw new StatesetAPIError({
              message: 'Invalid JSON received from the Stateset API',
              exception: e,
              requestId: headers['request-id'],
            });
          }
        )
        .then(
          (jsonResponse) => {
            this._recordRequestMetrics(requestId, responseEvent.elapsed);

            // Expose raw response object.
            const rawResponse = res.getRawResponse();
            this._addHeadersDirectlyToObject(rawResponse, headers);
            Object.defineProperty(jsonResponse, 'lastResponse', {
              enumerable: false,
              writable: false,
              value: rawResponse,
            });

            callback.call(this, null, jsonResponse);
          },
          (e) => callback.call(this, e, null)
        );
    };
  },

  _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stateset.${
      requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ''
    }`;
  },

  _errorHandler(req, requestRetries, callback) {
    return (message, detail) => {
      callback.call(
        this,
        new StatesetConnectionError({
          message: this._generateConnectionErrorMessage(requestRetries),
          detail: error,
        }),
        null
      );
    };
  },

  // For more on when and how to retry API requests, see https://stateset.com/docs/error-handling#safely-retrying-requests-with-idempotency
  _shouldRetry(res, numRetries, maxRetries, error) {
    if (
      error &&
      numRetries === 0 &&
      HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)
    ) {
      return true;
    }

    // Do not retry if we are out of retries.
    if (numRetries >= maxRetries) {
      return false;
    }

    // Retry on connection error.
    if (!res) {
      return true;
    }

    // The API may ask us not to retry (e.g., if doing so would be a no-op)
    // or advise us to retry (e.g., in cases of lock timeouts); we defer to that.
    if (res.getHeaders()['stateset-should-retry'] === 'false') {
      return false;
    }
    if (res.getHeaders()['stateset-should-retry'] === 'true') {
      return true;
    }

    // Retry on conflict errors.
    if (res.getStatusCode() === 409) {
      return true;
    }

    // Retry on 500, 503, and other internal errors.
    //
    // Note that we expect the stateset-should-retry header to be false
    // in most cases when a 500 is returned, since our idempotency framework
    // would typically replay it anyway.
    if (res.getStatusCode() >= 500) {
      return true;
    }

    return false;
  },

  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stateset.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stateset.getMaxNetworkRetryDelay();

    // Apply exponential backoff with initialNetworkRetryDelay on the
    // number of numRetries so far as inputs. Do not allow the number to exceed
    // maxNetworkRetryDelay.
    let sleepSeconds = Math.min(
      initialNetworkRetryDelay * Math.pow(numRetries - 1, 2),
      maxNetworkRetryDelay
    );

    // Apply some jitter by randomizing the value in the range of
    // (sleepSeconds / 2) to (sleepSeconds).
    sleepSeconds *= 0.5 * (1 + Math.random());

    // But never sleep less than the base sleep seconds.
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);

    // And never sleep less than the time the API asks us to wait, assuming it's a reasonable ask.
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }

    return sleepSeconds * 1000;
  },

  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries &&
      Number.isInteger(settings.maxNetworkRetries)
      ? settings.maxNetworkRetries
      : this._stateset.getMaxNetworkRetries();
  },

  _defaultIdempotencyKey(method, settings) {
    // If this is a POST and we allow multiple retries, ensure an idempotency key.
    const maxRetries = this._getMaxNetworkRetries(settings);

    if (method === 'POST' && maxRetries > 0) {
      return `stateset-node-retry-${utils.uuid4()}`;
    }
    return null;
  },

  _makeHeaders(
    auth,
    contentLength,
    apiVersion,
    clientUserAgent,
    method,
    userSuppliedHeaders,
    userSuppliedSettings
  ) {
    const defaultHeaders = {
      // Use specified auth token or use default from this stateset instance:
      Authorization: auth ? `Bearer ${auth}` : this._stateset.getApiField('auth'),
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': this._getUserAgentString(),
      'X-Stateset-Client-User-Agent': clientUserAgent,
      'X-Stateset-Client-Telemetry': this._getTelemetryHeader(),
      'Stateset-Version': apiVersion,
      'Stateset-Account': this._stateset.getApiField('statesetAccount'),
      'Idempotency-Key': this._defaultIdempotencyKey(
        method,
        userSuppliedSettings
      ),
    };

    // As per https://datatracker.ietf.org/doc/html/rfc7230#section-3.3.2:
    //   A user agent SHOULD send a Content-Length in a request message when
    //   no Transfer-Encoding is sent and the request method defines a meaning
    //   for an enclosed payload body.  For example, a Content-Length header
    //   field is normally sent in a POST request even when the value is 0
    //   (indicating an empty payload body).  A user agent SHOULD NOT send a
    //   Content-Length header field when the request message does not contain
    //   a payload body and the method semantics do not anticipate such a
    //   body.
    //
    // These method types are expected to have bodies and so we should always
    // include a Content-Length.
    const methodHasPayload =
      method == 'POST' || method == 'PUT' || method == 'PATCH';

    // If a content length was specified, we always include it regardless of
    // whether the method semantics anticipate such a body. This keeps us
    // consistent with historical behavior. We do however want to warn on this
    // and fix these cases as they are semantically incorrect.
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        utils.emitWarning(
          `${method} method had non-zero contentLength but no payload is expected for this verb`
        );
      }
      defaultHeaders['Content-Length'] = contentLength;
    }

    return Object.assign(
      utils.removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      utils.normalizeHeaders(userSuppliedHeaders)
    );
  },

  _getUserAgentString() {
    const packageVersion = this._stateset.getConstant('PACKAGE_VERSION');
    const appInfo = this._stateset._appInfo
      ? this._stateset.getAppInfoAsString()
      : '';

    return `Stateset/v1 NodeBindings/${packageVersion} ${appInfo}`.trim();
  },

  _getTelemetryHeader() {
    if (
      this._stateset.getTelemetryEnabled() &&
      this._stateset._prevRequestMetrics.length > 0
    ) {
      const metrics = this._stateset._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics,
      });
    }
  },

  _recordRequestMetrics(requestId, requestDurationMs) {
    if (this._stateset.getTelemetryEnabled() && requestId) {
      if (
        this._stateset._prevRequestMetrics.length >
        StatesetResource.MAX_BUFFERED_REQUEST_METRICS
      ) {
        utils.emitWarning(
          'Request metrics buffer is full, dropping telemetry message.'
        );
      } else {
        this._stateset._prevRequestMetrics.push({
          request_id: requestId,
          request_duration_ms: requestDurationMs,
        });
      }
    }
  },

  _request(method, host, path, data, auth, options = {}, callback) {
    let requestData;

    const retryRequest = (
      requestFn,
      apiVersion,
      headers,
      requestRetries,
      retryAfter
    ) => {
      return setTimeout(
        requestFn,
        this._getSleepTimeInMS(requestRetries, retryAfter),
        apiVersion,
        headers,
        requestRetries + 1
      );
    };

    const makeRequest = (apiVersion, headers, numRetries) => {
      // timeout can be set on a per-request basis. Favor that over the global setting
      const timeout =
        options.settings &&
        Number.isInteger(options.settings.timeout) &&
        options.settings.timeout >= 0
          ? options.settings.timeout
          : this._stateset.getApiField('timeout');

      const req = this._stateset
        .getApiField('httpClient')
        .makeRequest(
          host || this._stateset.getApiField('host'),
          this._stateset.getApiField('port'),
          path,
          method,
          headers,
          requestData,
          this._stateset.getApiField('protocol'),
          timeout
        );

      const requestStartTime = Date.now();

      const requestEvent = utils.removeNullish({
        api_version: apiVersion,
        account: headers['Stateset-Account'],
        idempotency_key: headers['Idempotency-Key'],
        method,
        path,
        request_start_time: requestStartTime,
      });

      const requestRetries = numRetries || 0;

      const maxRetries = this._getMaxNetworkRetries(options.settings);

      this._stateset._emitter.emit('request', requestEvent);

      req
        .then((res) => {
          if (this._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(
              makeRequest,
              apiVersion,
              headers,
              requestRetries,
              res.getHeaders()['retry-after']
            );
          } else if (options.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, callback)(res);
          }
        })
        .catch((error) => {
          if (this._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(
              makeRequest,
              apiVersion,
              headers,
              requestRetries,
              null
            );
          } else {
            const isTimeoutError =
              error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;

            return callback.call(
              this,
              new StatesetConnectionError({
                message: isTimeoutError
                  ? `Request aborted due to timeout being reached (${timeout}ms)`
                  : this._generateConnectionErrorMessage(requestRetries),
                detail: error,
              })
            );
          }
        });
    };

    const prepareAndMakeRequest = (error, data) => {
      if (error) {
        return callback(error);
      }

      requestData = data;

      this._stateset.getClientUserAgent((clientUserAgent) => {
        const apiVersion = this._stateset.getApiField('version');
        const headers = this._makeHeaders(
          auth,
          requestData.length,
          apiVersion,
          clientUserAgent,
          method,
          options.headers,
          options.settings
        );

        makeRequest(apiVersion, headers);
      });
    };

    if (this.requestDataProcessor) {
      this.requestDataProcessor(
        method,
        data,
        options.headers,
        prepareAndMakeRequest
      );
    } else {
      prepareAndMakeRequest(null, utils.stringifyRequestData(data || {}));
    }
  },
};

module.exports = StatesetResource;