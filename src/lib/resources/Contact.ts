'use strict';

module.exports = require('../StatesetResource').extend({
  path: 'contacts/',
  operations: ['create', 'list', 'retrieve', 'transfer']
});