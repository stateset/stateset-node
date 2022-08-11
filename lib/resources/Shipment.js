'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'shipments/',
  operations: ['create', 'list', 'retrieve']
});