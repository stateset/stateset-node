'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
    path: 'payments/',
    operations: ['create', 'list', 'retrieve']
});
