'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'payments/',
  operations: ['create', 'list', 'retrieve']
});