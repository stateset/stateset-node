'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'manufactureorders/',
  operations: ['create', 'list', 'retrieve']
});