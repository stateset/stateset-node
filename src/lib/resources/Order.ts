'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'orders/',
  operations: ['create', 'list', 'retrieve'],
});
