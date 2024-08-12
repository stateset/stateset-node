'use strict';
module.exports = require('../StatesetResource').extend({
    path: 'messages/',
    operations: ['create', 'list', 'retrieve']
});
