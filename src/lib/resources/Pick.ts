'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
  path: 'picks/',
  operations: ['create', 'list', 'retrieve']
});