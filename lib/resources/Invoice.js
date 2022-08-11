'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'invoices/',
  operations: ['create', 'list', 'retrieve', 'factor']
});