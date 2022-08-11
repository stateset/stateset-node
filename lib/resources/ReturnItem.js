'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'returnlineitems/',
  operations: ['create', 'list', 'retrieve']
});