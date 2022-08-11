'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'purchaseorders/',
  operations: ['create', 'list', 'retrieve', 'finance']
});