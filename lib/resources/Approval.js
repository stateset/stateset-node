'use strict';
var method = require('../Method');
module.exports = require('../Resource').extend({
  path: 'approvals/',
  operations: ['create', 'list', 'retrieve', 'approve', 'reject']
});