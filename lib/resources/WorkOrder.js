'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'workorders/',
  operations: ['create', 'list', 'retrieve']
});