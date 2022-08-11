'use strict';

module.exports = require('../Resource').extend({
  path: 'contacts/',
  operations: ['create', 'list', 'retrieve', 'transfer']
});