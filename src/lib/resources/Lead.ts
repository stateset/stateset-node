'use strict';

module.exports = require('../StatesetResource').extend({
  path: 'leads/',
  operations: ['create', 'list', 'retrieve', 'transfer', 'reject', 'engage']
});