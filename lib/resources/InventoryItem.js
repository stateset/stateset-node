'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'inventoryitems/',
  operations: ['create', 'list', 'retrieve']
});