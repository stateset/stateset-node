'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
    path: 'customers/',
    operations: ['create', 'list', 'retrieve']
});
