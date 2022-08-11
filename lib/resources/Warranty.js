'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'warranties/',
  operations: ['create', 'list', 'retrieve']
});