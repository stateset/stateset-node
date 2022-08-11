'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'returns/',
  operations: ['create', 'list', 'retrieve']
});