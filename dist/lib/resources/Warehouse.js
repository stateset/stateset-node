'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
    path: 'warehouses/',
    operations: ['create', 'list', 'retrieve']
});
