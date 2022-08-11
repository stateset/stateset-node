'use strict';

var method = require('../Method');

module.exports = require('../Resource').extend({
  path: 'warrantylineitems/',
  operations: ['create', 'list', 'retrieve']
});