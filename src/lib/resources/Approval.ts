'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
  path: 'approvals/',
  operations: ['create', 'list', 'retrieve', 'approve', 'reject']
});