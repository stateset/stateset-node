'use strict';
var method = require('../Method');
module.exports = require('../StatesetResource').extend({
    path: 'returnlineitems/',
    operations: ['create', 'list', 'retrieve']
});
