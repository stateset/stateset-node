'use strict';

var Method = require('./StatesetMethod');
var utils = require('./utils');

module.exports = {

  create: Method({
    method: 'POST'
  }),

  list: Method({
    method: 'GET',
	path: ''
  }),

  retrieve: Method({
    method: 'GET',
    path: '/{id}',
    urlParams: ['id']
  }),

  update: Method({
    method: 'PUT',
    path: '{id}',
    urlParams: ['id']
  }),

  del: Method({
    method: 'DELETE',
    path: '{id}',
    urlParams: ['id']
  }),

};