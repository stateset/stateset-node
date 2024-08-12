'use strict';

module.exports = require('../StatesetResource').extend({
  path: 'address/',
  operations: ['create', 'list', 'retrieve']
});