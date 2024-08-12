'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
  path: 'cases/',
  operations: ['create', 'list', 'retrieve', 'close', 'resolve']
});