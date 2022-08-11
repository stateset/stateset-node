'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'customers/',
  operations: ['create', 'list', 'retrieve']
});