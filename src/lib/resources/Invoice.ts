'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
  path: 'invoices/',
  operations: ['create', 'list', 'retrieve', 'factor']
});