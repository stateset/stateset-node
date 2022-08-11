'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'warehouses/',
  operations: ['create', 'list', 'retrieve']
});