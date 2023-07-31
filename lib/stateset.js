'use strict';

Stateset.AUTH_SCHEME_STATESET = 'StatesetToken'
Stateset.AUTH_SCHEME_OAUTH = 'Bearer'

Stateset.DEFAULT_HOST = 'api.stateset.com';
Stateset.DEFAULT_PROTOCOL = 'https';
Stateset.DEFAULT_PORT = '443';
Stateset.DEFAULT_AUTH_SCHEME = Stateset.AUTH_SCHEME_STATESET;
Stateset.DEFAULT_BASE_PATH = '/v1/';
Stateset.DEFAULT_TIMEOUT = 30000; // 30 seconds; override with setTimeout on Stateset instance
Stateset.PACKAGE_VERSION = '0.0.1';

Stateset.USER_AGENT = 'Stateset/v1 NodeBindings/'+Stateset.PACKAGE_VERSION;

Stateset.resources = {
  Address: require('./resources/Address'),
  Account: require('./resources/Account'),
  Contact: require('./resources/Contact'),
  Customer: require('./resources/Customer'),
  Case: require('./resources/Case'),
  BillOfMaterials: require('./resources/BillOfMaterials'),
  Transaction: require('./resources/Transaction'),
  Refund: require('./resources/Refund'),
  Return: require('./resources/Return'),
  Warranty: require('./resources/Warranty'),
  Shipment: require('./resources/Shipment'),
  Inventory: require('./resources/Inventory'),
  Payment: require('./resources/Payment'),
  Pick: require('./resources/Pick'),
  PurchaseOrder: require('./resources/PurchaseOrder'),
  ManufactureOrder: require('./resources/ManufactureOrder'),
  WorkOrder: require('./resources/WorkOrder'),
  Invoice: require('./resources/Invoice'),
  Order: require('./resources/Order'),
  Warehouse: require('./resources/Warehouse')
};

Stateset.Error = require('./StatesetError');
Stateset.Resource = require('./StatesetResource');

function Stateset(token) {

  if (!(this instanceof Stateset)) {
    return new Stateset(token);
  }


  this._api = {
    host: Stateset.DEFAULT_HOST,
    port: Stateset.DEFAULT_PORT,
    protocol: Stateset.DEFAULT_PROTOCOL,
    authScheme: Stateset.DEFAULT_AUTH_SCHEME,
    basePath: Stateset.DEFAULT_BASE_PATH,
    timeout: Stateset.DEFAULT_TIMEOUT,
    dev: false
  };

  if(typeof(token) !== 'undefined') {
    this.setToken(token);
  }

  this._init();
}

Stateset.prototype = {

  setAuthScheme: function(auth) {
    this.set('authScheme', auth);
  },

  setHost: function(host, port, protocol) {
    this.set('host', host);
    if (port) this.set('port', port);
    if (protocol) this.set('protocol', protocol);
  },

  setProtocol: function(protocol) {
    this.set('protocol', protocol.toLowerCase());
  },

  setPort: function(port) {
    this.set('port', port);
  },

  // token can be provided as a string, or as an object with either a 'statesetToken' or 'oauthToken' attribute
  setToken: function(token) {
    var statesetToken = (typeof token === 'object') ? token.statesetToken : token;
    var oauthToken = (typeof token === 'object') ? token.oauthToken : undefined;

    if (statesetToken && oauthToken) {
      throw new Stateset.Error.StatesetError({
        message: 'Ambiguous authentication credentials',
        detail: "Please provide either 'statesetToken' or 'oauthToken', not both"
      });
    }

    if (oauthToken) {
      this.set('authScheme', Stateset.AUTH_SCHEME_OAUTH);
      this.set('token', oauthToken);
    } else {
      this.set('authScheme', Stateset.AUTH_SCHEME_SHIPPO);
      this.set('token', statesetToken);  
    }

  },

  setTimeout: function(timeout) {
    this.set('timeout', timeout == null ? Stateset.DEFAULT_TIMEOUT : timeout);
  },

  set: function(key, value) {
    this._api[key] = value;
  },

  get: function(key) {
    return this._api[key];
  },

  _init: function() {
    for (var name in Stateset.resources) {
      if(Stateset.resources.hasOwnProperty(name)) {
        // "this" is the Stateset object being created
        // console.log('create %s', name);
        this[name.toLowerCase()] = new Stateset.resources[name](this);
      }
    }

    this.error = Stateset.Error;
  }

};

module.exports = Stateset;