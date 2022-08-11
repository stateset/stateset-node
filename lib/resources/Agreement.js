'use strict';

module.exports = require('../Resource').extend({
  path: 'agreements/',
  operations: ['create', 'list', 'retrieve', 'activate', 'cancel', 'amend', 'renew', 'terminate']
});