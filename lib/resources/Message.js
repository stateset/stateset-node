'use strict';

module.exports = require('../Resource').extend({
  path: 'messages/',
  operations: ['create', 'list', 'retrieve']
});