'use strict';

var utils = require('./utils');

module.exports = _Error;

/**
 * Generic Error klass to wrap any errors returned by stateset-node
 */
function _Error(raw) {
  this.populate.apply(this, arguments);
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function(type, message) {
  this.type = type;
  this.message = message;
};


_Error.extend = utils.protoExtend;

/**
 * Create subclass of internal Error klass
 * (Specifically for errors returned from Stateset's REST API)
 */
var StatesetError = _Error.StatesetError = _Error.extend({
  type: 'StatesetError',
  populate: function(raw) {

    // Move from prototype def (so it appears in stringified obj)
    this.type = this.type;

    this.code = raw.code;
    this.message = raw.message;
    this.detail = raw.detail;
    this.path = raw.path;
    this.statusCode = raw.statusCode;
  }
});

/**
 * Helper factory which takes raw stateset errors and outputs wrapping instances
 */
StatesetError.generate = function(rawStatesetError) {
  switch (rawStatesetError.type) {
    case 'invalid_request_error':
      return new _Error.StatesetInvalidRequestError(rawStatesetError);
    case 'api_error':
      return new _Error.StatesetAPIError(rawStatesetError);
  }
  return new _Error('Generic', 'Unknown Error');
};

// Specific Stateset Error types:
_Error.StatesetNotFoundError = StatesetError.extend({ type: 'StatesetNotFoundError' });
_Error.StatesetInvalidRequestError = StatesetError.extend({ type: 'StatesetInvalidRequest' });
_Error.StatesetAPIError = StatesetError.extend({ type: 'StatesetAPIError' });
_Error.StatesetAuthenticationError = StatesetError.extend({ type: 'StatesetAuthenticationError' });
_Error.StatesetConnectionError = StatesetError.extend({ type: 'StatesetConnectionError' });