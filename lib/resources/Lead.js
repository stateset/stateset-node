'use strict';

module.exports = require('../Resource').extend({
  path: 'leads/',
  operations: ['create', 'list', 'retrieve', 'transfer', 'reject', 'engage']
});