'use strict';
module.exports = require('../StatesetResource').extend({
    path: 'proposals/',
    operations: ['create', 'list', 'retrieve']
});
