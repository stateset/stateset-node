'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'cases/',
  operations: ['create', 'list', 'retrieve', 'close', 'resolve']
});