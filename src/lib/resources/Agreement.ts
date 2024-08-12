'use strict';

module.exports = require('../StatesetResource').extend({
  path: 'agreements/',
  operations: ['create', 'list', 'retrieve', 'activate', 'cancel', 'amend', 'renew', 'terminate']
});