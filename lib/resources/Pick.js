'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'picks/',
  operations: ['create', 'list', 'retrieve']
});