'use strict';

import StatesetResource from '../../StatesetResource';

export default StatesetResource.extend({
  path: 'returns/',
  operations: ['create', 'list', 'retrieve'],
});
